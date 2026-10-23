import assert from "node:assert/strict";
import { test } from "node:test";
import { concepts, questions } from "../lib/cloudready/content";
import { createLearnerData } from "../lib/cloudready/defaults";
import { createLearningService } from "../lib/cloudready/learning";
import { createDemoRepository } from "../lib/cloudready/persistence";
import {
  createRevisionService,
  revisionQueue,
} from "../lib/cloudready/revision";
import type { RevisionItem } from "../lib/cloudready/models";
import { progressReport } from "../lib/cloudready/progress";

const now = new Date("2026-10-25T21:30:00Z"); // Monday locally, Sunday in UTC.
function fixture() {
  const values = new Map<string, string>();
  let fail = false;
  const repository = createDemoRepository({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (fail) throw new Error("Storage full");
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  });
  const data = createLearnerData({
    id: "demo",
    isDemo: true,
    timezone: "Africa/Nairobi",
  });
  repository.save(data);
  const service = createRevisionService(repository);
  const learning = createLearningService(repository);
  const read = () => {
    const result = repository.load();
    if (result.status !== "ready") throw new Error("No data");
    return result.data;
  };
  const add = (id = concepts[0].id) =>
    learning
      .addToRevision(id, now)
      .revision.find((item) => item.conceptId === id)!;
  return {
    repository,
    service,
    read,
    add,
    fail: (value: boolean) => {
      fail = value;
    },
  };
}

test("queue separates due, overdue, and upcoming by the learner calendar and preserves missing content", () => {
  const fx = fixture();
  fx.add();
  const data = fx.read();
  const item = data.revision[0];
  data.revision.push(
    { ...item, conceptId: concepts[1].id, nextReviewDate: "2026-10-20" },
    { ...item, conceptId: "removed-content", nextReviewDate: "2026-10-27" },
  );
  const before = structuredClone(data);
  const due = revisionQueue(data, "due", now);
  assert.equal(due.today, "2026-10-26");
  assert.equal(due.total, 3);
  assert.equal(due.dueCount, 2);
  assert.equal(due.upcomingCount, 1);
  assert.deepEqual(
    due.items.map((entry) => entry.item.nextReviewDate),
    ["2026-10-20", "2026-10-26"],
  );
  assert.equal(revisionQueue(data, "upcoming", now).items[0].concept, null);
  assert.equal(revisionQueue(data, "all", now).items.length, 3);
  assert.deepEqual(data, before);
});

test("saved recall schedules from the local rating day and adds activity without marked-question accuracy", () => {
  const fx = fixture();
  const item = fx.add();
  const before = fx.read();
  const question = questions[0];
  before.sessions = [
    {
      id: "saved-practice",
      kind: "practice",
      status: "completed",
      mode: "mixed",
      explanationTiming: "after-answer",
      confidenceEnabled: true,
      questionIds: [question.id],
      startedAt: now.toISOString(),
      completedAt: now.toISOString(),
      responses: [
        {
          questionId: question.id,
          sessionId: "saved-practice",
          topicId: question.topicId,
          conceptId: question.conceptId,
          selectedOptionId: question.options.find(
            (option) => option.id !== question.correctOptionId,
          )!.id,
          correct: false,
          confidence: "guessing",
          attemptType: "first-practice",
          submittedAt: now.toISOString(),
        },
      ],
    },
  ];
  fx.repository.save(before);
  const after = fx.service.review(item, "good", now);
  assert.equal(after.revision[0].nextReviewDate, "2026-11-02");
  assert.equal(after.revision[0].reviews, 1);
  assert.equal(after.revision[0].lastRating, "good");
  assert.deepEqual(after.sessions, before.sessions);
  assert.deepEqual(after.lessonReviews, before.lessonReviews);
  assert.deepEqual(fx.read(), after);
  const report = progressReport(
    after,
    { period: "all", scope: "practice" },
    now,
  );
  assert.equal(report.status, "ready");
  if (report.status !== "ready") throw new Error("Invalid report");
  assert.equal(report.revisionReviewed, 1);
  assert.equal(report.accuracy.percent, 0);
  assert.equal(report.accuracy.total, 1);
  assert.equal(revisionQueue(after, "due", now).items.length, 0);
  assert.equal(revisionQueue(after, "upcoming", now).items.length, 1);
});

test("stale and duplicate ratings cannot schedule twice; current unrelated changes survive", () => {
  const fx = fixture();
  const item = fx.add();
  const changed = fx.read();
  changed.profile.displayName = "Updated learner";
  fx.repository.save(changed);
  const after = fx.service.review(item, "easy", now);
  assert.equal(after.profile.displayName, "Updated learner");
  assert.throws(() => fx.service.review(item, "again", now), /changed/);
  assert.throws(() => fx.service.remove(item), /changed/);
  assert.equal(fx.read().activity.length, 1);
  const next = fx.service.review(after.revision[0], "easy", now);
  assert.equal(next.revision[0].intervalDays, 32);
  assert.equal(next.revision[0].easyStreak, 2);
});

test("removal and undo restore the exact previous schedule and order without removing activity", () => {
  const fx = fixture();
  const first = fx.add();
  fx.add(concepts[1].id);
  fx.service.review(first, "hard", now);
  const before = fx.read();
  const removed = fx.service.remove(before.revision[0]);
  assert.equal(removed.revision.length, 1);
  assert.deepEqual(removed.activity, before.activity);
  assert.deepEqual(fx.service.undoRemove(), before);
  assert.throws(() => fx.service.undoRemove(), /no removal/);
});

test("undo refuses changed data, re-added items, resets, and stale removal snapshots", () => {
  for (const change of ["profile", "re-add", "reset"] as const) {
    const fx = fixture();
    const item = fx.add();
    const baseline = fx.read();
    fx.service.remove(item);
    if (change === "profile") {
      const data = fx.read();
      data.profile.displayName = "Another name";
      fx.repository.save(data);
    }
    if (change === "re-add") fx.add();
    if (change === "reset") {
      fx.repository.reset();
      fx.repository.save({
        ...baseline,
        revision: [],
        profile: baseline.profile,
      });
    }
    const before = fx.read();
    assert.throws(() => fx.service.undoRemove(), /changed/);
    assert.deepEqual(fx.read(), before);
  }
});

test("failed writes preserve reviews, removals, and undo opportunity for retry", () => {
  const fx = fixture();
  const item = fx.add();
  const before = fx.read();
  fx.fail(true);
  assert.throws(() => fx.service.review(item, "good", now), /Storage full/);
  assert.throws(() => fx.service.remove(item), /Storage full/);
  assert.deepEqual(fx.read(), before);
  fx.fail(false);
  fx.service.remove(item);
  fx.fail(true);
  assert.throws(() => fx.service.undoRemove(), /Storage full/);
  assert.equal(fx.read().revision.length, 0);
  fx.fail(false);
  assert.deepEqual(fx.service.undoRemove(), before);
});

test("unavailable concepts can be removed but not rated, and unreadable records never get reset", () => {
  const fx = fixture();
  const known = fx.add();
  const missing: RevisionItem = { ...known, conceptId: "missing" };
  const data = { ...fx.read(), revision: [missing] };
  fx.repository.save(data);
  assert.throws(() => fx.service.review(missing, "good", now), /unavailable/);
  assert.equal(fx.service.remove(missing).revision.length, 0);
  fx.repository.reset();
  assert.throws(
    () => fx.service.review(known, "good", now),
    /could not be opened/,
  );
  assert.equal(fx.repository.load().status, "empty");
});
