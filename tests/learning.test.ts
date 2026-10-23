import assert from "node:assert/strict";
import { test } from "node:test";
import { concepts, questions, topics } from "../lib/cloudready/content";
import {
  createLearningService,
  learningLibrary,
} from "../lib/cloudready/learning";
import { createLearnerData } from "../lib/cloudready/defaults";
import { createDemoRepository } from "../lib/cloudready/persistence";
import { sessionSchema, type LearnerData } from "../lib/cloudready/models";
import { dashboardSummary } from "../lib/cloudready/dashboard";
const now = new Date("2026-10-25T21:30:00Z");
function fixture() {
  const values = new Map<string, string>();
  let writes = 0;
  const repository = createDemoRepository({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
      writes++;
    },
    removeItem: (key) => {
      values.delete(key);
    },
  });
  const data = createLearnerData({
    id: "demo-learner",
    isDemo: true,
    timezone: "Africa/Nairobi",
  });
  repository.save(data);
  return {
    repository,
    service: createLearningService(repository),
    writes: () => writes,
    read: () => {
      const loaded = repository.load();
      if (loaded.status !== "ready") throw new Error("Fixture unavailable");
      return loaded.data;
    },
  };
}
function withAnswer(
  data: LearnerData,
  correct: boolean,
  at = now.toISOString(),
) {
  const question = questions[0];
  const session = sessionSchema.parse({
    id: `session-${data.sessions.length}`,
    kind: "diagnostic",
    status: "completed",
    mode: "mixed",
    explanationTiming: "after-answer",
    confidenceEnabled: true,
    questionIds: [question.id],
    startedAt: at,
    completedAt: at,
    responses: [
      {
        questionId: question.id,
        sessionId: `session-${data.sessions.length}`,
        topicId: question.topicId,
        conceptId: question.conceptId,
        selectedOptionId: correct
          ? question.correctOptionId
          : question.options.find(
              (option) => option.id !== question.correctOptionId,
            )!.id,
        correct,
        confidence: "confident",
        submittedAt: at,
        attemptType: "diagnostic",
      },
    ],
  });
  return { ...data, sessions: [...data.sessions, session] };
}

test("all 12 lessons have stable unique routes, balanced topics, source references and matching recap checks", () => {
  assert.equal(concepts.length, 12);
  assert.equal(new Set(concepts.map((concept) => concept.id)).size, 12);
  assert.equal(new Set(concepts.map((concept) => concept.slug)).size, 12);
  for (const topic of topics)
    assert.equal(
      concepts.filter((concept) => concept.topicId === topic.id).length,
      4,
    );
  for (const concept of concepts) {
    assert.match(concept.slug, /^[a-z0-9-]+$/);
    assert.ok(concept.explanation.length > 50);
    assert.equal(concept.comparison.length, 2);
    assert.match(concept.localScenario, /fictional/i);
    assert.equal(new URL(concept.source.url).hostname, "learn.microsoft.com");
    assert.ok(concept.knowledgeCheckIds.length > 0);
    assert.ok(
      concept.knowledgeCheckIds.every((id) =>
        questions.some(
          (question) => question.id === id && question.conceptId === concept.id,
        ),
      ),
    );
  }
});

test("marking reviewed persists one lesson and one activity event without changing marked answers", () => {
  const f = fixture();
  const existing = withAnswer(f.read(), false);
  f.repository.save(existing);
  const saved = f.service.markReviewed(concepts[0].id, now);
  assert.deepEqual(saved.sessions, existing.sessions);
  assert.deepEqual(saved.revision, existing.revision);
  assert.equal(saved.lessonReviews.length, 1);
  assert.equal(saved.activity[0].kind, "lesson-reviewed");
  assert.equal(saved.activity[0].targetId, concepts[0].id);
  assert.equal(dashboardSummary(saved, now).activeDaysThisWeek, 1);
  const count = f.writes();
  f.service.markReviewed(concepts[0].id, new Date("2026-10-27T12:00:00Z"));
  assert.equal(f.writes(), count);
  assert.deepEqual(f.read().lessonReviews, saved.lessonReviews);
});

