import assert from "node:assert/strict";
import { test } from "node:test";
import { createLearnerData } from "../lib/cloudready/defaults";
import {
  createDemoRepository,
  DEMO_STORAGE_KEY,
} from "../lib/cloudready/persistence";
import { createOnboardingDraftStore } from "../lib/cloudready/onboarding-storage";
import {
  ONBOARDING_STORAGE_KEY,
  valuesFromProfile,
} from "../lib/cloudready/onboarding";
import {
  createSettingsDraftStore,
  createSettingsService,
  settingsValues,
  validateSettings,
  SETTINGS_DRAFT_KEY,
} from "../lib/cloudready/settings";
import { concepts } from "../lib/cloudready/content";
import { createLearningService } from "../lib/cloudready/learning";

const now = new Date("2026-10-25T21:30:00Z");
function fixture() {
  const records = new Map<string, string>();
  let failSave = false;
  let failRemove: string | null = null;
  const storage = {
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (failSave) throw new Error("Storage full");
      records.set(key, value);
    },
    removeItem: (key: string) => {
      if (failRemove === key) throw new Error("Cannot remove");
      records.delete(key);
    },
  };
  const repository = createDemoRepository(storage);
  const data = createLearnerData({
    id: "demo",
    isDemo: true,
    timezone: "Africa/Nairobi",
  });
  repository.save(data);
  const setup = createOnboardingDraftStore(storage);
  const service = createSettingsService(repository, setup);
  const read = () => {
    const result = repository.load();
    if (result.status !== "ready") throw new Error("Unreadable fixture");
    return result.data;
  };
  return {
    records,
    storage,
    repository,
    setup,
    service,
    read,
    failSave: (value: boolean) => {
      failSave = value;
    },
    failRemove: (key: string) => {
      failRemove = key;
    },
  };
}

test("settings save reads current learning records, keeps identity/setup state, and normalises names/timezone", () => {
  const fx = fixture();
  const base = fx.read().profile;
  createLearningService(fx.repository).addToRevision(concepts[0].id, now);
  const before = fx.read();
  const values = settingsValues(base);
  values.displayName = " New name ";
  values.fullName = " Full name ";
  values.preferences.timezone = " UTC ";
  const after = fx.service.save(base, values, now);
  assert.equal(after.profile.displayName, "New name");
  assert.equal(after.profile.fullName, "Full name");
  assert.equal(after.profile.preferences.timezone, "UTC");
  assert.equal(after.profile.id, base.id);
  assert.equal(after.profile.onboardingComplete, false);
  assert.deepEqual(after.revision, before.revision);
  assert.deepEqual(after.activity, before.activity);
  assert.deepEqual(after.sessions, before.sessions);
  assert.deepEqual(fx.read(), after);
});

test("invalid settings fail without writes; old exam dates can remain while new past dates fail", () => {
  const fx = fixture();
  const data = fx.read();
  data.profile.onboardingComplete = true;
  data.profile.preferences.studyDays = [1];
  data.profile.preferences.examDate = "2026-10-01";
  fx.repository.save(data);
  assert.deepEqual(
    validateSettings(settingsValues(data.profile), data.profile, now),
    {},
  );
  for (const field of [
    "displayName",
    "minutes",
    "timezone",
    "days",
    "exam",
    "duplicate-days",
    "duplicate-topics",
  ] as const) {
    const values = settingsValues(data.profile);
    if (field === "displayName") values.displayName = " ";
    if (field === "minutes") values.preferences.minutesPerSession = 2.5;
    if (field === "timezone") values.preferences.timezone = "Invalid/City";
    if (field === "days") values.preferences.studyDays = [];
    if (field === "duplicate-days") values.preferences.studyDays = [1, 1];
    if (field === "duplicate-topics")
      values.preferences.difficultTopics = ["cloud-concepts", "cloud-concepts"];
    if (field === "exam") values.preferences.examDate = "2026-10-25"; // Already Monday in Nairobi.
    assert.ok(
      Object.keys(validateSettings(values, data.profile, now)).length > 0,
    );
    assert.throws(() => fx.service.save(data.profile, values, now));
    assert.deepEqual(fx.read(), data);
  }
  const values = settingsValues(data.profile);
  values.preferences.examDate = null;
  assert.equal(
    fx.service.save(data.profile, values, now).profile.preferences.examDate,
    null,
  );
});

test("concurrent profile changes and onboarding drafts cannot silently overwrite settings", () => {
  const fx = fixture();
  const base = fx.read().profile;
  const values = settingsValues(base);
  values.displayName = "Edited";
  fx.setup.save({
    schemaVersion: 1,
    profileId: base.id,
    step: 1,
    values: valuesFromProfile(base),
    updatedAt: now.toISOString(),
  });
  assert.throws(() => fx.service.save(base, values, now), /onboarding draft/);
  fx.service.discardSetupDraft();
  const changed = fx.read();
  changed.profile.displayName = "Elsewhere";
  fx.repository.save(changed);
  assert.throws(() => fx.service.save(base, values, now), /changed elsewhere/);
  assert.equal(fx.read().profile.displayName, "Elsewhere");
});

