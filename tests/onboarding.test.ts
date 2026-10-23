import assert from "node:assert/strict";
import { test } from "node:test";
import { createLearnerData } from "../lib/cloudready/defaults";
import {
  createDemoRepository,
  DEMO_STORAGE_KEY,
  type StoragePort,
} from "../lib/cloudready/persistence";
import {
  ONBOARDING_STORAGE_KEY,
  completedProfile,
  validateOnboardingStep,
  valuesFromProfile,
  type OnboardingValues,
} from "../lib/cloudready/onboarding";
import {
  createOnboardingDraftStore,
  finishDemoOnboarding,
} from "../lib/cloudready/onboarding-storage";

const now = new Date("2026-10-23T22:30:00Z");
function memoryStorage(): StoragePort {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}
const initial = createLearnerData({
  id: "demo-learner",
  isDemo: true,
  timezone: "Africa/Nairobi",
});
const valid: OnboardingValues = {
  ...valuesFromProfile(initial.profile),
  displayName: " Amina ",
  studyDays: [1, 3, 5],
  minutesPerSession: "20",
  notSure: false,
  difficultTopics: ["cloud-concepts"],
};

test("onboarding validates background, study availability, minutes, and editable timezone", () => {
  assert.ok(
    validateOnboardingStep({ ...valid, displayName: " " }, 1, now).displayName,
  );
  const errors = validateOnboardingStep(
    {
      ...valid,
      studyDays: [],
      minutesPerSession: "3.5",
      timezone: "invalid/zone",
    },
    2,
    now,
  );
  assert.deepEqual(Object.keys(errors).sort(), [
    "minutesPerSession",
    "studyDays",
    "timezone",
  ]);
  assert.ok(
    validateOnboardingStep({ ...valid, studyDays: [1, 1] }, 2, now).studyDays,
  );
  assert.deepEqual(validateOnboardingStep(valid, 2, now), {});
});

test("past exam dates are rejected in the chosen timezone, while today remains valid", () => {
  const value = { ...valid, noExamDate: false, examDate: "2026-10-23" };
  assert.ok(validateOnboardingStep(value, 2, now).examDate);
  assert.equal(
    validateOnboardingStep({ ...value, timezone: "UTC" }, 2, now).examDate,
    undefined,
  );
  assert.equal(
    validateOnboardingStep({ ...value, examDate: "2026-10-24" }, 2, now)
      .examDate,
    undefined,
  );
  assert.ok(
    validateOnboardingStep({ ...value, examDate: "2026-02-30" }, 2, now)
      .examDate,
  );
});

test("no chosen exam date is optional and Not sure yet is exclusive of topics", () => {
  assert.equal(
    completedProfile(
      initial.profile,
      { ...valid, noExamDate: true, examDate: "2020-01-01" },
      now,
    ).preferences.examDate,
    null,
  );
  assert.ok(
    validateOnboardingStep({ ...valid, notSure: true }, 3, now).difficultTopics,
  );
  assert.ok(
    validateOnboardingStep(
      { ...valid, notSure: false, difficultTopics: [] },
      3,
      now,
    ).difficultTopics,
  );
  assert.deepEqual(
    validateOnboardingStep(
      { ...valid, notSure: true, difficultTopics: [] },
      3,
      now,
    ),
    {},
  );
});

test("drafts resume the current step and incomplete input without completing onboarding", () => {
  const storage = memoryStorage();
  const drafts = createOnboardingDraftStore(storage);
  drafts.save({
    schemaVersion: 1,
    profileId: initial.profile.id,
    step: 2,
    values: { ...valid, timezone: "", minutesPerSession: "" },
    updatedAt: now.toISOString(),
  });
  const resumed = createOnboardingDraftStore(storage).load(initial.profile.id);
  assert.equal(resumed.status, "ready");
  if (resumed.status === "ready") {
    assert.equal(resumed.draft.step, 2);
    assert.equal(resumed.draft.values.timezone, "");
  }
  assert.equal(initial.profile.onboardingComplete, false);
});

