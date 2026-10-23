"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { topics } from "@/lib/cloudready/content";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import { createOnboardingDraftStore } from "@/lib/cloudready/onboarding-storage";
import {
  createSettingsDraftStore,
  createSettingsService,
  settingsValues,
  validateSettings,
  type SettingsValues,
} from "@/lib/cloudready/settings";
import type { LearnerData } from "@/lib/cloudready/models";

function service() {
  return createSettingsService(
    createDemoRepository(window.localStorage),
    createOnboardingDraftStore(window.localStorage),
  );
}
function drafts() {
  return createSettingsDraftStore(window.sessionStorage);
}

function SettingsEditor({
  data,
  hasSetupDraft,
  draftError,
  onSaved,
  refresh,
}: {
  data: LearnerData;
  hasSetupDraft: boolean;
  draftError: boolean;
  onSaved: (data: LearnerData) => void;
  refresh: () => void;
}) {
  const [initial] = useState(() => {
    try {
      const saved = drafts().load(data.profile.id);
      return {
        base: saved?.base ?? data.profile,
        values: saved?.values ?? settingsValues(data.profile),
        notice: saved ? "Unsaved settings restored from this tab’s draft." : "",
      };
    } catch {
      return {
        base: data.profile,
        values: settingsValues(data.profile),
        notice:
          "A tab draft could not be read. Keep this page open until you save or discard changes.",
      };
    }
  });
  const [base, setBase] = useState(initial.base);
  const [values, setValues] = useState<SettingsValues>(initial.values);
  const [notice, setNotice] = useState(initial.notice);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<
    "discard" | "learning" | "demo" | "setup" | null
  >(null);
  const [resetSnapshot, setResetSnapshot] = useState(data);
  const busy = useRef(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(settingsValues(base));
  const stale = JSON.stringify(base) !== JSON.stringify(data.profile);
  useEffect(() => {
    if (!dirty) return;
    function unload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    function navigate(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (
        !link ||
        link.hasAttribute("download") ||
        link.target === "_blank" ||
        !link.href ||
        link.href.startsWith(`${location.origin}${location.pathname}#`)
      )
        return;
      if (
        !window.confirm(
          "Leave without saving settings? Your edits remain a draft in this tab when browser storage is available.",
        )
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty]);
  function change(next: SettingsValues) {
    setValues(next);
    setMessage("");
    setErrors({});
    try {
      if (JSON.stringify(next) === JSON.stringify(settingsValues(base)))
        drafts().clear();
      else drafts().save(base, next);
      setNotice("");
    } catch {
      setNotice(
        "Your tab draft could not be saved. Keep this page open until you save or discard changes.",
      );
    }
  }
  function preference<K extends keyof SettingsValues["preferences"]>(
    key: K,
    value: SettingsValues["preferences"][K],
  ) {
    change({ ...values, preferences: { ...values.preferences, [key]: value } });
  }
  function save() {
    if (busy.current) return;
    const found = validateSettings(values, base);
    setErrors(found);
    setError("");
    setMessage("");
    if (Object.keys(found).length) {
      setError("Check the highlighted settings before saving.");
      document.getElementById(`settings-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    busy.current = true;
    try {
      const updated = service().save(base, values);
      onSaved(updated);
      setBase(updated.profile);
      setValues(settingsValues(updated.profile));
      setMessage(
        "Settings saved. Your learning records and existing review dates are kept.",
      );
      try {
        drafts().clear();
        setNotice("");
      } catch {
        setNotice(
          "Settings saved, but the old tab draft could not be cleared. Discard it before editing again if it returns.",
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Settings could not be saved. Check browser storage and try again.",
      );
    } finally {
      busy.current = false;
    }
  }
  function exportProgress() {
    setError("");
    try {
      const result = service().export();
      const url = URL.createObjectURL(
        new Blob([result.json], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        "Export prepared for download. It contains saved records only; check your browser’s downloads.",
      );
    } catch {
      setError(
        "Your saved progress could not be exported. Check browser storage and try again.",
      );
    }
  }
  async function confirm() {
    try {
      if (confirmation === "discard") {
        const latest = service().read();
        drafts().clear();
        onSaved(latest);
        setBase(latest.profile);
        setValues(settingsValues(latest.profile));
        setErrors({});
        setNotice("");
        setError("");
        setMessage(
          "Unsaved settings discarded; latest saved preferences loaded.",
        );
      }
      if (confirmation === "setup") {
        service().discardSetupDraft();
        refresh();
      }
      if (confirmation === "learning") {
        const updated = service().clearLearning(resetSnapshot);
        onSaved(updated);
        setMessage(
          "Learning records cleared. Your profile, preferences, setup draft, and theme are kept.",
        );
      }
      if (confirmation === "demo") {
        drafts().clear();
        service().resetDemo(resetSnapshot);
        refresh();
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "This action could not be completed. Check browser storage and refresh.",
      );
      throw cause;
    }
  }
  function openReset(kind: "learning" | "demo") {
    setResetSnapshot(data);
    setConfirmation(kind);
  }
  function control(path: string) {
    return {
      id: `settings-${path}`,
      "aria-invalid": Boolean(errors[path]),
      "aria-describedby": errors[path] ? `settings-${path}-error` : undefined,
    };
  }
  function field(path: string, label: string, child: ReactNode) {
    return (
      <Field id={`settings-${path}`} label={label} error={errors[path]}>
        {child}
      </Field>
    );
  }
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Your study space, your way.
      </h1>
      <Button
        variant="secondary"
        className="mt-4"
        onClick={() => {
          if (
            !dirty ||
            window.confirm(
              "Refresh saved records? Unsaved edits can be restored only if this tab’s draft was saved.",
            )
          )
            refresh();
        }}
      >
        Refresh records
      </Button>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        Edit your local demo profile and study preferences. Settings save only
        when you choose Save settings.
      </p>
      {notice ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-warning-soft p-4 text-sm leading-7 text-warning"
        >
          {notice}
        </p>
      ) : null}
      {stale ? (
        <p role="status" className="mt-5 text-sm leading-7 text-warning">
          Your saved profile changed while these edits were open. Discard edits
          to load the latest profile before saving.
        </p>
      ) : null}
      {hasSetupDraft || draftError ? (
        <Card className="mt-5">
          <h2 className="font-semibold">Your setup draft needs attention</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Finish or discard the onboarding draft before saving settings so it
            cannot later replace these preferences.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className={buttonVariants({ variant: "secondary" })}
            >
              Open onboarding
            </Link>
            <Button
              variant="secondary"
              onClick={() => setConfirmation("setup")}
            >
              Discard setup draft
            </Button>
          </div>
        </Card>
      ) : null}
      <div
        role="status"
        aria-live="polite"
        className="mt-5 text-sm text-success"
      >
        {message}
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm leading-7 text-destructive">
          {error}
        </p>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        noValidate
        className="mt-6 space-y-6"
      >
        <Card>
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {field(
              "fullName",
              "Full name",
              <Input
                {...control("fullName")}
                autoComplete="name"
                maxLength={100}
                value={values.fullName}
                onChange={(event) =>
                  change({ ...values, fullName: event.target.value })
                }
              />,
            )}
            {field(
              "displayName",
              "Display name",
              <Input
                {...control("displayName")}
                maxLength={50}
                value={values.displayName}
                onChange={(event) =>
                  change({ ...values, displayName: event.target.value })
                }
              />,
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Study preferences</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {field(
              "preferences.experience",
              "Cloud experience",
              <Select
                {...control("preferences.experience")}
                value={values.preferences.experience}
                onChange={(event) =>
                  preference(
                    "experience",
                    event.target
                      .value as SettingsValues["preferences"]["experience"],
                  )
                }
              >
                <option value="new">New to cloud</option>
                <option value="some-knowledge">Some cloud knowledge</option>
                <option value="revising">Revising for the exam</option>
              </Select>,
            )}
            {field(
              "preferences.preparation",
              "Preparation so far",
              <Select
                {...control("preferences.preparation")}
                value={values.preferences.preparation}
                onChange={(event) =>
                  preference(
                    "preparation",
                    event.target
                      .value as SettingsValues["preferences"]["preparation"],
                  )
                }
              >
                <option value="none">Not started</option>
                <option value="started">Started studying</option>
                <option value="completed-course">Completed a course</option>
              </Select>,
            )}
            {field(
              "preferences.explanationStyle",
              "Explanation style",
              <Select
                {...control("preferences.explanationStyle")}
                value={values.preferences.explanationStyle}
                onChange={(event) =>
                  preference(
                    "explanationStyle",
                    event.target
                      .value as SettingsValues["preferences"]["explanationStyle"],
                  )
                }
              >
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
                <option value="example-first">Example first</option>
              </Select>,
            )}
            {field(
              "preferences.minutesPerSession",
              "Minutes per session (5–240)",
              <Input
                {...control("preferences.minutesPerSession")}
                type="number"
                min={5}
                max={240}
                step={1}
                value={values.preferences.minutesPerSession || ""}
                onChange={(event) =>
                  preference("minutesPerSession", Number(event.target.value))
                }
              />,
            )}
            {field(
              "preferences.timezone",
              "Timezone (for example, Africa/Nairobi)",
              <Input
                {...control("preferences.timezone")}
                maxLength={100}
                value={values.preferences.timezone}
                onChange={(event) => preference("timezone", event.target.value)}
              />,
            )}
            {field(
              "preferences.examDate",
              "Exam date (optional)",
              <Input
                {...control("preferences.examDate")}
                type="date"
                value={values.preferences.examDate ?? ""}
                onChange={(event) =>
                  preference("examDate", event.target.value || null)
                }
              />,
            )}
          </div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            Leave the date blank if you have not chosen one. An existing past
            exam date can be kept. Timezone changes affect activity grouping and
            today’s due count; existing review dates are kept.
          </p>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium">Study days</legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day, index) => (
                <label
                  key={day}
                  className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={values.preferences.studyDays.includes(index)}
                    onChange={(event) =>
                      preference(
                        "studyDays",
                        event.target.checked
                          ? [...values.preferences.studyDays, index].sort()
                          : values.preferences.studyDays.filter(
                              (value) => value !== index,
                            ),
                      )
                    }
                  />
                  {day}
                </label>
              ))}
            </div>
            {errors["preferences.studyDays"] ? (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {errors["preferences.studyDays"]}
              </p>
            ) : null}
          </fieldset>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium">
              Topics you find difficult (optional)
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {topics.map((topic) => (
                <label
                  key={topic.id}
                  className="flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={values.preferences.difficultTopics.includes(
                      topic.id,
                    )}
                    onChange={(event) =>
                      preference(
                        "difficultTopics",
                        event.target.checked
                          ? [...values.preferences.difficultTopics, topic.id]
                          : values.preferences.difficultTopics.filter(
                              (value) => value !== topic.id,
                            ),
                      )
                    }
                  />
                  {topic.title}
                </label>
              ))}
            </div>
          </fieldset>
          {!data.profile.onboardingComplete ? (
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              Saving these settings does not complete onboarding. Finish setup
              before starting a saved study session.
            </p>
          ) : null}
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={!dirty || stale || hasSetupDraft || draftError}
          >
            Save settings
          </Button>
          <Button
            variant="secondary"
            disabled={!dirty && !stale && !notice}
            onClick={() => setConfirmation("discard")}
          >
            Discard edits
          </Button>
          <span className="text-xs text-muted-foreground">
            {dirty ? "Unsaved changes" : "No unsaved changes"}
          </span>
        </div>
      </form>
      <Card className="mt-7">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Use the Theme control at the top of this page to choose Light, Dark,
          or System. Theme changes save immediately in this browser,
          independently of Save settings.
        </p>
      </Card>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Your demo and data</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          This is a local demo, with no authenticated account or server session.
          Email changes, password changes, and account deletion become available
          when real accounts are connected.
        </p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          Exports include your saved name, preferences, answers, sessions,
          lesson reviews, revision schedules, and activity. They exclude unsaved
          settings, setup drafts, and theme. Import is not available yet.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportProgress}>
            Export saved progress (JSON)
          </Button>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Leave demo
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Leaving the demo opens the home page and keeps local records.
        </p>
      </Card>
      <Card className="mt-6 border-destructive/30">
        <h2 className="text-lg font-semibold">Reset controls</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Clear learning records removes all sessions, answers, lesson reviews,
          revision schedules, and activity. It keeps your profile, preferences,
          onboarding draft, theme, and unsaved settings edits.
        </p>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Reset entire demo also removes the local profile, preferences,
          onboarding draft, and this tab’s settings draft. Theme and already
          downloaded exports are kept. Other tabs’ temporary settings drafts are
          not cleared.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => openReset("learning")}>
            Clear learning records
          </Button>
          <Button variant="danger" onClick={() => openReset("demo")}>
            Reset entire demo
          </Button>
        </div>
      </Card>
      <ConfirmDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
        title={
          confirmation === "discard"
            ? "Discard unsaved settings?"
            : confirmation === "setup"
              ? "Discard your setup draft?"
              : confirmation === "learning"
                ? "Clear all learning records?"
                : "Reset the entire local demo?"
        }
        description={
          confirmation === "discard"
            ? "Your edits and this tab’s settings draft will be removed. The latest saved profile will be loaded."
            : confirmation === "setup"
              ? "The saved onboarding draft will be removed. Your committed preferences and learning records are kept."
              : confirmation === "learning"
                ? "All saved answers, sessions, lesson reviews, revision schedules, and activity will be permanently removed. Your profile, preferences, theme, setup draft, and settings edits are kept. Export first if you need a copy."
                : "The local profile, preferences, learning history, onboarding draft, and this tab’s settings draft will be removed. Theme is kept. Export first if you need a copy; this cannot be undone."
        }
        confirmLabel={
          confirmation === "discard"
            ? "Discard edits"
            : confirmation === "setup"
              ? "Discard setup draft"
              : confirmation === "learning"
                ? "Clear learning records"
                : "Reset demo"
        }
        destructive
        onConfirm={confirm}
      />
    </>
  );
}

export function SettingsDashboard() {
  const { state, refresh, replaceData } = useLearnerData();
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  return (
    <LearnerShell displayName={name} isDemo>
      {state.status === "loading" ? (
        <LoadingState label="Loading your settings…" />
      ) : state.status === "error" ? (
        <ErrorState
          title="Your settings could not be loaded"
          description="Your saved demo may be unreadable or storage may be unavailable. Existing records have not been reset."
          action={
            <div className="flex flex-wrap gap-3">
              <Button onClick={refresh}>Try again</Button>
              <Link
                href="/foundation"
                className={buttonVariants({ variant: "secondary" })}
              >
                Manage demo data
              </Link>
            </div>
          }
        />
      ) : (
        <SettingsEditor
          data={state.data}
          hasSetupDraft={state.hasDraft}
          draftError={state.draftError}
          onSaved={replaceData}
          refresh={refresh}
        />
      )}
    </LearnerShell>
  );
}
