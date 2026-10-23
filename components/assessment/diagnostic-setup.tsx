"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight, Check, Clock3, Layers3, ShieldCheck } from "lucide-react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState, LoadingState } from "@/components/ui/states";
import {
  createAssessmentService,
  diagnosticPool,
  sessionContentAvailable,
  unfinishedDiagnostic,
} from "@/lib/cloudready/assessment";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import { topics } from "@/lib/cloudready/content";

export function DiagnosticSetup() {
  const { state, refresh } = useLearnerData();
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  async function start(replaceSessionId?: string) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const session = createAssessmentService(
        createDemoRepository(window.localStorage),
      ).startDiagnostic({ replaceSessionId });
      router.push(`/assessment/${encodeURIComponent(session.id)}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your session could not be saved. Check browser storage and try again.",
      );
      refresh();
      if (replaceSessionId) throw error;
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Opening diagnostic setup…" />
        ) : (
          <ErrorState
            title="Your demo could not be loaded"
            description="Browser storage may be blocked or contain unreadable records. Your saved data has not been reset."
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
        )}
      </LearnerShell>
    );
  const { data, hasDraft, draftError } = state;
  const unfinished = unfinishedDiagnostic(data);
  const needsSetup = !data.profile.onboardingComplete || hasDraft;
  let poolReady = true;
  try {
    diagnosticPool();
  } catch {
    poolReady = false;
  }
  const resumable = unfinished ? sessionContentAvailable(unfinished) : false;
  return (
    <LearnerShell displayName={name} isDemo>
      <Link
        href="/dashboard"
        className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
      >
        Back to dashboard
      </Link>
      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div>
          <Badge tone="info">Your starting point</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Let’s find what needs
            <br className="hidden sm:block" /> a second look.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
            Twelve questions. No timer. Just a clearer picture of what you
            understand and where an explanation could help.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Layers3,
                title: "12 questions",
                text: "Four from each topic group",
              },
              {
                icon: Clock3,
                title: "Take your time",
                text: "Untimed, with pauses allowed",
              },
              {
                icon: ShieldCheck,
                title: "Confidence matters",
                text: "An answer and a confidence rating",
              },
            ].map(({ icon: Icon, title, text }) => (
              <Card key={title} className="p-4">
                <Icon aria-hidden="true" size={21} className="text-primary" />
                <h2 className="mt-3 text-sm font-semibold">{title}</h2>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  {text}
                </p>
              </Card>
            ))}
          </div>
          <Card className="mt-6">
            <h2 className="text-lg font-semibold">How it works</h2>
            <ol className="mt-4 space-y-4">
              {[
                "Choose one answer, then tell us how sure you feel before submitting.",
                "Read the explanation after each answer, including why each alternative does or does not fit.",
                "Submitted answers are saved and locked. Pause and return in this browser whenever you need.",
              ].map((text, index) => (
                <li key={text} className="flex gap-3 text-sm leading-7">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t pt-4 text-xs leading-6 text-muted-foreground">
              This is a learning diagnostic, not an official exam simulation or
              pass prediction. The equal topic split is for learning coverage,
              not official exam weighting.
            </p>
          </Card>
          <Card className="mt-5">
            <h2 className="font-semibold">What we’ll cover</h2>
            <ul className="mt-4 space-y-4">
              {topics.map((topic) => (
                <li key={topic.id} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    size={17}
                    className="mt-1 shrink-0 text-success"
                  />
                  <div>
                    <h3 className="text-sm font-medium">
                      {topic.title}
                      <span className="ml-2 font-normal text-muted-foreground">
                        4 questions
                      </span>
                    </h3>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                      {topic.summary}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="border-primary/20 bg-accent">
            <h2 className="text-lg font-semibold">
              Be honest about your confidence.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              A lucky guess and a well-understood answer can look the same in a
              score. Your confidence helps us tell them apart.
            </p>
            <dl className="mt-5 space-y-4">
              {[
                ["Guessing", "I’m choosing without a clear reason."],
                ["Somewhat sure", "I have a reason, but I’m uncertain."],
                ["Confident", "I can explain why this answer fits."],
              ].map(([label, hint]) => (
                <div key={label}>
                  <dt className="text-sm font-semibold">{label}</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                    {hint}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            {needsSetup ? (
              <>
                <h2 className="font-semibold">
                  Finish your study setup first.
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Save your preferences before beginning. Existing diagnostic
                  answers will stay in this browser.
                </p>
                <Link
                  href="/onboarding"
                  className={buttonVariants({ className: "mt-5 w-full" })}
                >
                  {hasDraft ? "Resume study setup" : "Set study preferences"}
                </Link>
              </>
            ) : draftError ? (
              <ErrorState
                title="Your setup draft needs attention"
                description="Your learner records loaded, but the setup draft could not be read."
                action={
                  <Link href="/foundation" className="text-primary underline">
                    Manage demo data
                  </Link>
                }
              />
            ) : (
              <>
                <h2 className="font-semibold">
                  {unfinished ? "Your diagnostic is saved." : "Ready to begin?"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {unfinished
                    ? `${unfinished.responses.length} of ${unfinished.questionIds.length} answers saved. Resume without losing submitted answers, or confirm a new start.`
                    : "Your first step is understanding where you are now. You don’t need to know every answer."}
                </p>
                {unfinished ? (
                  <>
                    {resumable ? (
                      <Link
                        href={`/assessment/${encodeURIComponent(unfinished.id)}`}
                        className={buttonVariants({ className: "mt-5 w-full" })}
                      >
                        Resume diagnostic
                        <ArrowRight aria-hidden="true" size={16} />
                      </Link>
                    ) : (
                      <p
                        role="alert"
                        className="mt-4 text-sm leading-6 text-warning"
                      >
                        Some saved questions are unavailable. Your answers are
                        kept; you can confirm a new diagnostic below.
                      </p>
                    )}
                    <Button
                      variant="secondary"
                      className="mt-3 w-full"
                      disabled={pending || !poolReady}
                      onClick={() => setReplaceId(unfinished.id)}
                    >
                      Start a new diagnostic
                    </Button>
                  </>
                ) : (
                  <Button
                    className="mt-5 w-full"
                    disabled={pending || !poolReady}
                    onClick={() => void start()}
                  >
                    {pending ? "Saving your session…" : "Start my diagnostic"}
                    <ArrowRight aria-hidden="true" size={16} />
                  </Button>
                )}
                {!poolReady ? (
                  <p role="alert" className="mt-3 text-sm text-warning">
                    The reviewed question pool is incomplete. Starting a new
                    diagnostic is unavailable.
                  </p>
                ) : null}
              </>
            )}
            {error ? (
              <p
                role="alert"
                className="mt-4 text-sm leading-7 text-destructive"
              >
                {error}
              </p>
            ) : null}
            <p className="mt-5 border-t pt-4 text-xs leading-6 text-muted-foreground">
              Demo progress is stored in this browser on this site. Clearing
              browser data removes it. Submitted answers are saved; unsubmitted
              selections are not.
            </p>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={replaceId !== null}
        onOpenChange={(open) => {
          if (!open) setReplaceId(null);
        }}
        title="Start over with a new diagnostic?"
        description="The unfinished diagnostic will be closed and cannot be resumed. Its submitted answers stay in your learning history. The new diagnostic uses the same initial 12-question bank, so it is not a fresh-question benchmark."
        confirmLabel="Close old session and start new"
        destructive
        onConfirm={() => start(replaceId ?? undefined)}
      />
    </LearnerShell>
  );
}
