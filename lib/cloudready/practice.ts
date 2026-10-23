import { z } from "zod";
import { questions, concepts, topics } from "./content";
import {
  topicIdSchema,
  sessionSchema,
  type LearnerData,
  type Question,
  type AssessmentSession,
} from "./models";
import { revisionPriority } from "./scoring";
import type { LearnerRepository } from "./persistence";

export const practiceOptionsSchema = z
  .object({
    mode: z.enum(["mixed", "topic", "weak-areas"]),
    topicId: topicIdSchema.nullable(),
    conceptId: z.string().min(1).nullable(),
    count: z.number().int().min(1).max(30),
    confidenceEnabled: z.boolean(),
    explanationTiming: z.enum(["after-answer", "after-session"]),
  })
  .superRefine((value, ctx) => {
    if (
      value.mode === "topic"
        ? !value.topicId
        : value.topicId !== null || value.conceptId !== null
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Choose a topic for topic practice; other modes must not carry topic filters.",
      });
  });
export type PracticeOptions = z.infer<typeof practiceOptionsSchema>;
export function unfinishedPractice(data: LearnerData) {
  return (
    data.sessions
      .filter(
        (session) =>
          session.kind === "practice" && session.status === "in-progress",
      )
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0] ??
    null
  );
}
export function practicePool(
  data: LearnerData,
  options: Pick<PracticeOptions, "mode" | "topicId" | "conceptId">,
  bank: readonly Question[] = questions,
) {
  const weak = new Set(data.revision.map((item) => item.conceptId));
  const latest = new Map<string, AssessmentSession["responses"][number]>();
  const responses = data.sessions.flatMap((session) => session.responses);
  for (const response of [...responses].sort(
    (a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt),
  ))
    latest.set(response.conceptId, response);
  for (const response of latest.values())
    if (revisionPriority(response) > 0) weak.add(response.conceptId);
  const eligible = bank.filter(
    (question) =>
      options.mode === "mixed" ||
      (options.mode === "topic" &&
        question.topicId === options.topicId &&
        (!options.conceptId || question.conceptId === options.conceptId)) ||
      (options.mode === "weak-areas" && weak.has(question.conceptId)),
  );
  const seen = new Set(responses.map((response) => response.questionId));
  const fresh = eligible.filter((question) => !seen.has(question.id));
  const repeated = eligible.filter((question) => seen.has(question.id));
  return { eligible, fresh, repeated, total: eligible.length };
}
export function createPracticeService(
  repository: LearnerRepository,
  bank: readonly Question[] = questions,
) {
  return {
    start(
      input: PracticeOptions,
      replaceSessionId?: string,
      now = new Date(),
      id: string = crypto.randomUUID(),
    ) {
      const options = practiceOptionsSchema.parse(input);
      if (new Set(bank.map((question) => question.id)).size !== bank.length)
        throw new Error("The question bank contains duplicate identifiers.");
      if (
        options.conceptId &&
        !concepts.some(
          (concept) =>
            concept.id === options.conceptId &&
            concept.topicId === options.topicId,
        )
      )
        throw new Error("Choose a concept from the selected topic.");
      const loaded = repository.load();
      if (loaded.status !== "ready")
        throw new Error("Your saved demo could not be opened.");
      const data = loaded.data;
      if (!data.profile.onboardingComplete)
        throw new Error(
          "Save your study preferences before starting practice.",
        );
      const unfinished = unfinishedPractice(data);
      if (replaceSessionId && unfinished?.id !== replaceSessionId)
        throw new Error(
          "Your saved practice session changed. Refresh before replacing it.",
        );
      if (unfinished && !replaceSessionId) return unfinished;
      const pool = practicePool(data, options, bank);
      if (options.count > pool.total)
        throw new Error("Choose a question count within the eligible pool.");
      if (data.sessions.some((session) => session.id === id))
        throw new Error("This session identifier already exists. Try again.");
      function spread(items: readonly Question[]) {
        const groups = topics.map((topic) =>
          items.filter((question) => question.topicId === topic.id),
        );
        return Array.from(
          { length: Math.max(0, ...groups.map((group) => group.length)) },
          (_, index) =>
            groups.flatMap((group) => (group[index] ? [group[index]] : [])),
        ).flat();
      }
      const chosen = [
        ...(options.mode === "mixed" ? spread(pool.fresh) : pool.fresh),
        ...(options.mode === "mixed" ? spread(pool.repeated) : pool.repeated),
      ].slice(0, options.count);
      const fresh = new Set(pool.fresh.map((question) => question.id));
      const session = sessionSchema.parse({
        id,
        kind: "practice",
        status: "in-progress",
        mode: options.mode,
        explanationTiming: options.explanationTiming,
        confidenceEnabled: options.confidenceEnabled,
        questionIds: chosen.map((question) => question.id),
        freshQuestionIds: chosen
          .filter((question) => fresh.has(question.id))
          .map((question) => question.id),
        practiceFocus: {
          topicId: options.topicId,
          conceptId: options.conceptId,
        },
        responses: [],
        startedAt: now.toISOString(),
        completedAt: null,
      });
      repository.save({
        ...data,
        sessions: [
          ...data.sessions.map((item) =>
            item.id === replaceSessionId
              ? { ...item, status: "abandoned" as const }
              : item,
          ),
          session,
        ],
      });
      return session;
    },
  };
}
