import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createDemoRepository,
  type StoragePort,
} from "../lib/cloudready/persistence";
import { createDemoService } from "../lib/cloudready/services";
import {
  createOnboardingDraftStore,
  finishDemoOnboarding,
} from "../lib/cloudready/onboarding-storage";
import { valuesFromProfile } from "../lib/cloudready/onboarding";
import { createAssessmentService } from "../lib/cloudready/assessment";
import { assessmentStep } from "../lib/cloudready/assessment-flow";
import { diagnosticResults } from "../lib/cloudready/results";
import {
  createLearningService,
  learningLibrary,
} from "../lib/cloudready/learning";
import {
  createPracticeService,
  practicePool,
  type PracticeOptions,
} from "../lib/cloudready/practice";
import { practiceResults } from "../lib/cloudready/practice-results";
import {
  createRevisionService,
  revisionQueue,
} from "../lib/cloudready/revision";
import { progressReport } from "../lib/cloudready/progress";
import { dashboardSummary, studyPlan } from "../lib/cloudready/dashboard";
import {
  createSettingsService,
  settingsValues,
} from "../lib/cloudready/settings";
import { concepts, questions } from "../lib/cloudready/content";
import { addCalendarDays, dateInTimezone } from "../lib/cloudready/scheduler";

function environment() {
  const values = new Map<string, string>();
  let writes = 0;
  let fail = false;
  let minute = 0;
  const now = () =>
    new Date(Date.parse("2026-10-23T09:00:00Z") + minute++ * 60_000);
  const storage: StoragePort = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (fail) throw new Error("Storage full");
      values.set(key, value);
      writes++;
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
  // Recreating every repository simulates reading the persisted payload afresh.
  const repository = () => createDemoRepository(storage);
  const read = () => {
    const loaded = repository().load();
    if (loaded.status !== "ready") throw new Error("Missing learner");
    return loaded.data;
  };
  function setup() {
    const profile =
      createDemoService(repository()).start("Africa/Nairobi").profile;
    const draft = createOnboardingDraftStore(storage);
    const form = {
      ...valuesFromProfile(profile),
      displayName: "Journey learner",
      studyDays: [1, 3, 5],
      minutesPerSession: "15",
      notSure: true,
    };
    draft.save({
      schemaVersion: 1,
      profileId: profile.id,
      step: 2,
      values: form,
      updatedAt: now().toISOString(),
    });
    assert.equal(
      createOnboardingDraftStore(storage).load(profile.id).status,
      "ready",
    );
    const saved = finishDemoOnboarding(repository(), draft, form, now());
    assert.equal(saved.ok, true);
    assert.equal(read().profile.onboardingComplete, true);
    assert.equal(draft.load(profile.id).status, "empty");
  }
  return {
    storage,
    repository,
    read,
    now,
    setup,
    writes: () => writes,
    fail: (value: boolean) => {
      fail = value;
    },
  };
}
function question(id: string) {
  const item = questions.find((item) => item.id === id);
  assert.ok(item);
  return item;
}

