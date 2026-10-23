import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAssessmentService,
  diagnosticPool,
  sessionContentAvailable,
  unfinishedDiagnostic,
} from "../lib/cloudready/assessment";
import { questions, topics } from "../lib/cloudready/content";
import { createLearnerData } from "../lib/cloudready/defaults";
import { dashboardSummary } from "../lib/cloudready/dashboard";
import { learnerDataSchema, questionSchema } from "../lib/cloudready/models";
import {
  createDemoRepository,
  type StoragePort,
} from "../lib/cloudready/persistence";

const now = new Date("2026-10-25T21:30:00Z");
function fixture() {
  const saved = new Map<string, string>();
  const storage: StoragePort = {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => {
      saved.set(key, value);
    },
    removeItem: (key) => {
      saved.delete(key);
    },
  };
  const repository = createDemoRepository(storage);
  const data = createLearnerData({
    id: "demo-learner",
    isDemo: true,
    timezone: "Africa/Nairobi",
  });
  data.profile.onboardingComplete = true;
  repository.save(data);
  return {
    storage,
    repository,
    service: createAssessmentService(repository),
    read: () => {
      const loaded = repository.load();
      assert.equal(loaded.status, "ready");
      if (loaded.status !== "ready") throw new Error("fixture failed");
      return loaded.data;
    },
  };
}

test("diagnostic content is valid, original, balanced and sourced to Microsoft Learn", () => {
  assert.equal(questions.length, 30);
  assert.equal(new Set(questions.map((question) => question.id)).size, 30);
  for (const question of questions) {
    assert.ok(questionSchema.safeParse(question).success);
    assert.equal(new URL(question.source.url).hostname, "learn.microsoft.com");
    assert.ok(
      question.options.every((option) => option.explanation.length > 10),
    );
  }
  const pool = diagnosticPool();
  for (const topic of topics)
    assert.equal(
      pool.filter((question) => question.topicId === topic.id).length,
      4,
    );
  assert.deepEqual(
    pool.slice(0, 3).map((question) => question.topicId),
    topics.map((topic) => topic.id),
  );
  assert.throws(() => diagnosticPool(questions.slice(0, 10)), /four reviewed/);
  assert.throws(() => diagnosticPool([...questions, questions[0]]), /unique/);
});

test("start persists a complete 12-question session with mandatory confidence and no invented activity", () => {
  const f = fixture();
  const session = f.service.startDiagnostic({}, now, "diagnostic-1");
  assert.equal(session.questionIds.length, 12);
  assert.equal(session.confidenceEnabled, true);
  assert.equal(session.explanationTiming, "after-answer");
  assert.equal(session.status, "in-progress");
  assert.equal(f.read().activity.length, 0);
  assert.equal(f.read().revision.length, 0);
  assert.deepEqual(f.read().sessions[0], session);
  assert.equal(sessionContentAvailable(session), true);
  assert.equal(
    sessionContentAvailable({ ...session, questionIds: ["removed"] }),
    false,
  );
});

test("start requires completed onboarding and readable existing records", () => {
  const f = fixture();
  const data = f.read();
  data.profile.onboardingComplete = false;
  f.repository.save(data);
  assert.throws(
    () => f.service.startDiagnostic({}, now, "blocked"),
    /study preferences/,
  );
  f.repository.reset();
  assert.throws(
    () => f.service.startDiagnostic({}, now, "blocked"),
    /saved demo/,
  );
});

test("repeated start resumes the existing session without replacing answers or writing a duplicate", () => {
  const f = fixture();
  const first = f.service.startDiagnostic({}, now, "first");
  const question = questions.find((item) => item.id === first.questionIds[0])!;
  f.service.answer(
    first.id,
    question.id,
    question.correctOptionId,
    "confident",
    now,
  );
  const resumed = createAssessmentService(f.repository).startDiagnostic(
    {},
    now,
    "second",
  );
  assert.equal(resumed.id, "first");
  assert.equal(resumed.responses.length, 1);
  assert.equal(f.read().sessions.length, 1);
});

test("confirmed replacement closes the old session and retains its answers and other learner data", () => {
  const f = fixture();
  const first = f.service.startDiagnostic({}, now, "first");
  const question = questions.find((item) => item.id === first.questionIds[0])!;
  f.service.answer(
    first.id,
    question.id,
    question.correctOptionId,
    "guessing",
    now,
  );
  const before = f.read();
  const second = f.service.startDiagnostic(
    { replaceSessionId: first.id },
    now,
    "second",
  );
  const after = f.read();
  assert.equal(after.sessions[0].status, "abandoned");
  assert.deepEqual(after.sessions[0].responses, before.sessions[0].responses);
  assert.deepEqual(after.revision, before.revision);
  assert.deepEqual(after.profile, before.profile);
  assert.equal(unfinishedDiagnostic(after)?.id, second.id);
  assert.ok(learnerDataSchema.safeParse(after).success);
  assert.throws(
    () =>
      f.service.answer(first.id, first.questionIds[1], "a", "confident", now),
    /already ended/,
  );
});