test("adding to revision uses the learner's calendar day and preserves existing schedules", () => {
  const f = fixture();
  const saved = f.service.addToRevision(concepts[0].id, now);
  assert.equal(saved.revision[0].nextReviewDate, "2026-10-26");
  assert.equal(saved.revision[0].reason, "manual");
  assert.equal(saved.activity.length, 0);
  assert.equal(saved.lessonReviews.length, 0);
  saved.revision[0].nextReviewDate = "2026-11-12";
  saved.revision[0].intervalDays = 16;
  saved.revision[0].reviews = 2;
  f.repository.save(saved);
  const count = f.writes();
  const again = f.service.addToRevision(concepts[0].id, now);
  assert.equal(f.writes(), count);
  assert.deepEqual(again.revision, saved.revision);
});

test("learning mutations read the latest profile and retain existing records", () => {
  const f = fixture();
  const updated = f.read();
  updated.profile.displayName = "New display name";
  f.repository.save(updated);
  const result = f.service.markReviewed(concepts[1].id, now);
  assert.equal(result.profile.displayName, "New display name");
  assert.deepEqual(result.sessions, updated.sessions);
  assert.deepEqual(result.revision, updated.revision);
});

test("unknown concepts, unreadable data and failed writes cannot silently replace saved data", () => {
  const f = fixture();
  const before = f.read();
  const count = f.writes();
  assert.throws(() => f.service.markReviewed("missing", now), /not be found/);
  assert.throws(() => f.service.addToRevision("missing", now), /not be found/);
  assert.equal(f.writes(), count);
  const failed = createLearningService({
    ...f.repository,
    save: () => {
      throw new Error("Storage unavailable");
    },
  });
  assert.throws(
    () => failed.markReviewed(concepts[0].id, now),
    /Storage unavailable/,
  );
  assert.throws(
    () => failed.addToRevision(concepts[0].id, now),
    /Storage unavailable/,
  );
  assert.deepEqual(f.read(), before);
  f.repository.reset();
  assert.throws(
    () => f.service.markReviewed(concepts[0].id, now),
    /saved demo/,
  );
});

test("library search combines case-insensitive terms, topic and review filters with honest empty results", () => {
  const f = fixture();
  assert.equal(
    learningLibrary(f.read(), "  pAaS  ")[0].id,
    "cloud-service-models",
  );
  assert.equal(
    learningLibrary(f.read(), "region", "management-governance").length,
    0,
  );
  assert.equal(learningLibrary(f.read(), "", "azure-services").length, 4);
  assert.equal(learningLibrary(f.read(), "not a lesson").length, 0);
  assert.equal(learningLibrary(f.read(), "", "all", "reviewed").length, 0);
  const saved = f.service.markReviewed(concepts[0].id, now);
  assert.equal(learningLibrary(saved, "", "all", "reviewed").length, 1);
  assert.equal(learningLibrary(saved, "", "all", "not-reviewed").length, 11);
});

test("needs-attention remains independent of reviewed status and uses latest answer reasoning", () => {
  const f = fixture();
  const mistaken = withAnswer(f.read(), false, "2026-10-25T20:00:00Z");
  f.repository.save(mistaken);
  const reviewed = f.service.markReviewed(concepts[0].id, now);
  const attention = learningLibrary(reviewed, "", "all", "needs-attention");
  assert.equal(attention.length, 1);
  assert.ok(attention[0].reviewed);
  const corrected = withAnswer(reviewed, true);
  assert.equal(
    learningLibrary(corrected, "", "all", "needs-attention").length,
    0,
  );
  f.repository.save(corrected);
  f.service.addToRevision(concepts[0].id, now);
  assert.equal(
    learningLibrary(f.read(), "", "all", "needs-attention").length,
    1,
  );
});

test("filtering and reading lessons do not mutate learner data or create study activity", () => {
  const f = fixture();
  const data = f.read();
  const before = structuredClone(data);
  const count = f.writes();
  learningLibrary(data, "region");
  learningLibrary(data, "", "all", "needs-attention");
  assert.deepEqual(data, before);
  assert.equal(f.writes(), count);
  assert.equal(data.activity.length, 0);
});
