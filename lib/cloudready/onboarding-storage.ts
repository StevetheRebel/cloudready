import {
  ONBOARDING_STORAGE_KEY,
  completedProfile,
  onboardingDraftSchema,
  onboardingValuesSchema,
  validateOnboardingStep,
  type OnboardingDraft,
  type OnboardingValues,
} from "./onboarding";
import type { LearnerRepository, StoragePort } from "./persistence";

export function createOnboardingDraftStore(storage: StoragePort) {
  return {
    load(
      profileId: string,
    ):
      | { status: "empty" }
      | { status: "ready"; draft: OnboardingDraft }
      | { status: "error"; message: string } {
      try {
        const raw = storage.getItem(ONBOARDING_STORAGE_KEY);
        if (!raw) return { status: "empty" };
        const result = onboardingDraftSchema.safeParse(JSON.parse(raw));
        if (!result.success || result.data.profileId !== profileId)
          return {
            status: "error",
            message:
              "The saved setup draft could not be read for this demo profile. Reset demo data explicitly to start again.",
          };
        return { status: "ready", draft: result.data };
      } catch {
        return {
          status: "error",
          message:
            "Your setup draft could not be read. Check browser storage permissions.",
        };
      }
    },
    save(draft: OnboardingDraft) {
      storage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify(onboardingDraftSchema.parse(draft)),
      );
    },
    clear() {
      storage.removeItem(ONBOARDING_STORAGE_KEY);
    },
  };
}

export function finishDemoOnboarding(
  repository: LearnerRepository,
  drafts: ReturnType<typeof createOnboardingDraftStore>,
  values: OnboardingValues,
  now = new Date(),
) {
  onboardingValuesSchema.parse(values);
  for (const step of [1, 2, 3] as const) {
    const errors = validateOnboardingStep(values, step, now);
    if (Object.keys(errors).length) return { ok: false as const, step, errors };
  }
  // Read fresh records so editing preferences never overwrites learning activity.
  const current = repository.load();
  if (current.status !== "ready" || !current.data.profile.isDemo)
    throw new Error(
      "Open a readable demo profile before saving your preferences.",
    );
  const data = {
    ...current.data,
    profile: completedProfile(current.data.profile, values, now),
  };
  repository.save(data);
  let draftCleared = true;
  try {
    drafts.clear();
  } catch {
    draftCleared = false;
  }
  return { ok: true as const, data, draftCleared };
}
