import { learnerDataSchema, type LearnerData } from "./models";

export function createLearnerData({
  id,
  isDemo,
  timezone = "UTC",
}: {
  id: string;
  isDemo: boolean;
  timezone?: string;
}): LearnerData {
  return learnerDataSchema.parse({
    schemaVersion: 1,
    profile: {
      id,
      isDemo,
      fullName: isDemo ? "Demo learner" : "Learner",
      displayName: isDemo ? "Demo learner" : "Learner",
      onboardingComplete: false,
      preferences: {
        experience: "new",
        preparation: "none",
        explanationStyle: "example-first",
        examDate: null,
        studyDays: [],
        minutesPerSession: 15,
        timezone,
        difficultTopics: [],
      },
    },
    sessions: [],
    lessonReviews: [],
    revision: [],
    activity: [],
  });
}