test("stale replacement confirmations cannot close a newer session", () => {
  const f = fixture();
  const first = f.service.startDiagnostic({}, now, "first");
  f.service.startDiagnostic({ replaceSessionId: first.id }, now, "second");
  assert.throws(
    () =>
      f.service.startDiagnostic({ replaceSessionId: first.id }, now, "third"),
    /session changed/,
  );
  assert.equal(f.read().sessions.length, 2);
});

test("invalid question pools and failed writes leave the original session intact", () => {
  const f = fixture();
  const first = f.service.startDiagnostic({}, now, "first");
  const before = f.read();
  assert.throws(() =>
    createAssessmentService(f.repository, []).startDiagnostic(
      { replaceSessionId: first.id },
      now,
      "second",
    ),
  );
  assert.deepEqual(f.read(), before);
  const fail = createAssessmentService({
    ...f.repository,
    save: () => {
      throw new Error("storage full");
    },
  });
  assert.throws(
    () => fail.startDiagnostic({ replaceSessionId: first.id }, now, "second"),
    /storage full/,
  );
  assert.deepEqual(f.read(), before);
  assert.throws(
    () => fail.answer(first.id, first.questionIds[0], "b", "confident", now),
    /storage full/,
  );
  assert.deepEqual(f.read(), before);
});

test("answers validate confidence/order/options and stale duplicate submissions cannot overwrite saved data", () => {
  const f = fixture();
  const session = f.service.startDiagnostic({}, now, "first");
  assert.throws(
    () => f.service.answer(session.id, session.questionIds[0], "a", null, now),
    /confidence/,
  );
  assert.throws(
    () =>
      f.service.answer(
        session.id,
        session.questionIds[0],
        "invalid",
        "confident",
        now,
      ),
    /valid answer/,
  );
  assert.throws(
    () =>
      f.service.answer(
        session.id,
        session.questionIds[1],
        "a",
        "confident",
        now,
      ),
    /current question/,
  );
  const saved = f.service.answer(
    session.id,
    session.questionIds[0],
    "a",
    "confident",
    now,
  );
  assert.equal(saved.session.responses[0].correct, false);
  assert.throws(() =>
    f.service.answer(session.id, session.questionIds[0], "b", "guessing", now),
  );
  assert.equal(f.read().sessions[0].responses[0].selectedOptionId, "a");
  assert.equal(f.read().revision[0].reason, "confident-incorrect");
  assert.equal(f.read().revision[0].nextReviewDate, "2026-10-26");
});

test("the full diagnostic persists across service recreation and records completion exactly once", () => {
  const f = fixture();
  const session = f.service.startDiagnostic({}, now, "first");
  for (const id of session.questionIds) {
    const question = questions.find((item) => item.id === id)!;
    createAssessmentService(f.repository).answer(
      session.id,
      id,
      question.correctOptionId,
      "confident",
      now,
    );
  }
  const data = f.read();
  assert.equal(data.sessions[0].status, "completed");
  assert.equal(data.sessions[0].completedAt, now.toISOString());
  assert.equal(data.sessions[0].responses.length, 12);
  assert.equal(data.activity.length, 1);
  assert.equal(data.revision.length, 0);
  assert.equal(unfinishedDiagnostic(data), null);
  const dashboard = dashboardSummary(data, now);
  assert.equal(dashboard.hasDiagnostic, true);
  assert.equal(dashboard.totalResponses, 12);
  assert.equal(dashboard.topicsAttempted, 3);
  assert.equal(dashboard.practice.total, 0);
  assert.equal(dashboard.completedThisWeek, 1);
  assert.throws(
    () =>
      f.service.answer(
        session.id,
        session.questionIds[11],
        "a",
        "guessing",
        now,
      ),
    /already ended/,
  );
  assert.equal(f.read().activity.length, 1);
});

test("latest profile and existing review schedules survive answer writes", () => {
  const f = fixture();
  const session = f.service.startDiagnostic({}, now, "first");
  const question = questions.find(
    (item) => item.id === session.questionIds[0],
  )!;
  const data = f.read();
  data.profile.displayName = "Changed in another tab";
  data.revision.push({
    conceptId: question.conceptId,
    reason: "manual",
    nextReviewDate: "2026-11-03",
    lastReviewedAt: null,
    intervalDays: 8,
    easyStreak: 1,
    reviews: 2,
    lastRating: "easy",
  });
  f.repository.save(data);
  f.service.answer(
    session.id,
    question.id,
    question.correctOptionId,
    "guessing",
    now,
  );
  assert.equal(f.read().profile.displayName, data.profile.displayName);
  assert.deepEqual(f.read().revision, data.revision);
});
