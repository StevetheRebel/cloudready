import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createPracticeService,
  practicePool,
  practiceOptionsSchema,
  type PracticeOptions,
} from "../lib/cloudready/practice";
import { practiceResults } from "../lib/cloudready/practice-results";
import {
  createAssessmentService,
  diagnosticPool,
} from "../lib/cloudready/assessment";
import { assessmentStep } from "../lib/cloudready/assessment-flow";
import { concepts, questions, topics } from "../lib/cloudready/content";
import { diagnosticQuestions } from "../lib/cloudready/diagnostic-content";
import { createLearnerData } from "../lib/cloudready/defaults";
import { createDemoRepository } from "../lib/cloudready/persistence";
import { sessionSchema } from "../lib/cloudready/models";
import { dashboardSummary } from "../lib/cloudready/dashboard";

const now = new Date("2026-10-23T12:00:00Z");
const settings: PracticeOptions = {
  mode: "mixed",
  topicId: null,
  conceptId: null,
  count: 6,
  confidenceEnabled: true,
  explanationTiming: "after-answer",
};
function fixture() {
  const saved = new Map<string, string>();
  const repository = createDemoRepository({
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => {
      saved.set(key, value);
    },
    removeItem: (key) => {
      saved.delete(key);
    },
  });
  const data = createLearnerData({ id: "demo-learner", isDemo: true });
  data.profile.onboardingComplete = true;
  repository.save(data);
  return {
    repository,
    practice: createPracticeService(repository),
    assessment: createAssessmentService(repository),
    read: () => {
      const value = repository.load();
      if (value.status !== "ready") throw new Error("Missing fixture");
      return value.data;
    },
  };
}
function finishDiagnostic(f: ReturnType<typeof fixture>) {
  const session = f.assessment.startDiagnostic({}, now, "diagnostic");
  for (const id of session.questionIds) {
    const question = questions.find((item) => item.id === id)!;
    f.assessment.answer(
      session.id,
      id,
      question.correctOptionId,
      "confident",
      now,
    );
  }
  return session;
}
function finishPractice(
  f: ReturnType<typeof fixture>,
  id: string,
  correct = true,
  at = now,
) {
  const session = f.read().sessions.find((item) => item.id === id)!;
  for (const questionId of session.questionIds) {
    const question = questions.find((item) => item.id === questionId)!;
    f.assessment.answer(
      id,
      questionId,
      correct
        ? question.correctOptionId
        : question.options.find(
            (option) => option.id !== question.correctOptionId,
          )!.id,
      session.confidenceEnabled ? "confident" : null,
      at,
    );
  }
}

test("practice expansion has 30 unique questions, ten per topic, and preserves diagnostic membership", () => {
  assert.equal(questions.length, 30);
  assert.equal(new Set(questions.map((question) => question.id)).size, 30);
  for (const topic of topics)
    assert.equal(
      questions.filter((question) => question.topicId === topic.id).length,
      10,
    );
  assert.deepEqual(
    new Set(diagnosticPool().map((question) => question.id)),
    new Set(diagnosticQuestions.map((question) => question.id)),
  );
});

test("practice settings reject invalid modes, counts, confidence values and incompatible scope", () => {
  assert.ok(practiceOptionsSchema.safeParse(settings).success);
  for (const override of [
    { count: 0 },
    { count: 31 },
    { count: 1.5 },
    { mode: "invalid" },
    { confidenceEnabled: "yes" },
    { mode: "topic", topicId: null },
    { mode: "mixed", topicId: "cloud-concepts" },
  ])
    assert.equal(
      practiceOptionsSchema.safeParse({ ...settings, ...override }).success,
      false,
    );
});

test("after the diagnostic, the pool distinguishes eighteen unanswered questions from twelve seen ones", () => {
  const f = fixture();
  finishDiagnostic(f);
  const pool = practicePool(f.read(), settings);
  assert.equal(pool.fresh.length, 18);
  assert.equal(pool.repeated.length, 12);
  const session = f.practice.start(settings, undefined, now, "practice");
  assert.equal(session.freshQuestionIds?.length, 6);
  assert.ok(
    session.questionIds.every(
      (id) => !diagnosticQuestions.some((question) => question.id === id),
    ),
  );
});