test("connected demo journey preserves diagnostic history through lessons, fresh practice, retries, revision, settings, export and reset", () => {
  const f = environment();
  const initial = createDemoService(f.repository()).start("Africa/Nairobi");
  assert.equal(initial.sessions.length, 0);
  assert.equal(dashboardSummary(initial, f.now()).practice.percent, null);
  f.setup();

  const diagnostic = createAssessmentService(f.repository()).startDiagnostic(
    {},
    f.now(),
    "journey-diagnostic",
  );
  for (const [index, id] of diagnostic.questionIds.slice(0, 4).entries()) {
    const item = question(id);
    createAssessmentService(f.repository()).answer(
      diagnostic.id,
      id,
      index === 0
        ? item.options.find((option) => option.id !== item.correctOptionId)!.id
        : item.correctOptionId,
      "confident",
      f.now(),
    );
  }
  const resumed = createAssessmentService(f.repository()).startDiagnostic(
    {},
    f.now(),
  );
  assert.equal(resumed.id, diagnostic.id);
  assert.equal(resumed.responses.length, 4);
  assert.equal(
    assessmentStep(resumed, null, questions).question?.id,
    diagnostic.questionIds[4],
  );
  assert.equal(
    dashboardSummary(f.read(), f.now()).unfinished?.id,
    diagnostic.id,
  );
  for (const id of diagnostic.questionIds.slice(4))
    createAssessmentService(f.repository()).answer(
      diagnostic.id,
      id,
      question(id).correctOptionId,
      "confident",
      f.now(),
    );
  const completedDiagnostic = structuredClone(f.read().sessions[0]);
  const results = diagnosticResults(completedDiagnostic);
  assert.deepEqual(results.score, { total: 12, correct: 11, percent: 92 });
  assert.equal(results.unavailableCount, 0);
  const concept = concepts.find(
    (item) => item.id === question(diagnostic.questionIds[0]).conceptId,
  )!;
  assert.equal(results.priorities[0].conceptId, concept.id);

  const learning = createLearningService(f.repository());
  learning.markReviewed(concept.id, f.now());
  learning.addToRevision(concept.id, f.now());
  assert.equal(
    learningLibrary(f.read(), "", "all", "reviewed")[0].id,
    concept.id,
  );
  assert.equal(revisionQueue(f.read(), "due", f.now()).dueCount, 1);
  const revision = createRevisionService(f.repository());
  const ratingAt = f.now();
  revision.review(f.read().revision[0], "good", ratingAt);
  const schedule = structuredClone(f.read().revision[0]);
  assert.equal(
    schedule.nextReviewDate,
    addCalendarDays(dateInTimezone(ratingAt, "Africa/Nairobi"), 7),
  );

  const scope: PracticeOptions = {
    mode: "topic",
    topicId: concept.topicId,
    conceptId: concept.id,
    count: 1,
    confidenceEnabled: true,
    explanationTiming: "after-session",
  };
  const pool = practicePool(f.read(), scope);
  assert.ok(pool.fresh.length > 0);
  const fresh = createPracticeService(f.repository()).start(
    { ...scope, count: pool.fresh.length },
    undefined,
    f.now(),
    "journey-fresh",
  );
  assert.equal(fresh.freshQuestionIds?.length, fresh.questionIds.length);
  assert.ok(
    fresh.questionIds.every((id) => !diagnostic.questionIds.includes(id)),
  );
  for (const id of fresh.questionIds)
    createAssessmentService(f.repository()).answer(
      fresh.id,
      id,
      question(id).correctOptionId,
      "guessing",
      f.now(),
    );
  assert.deepEqual(
    f.read().revision[0],
    schedule,
    "Question answers must not overwrite recall scheduling",
  );
  const freshResult = practiceResults(f.read(), fresh.id);
  assert.equal(freshResult.firstPractice.total, pool.fresh.length);
  assert.equal(freshResult.retries.total, 0);

  const repeated = createPracticeService(f.repository()).start(
    { ...scope, count: pool.total, confidenceEnabled: false },
    undefined,
    f.now(),
    "journey-repeated",
  );
  assert.deepEqual(repeated.freshQuestionIds, []);
  for (const id of repeated.questionIds)
    createAssessmentService(f.repository()).answer(
      repeated.id,
      id,
      question(id).correctOptionId,
      null,
      f.now(),
    );
  const repeatedResult = practiceResults(f.read(), repeated.id);
  assert.equal(repeatedResult.retries.total, pool.fresh.length);
  assert.equal(
    repeatedResult.firstPractice.total,
    pool.repeated.length,
    "A previous diagnostic is not a previous practice attempt",
  );
  assert.equal(repeatedResult.comparison.first.total, pool.fresh.length);
  assert.equal(repeatedResult.unratedCount, pool.total);

  const data = f.read();
  const reportAt = f.now();
  const beforeReads = f.writes();
  const progress = progressReport(
    data,
    { period: "all", scope: "practice" },
    reportAt,
  );
  assert.equal(progress.status, "ready");
  if (progress.status !== "ready") throw new Error("Invalid progress report");
  assert.equal(
    progress.accuracy.total,
    fresh.questionIds.length + repeated.questionIds.length,
  );
  assert.equal(progress.accuracy.percent, 100);
  assert.equal(progress.uniqueQuestions, pool.total);
  assert.equal(progress.lessonsReviewed, 1);
  assert.equal(progress.revisionReviewed, 1);
  assert.equal(progress.completed.length, 3);
  const dashboard = dashboardSummary(data, reportAt);
  assert.equal(dashboard.latestCompletedPractice?.id, repeated.id);
  assert.equal(dashboard.latestCompletedDiagnostic?.id, diagnostic.id);
  assert.equal(dashboard.unfinished, null);
  assert.equal(dashboard.practice.total, progress.accuracy.total);
  assert.ok(
    studyPlan(data, false, reportAt).tasks.reduce(
      (sum, item) => sum + item.minutes,
      0,
    ) <= 15,
  );
  assert.deepEqual(data.sessions[0], completedDiagnostic);
  assert.equal(
    f.writes(),
    beforeReads,
    "Reports must not create learning activity",
  );

  revision.remove(data.revision[0]);
  assert.equal(f.read().revision.length, 0);
  assert.deepEqual(revision.undoRemove(), data);
  const settings = createSettingsService(
    f.repository(),
    createOnboardingDraftStore(f.storage),
  );
  const edits = settingsValues(data.profile);
  edits.displayName = "Returning learner";
  edits.preferences.minutesPerSession = 30;
  const updated = settings.save(data.profile, edits, f.now());
  assert.deepEqual(updated.sessions, data.sessions);
  assert.deepEqual(updated.revision, data.revision);
  const exported = JSON.parse(settings.export(f.now()).json);
  assert.deepEqual(exported.data, f.read());
  assert.equal(
    exported.data.sessions.reduce(
      (sum: number, session: { responses: unknown[] }) =>
        sum + session.responses.length,
      0,
    ),
    12 + fresh.questionIds.length + repeated.questionIds.length,
  );
  const cleared = settings.clearLearning(f.read());
  assert.equal(cleared.profile.displayName, "Returning learner");
  assert.equal(cleared.sessions.length, 0);
  assert.equal(dashboardSummary(cleared, f.now()).practice.percent, null);
  assert.equal(revisionQueue(cleared, "all", f.now()).total, 0);
  assert.deepEqual(
    exported.data.sessions[0],
    completedDiagnostic,
    "Reset cannot change a previously exported snapshot",
  );
});

