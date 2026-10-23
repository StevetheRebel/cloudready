"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  LoaderCircle,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeSelect } from "@/components/theme-select";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, fieldDescription } from "@/components/ui/field";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ChoiceGroup } from "@/components/onboarding/choice-group";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import { createDemoService } from "@/lib/cloudready/services";
import {
  createOnboardingDraftStore,
  finishDemoOnboarding,
} from "@/lib/cloudready/onboarding-storage";
import {
  validateOnboardingStep,
  valuesFromProfile,
  type OnboardingStep,
  type OnboardingValues,
} from "@/lib/cloudready/onboarding";
import { timezoneSchema, type TopicId } from "@/lib/cloudready/models";
import { dateInTimezone } from "@/lib/cloudready/scheduler";
import { topics } from "@/lib/cloudready/content";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Your starting point", hint: "Experience and explanations" },
  { title: "Make room to study", hint: "Your time and availability" },
  { title: "Choose your focus", hint: "Topics to revisit" },
];
const days = [
  { value: 1, label: "Mon", name: "Monday" },
  { value: 2, label: "Tue", name: "Tuesday" },
  { value: 3, label: "Wed", name: "Wednesday" },
  { value: 4, label: "Thu", name: "Thursday" },
  { value: 5, label: "Fri", name: "Friday" },
  { value: 6, label: "Sat", name: "Saturday" },
  { value: 0, label: "Sun", name: "Sunday" },
];
const timezoneSuggestions = [
  "Africa/Nairobi",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Africa/Kigali",
  "UTC",
  "Europe/London",
  "America/New_York",
  "Asia/Kolkata",
];