test("mixed practice spreads questions across available topics and persists its configuration", () => {
  const f = fixture();
  const session = f.practice.start(
    {
      ...settings,
      confidenceEnabled: false,
      explanationTiming: "after-session",
    },
    undefined,
    now,
    "mixed",
  );
  const selected = session.questionIds.map((id) =>
    questions.find((question) => question.id === id)!,
  );
  for (const topic of topics)
    assert.equal(
      selected.filter((question) => question.topicId === topic.id).length,
      2,
    );
  assert.equal(session.confidenceEnabled, false);
  assert.equal(session.explanationTiming, "after-session");
  assert.deepEqual(session.practiceFocus, { topicId: null, conceptId: null });
});

test("topic and concept pools enforce scope; weak-area mode has no silent mixed fallback", () => {
  const f = fixture();
  assert.equal(
    practicePool(f.read(), {
      mode: "topic",
      topicId: "azure-services",
      conceptId: null,
    }).total,
    10,
  );
  const focus = {
    mode: "topic" as const,
    topicId: concepts[0].topicId,
    conceptId: concepts[0].id,
  };
  assert.ok(
    practicePool(f.read(), focus).eligible.every(
      (question) => question.conceptId === concepts[0].id,
    ),
  );
  assert.equal(
    practicePool(f.read(), {
      mode: "weak-areas",
      topicId: null,
      conceptId: null,
    }).total,
    0,
  );
  const data = f.read();
  data.revision.push({
    conceptId: concepts[0].id,
    reason: "manual",
    nextReviewDate: "2026-10-24",
    lastReviewedAt: null,
    intervalDays: 0,
    easyStreak: 0,
    reviews: 0,
    lastRating: null,
  });
  assert.ok(
    practicePool(data, {
      mode: "weak-areas",
      topicId: null,
      conceptId: null,
    }).eligible.every((question) => question.conceptId === concepts[0].id),
  );
  assert.throws(
    () =>
      f.practice.start(
        {
          ...settings,
          mode: "topic",
          topicId: "azure-services",
          conceptId: concepts[0].id,
          count: 1,
        },
        undefined,
        now,
        "bad",
      ),
    /concept/,
  );
});

test("counts beyond the eligible pool and incomplete onboarding fail without writes", () => {
  const f = fixture();
  const before = f.read();
  assert.throws(
    () =>
      f.practice.start(
        { ...settings, mode: "topic", topicId: "azure-services", count: 11 },
        undefined,
        now,
        "bad",
      ),
    /eligible pool/,
  );
  assert.deepEqual(f.read(), before);
  before.profile.onboardingComplete = false;
  f.repository.save(before);
  assert.throws(
    () => f.practice.start(settings, undefined, now, "bad"),
    /preferences/,
  );
});

test("resuming or replacing practice preserves diagnostic sessions and historical responses", () => {
  const f = fixture();
  const diagnostic = f.assessment.startDiagnostic({}, now, "diagnostic");
  const first = f.practice.start(settings, undefined, now, "first");
  f.assessment.answer(first.id, first.questionIds[0], "a", "confident", now);
  const before = f.read();
  assert.equal(
    f.practice.start({ ...settings, count: 2 }, undefined, now, "ignored").id,
    first.id,
  );
  const second = f.practice.start(settings, first.id, now, "second");
  const after = f.read();
  assert.equal(
    after.sessions.find((item) => item.id === first.id)?.status,
    "abandoned",
  );
  assert.deepEqual(
    after.sessions.find((item) => item.id === first.id)?.responses,
    before.sessions.find((item) => item.id === first.id)?.responses,
  );
  assert.deepEqual(
    after.sessions.find((item) => item.id === diagnostic.id),
    diagnostic,
  );
  assert.throws(
    () => f.practice.start(settings, first.id, now, "third"),
    /session changed/,
  );
  assert.equal(
    after.sessions.find((item) => item.id === second.id)?.status,
    "in-progress",
  );
});

test("failed start saves retain the original unfinished practice and all history", () => {
  const f = fixture();
  const first = f.practice.start(settings, undefined, now, "first");
  const before = f.read();
  const failing = createPracticeService({
    ...f.repository,
    save: () => {
      throw new Error("storage full");
    },
  });
  assert.throws(
    () => failing.start(settings, first.id, now, "next"),
    /storage full/,
  );
  assert.deepEqual(f.read(), before);
});