test("JSON export is a read-only validated snapshot with local date and no draft/theme fields", () => {
  const fx = fixture();
  createLearningService(fx.repository).markReviewed(concepts[0].id, now);
  fx.records.set("cloudready:theme", "dark");
  fx.records.set(SETTINGS_DRAFT_KEY, "private draft");
  const before = new Map(fx.records);
  const exported = fx.service.export(now);
  assert.equal(exported.filename, "cloudready-progress-2026-10-26.json");
  const parsed = JSON.parse(exported.json);
  assert.equal(parsed.format, "cloudready-demo-export");
  assert.equal(parsed.exportedAt, now.toISOString());
  assert.deepEqual(parsed.data, fx.read());
  assert.ok(!exported.json.includes("private draft"));
  assert.ok(!exported.json.includes("cloudready:theme"));
  assert.deepEqual(fx.records, before);
});

test("learning reset preserves profile, theme, setup draft, and clears all learning and removal marker", () => {
  const fx = fixture();
  createLearningService(fx.repository).addToRevision(concepts[0].id, now);
  createLearningService(fx.repository).markReviewed(concepts[0].id, now);
  const before = fx.read();
  before.revisionRemovalId = crypto.randomUUID();
  fx.repository.save(before);
  fx.records.set("cloudready:theme", "dark");
  fx.records.set(ONBOARDING_STORAGE_KEY, "setup draft");
  const after = fx.service.clearLearning(before);
  assert.deepEqual(after.profile, before.profile);
  assert.deepEqual(after.revision, []);
  assert.deepEqual(after.activity, []);
  assert.deepEqual(after.lessonReviews, []);
  assert.deepEqual(after.sessions, []);
  assert.equal(after.revisionRemovalId, undefined);
  assert.equal(fx.records.get("cloudready:theme"), "dark");
  assert.equal(fx.records.get(ONBOARDING_STORAGE_KEY), "setup draft");
});

test("reset confirmations reject newly changed records", () => {
  const fx = fixture();
  const before = fx.read();
  createLearningService(fx.repository).addToRevision(concepts[0].id, now);
  assert.throws(() => fx.service.clearLearning(before), /records changed/);
  assert.throws(() => fx.service.resetDemo(before), /records changed/);
  assert.equal(fx.read().revision.length, 1);
});

test("full demo reset removes learner and setup records but keeps theme; partial deletion reports its limit", () => {
  const fx = fixture();
  fx.records.set(ONBOARDING_STORAGE_KEY, "draft");
  fx.records.set("cloudready:theme", "dark");
  fx.service.resetDemo(fx.read());
  assert.equal(fx.repository.load().status, "empty");
  assert.equal(fx.records.has(ONBOARDING_STORAGE_KEY), false);
  assert.equal(fx.records.get("cloudready:theme"), "dark");
  const partial = fixture();
  partial.records.set(ONBOARDING_STORAGE_KEY, "draft");
  partial.failRemove(ONBOARDING_STORAGE_KEY);
  assert.throws(
    () => partial.service.resetDemo(partial.read()),
    /partially completed/,
  );
  assert.equal(partial.records.has(DEMO_STORAGE_KEY), false);
  assert.equal(partial.records.has(ONBOARDING_STORAGE_KEY), true);
});

test("failed profile/reset writes leave the saved learner intact; unreadable records cannot export or save", () => {
  const fx = fixture();
  const before = fx.read();
  const values = settingsValues(before.profile);
  values.displayName = "Change";
  fx.failSave(true);
  assert.throws(
    () => fx.service.save(before.profile, values, now),
    /Storage full/,
  );
  assert.throws(() => fx.service.clearLearning(before), /Storage full/);
  assert.deepEqual(fx.read(), before);
  fx.records.set(DEMO_STORAGE_KEY, "broken");
  assert.throws(() => fx.service.export(now), /could not be read/);
  assert.throws(
    () => fx.service.save(before.profile, values, now),
    /could not be read/,
  );
  assert.equal(fx.records.get(DEMO_STORAGE_KEY), "broken");
});

test("tab drafts preserve incomplete edits and reject corrupt/foreign drafts without changing learner data", () => {
  const fx = fixture();
  const before = fx.read();
  const store = createSettingsDraftStore(fx.storage);
  const values = settingsValues(before.profile);
  values.displayName = "";
  values.preferences.timezone = "Partial/";
  values.preferences.minutesPerSession = 0;
  store.save(before.profile, values);
  assert.deepEqual(store.load(before.profile.id)?.values, values);
  assert.throws(() => store.load("other"), /different learner/);
  assert.deepEqual(fx.read(), before);
  fx.records.set(SETTINGS_DRAFT_KEY, "bad json");
  assert.throws(() => store.load(before.profile.id));
  assert.equal(fx.records.get(SETTINGS_DRAFT_KEY), "bad json");
  store.clear();
  assert.equal(store.load(before.profile.id), null);
});
