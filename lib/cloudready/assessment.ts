import { questions, topics } from "./content";
import {
  sessionSchema,
  type AssessmentSession,
  type LearnerData,
  type Question,
  type Confidence,
} from "./models";
import type { LearnerRepository } from "./persistence";
import { submitAnswer } from "./scoring";
import { dateInTimezone } from "./scheduler";
import { confidenceRequired } from "./assessment-flow";

export const DIAGNOSTIC_SIZE = 12;
export const QUESTIONS_PER_TOPIC = 4;
export function unfinishedDiagnostic(data: LearnerData) {
  return (
    data.sessions
      .filter(
        (session) =>
          session.kind === "diagnostic" && session.status === "in-progress",
      )
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0] ??
    null
  );
}
export function diagnosticPool(pool: readonly Question[] = questions) {
  const ids = new Set(pool.map((question) => question.id));
  if (ids.size !== pool.length)
    throw new Error("Question identifiers must be unique.");
  const groups = topics.map((topic) =>
    pool.filter((question) => question.topicId === topic.id),
  );
  if (groups.some((group) => group.length < QUESTIONS_PER_TOPIC))
    throw new Error("The diagnostic needs four reviewed questions per topic.");
  // Interleave topic groups so the learner encounters all three early.
  return Array.from({ length: QUESTIONS_PER_TOPIC }, (_, index) =>
    groups.map((group) => group[index]),
  ).flat();
}
export function sessionContentAvailable(
  session: AssessmentSession,
  pool: readonly Question[] = questions,
) {
  return session.questionIds.every((id) =>
    pool.some((question) => question.id === id),
  );
}

export function createAssessmentService(
  repository: LearnerRepository,
  pool: readonly Question[] = questions,
) {
  function read() {
    const loaded = repository.load();
    if (loaded.status !== "ready")
      throw new Error(
        "Your saved demo could not be opened. Return to the dashboard and try again.",
      );
    return loaded.data;
  }
  return {
    startDiagnostic(
      options: { replaceSessionId?: string } = {},
      now = new Date(),
      id: string = crypto.randomUUID(),
    ) {
      const data = read();
      if (!data.profile.onboardingComplete)
        throw new Error(
          "Complete your study preferences before starting the diagnostic.",
        );
      const unfinished = unfinishedDiagnostic(data);
      if (
        options.replaceSessionId &&
        unfinished?.id !== options.replaceSessionId
      )
        throw new Error(
          "The saved session changed. Refresh before replacing it.",
        );
      if (unfinished && !options.replaceSessionId) return unfinished;
      const questionIds = diagnosticPool(pool).map((question) => question.id);
      if (data.sessions.some((session) => session.id === id))
        throw new Error("This session identifier already exists. Try again.");
      const session = sessionSchema.parse({
        id,
        kind: "diagnostic",
        status: "in-progress",
        mode: "mixed",
        explanationTiming: "after-answer",
        confidenceEnabled: true,
        questionIds,
        responses: [],
        startedAt: now.toISOString(),
        completedAt: null,
      });
      repository.save({
        ...data,
        sessions: [
          ...data.sessions.map((item) =>
            item.id === options.replaceSessionId
              ? { ...item, status: "abandoned" as const }
              : item,
          ),
          session,
        ],
      });
      return session;
    },
    answer(
      sessionId: string,
      questionId: string,
      selectedOptionId: string,
      confidence: Confidence | null,
      now = new Date(),
    ) {
      // Re-read immediately before writing so stale tabs cannot submit an old question twice.
      const data = read();
      const session = data.sessions.find((item) => item.id === sessionId);
      if (!session) throw new Error("This study session could not be found.");
      const question = pool.find((item) => item.id === questionId);
      if (!question)
        throw new Error(
          "This question is no longer available. Your saved answers are kept.",
        );
      const attemptType =
        session.kind === "diagnostic"
          ? "diagnostic"
          : data.sessions.some((item) =>
                item.responses.some(
                  (response) =>
                    response.questionId === questionId &&
                    response.attemptType !== "diagnostic",
                ),
              )
            ? "retry"
            : "first-practice";
      const next = submitAnswer(
        session,
        question,
        selectedOptionId,
        confidenceRequired(session) ? confidence : null,
        attemptType,
        now,
      );
      const response = next.responses[next.responses.length - 1];
      const reason = !response.correct
        ? response.confidence === "confident"
          ? ("confident-incorrect" as const)
          : ("incorrect" as const)
        : response.confidence !== null && response.confidence !== "confident"
          ? ("uncertain-correct" as const)
          : null;
      const revision = [...data.revision];
      if (reason) {
        const existing = revision.findIndex(
          (item) => item.conceptId === response.conceptId,
        );
        if (existing < 0)
          revision.push({
            conceptId: response.conceptId,
            reason,
            nextReviewDate: dateInTimezone(
              now,
              data.profile.preferences.timezone,
            ),
            lastReviewedAt: null,
            intervalDays: 0,
            easyStreak: 0,
            reviews: 0,
            lastRating: null,
          });
        // Existing spaced-review schedules are retained; this is a new learning response, not a recall rating.
      }
      const eventId = `session-completed:${sessionId}`;
      const activity =
        next.status === "completed" &&
        !data.activity.some((event) => event.id === eventId)
          ? [
              ...data.activity,
              {
                id: eventId,
                kind: "session-completed" as const,
                targetId: sessionId,
                at: now.toISOString(),
              },
            ]
          : data.activity;
      const updated = {
        ...data,
        sessions: data.sessions.map((item) =>
          item.id === next.id ? next : item,
        ),
        revision,
        activity,
      };
      repository.save(updated);
      return { data: updated, session: next };
    },
  };
}
