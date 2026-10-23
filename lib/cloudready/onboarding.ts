import { z } from "zod";
import {
  dateKeySchema,
  profileSchema,
  timezoneSchema,
  topicIdSchema,
  type Profile,
} from "./models";
import { dateInTimezone } from "./scheduler";

export const ONBOARDING_STORAGE_KEY = "cloudready:onboarding:v1";
export const onboardingValuesSchema = z.object({
  displayName: z.string().max(50),
  experience: profileSchema.shape.preferences.shape.experience,
  preparation: profileSchema.shape.preferences.shape.preparation,
  explanationStyle: profileSchema.shape.preferences.shape.explanationStyle,
  examDate: z.string().max(10),
  noExamDate: z.boolean(),
  studyDays: z.array(z.number().int().min(0).max(6)).max(7),
  minutesPerSession: z.string().max(6),
  timezone: z.string().max(100),
  difficultTopics: z.array(topicIdSchema).max(3),
  notSure: z.boolean(),
});
export type OnboardingValues = z.infer<typeof onboardingValuesSchema>;
export type OnboardingStep = 1 | 2 | 3;
export const onboardingDraftSchema = z.object({
  schemaVersion: z.literal(1),
  profileId: z.string().min(1),
  step: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  values: onboardingValuesSchema,
  updatedAt: z.iso.datetime(),
});
export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

export function valuesFromProfile(profile: Profile): OnboardingValues {
  return {
    displayName: profile.displayName,
    ...profile.preferences,
    examDate: profile.preferences.examDate ?? "",
    noExamDate: profile.preferences.examDate === null,
    minutesPerSession: String(profile.preferences.minutesPerSession),
    notSure: profile.preferences.difficultTopics.length === 0,
  };
}

export function validateOnboardingStep(
  values: OnboardingValues,
  step: OnboardingStep,
  now = new Date(),
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 1) {
    if (!values.displayName.trim() || values.displayName.trim().length > 50)
      errors.displayName = "Enter a display name between 1 and 50 characters.";
    for (const key of [
      "experience",
      "preparation",
      "explanationStyle",
    ] as const) {
      if (
        !profileSchema.shape.preferences.shape[key].safeParse(values[key])
          .success
      )
        errors[key] = "Choose an option to continue.";
    }
  }
  if (step === 2) {
    const validTimezone = timezoneSchema.safeParse(
      values.timezone.trim(),
    ).success;
    if (!validTimezone)
      errors.timezone =
        "Enter a valid timezone, such as Africa/Nairobi or UTC.";
    if (
      !values.studyDays.length ||
      new Set(values.studyDays).size !== values.studyDays.length ||
      values.studyDays.some(
        (day) => !Number.isInteger(day) || day < 0 || day > 6,
      )
    )
      errors.studyDays = "Choose at least one study day.";
    const minutes = Number(values.minutesPerSession);
    if (
      !values.minutesPerSession.trim() ||
      !Number.isInteger(minutes) ||
      minutes < 5 ||
      minutes > 240
    )
      errors.minutesPerSession =
        "Choose a whole number of minutes from 5 to 240.";
    if (!values.noExamDate) {
      if (!dateKeySchema.safeParse(values.examDate).success)
        errors.examDate =
          "Choose a valid exam date, or select that you haven’t chosen one.";
      else if (
        validTimezone &&
        values.examDate < dateInTimezone(now, values.timezone.trim())
      )
        errors.examDate =
          "Your exam date cannot be in the past in your chosen timezone.";
    }
  }
  if (step === 3) {
    if (values.notSure && values.difficultTopics.length)
      errors.difficultTopics =
        "Choose topics or Not sure yet, rather than both.";
    else if (!values.notSure && !values.difficultTopics.length)
      errors.difficultTopics =
        "Choose at least one topic, or select Not sure yet.";
    else if (
      new Set(values.difficultTopics).size !== values.difficultTopics.length ||
      values.difficultTopics.some(
        (topic) => !topicIdSchema.safeParse(topic).success,
      )
    )
      errors.difficultTopics = "Choose a valid topic once.";
  }
  return errors;
}

export function completedProfile(
  profile: Profile,
  values: OnboardingValues,
  now = new Date(),
): Profile {
  for (const step of [1, 2, 3] as const) {
    if (Object.keys(validateOnboardingStep(values, step, now)).length)
      throw new Error(`Complete onboarding step ${step} before saving.`);
  }
  return profileSchema.parse({
    ...profile,
    displayName: values.displayName.trim(),
    onboardingComplete: true,
    preferences: {
      experience: values.experience,
      preparation: values.preparation,
      explanationStyle: values.explanationStyle,
      examDate: values.noExamDate ? null : values.examDate,
      studyDays: values.studyDays,
      minutesPerSession: Number(values.minutesPerSession),
      timezone: values.timezone.trim(),
      difficultTopics: values.notSure ? [] : values.difficultTopics,
    },
  });
}