test("corrupt, unsupported, and cross-profile drafts are reported without silently replacing them", () => {
  const storage = memoryStorage();
  const drafts = createOnboardingDraftStore(storage);
  storage.setItem(ONBOARDING_STORAGE_KEY, "broken");
  assert.equal(drafts.load(initial.profile.id).status, "error");
  assert.equal(storage.getItem(ONBOARDING_STORAGE_KEY), "broken");
  storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ schemaVersion: 2 }));
  assert.equal(drafts.load(initial.profile.id).status, "error");
  drafts.save({
    schemaVersion: 1,
    profileId: "different-profile",
    step: 1,
    values: valid,
    updatedAt: now.toISOString(),
  });
  assert.equal(drafts.load(initial.profile.id).status, "error");
});

test("completion preserves learner records, saves normalized preferences, and removes only the draft", () => {
  const storage = memoryStorage();
  const repository = createDemoRepository(storage);
  repository.save({
    ...initial,
    activity: [
      {
        id: "existing-event",
        kind: "lesson-reviewed",
        targetId: "existing-lesson",
        at: now.toISOString(),
      },
    ],
  });
  const drafts = createOnboardingDraftStore(storage);
  drafts.save({
    schemaVersion: 1,
    profileId: initial.profile.id,
    step: 3,
    values: valid,
    updatedAt: now.toISOString(),
  });
  storage.setItem("cloudready:theme", "dark");
  const result = finishDemoOnboarding(repository, drafts, valid, now);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.profile.displayName, "Amina");
    assert.equal(result.data.profile.fullName, initial.profile.fullName);
    assert.equal(result.data.profile.onboardingComplete, true);
    assert.equal(result.data.profile.preferences.minutesPerSession, 20);
    assert.equal(result.data.activity[0].id, "existing-event");
    assert.equal(result.data.sessions.length, 0);
  }
  assert.equal(storage.getItem(ONBOARDING_STORAGE_KEY), null);
  assert.equal(storage.getItem("cloudready:theme"), "dark");
});

test("completion revalidates earlier steps and does not mark an invalid setup complete", () => {
  const storage = memoryStorage();
  const repository = createDemoRepository(storage);
  repository.save(initial);
  const result = finishDemoOnboarding(
    repository,
    createOnboardingDraftStore(storage),
    { ...valid, noExamDate: false, examDate: "2026-10-23" },
    now,
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.step, 2);
  const stored = repository.load();
  if (stored.status === "ready")
    assert.equal(stored.data.profile.onboardingComplete, false);
});

test("save failures retain the draft; draft cleanup failure does not undo saved preferences", () => {
  const storage = memoryStorage();
  const repository = createDemoRepository(storage);
  repository.save(initial);
  const drafts = createOnboardingDraftStore(storage);
  drafts.save({
    schemaVersion: 1,
    profileId: initial.profile.id,
    step: 3,
    values: valid,
    updatedAt: now.toISOString(),
  });
  const failingRepository = createDemoRepository({
    ...storage,
    setItem(key, value) {
      if (key === DEMO_STORAGE_KEY) throw new Error("quota");
      storage.setItem(key, value);
    },
  });
  assert.throws(() =>
    finishDemoOnboarding(failingRepository, drafts, valid, now),
  );
  assert.equal(drafts.load(initial.profile.id).status, "ready");
  const cleanupFailure = createOnboardingDraftStore({
    ...storage,
    removeItem() {
      throw new Error("blocked");
    },
  });
  const result = finishDemoOnboarding(repository, cleanupFailure, valid, now);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.draftCleared, false);
});

test("reset removes demo data and setup drafts while retaining the theme", () => {
  const storage = memoryStorage();
  const repository = createDemoRepository(storage);
  repository.save(initial);
  createOnboardingDraftStore(storage).save({
    schemaVersion: 1,
    profileId: initial.profile.id,
    step: 1,
    values: valid,
    updatedAt: now.toISOString(),
  });
  storage.setItem("cloudready:theme", "dark");
  repository.reset();
  assert.equal(storage.getItem(DEMO_STORAGE_KEY), null);
  assert.equal(storage.getItem(ONBOARDING_STORAGE_KEY), null);
  assert.equal(storage.getItem("cloudready:theme"), "dark");
});
