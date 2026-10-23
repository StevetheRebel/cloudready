import { concepts } from "./content";
import type { LearnerData, TopicId } from "./models";
import type { LearnerRepository } from "./persistence";
import { dateInTimezone } from "./scheduler";
import { revisionPriority } from "./scoring";

export type LearningStatus =
  "all" | "reviewed" | "not-reviewed" | "needs-attention";
export function learningLibrary(
  data: LearnerData,
  query = "",
  topic: TopicId | "all" = "all",
  status: LearningStatus = "all",
) {
  const latest = new Map<
    string,
    LearnerData["sessions"][number]["responses"][number]
  >();
  for (const response of data.sessions
    .flatMap((session) => session.responses)
    .sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt)))
    latest.set(response.conceptId, response);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return concepts
    .map((concept) => ({
      ...concept,
      reviewed:
        data.lessonReviews.find((review) => review.conceptId === concept.id) ??
        null,
      inRevision:
        data.revision.find((item) => item.conceptId === concept.id) ?? null,
      needsAttention:
        data.revision.some((item) => item.conceptId === concept.id) ||
        (latest.has(concept.id) &&
          revisionPriority(latest.get(concept.id)!) > 0),
    }))
    .filter((concept) => {
      const text =
        `${concept.title} ${concept.summary} ${concept.keyTerms.join(" ")}`.toLowerCase();
      return (
        (topic === "all" || concept.topicId === topic) &&
        words.every((word) => text.includes(word)) &&
        (status === "all" ||
          (status === "reviewed" && concept.reviewed) ||
          (status === "not-reviewed" && !concept.reviewed) ||
          (status === "needs-attention" && concept.needsAttention))
      );
    });
}

export function createLearningService(repository: LearnerRepository) {
  function read(conceptId: string) {
    if (!concepts.some((concept) => concept.id === conceptId))
      throw new Error("This lesson could not be found.");
    const loaded = repository.load();
    if (loaded.status !== "ready")
      throw new Error(
        "Your saved demo could not be opened. Check browser storage and try again.",
      );
    return loaded.data;
  }
  return {
    markReviewed(conceptId: string, now = new Date()) {
      const data = read(conceptId);
      if (data.lessonReviews.some((review) => review.conceptId === conceptId))
        return data;
      const eventId = `lesson-reviewed:${conceptId}`;
      const updated: LearnerData = {
        ...data,
        lessonReviews: [
          ...data.lessonReviews,
          { conceptId, reviewedAt: now.toISOString() },
        ],
        activity: data.activity.some((event) => event.id === eventId)
          ? data.activity
          : [
              ...data.activity,
              {
                id: eventId,
                kind: "lesson-reviewed",
                targetId: conceptId,
                at: now.toISOString(),
              },
            ],
      };
      repository.save(updated);
      return updated;
    },
    addToRevision(conceptId: string, now = new Date()) {
      const data = read(conceptId);
      if (data.revision.some((item) => item.conceptId === conceptId))
        return data;
      const updated: LearnerData = {
        ...data,
        revision: [
          ...data.revision,
          {
            conceptId,
            reason: "manual",
            nextReviewDate: dateInTimezone(
              now,
              data.profile.preferences.timezone,
            ),
            lastReviewedAt: null,
            intervalDays: 0,
            easyStreak: 0,
            reviews: 0,
            lastRating: null,
          },
        ],
      };
      repository.save(updated);
      return updated;
    },
  };
}
