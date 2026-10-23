import assert from "node:assert/strict";
import { test } from "node:test";
import {
  explanationContent,
  preferredExplanation,
} from "../lib/cloudready/explanations";
import {
  assessmentStep,
  confidenceRequired,
} from "../lib/cloudready/assessment-flow";
import { createAssessmentService } from "../lib/cloudready/assessment";
import { questions } from "../lib/cloudready/content";
import { createLearnerData } from "../lib/cloudready/defaults";
import {
  sessionSchema,
  type AssessmentSession,
} from "../lib/cloudready/models";
import { createDemoRepository } from "../lib/cloudready/persistence";
import { submitAnswer } from "../lib/cloudready/scoring";

const now = new Date("2026-10-23T12:00:00Z");
function practice(
  overrides: Partial<AssessmentSession> = {},
): AssessmentSession {
  return sessionSchema.parse({
    id: "practice-1",
    kind: "practice",
    status: "in-progress",
    mode: "mixed",
    explanationTiming: "after-session",
    confidenceEnabled: false,
    questionIds: questions.slice(0, 2).map((question) => question.id),
    responses: [],
    startedAt: now.toISOString(),
    completedAt: null,
    ...overrides,
  });
}
function fixture(sessions: AssessmentSession[]) {
  const storage = new Map<string, string>();
  const repository = createDemoRepository({
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: (key) => {
      storage.delete(key);
    },
  });
  repository.save({
    ...createLearnerData({ id: "demo-learner", isDemo: true }),
    sessions,
  });
  return { service: createAssessmentService(repository), repository };
}

test("source-checked support covers all diagnostic questions and respects the selected format", () => {
  for (const question of questions) {
    assert.ok(question.simplerExplanation);
    assert.ok(question.localScenario);
    assert.equal(
      explanationContent(question, "standard").text,
      question.explanation,
    );
    assert.equal(
      explanationContent(question, "simpler").text,
      question.simplerExplanation,
    );
    assert.equal(
      explanationContent(question, "local").text,
      question.localScenario,
    );
    assert.equal(explanationContent(question, "local").fictional, true);
  }
  assert.equal(preferredExplanation("concise"), "simpler");
  assert.equal(preferredExplanation("example-first"), "local");
  assert.equal(preferredExplanation("detailed"), "standard");
});

test("AI-unconfigured and offline states retain usable source-checked explanations without generated claims", () => {
  const question = questions[0];
  const unconfigured = explanationContent(question, "ai", true);
  const offline = explanationContent(question, "ai", false);
  assert.match(unconfigured.notice!, /not connected/);
  assert.match(offline.notice!, /offline/);
  assert.equal(unconfigured.text, question.simplerExplanation);
  assert.equal(offline.text, unconfigured.text);
  const unsupported = {
    ...question,
    conceptId: "not-in-support-bank",
    simplerExplanation: undefined,
    localScenario: undefined,
  };
  assert.equal(
    explanationContent(unsupported, "local").text,
    unsupported.explanation,
  );
  assert.equal(explanationContent(unsupported, "local").fictional, false);
  assert.match(
    explanationContent(unsupported, "simpler").notice!,
    /not available/,
  );
});

test("after-session feedback remains hidden during a session and becomes available on completion", () => {
  const initial = practice();
  assert.equal(
    assessmentStep(initial, null, questions).revealExplanation,
    false,
  );
  const first = submitAnswer(
    initial,
    questions[0],
    questions[0].correctOptionId,
    null,
    "first-practice",
    now,
  );
  const reviewed = assessmentStep(first, questions[0].id, questions);
  assert.equal(reviewed.response?.correct, true);
  assert.equal(reviewed.revealExplanation, false);
  assert.equal(
    assessmentStep(first, null, questions).question?.id,
    questions[1].id,
  );
  const done = submitAnswer(
    first,
    questions[1],
    questions[1].correctOptionId,
    null,
    "first-practice",
    now,
  );
  assert.equal(
    assessmentStep(done, questions[0].id, questions).revealExplanation,
    true,
  );
  assert.equal(assessmentStep(done, null, questions).complete, true);
  assert.equal(
    assessmentStep(done, questions[0].id, questions).complete,
    false,
  );
});

test("after-answer feedback is immediate and future review IDs cannot skip an unanswered question", () => {
  const initial = practice({ explanationTiming: "after-answer" });
  assert.equal(
    assessmentStep(initial, questions[1].id, questions).question?.id,
    questions[0].id,
  );
  const answered = submitAnswer(
    initial,
    questions[0],
    "a",
    null,
    "first-practice",
    now,
  );
  assert.equal(
    assessmentStep(answered, questions[0].id, questions).revealExplanation,
    true,
  );
  assert.equal(
    assessmentStep(answered, questions[1].id, questions).question?.id,
    questions[1].id,
  );
});

test("diagnostic confidence remains mandatory while practice can disable it", () => {
  assert.equal(confidenceRequired(practice()), false);
  assert.equal(confidenceRequired(practice({ confidenceEnabled: true })), true);
  const diagnostic = practice({
    id: "diagnostic",
    kind: "diagnostic",
    confidenceEnabled: false,
  });
  assert.equal(confidenceRequired(diagnostic), true);
  assert.throws(
    () =>
      fixture([diagnostic]).service.answer(
        diagnostic.id,
        questions[0].id,
        "a",
        null,
        now,
      ),
    /confidence/,
  );
  const required = practice({ confidenceEnabled: true });
  assert.throws(
    () =>
      fixture([required]).service.answer(
        required.id,
        questions[0].id,
        "a",
        null,
        now,
      ),
    /confidence/,
  );
});

test("unrated correct practice is not misclassified as uncertain and completion persists once", () => {
  const f = fixture([practice()]);
  const first = f.service.answer(
    "practice-1",
    questions[0].id,
    questions[0].correctOptionId,
    "guessing",
    now,
  );
  assert.equal(first.session.responses[0].confidence, null);
  assert.equal(first.session.responses[0].attemptType, "first-practice");
  assert.equal(first.data.revision.length, 0);
  const done = f.service.answer(
    "practice-1",
    questions[1].id,
    questions[1].correctOptionId,
    null,
    now,
  );
  assert.equal(done.session.status, "completed");
  assert.equal(done.data.activity.length, 1);
  assert.throws(
    () => f.service.answer("practice-1", questions[1].id, "a", null, now),
    /already ended/,
  );
});

test("practice retry classification uses practice history while a prior diagnostic stays separate", () => {
  const diagnostic = practice({
    id: "diagnostic",
    kind: "diagnostic",
    confidenceEnabled: true,
    questionIds: [questions[0].id],
  });
  const completedDiagnostic = submitAnswer(
    diagnostic,
    questions[0],
    "a",
    "confident",
    "diagnostic",
    now,
  );
  const f = fixture([completedDiagnostic, practice()]);
  const first = f.service.answer("practice-1", questions[0].id, "a", null, now);
  assert.equal(first.session.responses[0].attemptType, "first-practice");
  const nextPractice = practice({
    id: "practice-2",
    confidenceEnabled: true,
    questionIds: [questions[0].id],
  });
  f.repository.save({
    ...first.data,
    sessions: [...first.data.sessions, nextPractice],
  });
  const retry = f.service.answer(
    nextPractice.id,
    questions[0].id,
    questions[0].correctOptionId,
    "guessing",
    now,
  );
  assert.equal(retry.session.responses[0].attemptType, "retry");
  assert.equal(retry.session.responses[0].confidence, "guessing");
  assert.equal(retry.data.sessions[0].responses[0].selectedOptionId, "a");
});
