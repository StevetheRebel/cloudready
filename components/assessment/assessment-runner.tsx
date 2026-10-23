"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import {
  createAssessmentService,
  sessionContentAvailable,
} from "@/lib/cloudready/assessment";
import { questions } from "@/lib/cloudready/content";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import { accuracyOf } from "@/lib/cloudready/scoring";
import type { Confidence } from "@/lib/cloudready/models";
import {
  assessmentStep,
  confidenceRequired,
} from "@/lib/cloudready/assessment-flow";
import { QuestionPanel } from "@/components/assessment/question-panel";

export function AssessmentRunner({
  sessionId,
  expectedKind,
}: {
  sessionId: string;
  expectedKind?: "diagnostic" | "practice";
}) {
  const router = useRouter();
  const { state, refresh, replaceData } = useLearnerData();
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const busy = useRef(false);
  const completionTitle = useRef<HTMLHeadingElement>(null);
  const isComplete =
    state.status === "ready" &&
    !reviewId &&
    state.data.sessions.some(
      (session) => session.id === sessionId && session.status === "completed",
    );
  useEffect(() => {
    if (isComplete) completionTitle.current?.focus();
  }, [isComplete]);
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Opening your saved study session…" />
        ) : (
          <ErrorState
            title="Your study session could not be loaded"
            description="Check browser storage. Existing records have not been reset."
            action={<Button onClick={refresh}>Try again</Button>}
          />
        )}
      </LearnerShell>
    );
  const session = state.data.sessions.find((item) => item.id === sessionId);
  const back = (
    <Link
      href={session?.kind === "practice" ? "/practice" : "/assessment/start"}
      className={buttonVariants({ variant: "secondary" })}
    >
      {session?.kind === "practice"
        ? "Open practice setup"
        : "Open diagnostic setup"}
    </Link>
  );
  if (!session)
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title="Study session not found in this browser"
          description="This link may belong to another browser or site, or its local data may have been cleared. You can open setup to start or resume an available diagnostic."
          action={back}
        />
      </LearnerShell>
    );
  if (expectedKind && session.kind !== expectedKind)
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title="This link belongs to a different session type"
          description="Your saved session is kept. Open its matching study screen."
          action={
            <Link
              href={`/${session.kind === "diagnostic" ? "assessment" : "practice"}/${encodeURIComponent(session.id)}`}
              className={buttonVariants()}
            >
              Open saved session
            </Link>
          }
        />
      </LearnerShell>
    );
  if (session.status === "abandoned")
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title="This study session was closed"
          description="A new session replaced this one. Its submitted answers remain in your learning history, but it cannot be resumed."
          action={back}
        />
      </LearnerShell>
    );
  if (!sessionContentAvailable(session))
    return (
      <LearnerShell displayName={name} isDemo>
        <ErrorState
          title="Some saved questions are unavailable"
          description="Your saved answers are kept. Return to setup to confirm a new diagnostic; this session has not been replaced automatically."
          action={back}
        />
      </LearnerShell>
    );
  const step = assessmentStep(session, reviewId, questions);
  const { index, question, response } = step;
  const sessionLabel =
    session.kind === "diagnostic" ? "diagnostic" : "practice";
  function answer(option: string, confidence: Confidence | null) {
    if (!question || busy.current) return;
    busy.current = true;
    setSaveError("");
    try {
      const result = createAssessmentService(
        createDemoRepository(window.localStorage),
      ).answer(sessionId, question.id, option, confidence);
      setReviewId(question.id);
      replaceData(result.data);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Your answer could not be saved. Check browser storage and retry.",
      );
    } finally {
      busy.current = false;
    }
  }
  const complete = step.complete;
  const score = accuracyOf(session.responses);
  return (
    <LearnerShell displayName={name} isDemo>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Badge tone="info">Untimed {sessionLabel}</Badge>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
          >
            Pause and return to dashboard
          </Link>
        </div>
        {complete ? (
          <Card>
            <CheckCircle2
              aria-hidden="true"
              size={32}
              className="text-success"
            />
            <h1
              ref={completionTitle}
              tabIndex={-1}
              className="mt-5 text-3xl font-semibold tracking-tight"
            >
              {session.kind === "diagnostic"
                ? "Your starting point is saved."
                : "Your practice session is saved."}
            </h1>
            <p className="mt-4 text-xl font-semibold">
              {score.correct} correct / {score.total} answers · {score.percent}%
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Your dashboard now reflects these answers, confidence ratings, and
              revision priorities. This learning score does not predict your
              official exam result.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {session.status === "completed" ? (
                <Link
                  href={`/${session.kind === "diagnostic" ? "assessment" : "practice"}/${encodeURIComponent(session.id)}/results`}
                  className={buttonVariants()}
                >
                  View detailed results
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              ) : null}
              <Link href="/dashboard" className={buttonVariants()}>
                Open dashboard
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Button
                variant="secondary"
                onClick={() => setReviewId(session.questionIds[0])}
              >
                Review answers
              </Button>
            </div>
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              {session.kind === "diagnostic"
                ? "Detailed results show your topic breakdown, confidence patterns, and learning priorities. Concept lessons are available now."
                : "Practice results distinguish first practice, retries, and supported comparisons on matching questions."}
            </p>
          </Card>
        ) : question ? (
          <>
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Question {index + 1} of {session.questionIds.length}
                </span>
                <span>{session.responses.length} answers saved</span>
              </div>
              <progress
                className="mt-3 h-2 w-full accent-primary"
                value={session.responses.length}
                max={session.questionIds.length}
                aria-label="Saved session answers"
              />
            </div>
            {saveError ? (
              <div
                role="alert"
                className="mb-5 rounded-xl bg-destructive-soft p-4 text-sm leading-7 text-destructive"
              >
                {saveError}
                <Button variant="secondary" onClick={refresh} className="mt-3">
                  Reload saved session
                </Button>
              </div>
            ) : null}
            <QuestionPanel
              key={question.id}
              question={question}
              response={response}
              onSubmit={answer}
              last={index === session.questionIds.length - 1}
              confidenceEnabled={confidenceRequired(session)}
              revealExplanation={step.revealExplanation}
              preference={state.data.profile.preferences.explanationStyle}
              sessionLabel={sessionLabel}
              onNext={() => {
                setSaveError("");
                if (
                  session.status === "completed" &&
                  index === session.questionIds.length - 1
                ) {
                  router.push(
                    `/${session.kind === "diagnostic" ? "assessment" : "practice"}/${encodeURIComponent(session.id)}/results`,
                  );
                  return;
                }
                setReviewId(
                  index + 1 < session.responses.length
                    ? session.questionIds[index + 1]
                    : null,
                );
              }}
            />
            {session.responses.length && !reviewId ? (
              <Button
                variant="ghost"
                className="mt-3"
                onClick={() =>
                  setReviewId(
                    session.responses[session.responses.length - 1].questionId,
                  )
                }
              >
                Review last saved answer
              </Button>
            ) : null}
          </>
        ) : (
          <ErrorState
            title="Your session needs attention"
            description="The current question could not be opened. Your saved answers have not been removed."
            action={back}
          />
        )}
      </div>
    </LearnerShell>
  );
}
