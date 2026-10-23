import assert from "node:assert/strict";
import { test } from "node:test";
import { questions } from "../lib/cloudready/content";
import { diagnosticResults, confidenceLabel } from "../lib/cloudready/results";
import { createLearnerData } from "../lib/cloudready/defaults";
import { dashboardSummary } from "../lib/cloudready/dashboard";
import { createAssessmentService } from "../lib/cloudready/assessment";
import { createDemoRepository } from "../lib/cloudready/persistence";
import type {
  AssessmentSession,
  Confidence,
  Question,
} from "../lib/cloudready/models";

const now = new Date("2026-10-23T14:00:00Z");
function completed(
  pool: readonly Question[] = questions.slice(0, 4),
  marks: { correct: boolean; confidence: Confidence }[] = [],
): AssessmentSession {
  return {
    id: "diagnostic-results",
    kind: "diagnostic",
    status: "completed",
    mode: "mixed",
    explanationTiming: "after-answer",
    confidenceEnabled: true,
    questionIds: pool.map((question) => question.id),
    startedAt: "2026-10-23T10:00:00Z",
    completedAt: now.toISOString(),
    responses: pool.map((question, index) => {
      const mark = marks[index] ?? {
        correct: true,
        confidence: "confident" as const,
      };
      return {
        questionId: question.id,
        sessionId: "diagnostic-results",
        topicId: question.topicId,
        conceptId: question.conceptId,
        selectedOptionId: mark.correct
          ? question.correctOptionId
          : question.options.find(
              (option) => option.id !== question.correctOptionId,
            )!.id,
        correct: mark.correct,
        confidence: mark.confidence,
        submittedAt: `2026-10-23T12:0${index}:00Z`,
        attemptType: "diagnostic" as const,
      };
    }),
  };
}

test("results calculate explicit denominators and all four confidence categories from the selected session", () => {
  const session = completed(undefined, [
    { correct: true, confidence: "confident" },
    { correct: false, confidence: "confident" },
    { correct: true, confidence: "somewhat" },
    { correct: false, confidence: "guessing" },
  ]);
  const result = diagnosticResults(session);
  assert.deepEqual(result.score, { total: 4, correct: 2, percent: 50 });
  assert.deepEqual(
    result.confidence.map((item) => item.count),
    [1, 1, 1, 1],
  );
  assert.equal(result.topics[0].total, 4);
  assert.equal(result.topics[1].percent, null);
  assert.equal(result.topics[2].percent, null);
  assert.equal(confidenceLabel("somewhat"), "Somewhat sure");
  assert.equal(confidenceLabel("guessing"), "Guessing");
});

test("zero accuracy and perfect accuracy do not invent missing-topic scores or learning gaps", () => {
  const allWrong = completed(
    undefined,
    Array.from({ length: 4 }, () => ({
      correct: false,
      confidence: "confident",
    })),
  );
  assert.equal(diagnosticResults(allWrong).score.percent, 0);
  assert.equal(diagnosticResults(allWrong).topics[0].percent, 0);
  const perfect = diagnosticResults(completed());
  assert.equal(perfect.score.percent, 100);
  assert.deepEqual(perfect.priorities, []);
  assert.equal(perfect.topics[1].percent, null);
});

test("revision priorities rank confident mistakes before other mistakes and uncertain correct answers", () => {
  const session = completed(undefined, [
    { correct: true, confidence: "somewhat" },
    { correct: false, confidence: "guessing" },
    { correct: false, confidence: "confident" },
    { correct: true, confidence: "confident" },
  ]);
  const result = diagnosticResults(session);
  assert.deepEqual(
    result.priorities.map((item) => item.index),
    [2, 1, 0],
  );
  assert.deepEqual(
    result.priorities.map((item) => item.priority),
    [3, 2, 1],
  );
  assert.equal(result.priorities[0].reviewId, "answer-review-3");
});

test("repeated concepts use their latest submitted answer without duplicating concept priorities", () => {
  const pool = questions
    .slice(0, 4)
    .map((question, index) =>
      index < 2 ? { ...question, conceptId: "same-concept" } : question,
    );
  const session = completed(pool, [
    { correct: false, confidence: "confident" },
    { correct: true, confidence: "confident" },
    { correct: true, confidence: "guessing" },
  ]);
  const result = diagnosticResults(session, pool);
  assert.equal(result.priorities.length, 1);
  assert.equal(result.priorities[0].conceptId, pool[2].conceptId);
  assert.equal(result.score.total, 4);
});

