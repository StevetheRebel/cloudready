import assert from "node:assert/strict";
import { test } from "node:test";
import { createLearnerData } from "../lib/cloudready/defaults";
import { dashboardSummary, studyPlan } from "../lib/cloudready/dashboard";
import type {
  AssessmentSession,
  QuestionResponse,
} from "../lib/cloudready/models";

const now = new Date("2026-10-25T21:30:00Z"); // Monday in Nairobi, Sunday in UTC.
function learner() {
  return createLearnerData({
    id: "demo-learner",
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
    conceptId: id,
    selectedOptionId: "a",
    correct: true,
    confidence: "confident",
    submittedAt: "2026-10-25T21:10:00Z",
    attemptType: "first-practice",
    ...overrides,
  };
}
function session(
  id: string,
  responses: QuestionResponse[],
  overrides: Partial<AssessmentSession> = {},
): AssessmentSession {
  return {
    id,
    kind: "practice",
    status: "in-progress",
    mode: "mixed",
    explanationTiming: "after-answer",
    confidenceEnabled: true,
    questionIds: responses.map((item) => item.questionId),
    responses: responses.map((item) => ({ ...item, sessionId: id })),
    startedAt: "2026-10-20T10:00:00Z",
    completedAt: null,
    ...overrides,
  };
}

test("empty dashboard has no fabricated scores, activity, exam countdown, or priorities", () => {
  const result = dashboardSummary(learner(), now);
  assert.deepEqual(result.practice, { total: 0, correct: 0, percent: null });
  assert.equal(result.totalResponses, 0);
  assert.equal(result.examDays, null);
  assert.equal(result.topicsAttempted, 0);
  assert.equal(result.activeDaysThisWeek, 0);
  assert.equal(result.unfinished, null);
  assert.equal(result.hasDiagnostic, false);
  assert.deepEqual(result.priorities, []);
  assert.deepEqual(result.recentActivity, []);
  assert.ok(
    result.topics.every(
      (item) => item.percent === null && !item.enoughEvidence,
    ),
  );
});

test("practice accuracy excludes diagnostic responses and includes retries with explicit confidence counts", () => {
  const data = learner();
  data.sessions = [
    session(
      "diagnostic",
      [response("d", { attemptType: "diagnostic", correct: true })],
      {
        kind: "diagnostic",
        status: "completed",
        completedAt: "2026-10-25T21:15:00Z",
      },
    ),
    session("practice", [
      response("p", { correct: false, confidence: null }),
      response("r", { attemptType: "retry", confidence: "guessing" }),
    ]),
  ];
  const result = dashboardSummary(data, now);
  assert.deepEqual(result.practice, { total: 2, correct: 1, percent: 50 });
  assert.equal(result.totalResponses, 3);
  assert.equal(result.hasDiagnostic, true);
  assert.equal(result.topics[0].enoughEvidence, true);
  assert.equal(result.topics[0].confident, 1);
  assert.equal(result.topics[0].uncertain, 1);
  assert.equal(result.topics[0].unrated, 1);
  assert.equal(result.topics[1].percent, null);
  data.sessions = [session("wrong", [response("w", { correct: false })])];
  assert.equal(dashboardSummary(data, now).practice.percent, 0);
  assert.equal(dashboardSummary(data, now).topics[0].enoughEvidence, false);
});

test("revision uses the latest answer per concept, ranks confident errors, and includes due-only concepts", () => {
  const data = learner();
  data.sessions = [
    session("practice", [
      response("old", {
        conceptId: "resolved",
        correct: false,
        submittedAt: "2026-10-24T12:00:00Z",
      }),
      response("new", { conceptId: "resolved" }),
      response("uncertain", { confidence: "guessing" }),
      response("wrong", { correct: false }),
    ]),
  ];
  data.revision = [
    {
      conceptId: "due-only",
      reason: "manual",
      nextReviewDate: "2026-10-26",
      lastReviewedAt: null,
      intervalDays: 0,
      easyStreak: 0,
      reviews: 0,
      lastRating: null,
    },
  ];
  const before = structuredClone(data);
  const result = dashboardSummary(data, now);
  assert.deepEqual(
    result.priorities.map((item) => item.id),
    ["wrong", "uncertain", "due-only"],
  );
  assert.equal(result.dueCount, 1);
  assert.equal(result.topics[0].conceptsNeedingRevision, 2);
  assert.deepEqual(data, before);
});

test("weekly activity uses response/completion times in the learner timezone, ignores future records", () => {
  const data = learner();
  data.sessions = [
    session(
      "old-start",
      [
        response("sunday", { submittedAt: "2026-10-25T20:59:00Z" }),
        response("monday"),
        response("future", { submittedAt: "2026-10-26T10:00:00Z" }),
      ],
      { status: "completed", completedAt: "2026-10-25T21:20:00Z" },
    ),
  ];
  data.activity = [
    {
      id: "future",
      kind: "lesson-reviewed",
      targetId: "future",
      at: "2026-10-26T10:00:00Z",
    },
    {
      id: "real",
      kind: "session-completed",
      targetId: "old-start",
      at: "2026-10-25T21:20:00Z",
    },
  ];
  const result = dashboardSummary(data, now);
  assert.equal(result.today, "2026-10-26");
  assert.equal(result.weekDates[0].date, "2026-10-26");
  assert.equal(result.activeDaysThisWeek, 1);
  assert.equal(result.completedThisWeek, 1);
  assert.equal(result.totalResponses, 2);
  assert.deepEqual(
    result.recentActivity.map((item) => item.id),
    ["real"],
  );
  assert.equal(result.weekDates[1].future, true);
});

test("latest eligible unfinished session is selected without replacing any session", () => {
  const data = learner();
  data.sessions = [
    session("older", []),
    session("newer", [], { startedAt: "2026-10-25T21:00:00Z" }),
    session("future", [], { startedAt: "2026-10-26T10:00:00Z" }),
    session("done", [], {
      status: "completed",
      startedAt: "2026-10-25T21:20:00Z",
      completedAt: "2026-10-25T21:25:00Z",
    }),
  ];
  assert.equal(dashboardSummary(data, now).unfinished?.id, "newer");
  assert.equal(data.sessions.length, 4);
});

test("exam countdown uses calendar dates in the chosen timezone", () => {
  const data = learner();
  for (const [date, expected] of [
    ["2026-10-25", -1],
    ["2026-10-26", 0],
    ["2026-10-28", 2],
  ] as const) {
    data.profile.preferences.examDate = date;
    assert.equal(dashboardSummary(data, now).examDays, expected);
  }
});

test("study plans stay within the session budget and use setup before study", () => {
  for (const budget of [5, 10, 15, 30, 240]) {
    const data = learner();
    data.profile.preferences.minutesPerSession = budget;
    const { tasks: plan } = studyPlan(data, false, now);
    assert.ok(plan.every((item) => item.minutes > 0));
    assert.ok(plan.reduce((total, item) => total + item.minutes, 0) <= budget);
    assert.ok(plan.every((item) => item.href === "/onboarding"));
  }
});

test("returning plans resume saved work, then use lessons and scoped practice", () => {
  const data = learner();
  data.profile.onboardingComplete = true;
  data.profile.preferences.minutesPerSession = 30;
  data.profile.preferences.studyDays = [1];
  assert.equal(studyPlan(data, false, now).tasks[0].href, "/assessment/start");
  data.sessions = [session("saved / practice", [response("a")])];
  assert.equal(
    studyPlan(data, false, now).tasks[0].href,
    "/practice/saved%20%2F%20practice",
  );
  assert.equal(studyPlan(data, true, now).tasks[0].href, "/onboarding");
  data.sessions = [
    session("diagnostic", [], {
      kind: "diagnostic",
      status: "completed",
      completedAt: "2026-10-25T21:20:00Z",
    }),
  ];
  const before = structuredClone(data);
  const plan = studyPlan(data, false, now);
  assert.equal(plan.scheduledToday, true);
  assert.ok(plan.tasks[0].href.startsWith("/learn/"));
  assert.ok(plan.tasks[1].href.startsWith("/practice?concept="));
  assert.deepEqual(data, before);
  data.profile.preferences.minutesPerSession = 5;
  assert.ok(
    studyPlan(data, false, now).tasks.reduce(
      (sum, task) => sum + task.minutes,
      0,
    ) <= 5,
  );
});

test("dashboard links completed sessions but leaves missing targets unlinked", () => {
  const data = learner();
  data.sessions = [
    session("saved / result", [], {
      status: "completed",
      completedAt: "2026-10-25T21:20:00Z",
    }),
  ];
  data.activity = [
    {
      id: "one",
      kind: "session-completed",
      targetId: "saved / result",
      at: "2026-10-25T21:20:00Z",
    },
    {
      id: "two",
      kind: "session-completed",
      targetId: "missing",
      at: "2026-10-25T21:15:00Z",
    },
  ];
  const summary = dashboardSummary(data, now);
  assert.equal(summary.latestCompletedPractice?.id, "saved / result");
  assert.equal(
    summary.recentActivity[0].href,
    "/practice/saved%20%2F%20result/results",
  );
  assert.equal(summary.recentActivity[1].href, null);
});
