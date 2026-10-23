import assert from "node:assert/strict";
import { test } from "node:test";
import { createLearnerData } from "../lib/cloudready/defaults";
import {
  progressReport,
  type ProgressFilter,
} from "../lib/cloudready/progress";
import type {
  AssessmentSession,
  QuestionResponse,
} from "../lib/cloudready/models";

const now = new Date("2026-10-25T21:30:00Z");
const filter: ProgressFilter = { period: "7", scope: "practice" };
function learner() {
  return createLearnerData({
    id: "demo",
    isDemo: true,
    timezone: "Africa/Nairobi",
  });
}
function response(
  id: string,
  overrides: Partial<QuestionResponse> = {},
): QuestionResponse {
  return {
    questionId: id,
    sessionId: "practice",
    topicId: "cloud-concepts",
    conceptId: "concept",
    selectedOptionId: "a",
    correct: true,
    confidence: "confident",
    submittedAt: "2026-10-25T21:10:00Z",
    attemptType: "first-practice",
    ...overrides,
  };
}
function session(
  responses: QuestionResponse[],
  overrides: Partial<AssessmentSession> = {},
): AssessmentSession {
  return {
    id: "practice",
    kind: "practice",
    status: "in-progress",
    mode: "mixed",
    explanationTiming: "after-answer",
    confidenceEnabled: true,
    questionIds: responses.map((item) => item.questionId),
    responses,
    startedAt: "2026-09-01T00:00:00Z",
    completedAt: null,
    ...overrides,
  };
}
function ready(data = learner(), options = filter) {
  const result = progressReport(data, options, now);
  assert.equal(result.status, "ready");
  if (result.status !== "ready") throw new Error("Expected valid report");
  return result;
}

test("empty analytics has no invented accuracy, confidence, or daily activity", () => {
  const result = ready();
  assert.equal(result.hasHistory, false);
  assert.deepEqual(result.accuracy, { correct: 0, total: 0, percent: null });
  assert.equal(result.from, "2026-10-20");
  assert.equal(result.to, "2026-10-26");
  assert.deepEqual(result.trend, []);
  assert.ok(result.topics.every((topic) => topic.percent === null));
  assert.ok(result.confidence.every((group) => group.total === 0));
});

test("date filtering follows local submission dates with inclusive endpoints, excluding future answers", () => {
  const data = learner();
  data.sessions = [
    session([
      response("before", { submittedAt: "2026-10-19T20:59:00Z" }),
      response("start", { submittedAt: "2026-10-19T21:00:00Z" }),
      response("end"),
      response("future", { submittedAt: "2026-10-25T21:31:00Z" }),
    ]),
  ];
  const before = structuredClone(data);
  const result = ready(data);
  assert.equal(result.accuracy.total, 2);
  assert.deepEqual(
    result.trend.map((day) => day.date),
    ["2026-10-20", "2026-10-26"],
  );
  assert.equal(
    ready(data, {
      ...filter,
      period: "custom",
      from: "2026-10-26",
      to: "2026-10-26",
    }).accuracy.total,
    1,
  );
  assert.equal(ready(data, { ...filter, period: "all" }).accuracy.total, 3);
  assert.equal(ready(data, { ...filter, period: "30" }).from, "2026-09-27");
  assert.deepEqual(data, before);
});

test("practice, first attempts, retries, and diagnostics have independent denominators", () => {
  const data = learner();
  data.sessions = [
    session([
      response("same", { correct: false, confidence: null }),
      response("same", { attemptType: "retry", confidence: "guessing" }),
    ]),
    session([response("d", { attemptType: "diagnostic" })], {
      id: "diagnostic",
      kind: "diagnostic",
    }),
  ];
  const result = ready(data);
  assert.deepEqual(result.accuracy, { correct: 1, total: 2, percent: 50 });
  assert.equal(result.uniqueQuestions, 1);
  assert.deepEqual(
    result.confidence.find((group) => group.confidence === null),
    { confidence: null, correct: 0, total: 1, percent: 0 },
  );
  assert.equal(
    result.confidence.find((group) => group.confidence === "confident")
      ?.percent,
    null,
  );
  assert.equal(
    ready(data, { ...filter, scope: "first-practice" }).accuracy.percent,
    0,
  );
  assert.equal(
    ready(data, { ...filter, scope: "retry" }).accuracy.percent,
    100,
  );
  assert.equal(
    ready(data, { ...filter, scope: "diagnostic" }).accuracy.total,
    1,
  );
});

test("non-question activity stays outside accuracy and session completion uses completion date", () => {
  const data = learner();
  data.sessions = [
    session([response("one")], {
      status: "completed",
      completedAt: "2026-10-25T21:15:00Z",
    }),
    session([], {
      id: "future",
      status: "completed",
      completedAt: "2026-10-27T00:00:00Z",
    }),
  ];
  data.activity = [
    {
      id: "lesson",
      kind: "lesson-reviewed",
      targetId: "x",
      at: "2026-10-25T21:10:00Z",
    },
    {
      id: "recall",
      kind: "revision-reviewed",
      targetId: "x",
      at: "2026-10-25T21:10:00Z",
    },
    {
      id: "future",
      kind: "revision-reviewed",
      targetId: "y",
      at: "2026-10-26T10:00:00Z",
    },
  ];
  const result = ready(data);
  assert.equal(result.accuracy.total, 1);
  assert.equal(result.lessonsReviewed, 1);
  assert.equal(result.revisionReviewed, 1);
  assert.equal(result.completed.length, 1);
  const diagnosticView = ready(data, { ...filter, scope: "diagnostic" });
  assert.equal(diagnosticView.accuracy.total, 0);
  assert.equal(diagnosticView.hasHistory, true);
  assert.equal(diagnosticView.completed.length, 1);
  assert.equal(diagnosticView.lessonsReviewed, 1);
});

test("invalid and reversed calendar ranges return a recoverable state", () => {
  for (const [from, to] of [
    ["", ""],
    ["2026-02-30", "2026-03-02"],
    ["2026-10-26", "2026-10-25"],
  ]) {
    assert.equal(
      progressReport(learner(), { ...filter, period: "custom", from, to }, now)
        .status,
      "invalid",
    );
  }
});
