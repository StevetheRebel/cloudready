import assert from "node:assert/strict";
import { test } from "node:test";
import { createLearnerData } from "../lib/cloudready/defaults";
import {
  learnerDataSchema,
  type AssessmentSession,
  type Question,
  type RevisionItem,
} from "../lib/cloudready/models";
import {
  createDemoRepository,
  DEMO_STORAGE_KEY,
  type StoragePort,
} from "../lib/cloudready/persistence";
import { createDemoService } from "../lib/cloudready/services";
import {
  accuracyOf,
  classifyResponse,
  revisionPriority,
  submitAnswer,
} from "../lib/cloudready/scoring";
import {
  dateInTimezone,
  isDue,
  scheduleNext,
} from "../lib/cloudready/scheduler";

const now = new Date("2026-10-23T22:30:00Z");
function memoryStorage(): StoragePort {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}
const question: Question = {
  id: "test-question",
  topicId: "cloud-concepts",
  conceptId: "test-concept",
  text: "Test fixture only",
  options: ["a", "b", "c", "d"].map((id) => ({
    id,
    text: id,
    explanation: "Test explanation",
  })),
  correctOptionId: "b",
  explanation: "Test explanation",
  source: {
    title: "Test fixture",
    url: "https://example.com",
    reviewedAt: "2026-10-23",
  },
  difficulty: "introductory",
};
function session(): AssessmentSession {
  return {
    id: "test-session",
    kind: "diagnostic",
    status: "in-progress",
    mode: "mixed",
    explanationTiming: "after-answer",
    confidenceEnabled: true,
    questionIds: [question.id],
    responses: [],
    startedAt: now.toISOString(),
    completedAt: null,
  };
}
const item: RevisionItem = {
  conceptId: "test-concept",
  reason: "manual",
  nextReviewDate: "2026-10-23",
  lastReviewedAt: null,
  intervalDays: 0,
  easyStreak: 0,
  reviews: 0,
  lastRating: null,
};

test("demo persistence survives service recreation, strips unknown fields, and resets only demo data", () => {
  const storage = memoryStorage();
  storage.setItem("cloudready:theme", "dark");
  const service = createDemoService(createDemoRepository(storage));
  const initial = service.start("Africa/Nairobi");
  assert.equal(initial.sessions.length, 0);
  service.updateProfile({ ...initial.profile, displayName: "Amina" });
  const current = createDemoService(createDemoRepository(storage)).read();
  assert.equal(current.status, "ready");
  if (current.status === "ready")
    assert.equal(current.data.profile.displayName, "Amina");
  createDemoRepository(storage).save({
    ...initial,
    password: "must-not-persist",
  } as typeof initial);
  assert.equal(
    storage.getItem(DEMO_STORAGE_KEY)?.includes("must-not-persist"),
    false,
  );
  service.reset();
  assert.equal(service.read().status, "empty");
  assert.equal(storage.getItem("cloudready:theme"), "dark");
});

test("unreadable data is reported and retained until an explicit reset", () => {
  const storage = memoryStorage();
  storage.setItem(DEMO_STORAGE_KEY, "broken-json");
  const service = createDemoService(createDemoRepository(storage));
  assert.equal(service.read().status, "error");
  assert.throws(() => service.start("UTC"));
  assert.equal(storage.getItem(DEMO_STORAGE_KEY), "broken-json");
});

test("demo storage rejects real profiles and reports blocked or full storage", () => {
  const repository = createDemoRepository(memoryStorage());
  assert.throws(() =>
    repository.save(createLearnerData({ id: "real-account", isDemo: false })),
  );
  const blocked = createDemoRepository({
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("quota");
    },
    removeItem() {},
  });
  assert.equal(blocked.load().status, "error");
  assert.throws(() =>
    blocked.save(createLearnerData({ id: "demo", isDemo: true })),
  );
});

test("unknown schema versions and duplicate response records are rejected", () => {
  const initial = createLearnerData({ id: "demo", isDemo: true });
  assert.equal(
    learnerDataSchema.safeParse({ ...initial, schemaVersion: 2 }).success,
    false,
  );
  const completed = submitAnswer(
    session(),
    question,
    "b",
    "confident",
    "diagnostic",
    now,
  );
  assert.equal(
    learnerDataSchema.safeParse({
      ...initial,
      sessions: [
        {
          ...completed,
          responses: [...completed.responses, ...completed.responses],
        },
      ],
    }).success,
    false,
  );
});

test("marking uses the answer key, requires diagnostic confidence, and locks submitted answers", () => {
  const initial = session();
  assert.throws(() =>
    submitAnswer(initial, question, "b", null, "diagnostic", now),
  );
  assert.throws(() =>
    submitAnswer(
      initial,
      question,
      "missing-option",
      "confident",
      "diagnostic",
      now,
    ),
  );
  const completed = submitAnswer(
    initial,
    question,
    "a",
    "confident",
    "diagnostic",
    now,
  );
  assert.equal(completed.responses[0].correct, false);
  assert.equal(completed.responses[0].selectedOptionId, "a");
  assert.equal(completed.status, "completed");
  assert.throws(() =>
    submitAnswer(completed, question, "b", "confident", "diagnostic", now),
  );
  assert.equal(initial.responses.length, 0);
});

test("unrated practice stays separate from uncertainty, and empty accuracy has no percentage", () => {
  assert.deepEqual(accuracyOf([]), { total: 0, correct: 0, percent: null });
  assert.equal(
    classifyResponse({ correct: true, confidence: null }),
    "correct-unrated",
  );
  assert.ok(
    revisionPriority({ correct: false, confidence: "confident" }) >
      revisionPriority({ correct: false, confidence: "guessing" }),
  );
  const practice = {
    ...session(),
    kind: "practice" as const,
    confidenceEnabled: false,
  };
  const completed = submitAnswer(
    practice,
    question,
    "b",
    null,
    "first-practice",
    now,
  );
  assert.deepEqual(accuracyOf(completed.responses), {
    total: 1,
    correct: 1,
    percent: 100,
  });
});

test("revision scheduling uses the learner's local date, doubles Easy, caps intervals, and resets streaks", () => {
  assert.equal(dateInTimezone(now, "Africa/Nairobi"), "2026-10-24");
  assert.equal(
    scheduleNext(item, "again", "Africa/Nairobi", now).nextReviewDate,
    "2026-10-25",
  );
  assert.equal(
    scheduleNext(item, "hard", "Africa/Nairobi", now).intervalDays,
    3,
  );
  let next = item;
  for (const expected of [16, 32, 64, 120, 120]) {
    next = scheduleNext(next, "easy", "Africa/Nairobi", now);
    assert.equal(next.intervalDays, expected);
  }
  next = scheduleNext(next, "good", "Africa/Nairobi", now);
  assert.equal(next.easyStreak, 0);
  assert.equal(next.intervalDays, 7);
  assert.equal(
    isDue({ ...item, nextReviewDate: "2026-10-24" }, "Africa/Nairobi", now),
    true,
  );
  assert.equal(
    isDue({ ...item, nextReviewDate: "2026-10-25" }, "Africa/Nairobi", now),
    false,
  );
});

test("calendar scheduling crosses DST and year boundaries without changing the intended day", () => {
  const next = scheduleNext(
    item,
    "again",
    "America/New_York",
    new Date("2026-10-31T16:00:00Z"),
  );
  assert.equal(next.nextReviewDate, "2026-11-01");
  assert.equal(
    scheduleNext(item, "again", "UTC", new Date("2026-12-31T23:00:00Z"))
      .nextReviewDate,
    "2027-01-01",
  );
});