test("review follows the session question order even if responses or current content are reordered", () => {
  const session = completed();
  session.responses.reverse();
  const result = diagnosticResults(session, [...questions].reverse());
  assert.deepEqual(
    result.answers.map((answer) => answer.response.questionId),
    session.questionIds,
  );
  assert.deepEqual(
    result.answers.map((answer) => answer.reviewId),
    [
      "answer-review-1",
      "answer-review-2",
      "answer-review-3",
      "answer-review-4",
    ],
  );
});

test("missing content and detectable answer-key conflicts preserve recorded scoring and expose review limits", () => {
  const session = completed();
  const changed = questions
    .map((question) =>
      question.id === session.questionIds[0]
        ? {
            ...question,
            correctOptionId: question.options.find(
              (option) => option.id !== question.correctOptionId,
            )!.id,
          }
        : question,
    )
    .filter((question) => question.id !== session.questionIds[1]);
  const result = diagnosticResults(session, changed);
  assert.equal(result.score.correct, 4);
  assert.equal(result.score.percent, 100);
  assert.equal(result.unavailableCount, 2);
  assert.equal(result.answers[0].contentChanged, true);
  assert.equal(result.answers[1].question, null);
  assert.equal(result.answers[1].response.correct, true);
});

test("reports reject incomplete, replaced, practice, and malformed completed sessions", () => {
  const session = completed();
  assert.throws(
    () =>
      diagnosticResults({
        ...session,
        status: "in-progress",
        completedAt: null,
      }),
    /completed diagnostic/,
  );
  assert.throws(
    () =>
      diagnosticResults({ ...session, status: "abandoned", completedAt: null }),
    /completed diagnostic/,
  );
  assert.throws(() =>
    diagnosticResults({
      ...session,
      kind: "practice",
      responses: session.responses.map((response) => ({
        ...response,
        attemptType: "first-practice",
      })),
    }),
  );
  assert.throws(() =>
    diagnosticResults({ ...session, responses: session.responses.slice(0, 3) }),
  );
});

test("results are read-only and remain session-scoped while the dashboard selects the latest completed diagnostic", () => {
  const original = completed();
  const next = completed(questions.slice(0, 1), [
    { correct: false, confidence: "confident" },
  ]);
  next.id = "new-diagnostic";
  next.responses.forEach((response) => {
    response.sessionId = next.id;
  });
  next.startedAt = "2026-10-22T10:00:00Z";
  next.completedAt = "2026-10-23T13:59:00Z";
  original.completedAt = "2026-10-23T13:00:00Z";
  const future = structuredClone(next);
  future.id = "future";
  future.responses.forEach((response) => {
    response.sessionId = future.id;
  });
  future.completedAt = "2026-10-24T14:00:00Z";
  const data = {
    ...createLearnerData({ id: "demo-learner", isDemo: true }),
    sessions: [original, next, future],
  };
  const before = structuredClone(data);
  assert.equal(diagnosticResults(original).score.percent, 100);
  assert.equal(diagnosticResults(next).score.percent, 0);
  assert.equal(
    dashboardSummary(data, now).latestCompletedDiagnostic?.id,
    next.id,
  );
  assert.deepEqual(data, before);
});

test("a real persisted diagnostic produces a report without writing new progress on read", () => {
  const saved = new Map<string, string>();
  let writes = 0;
  const repository = createDemoRepository({
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => {
      writes++;
      saved.set(key, value);
    },
    removeItem: (key) => {
      saved.delete(key);
    },
  });
  const data = createLearnerData({ id: "demo-learner", isDemo: true });
  data.profile.onboardingComplete = true;
  repository.save(data);
  const service = createAssessmentService(repository);
  const session = service.startDiagnostic({}, now, "persisted-results");
  for (const id of session.questionIds) {
    const question = questions.find((item) => item.id === id)!;
    service.answer(session.id, id, question.correctOptionId, "somewhat", now);
  }
  const loaded = repository.load();
  assert.equal(loaded.status, "ready");
  if (loaded.status !== "ready") throw new Error("Expected saved session");
  const writeCount = writes;
  const report = diagnosticResults(loaded.data.sessions[0]);
  assert.equal(report.score.total, 12);
  assert.equal(report.score.percent, 100);
  assert.equal(report.priorities.length, 12);
  assert.equal(
    report.confidence.find((item) => item.id === "uncertain-correct")?.count,
    12,
  );
  assert.equal(writes, writeCount);
  assert.equal(loaded.data.activity.length, 1);
});