test("practice resumes after repository recreation and a failed answer save without losing earlier answers", () => {
  const f = environment();
  f.setup();
  const options: PracticeOptions = {
    mode: "mixed",
    topicId: null,
    conceptId: null,
    count: 3,
    confidenceEnabled: false,
    explanationTiming: "after-session",
  };
  const session = createPracticeService(f.repository()).start(
    options,
    undefined,
    f.now(),
    "resume-practice",
  );
  const first = question(session.questionIds[0]);
  createAssessmentService(f.repository()).answer(
    session.id,
    first.id,
    first.correctOptionId,
    null,
    f.now(),
  );
  const saved = f.read();
  f.fail(true);
  const second = question(session.questionIds[1]);
  assert.throws(
    () =>
      createAssessmentService(f.repository()).answer(
        session.id,
        second.id,
        second.correctOptionId,
        null,
        f.now(),
      ),
    /Storage full/,
  );
  assert.deepEqual(f.read(), saved);
  f.fail(false);
  const resumed = createPracticeService(f.repository()).start(
    options,
    undefined,
    f.now(),
  );
  assert.equal(resumed.id, session.id);
  assert.equal(resumed.responses.length, 1);
  assert.equal(
    assessmentStep(resumed, null, questions).question?.id,
    second.id,
  );
  assert.equal(
    assessmentStep(resumed, first.id, questions).revealExplanation,
    false,
  );
  assert.equal(
    studyPlan(f.read(), false, f.now()).tasks[0].href,
    `/practice/${session.id}`,
  );
  for (const id of session.questionIds.slice(1))
    createAssessmentService(f.repository()).answer(
      session.id,
      id,
      question(id).correctOptionId,
      null,
      f.now(),
    );
  const data = f.read();
  assert.equal(practiceResults(data, session.id).score.total, 3);
  assert.equal(
    assessmentStep(data.sessions[0], first.id, questions).revealExplanation,
    true,
  );
  assert.equal(
    data.activity.filter((event) => event.kind === "session-completed").length,
    1,
  );
  assert.deepEqual(
    data.sessions[0].responses[0],
    saved.sessions[0].responses[0],
  );
});
