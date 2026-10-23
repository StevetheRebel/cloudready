import { z } from "zod";

export const topicIdSchema = z.enum([
  "cloud-concepts",
  "azure-services",
  "management-governance",
]);
export const confidenceSchema = z.enum(["guessing", "somewhat", "confident"]);
const timestamp = z.iso.datetime();
export const dateKeySchema = z.iso.date();
export const timezoneSchema = z.string().refine((value) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}, "Choose a valid timezone");

export const preferencesSchema = z.object({
  experience: z.enum(["new", "some-knowledge", "revising"]),
  preparation: z.enum(["none", "started", "completed-course"]),
  explanationStyle: z.enum(["concise", "detailed", "example-first"]),
  examDate: dateKeySchema.nullable(),
  studyDays: z
    .array(z.number().int().min(0).max(6))
    .max(7)
    .refine((days) => new Set(days).size === days.length),
  minutesPerSession: z.number().int().min(5).max(240),
  timezone: timezoneSchema,
  difficultTopics: z.array(topicIdSchema).max(3),
});
export const profileSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().min(1).max(100),
  displayName: z.string().trim().min(1).max(50),
  isDemo: z.boolean(),
  onboardingComplete: z.boolean(),
  preferences: preferencesSchema,
});

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  explanation: z.string().min(1),
});
export const questionSchema = z
  .object({
    id: z.string().min(1),
    topicId: topicIdSchema,
    conceptId: z.string().min(1),
    text: z.string().min(1),
    options: z.array(optionSchema).length(4),
    correctOptionId: z.string().min(1),
    explanation: z.string().min(1),
    simplerExplanation: z.string().min(1).optional(),
    localScenario: z.string().optional(),
    source: z.object({
      title: z.string().min(1),
      url: z.url(),
      reviewedAt: dateKeySchema,
    }),
    difficulty: z.enum(["introductory", "intermediate"]),
  })
  .refine(
    (question) =>
      new Set(question.options.map((option) => option.id)).size === 4 &&
      question.options.some((option) => option.id === question.correctOptionId),
    "Questions need four unique options and a valid answer key",
  );

export const responseSchema = z.object({
  questionId: z.string().min(1),
  sessionId: z.string().min(1),
  topicId: topicIdSchema,
  conceptId: z.string().min(1),
  selectedOptionId: z.string().min(1),
  correct: z.boolean(),
  confidence: confidenceSchema.nullable(),
  submittedAt: timestamp,
  attemptType: z.enum(["diagnostic", "first-practice", "retry"]),
});
export const sessionSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["diagnostic", "practice"]),
    status: z.enum(["in-progress", "completed", "abandoned"]),
    mode: z.enum(["mixed", "topic", "weak-areas"]),
    explanationTiming: z.enum(["after-answer", "after-session"]),
    confidenceEnabled: z.boolean(),
    questionIds: z.array(z.string().min(1)).min(1),
    practiceFocus: z
      .object({
        topicId: topicIdSchema.nullable(),
        conceptId: z.string().min(1).nullable(),
      })
      .optional(),
    freshQuestionIds: z.array(z.string().min(1)).optional(),
    responses: z.array(responseSchema),
    startedAt: timestamp,
    completedAt: timestamp.nullable(),
  })
  .superRefine((session, ctx) => {
    const uniqueQuestions = new Set(session.questionIds);
    if (
      session.freshQuestionIds &&
      (new Set(session.freshQuestionIds).size !==
        session.freshQuestionIds.length ||
        session.freshQuestionIds.some((id) => !uniqueQuestions.has(id)))
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Fresh question identifiers must be unique and belong to the session",
      });
    const uniqueResponses = new Set(
      session.responses.map((response) => response.questionId),
    );
    if (
      uniqueQuestions.size !== session.questionIds.length ||
      uniqueResponses.size !== session.responses.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Session questions and responses must be unique",
      });
    for (const response of session.responses) {
      if (
        response.sessionId !== session.id ||
        !uniqueQuestions.has(response.questionId)
      )
        ctx.addIssue({
          code: "custom",
          message: "Response does not belong to this session",
        });
      if (
        (session.kind === "diagnostic" || session.confidenceEnabled) &&
        !response.confidence
      )
        ctx.addIssue({
          code: "custom",
          message: "Confidence is required for this session",
        });
      if (
        (session.kind === "diagnostic") !==
        (response.attemptType === "diagnostic")
      )
        ctx.addIssue({
          code: "custom",
          message: "Attempt type does not match session",
        });
    }
    if (
      session.status === "completed" &&
      (session.responses.length !== session.questionIds.length ||
        !session.completedAt)
    )
      ctx.addIssue({
        code: "custom",
        message: "Completed sessions need all responses and a completion date",
      });
  });

export const recallRatingSchema = z.enum(["again", "hard", "good", "easy"]);
export const revisionSchema = z.object({
  conceptId: z.string().min(1),
  reason: z.enum([
    "confident-incorrect",
    "uncertain-correct",
    "incorrect",
    "manual",
  ]),
  nextReviewDate: dateKeySchema,
  lastReviewedAt: timestamp.nullable(),
  intervalDays: z.number().int().min(0).max(120),
  easyStreak: z.number().int().min(0),
  reviews: z.number().int().min(0),
  lastRating: recallRatingSchema.nullable(),
});
export const lessonReviewSchema = z.object({
  conceptId: z.string().min(1),
  reviewedAt: timestamp,
});
export const activitySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["session-completed", "lesson-reviewed", "revision-reviewed"]),
  targetId: z.string().min(1),
  at: timestamp,
});
export const learnerDataSchema = z.object({
  schemaVersion: z.literal(1),
  profile: profileSchema,
  sessions: z.array(sessionSchema),
  lessonReviews: z.array(lessonReviewSchema),
  revision: z.array(revisionSchema),
  activity: z.array(activitySchema),
});

export type TopicId = z.infer<typeof topicIdSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionResponse = z.infer<typeof responseSchema>;
export type AssessmentSession = z.infer<typeof sessionSchema>;
export type RevisionItem = z.infer<typeof revisionSchema>;
export type RecallRating = z.infer<typeof recallRatingSchema>;
export type LearnerData = z.infer<typeof learnerDataSchema>;

export interface Concept {
  id: string;
  slug: string;
  topicId: TopicId;
  title: string;
  summary: string;
  readingMinutes: number;
  objective: string;
  explanation: string;
  keyTerms: string[];
  comparison: { label: string; detail: string }[];
  localScenario: string;
  misunderstandings: string[];
  recap: string;
  source: Question["source"];
  knowledgeCheckIds: string[];
}