export function OnboardingWizard() {
  const router = useRouter();
  const [values, setValues] = useState<OnboardingValues | null>(null);
  const [profileId, setProfileId] = useState("");
  const [step, setStep] = useState<OnboardingStep>(1);
  const [highestStep, setHighestStep] = useState<OnboardingStep>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveStatus, setSaveStatus] = useState(
    "Your changes save in this browser.",
  );
  const [pending, setPending] = useState(false);
  const [finished, setFinished] = useState<"diagnostic" | "dashboard" | null>(
    null,
  );
  const [draftWarning, setDraftWarning] = useState(false);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const successTitle = useRef<HTMLHeadingElement>(null);
  const ready = values !== null;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await Promise.resolve().then(() => {
          const repository = createDemoRepository(window.localStorage);
          const data = createDemoService(repository).start(
            Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          );
          const draft = createOnboardingDraftStore(window.localStorage).load(
            data.profile.id,
          );
          if (draft.status === "error") throw new Error(draft.message);
          return { data, draft };
        });
        if (!active) return;
        setProfileId(result.data.profile.id);
        if (result.draft.status === "ready") {
          setValues(result.draft.draft.values);
          setStep(result.draft.draft.step);
          setHighestStep(result.draft.draft.step);
          setSaveStatus("Restored your saved setup draft.");
        } else setValues(valuesFromProfile(result.data.profile));
      } catch {
        if (active)
          setLoadError(
            "Your demo profile or setup draft could not be opened. Browser storage may be blocked or contain unreadable data. You can manage or explicitly reset it in the foundation preview.",
          );
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (ready && !finished) stepTitle.current?.focus();
  }, [step, ready, finished]);
  useEffect(() => {
    if (finished) successTitle.current?.focus();
  }, [finished]);

  function persist(next: OnboardingValues, nextStep: OnboardingStep) {
    try {
      createOnboardingDraftStore(window.localStorage).save({
        schemaVersion: 1,
        profileId,
        step: nextStep,
        values: next,
        updatedAt: new Date().toISOString(),
      });
      setSaveError("");
      setSaveStatus("Draft saved in this browser.");
      return true;
    } catch {
      setSaveError(
        "Your latest changes could not be saved. Check browser storage permissions and try again before leaving this page.",
      );
      setSaveStatus("Latest changes are not saved.");
      return false;
    }
  }
  function patch(changes: Partial<OnboardingValues>) {
    if (!values) return;
    const next = { ...values, ...changes };
    setValues(next);
    setErrors({});
    persist(next, step);
  }
  function move(nextStep: OnboardingStep) {
    if (!values) return;
    if (nextStep > step) {
      const nextErrors = validateOnboardingStep(values, step);
      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        document.getElementById(Object.keys(nextErrors)[0])?.focus();
        return;
      }
    }
    if (!persist(values, nextStep)) return;
    setErrors({});
    setStep(nextStep);
    setHighestStep((current) => Math.max(current, nextStep) as OnboardingStep);
  }
  function toggleTopic(id: TopicId) {
    if (!values) return;
    const next = values.difficultTopics.includes(id)
      ? values.difficultTopics.filter((topic) => topic !== id)
      : [...values.difficultTopics, id];
    patch({ difficultTopics: next, notSure: false });
  }
  function finish(destination: "diagnostic" | "dashboard") {
    if (!values || pending) return;
    setPending(true);
    setSaveError("");
    try {
      const result = finishDemoOnboarding(
        createDemoRepository(window.localStorage),
        createOnboardingDraftStore(window.localStorage),
        values,
      );
      if (!result.ok) {
        setStep(result.step);
        setErrors(result.errors);
        requestAnimationFrame(() =>
          document.getElementById(Object.keys(result.errors)[0])?.focus(),
        );
        return;
      }
      setValues(valuesFromProfile(result.data.profile));
      setDraftWarning(!result.draftCleared);
      if (result.draftCleared) {
        router.push(
          destination === "dashboard" ? "/dashboard" : "/assessment/start",
        );
        return;
      }
      setFinished(destination);
    } catch {
      setSaveError(
        "Your preferences could not be saved. Your setup stays on this page; check browser storage and try again.",
      );
    } finally {
      setPending(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) move((step + 1) as OnboardingStep);
    else finish("diagnostic");
  }

  const today =
    values && timezoneSchema.safeParse(values.timezone.trim()).success
      ? dateInTimezone(new Date(), values.timezone.trim())
      : undefined;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <Brand />
        <Badge tone="info">Demo learner setup</Badge>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-5 py-7 sm:px-8 sm:py-12"
      >
        {loadError ? (
          <ErrorState
            title="Setup needs attention"
            description={loadError}
            action={
              <Link
                href="/foundation"
                className={buttonVariants({ variant: "secondary" })}
              >
                Manage demo data
              </Link>
            }
          />
        ) : !values ? (
          <LoadingState label="Opening your study preferences…" />
        ) : finished ? (
          <div className="mx-auto max-w-xl py-8">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success">
              <CheckCircle2 aria-hidden="true" size={28} />
            </span>
            <h1
              ref={successTitle}
              tabIndex={-1}
              className="mt-6 text-3xl font-semibold tracking-tight"
            >
              Your study preferences are saved.
            </h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              {values.displayName.trim()}, you’ve set aside{" "}
              {values.minutesPerSession} minutes per session across{" "}
              {values.studyDays.length}{" "}
              {values.studyDays.length === 1 ? "day" : "days"} each week.
            </p>
            <Card className="mt-6">
              <h2 className="font-semibold">
                {finished === "diagnostic"
                  ? "Your diagnostic is the next learning step"
                  : "Your dashboard is ready"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {finished === "diagnostic"
                  ? "Your preferences are saved. Open diagnostic setup when you are ready to begin."
                  : "Your preferences are saved. Open your dashboard to see your study routine and available next steps."}
              </p>
            </Card>
            {draftWarning ? (
              <p role="alert" className="mt-4 text-sm leading-6 text-warning">
                Your preferences were saved, but the old setup draft could not
                be removed. Check browser storage before editing setup again.
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={
                  finished === "diagnostic" ? "/assessment/start" : "/dashboard"
                }
                className={buttonVariants()}
              >
                {finished === "diagnostic"
                  ? "Open diagnostic setup"
                  : "Open dashboard"}
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Button
                variant="secondary"
                onClick={() => {
                  setFinished(null);
                  setStep(1);
                  setHighestStep(3);
                  setSaveStatus("Saved preferences loaded for editing.");
                }}
              >
                Edit preferences
              </Button>
            </div>
            <p className="mt-5 text-xs leading-6 text-muted-foreground">
              These preferences belong to your local demo profile. No real
              account was created.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-14">
            <aside>
              <span className="hidden size-12 items-center justify-center rounded-2xl bg-accent text-primary lg:flex">
                <Compass aria-hidden="true" size={24} />
              </span>
              <h1 className="mt-0 text-2xl font-semibold tracking-tight lg:mt-6">
                A plan that fits you.
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Tell us where you’re starting and when you can study. You can
                come back and change these preferences.
              </p>
              <nav aria-label="Setup steps" className="mt-7">
                <ol className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
                  {steps.map((item, index) => {
                    const number = (index + 1) as OnboardingStep;
                    return (
                      <li key={item.title}>
                        <button
                          type="button"
                          disabled={number > highestStep || pending}
                          aria-current={step === number ? "step" : undefined}
                          onClick={() => move(number)}
                          className={cn(
                            "flex min-h-14 w-full items-start gap-3 rounded-xl border p-3 text-left text-xs disabled:cursor-not-allowed lg:text-sm",
                            step === number
                              ? "border-primary bg-accent text-primary"
                              : "border-transparent text-muted-foreground",
                            number > highestStep && "opacity-60",
                          )}
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]">
                            {number < step ? (
                              <Check aria-hidden="true" size={12} />
                            ) : (
                              number
                            )}
                          </span>
                          <span>
                            <span className="block font-medium">
                              {item.title}
                            </span>
                            <span className="mt-1 hidden text-xs leading-5 text-muted-foreground lg:block">
                              {item.hint}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </aside>
            <section aria-label="Study preference form">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Step {step} of 3</span>
                <Button
                  variant="ghost"
                  className="px-0 text-xs"
                  disabled={pending}
                  onClick={() => {
                    if (persist(values, step)) router.push("/demo");
                  }}
                >
                  Save and exit
                </Button>
              </div>
              <progress
                value={step}
                max={3}
                aria-label="Setup progress"
                className="mb-7 h-1.5 w-full accent-primary"
              />
              <h2
                ref={stepTitle}
                tabIndex={-1}
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {steps[step - 1].title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {step === 1
                  ? "Choose the explanation style and starting level that feel right for you."
                  : step === 2
                    ? "A manageable study routine starts with the time you actually have."
                    : "Choose the topics you find difficult. The diagnostic will help uncover gaps you haven’t spotted yet."}
              </p>
              <form
                noValidate
                onSubmit={submit}
                aria-busy={pending}
                className="mt-7"
              >
                <fieldset disabled={pending} className="space-y-7">
                  {step === 1 ? (
                    <>
                      <Field
                        id="displayName"
                        label="Preferred display name"
                        error={errors.displayName}
                        hint="Up to 50 characters. This is how we’ll greet you."
                      >
                        <Input
                          id="displayName"
                          name="displayName"
                          autoComplete="nickname"
                          maxLength={50}
                          value={values.displayName}
                          onChange={(event) =>
                            patch({ displayName: event.target.value })
                          }
                          required
                          aria-invalid={Boolean(errors.displayName)}
                          aria-describedby={fieldDescription(
                            "displayName",
                            "hint",
                            errors.displayName,
                          )}
                        />
                      </Field>
                      <ChoiceGroup
                        id="experience"
                        legend="How familiar are you with cloud computing?"
                        value={values.experience}
                        onChange={(experience) => patch({ experience })}
                        error={errors.experience}
                        options={[
                          { value: "new", label: "New to cloud" },
                          { value: "some-knowledge", label: "Some knowledge" },
                          { value: "revising", label: "Revising for AZ-900" },
                        ]}
                      />
                      <ChoiceGroup
                        id="preparation"
                        legend="Have you prepared for AZ-900 before?"
                        value={values.preparation}
                        onChange={(preparation) => patch({ preparation })}
                        error={errors.preparation}
                        options={[
                          { value: "none", label: "Not yet" },
                          { value: "started", label: "Started studying" },
                          {
                            value: "completed-course",
                            label: "Completed a course",
                          },
                        ]}
                      />
                      <ChoiceGroup
                        id="explanationStyle"
                        legend="How do you prefer explanations?"
                        value={values.explanationStyle}
                        onChange={(explanationStyle) =>
                          patch({ explanationStyle })
                        }
                        error={errors.explanationStyle}
                        options={[
                          {
                            value: "concise",
                            label: "Concise",
                            hint: "Give me the essentials.",
                          },
                          {
                            value: "detailed",
                            label: "Detailed",
                            hint: "Walk through the reasoning.",
                          },
                          {
                            value: "example-first",
                            label: "Example first",
                            hint: "Start with a scenario.",
                          },
                        ]}
                      />
                    </>
                  ) : null}
                  {step === 2 ? (
                    <>
                      <div>
                        <p className="mb-3 text-sm font-semibold">
                          Target exam date
                        </p>
                        <label className="flex items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={values.noExamDate}
                            onChange={(event) =>
                              patch({
                                noExamDate: event.target.checked,
                                examDate: event.target.checked
                                  ? ""
                                  : values.examDate,
                              })
                            }
                            className="size-4 accent-primary"
                          />
                          I haven’t chosen a date
                        </label>
                        {!values.noExamDate ? (
                          <div className="mt-4">
                            <Field
                              id="examDate"
                              label="Exam date"
                              error={errors.examDate}
                              hint="Today or a future date in your chosen timezone."
                            >
                              <Input
                                id="examDate"
                                name="examDate"
                                type="date"
                                min={today}
                                value={values.examDate}
                                onChange={(event) =>
                                  patch({ examDate: event.target.value })
                                }
                                required
                                aria-invalid={Boolean(errors.examDate)}
                                aria-describedby={fieldDescription(
                                  "examDate",
                                  "hint",
                                  errors.examDate,
                                )}
                              />
                            </Field>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            You can add an exam date later.
                          </p>
                        )}
                      </div>
                      <fieldset
                        aria-describedby={
                          errors.studyDays ? "studyDays-error" : undefined
                        }
                      >
                        <legend
                          id="studyDays"
                          tabIndex={-1}
                          className="mb-3 text-sm font-semibold"
                        >
                          Which days can you study?
                        </legend>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                          {days.map((day) => (
                            <label
                              key={day.value}
                              className={cn(
                                "flex min-h-14 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-2 text-xs font-medium",
                                values.studyDays.includes(day.value)
                                  ? "border-primary bg-accent text-primary"
                                  : "bg-card",
                              )}
                            >
                              <input
                                type="checkbox"
                                name="studyDays"
                                aria-label={day.name}
                                checked={values.studyDays.includes(day.value)}
                                onChange={() =>
                                  patch({
                                    studyDays: values.studyDays.includes(
                                      day.value,
                                    )
                                      ? values.studyDays.filter(
                                          (value) => value !== day.value,
                                        )
                                      : [...values.studyDays, day.value],
                                  })
                                }
                                className="size-3.5 accent-primary"
                              />
                              {day.label}
                            </label>
                          ))}
                        </div>
                        {errors.studyDays ? (
                          <p
                            id="studyDays-error"
                            role="alert"
                            className="mt-2 text-sm text-destructive"
                          >
                            {errors.studyDays}
                          </p>
                        ) : null}
                      </fieldset>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          id="minutesPerSession"
                          label="Minutes per study session"
                          error={errors.minutesPerSession}
                          hint="Choose 5–240 minutes."
                        >
                          <Input
                            id="minutesPerSession"
                            name="minutesPerSession"
                            type="number"
                            min={5}
                            max={240}
                            step={1}
                            inputMode="numeric"
                            value={values.minutesPerSession}
                            onChange={(event) =>
                              patch({ minutesPerSession: event.target.value })
                            }
                            required
                            aria-invalid={Boolean(errors.minutesPerSession)}
                            aria-describedby={fieldDescription(
                              "minutesPerSession",
                              "hint",
                              errors.minutesPerSession,
                            )}
                          />
                        </Field>
                        <Field
                          id="timezone"
                          label="Timezone"
                          error={errors.timezone}
                          hint="Prefilled from your browser; editable."
                        >
                          <Input
                            id="timezone"
                            name="timezone"
                            list="timezone-options"
                            autoComplete="off"
                            maxLength={100}
                            value={values.timezone}
                            onChange={(event) =>
                              patch({ timezone: event.target.value })
                            }
                            required
                            aria-invalid={Boolean(errors.timezone)}
                            aria-describedby={fieldDescription(
                              "timezone",
                              "hint",
                              errors.timezone,
                            )}
                          />
                          <datalist id="timezone-options">
                            {timezoneSuggestions.map((zone) => (
                              <option value={zone} key={zone} />
                            ))}
                          </datalist>
                        </Field>
                      </div>
                    </>
                  ) : null}
                  {step === 3 ? (
                    <>
                      <fieldset
                        aria-describedby={
                          errors.difficultTopics
                            ? "difficultTopics-error"
                            : undefined
                        }
                      >
                        <legend
                          id="difficultTopics"
                          tabIndex={-1}
                          className="mb-3 text-sm font-semibold"
                        >
                          What would you like to revisit?
                        </legend>
                        <div className="space-y-3">
                          {topics.map((topic) => (
                            <label
                              key={topic.id}
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
                                values.difficultTopics.includes(topic.id)
                                  ? "border-primary bg-accent"
                                  : "bg-card",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={values.difficultTopics.includes(
                                  topic.id,
                                )}
                                onChange={() => toggleTopic(topic.id)}
                                className="mt-1 size-4 shrink-0 accent-primary"
                              />
                              <span>
                                <span className="block text-sm font-semibold">
                                  {topic.title}
                                </span>
                                <span className="mt-1 block text-xs leading-6 text-muted-foreground">
                                  {topic.summary}
                                </span>
                              </span>
                            </label>
                          ))}
                          <label
                            className={cn(
                              "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-medium",
                              values.notSure
                                ? "border-primary bg-accent"
                                : "bg-card",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={values.notSure}
                              onChange={(event) =>
                                patch({
                                  notSure: event.target.checked,
                                  difficultTopics: [],
                                })
                              }
                              className="size-4 accent-primary"
                            />
                            Not sure yet
                          </label>
                        </div>
                        {errors.difficultTopics ? (
                          <p
                            id="difficultTopics-error"
                            role="alert"
                            className="mt-2 text-sm text-destructive"
                          >
                            {errors.difficultTopics}
                          </p>
                        ) : null}
                      </fieldset>
                      <div className="rounded-xl bg-muted p-4 text-sm leading-7 text-muted-foreground">
                        Both actions save your preferences. Take the diagnostic
                        opens setup, where you can start or resume an untimed
                        12-question session. Go to dashboard opens your study
                        overview.
                      </div>
                    </>
                  ) : null}
                </fieldset>
                {saveError ? (
                  <p
                    role="alert"
                    className="mt-5 rounded-xl bg-destructive-soft p-3 text-sm leading-6 text-destructive"
                  >
                    {saveError}
                  </p>
                ) : null}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
                  <Button
                    variant="secondary"
                    disabled={step === 1 || pending}
                    onClick={() => move((step - 1) as OnboardingStep)}
                  >
                    <ArrowLeft aria-hidden="true" size={16} />
                    Back
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    {step === 3 ? (
                      <Button
                        variant="secondary"
                        disabled={pending}
                        onClick={() => finish("dashboard")}
                      >
                        Go to dashboard
                      </Button>
                    ) : null}
                    <Button type="submit" disabled={pending}>
                      {pending ? (
                        <LoaderCircle
                          aria-hidden="true"
                          size={16}
                          className="animate-spin motion-reduce:animate-none"
                        />
                      ) : null}
                      {step === 3 ? "Take the diagnostic" : "Continue"}
                      <ArrowRight aria-hidden="true" size={16} />
                    </Button>
                  </div>
                </div>
                <p
                  role="status"
                  className="mt-4 text-xs leading-6 text-muted-foreground"
                >
                  {saveStatus}
                </p>
              </form>
            </section>
          </div>
        )}
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs leading-6 text-muted-foreground sm:px-8">
        <span>
          Demo preferences stay in this browser. You can update them later.
        </span>
        <ThemeSelect />
      </footer>
    </div>
  );
}