test("seen questions are reused only after fresh questions are exhausted and exposure is stored", () => {
  const f = fixture();
  finishDiagnostic(f);
  const session = f.practice.start(
    { ...settings, count: 30 },
    undefined,
    now,
    "all",
  );
  assert.equal(session.freshQuestionIds?.length, 18);
  assert.ok(
    session.questionIds
      .slice(0, 18)
      .every((id) => session.freshQuestionIds!.includes(id)),
  );
  assert.ok(
    session.questionIds
      .slice(18)
      .every((id) => !session.freshQuestionIds!.includes(id)),
  );
  assert.equal(new Set(session.questionIds).size, 30);
});

test("confidence-off and after-session practice complete through the shared marking service", () => {
  const f = fixture();
  const session = f.practice.start(
    {
      ...settings,
      count: 2,
      confidenceEnabled: false,
      explanationTiming: "after-session",
    },
    undefined,
    now,
    "quiet",
  );
  const q = questions.find((item) => item.id === session.questionIds[0])!;
  const first = f.assessment.answer(
    session.id,
    q.id,
    q.correctOptionId,
    null,
    now,
  );
  assert.equal(
    assessmentStep(first.session, q.id, questions).revealExplanation,
    false,
  );
  const next = questions.find((item) => item.id === session.questionIds[1])!;
  f.assessment.answer(session.id, next.id, next.correctOptionId, null, now);
  const report = practiceResults(f.read(), session.id);
  assert.equal(report.unratedCount, 2);
  assert.equal(report.firstPractice.total, 2);
  assert.equal(report.retries.percent, null);
  assert.equal(f.read().activity.length, 1);
  assert.equal(f.read().revision.length, 0);
});

test("practice results compare matching first-practice answers with retries and preserve the original", () => {
  const f = fixture();
  const focus: PracticeOptions = {
    ...settings,
    mode: "topic",
    topicId: concepts[0].topicId,
    conceptId: concepts[0].id,
    count: 2,
  };
  const first = f.practice.start(focus, undefined, now, "first");
  finishPractice(f, first.id, false);
  const before = structuredClone(f.read().sessions[0]);
  const second = f.practice.start(
    focus,
    undefined,
    new Date("2026-10-24T12:00:00Z"),
    "second",
  );
  finishPractice(f, second.id, true, new Date("2026-10-24T12:10:00Z"));
  const report = practiceResults(f.read(), second.id);
  assert.equal(report.retries.total, 2);
  assert.equal(report.firstPractice.percent, null);
  assert.equal(report.comparison.first.percent, 0);
  assert.equal(report.comparison.retry.percent, 100);
  assert.equal(report.freshCount, 0);
  assert.deepEqual(f.read().sessions[0], before);
  assert.equal(
    dashboardSummary(f.read(), new Date("2026-10-24T13:00:00Z")).practice.total,
    4,
  );
});

test("unmatched retries and legacy exposure remain explicitly unavailable", () => {
  const f = fixture();
  const session = f.practice.start(
    { ...settings, count: 1 },
    undefined,
    now,
    "old",
  );
  finishPractice(f, session.id);
  const data = f.read();
  const old = data.sessions[0];
  old.responses[0].attemptType = "retry";
  delete old.freshQuestionIds;
  const report = practiceResults(data, old.id);
  assert.equal(report.comparison.first.percent, null);
  assert.equal(report.comparison.unmatched, 1);
  assert.equal(report.freshCount, null);
  assert.throws(() => practiceResults(data, "missing"));
  assert.throws(() =>
    practiceResults(
      { ...data, sessions: [{ ...old, status: "abandoned" }] },
      old.id,
    ),
  );
});

test("fresh-question metadata must be unique and belong to the session", () => {
  const f = fixture();
  const session = f.practice.start(settings, undefined, now, "new");
  assert.equal(
    sessionSchema.safeParse({ ...session, freshQuestionIds: ["missing"] })
      .success,
    false,
  );
  assert.equal(
    sessionSchema.safeParse({
      ...session,
      freshQuestionIds: [session.questionIds[0], session.questionIds[0]],
    }).success,
    false,
  );
});
