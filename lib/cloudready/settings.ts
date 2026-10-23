import { z } from "zod";
import {
  learnerDataSchema,
  preferencesSchema,
  profileSchema,
  type LearnerData,
  type Profile,
} from "./models";
import type { LearnerRepository, StoragePort } from "./persistence";
import { createOnboardingDraftStore } from "./onboarding-storage";
import { dateInTimezone } from "./scheduler";

export const settingsValuesSchema = z.object({
  fullName: profileSchema.shape.fullName,
  displayName: profileSchema.shape.displayName,
  preferences: preferencesSchema.extend({
    timezone: z.string().trim().pipe(preferencesSchema.shape.timezone),
    difficultTopics: preferencesSchema.shape.difficultTopics.refine(
      (topics) => new Set(topics).size === topics.length,
    ),
  }),
});
export type SettingsValues = z.infer<typeof settingsValuesSchema>;
export function settingsValues(profile: Profile): SettingsValues {
  return {
    fullName: profile.fullName,
    displayName: profile.displayName,
    preferences: { ...profile.preferences },
  };
}
export function validateSettings(
  values: SettingsValues,
  base: Profile,
  now = new Date(),
) {
  const parsed = settingsValuesSchema.safeParse(values);
  const errors: Record<string, string> = {};
  if (!parsed.success)
    for (const issue of parsed.error.issues)
      errors[issue.path.join(".")] = issue.message;
  if (parsed.success) {
    const prefs = parsed.data.preferences;
    if (base.onboardingComplete && !prefs.studyDays.length)
      errors["preferences.studyDays"] = "Choose at least one study day.";
    if (
      prefs.examDate &&
      prefs.examDate !== base.preferences.examDate &&
      prefs.examDate < dateInTimezone(now, prefs.timezone)
    )
      errors["preferences.examDate"] =
        "Choose today or a later date, or leave the exam date blank.";
  }
  return errors;
}

export const SETTINGS_DRAFT_KEY = "cloudready:settings-draft:v1";
// Drafts permit incomplete field values while constraining their shape.
const draftSchema = z.object({
  base: profileSchema,
  values: z.object({
    fullName: z.string().max(1000),
    displayName: z.string().max(1000),
    preferences: preferencesSchema.extend({
      timezone: z.string().max(1000),
      minutesPerSession: z.number().finite(),
      examDate: z.string().max(10).nullable(),
    }),
  }),
});
export function createSettingsDraftStore(storage: StoragePort) {
  return {
    load(profileId: string) {
      const raw = storage.getItem(SETTINGS_DRAFT_KEY);
      if (!raw) return null;
      const draft = draftSchema.parse(JSON.parse(raw));
      if (draft.base.id !== profileId)
        throw new Error("This draft belongs to a different learner.");
      return draft;
    },
    save(base: Profile, values: SettingsValues) {
      storage.setItem(
        SETTINGS_DRAFT_KEY,
        JSON.stringify(draftSchema.parse({ base, values })),
      );
    },
    clear() {
      storage.removeItem(SETTINGS_DRAFT_KEY);
    },
  };
}

export function createSettingsService(
  repository: LearnerRepository,
  setupDrafts: ReturnType<typeof createOnboardingDraftStore>,
) {
  function read() {
    const loaded = repository.load();
    if (loaded.status !== "ready")
      throw new Error(
        "Your demo records could not be read. Refresh before making changes.",
      );
    return loaded.data;
  }
  function unchanged(expected: LearnerData) {
    const data = read();
    if (
      JSON.stringify(data) !== JSON.stringify(learnerDataSchema.parse(expected))
    )
      throw new Error(
        "Your learning records changed. Refresh and review the reset again.",
      );
    return data;
  }
  return {
    read,
    save(base: Profile, values: SettingsValues, now = new Date()) {
      const data = read();
      if (
        JSON.stringify(data.profile) !==
        JSON.stringify(profileSchema.parse(base))
      )
        throw new Error(
          "Your profile changed elsewhere. Discard these edits to load the latest settings before trying again.",
        );
      if (setupDrafts.load(data.profile.id).status !== "empty")
        throw new Error(
          "Finish or discard your onboarding draft before saving settings.",
        );
      if (Object.keys(validateSettings(values, base, now)).length)
        throw new Error("Check the highlighted settings before saving.");
      const valid = settingsValuesSchema.parse(values);
      const updated = {
        ...data,
        profile: profileSchema.parse({ ...data.profile, ...valid }),
      };
      repository.save(updated);
      return updated;
    },
    export(now = new Date()) {
      const data = read();
      return {
        filename: `cloudready-progress-${dateInTimezone(now, data.profile.preferences.timezone)}.json`,
        json: JSON.stringify(
          {
            format: "cloudready-demo-export",
            version: 1,
            exportedAt: now.toISOString(),
            data,
          },
          null,
          2,
        ),
      };
    },
    clearLearning(expected: LearnerData) {
      const data = unchanged(expected);
      const updated = learnerDataSchema.parse({
        schemaVersion: 1,
        profile: data.profile,
        sessions: [],
        lessonReviews: [],
        revision: [],
        activity: [],
      });
      repository.save(updated);
      return updated;
    },
    resetDemo(expected: LearnerData) {
      unchanged(expected);
      // Multiple browser keys cannot be removed transactionally. A failure is
      // reported as potentially partial, never as an intact or completed reset.
      try {
        repository.reset();
      } catch {
        throw new Error(
          "The demo reset may have partially completed. Refresh to check your records and retry if needed.",
        );
      }
    },
    discardSetupDraft() {
      setupDrafts.clear();
    },
  };
}
