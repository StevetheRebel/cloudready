import { concepts } from "./content";
import {
  learnerDataSchema,
  recallRatingSchema,
  revisionSchema,
  type LearnerData,
  type RecallRating,
  type RevisionItem,
} from "./models";
import type { LearnerRepository } from "./persistence";
import { dateInTimezone, scheduleNext } from "./scheduler";

export type RevisionView = "due" | "upcoming" | "all";
export function revisionQueue(
  data: LearnerData,
  view: RevisionView = "due",
  now = new Date(),
) {
  const timezone = data.profile.preferences.timezone;
  const today = dateInTimezone(now, timezone);
  const items = [...data.revision].sort(
    (a, b) =>
      a.nextReviewDate.localeCompare(b.nextReviewDate) ||
      a.conceptId.localeCompare(b.conceptId),
  );
  return {
    today,
    timezone,
    dueCount: items.filter((item) => item.nextReviewDate <= today).length,
    upcomingCount: items.filter((item) => item.nextReviewDate > today).length,
    total: items.length,
    items: items
      .filter(
        (item) =>
          view === "all" ||
          (view === "due"
            ? item.nextReviewDate <= today
            : item.nextReviewDate > today),
      )
      .map((item) => ({
        item,
        concept:
          concepts.find((concept) => concept.id === item.conceptId) ?? null,
      })),
  };
}

// Read current data for every write; the displayed revision snapshot guards stale actions.
export function createRevisionService(repository: LearnerRepository) {
  let undo: { before: LearnerData; expected: string } | null = null;
  function read() {
    const loaded = repository.load();
    if (loaded.status !== "ready")
      throw new Error(
        "Your saved demo could not be opened. Check browser storage and refresh.",
      );
    return loaded.data;
  }
  function current(data: LearnerData, expected: RevisionItem) {
    const valid = revisionSchema.parse(expected);
    const item = data.revision.find(
      (item) => item.conceptId === valid.conceptId,
    );
    if (!item || JSON.stringify(item) !== JSON.stringify(valid))
      throw new Error(
        "This revision item changed. Refresh the queue and reveal it again before continuing.",
      );
    return item;
  }
  return {
    review(expected: RevisionItem, rating: RecallRating, now = new Date()) {
      recallRatingSchema.parse(rating);
      const data = read();
      const item = current(data, expected);
      if (!concepts.some((concept) => concept.id === item.conceptId))
        throw new Error(
          "This concept's review content is unavailable. You can remove the item or choose another.",
        );
      const scheduled = scheduleNext(
        item,
        rating,
        data.profile.preferences.timezone,
        now,
      );
      const updated: LearnerData = {
        ...data,
        revision: data.revision.map((value) =>
          value.conceptId === item.conceptId ? scheduled : value,
        ),
        activity: [
          ...data.activity,
          {
            id: `revision-reviewed:${crypto.randomUUID()}`,
            kind: "revision-reviewed",
            targetId: item.conceptId,
            at: now.toISOString(),
          },
        ],
      };
      repository.save(updated);
      undo = null;
      return updated;
    },
    remove(expected: RevisionItem) {
      const data = read();
      const item = current(data, expected);
      const updated = {
        ...data,
        revisionRemovalId: crypto.randomUUID(),
        revision: data.revision.filter(
          (value) => value.conceptId !== item.conceptId,
        ),
      };
      repository.save(updated);
      // Undo is deliberately limited to the exact post-removal state, so it cannot
      // overwrite a reset, a re-added concept, or changes from another tab.
      undo = {
        before: data,
        expected: JSON.stringify(learnerDataSchema.parse(updated)),
      };
      return updated;
    },
    undoRemove() {
      if (!undo) throw new Error("There is no removal to undo on this page.");
      const data = read();
      if (JSON.stringify(data) !== undo.expected)
        throw new Error(
          "Your learning records changed after removal. Undo is unavailable; add the concept again from its lesson if needed.",
        );
      const updated = undo.before;
      repository.save(updated);
      undo = null;
      return updated;
    },
  };
}
