"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Flag,
  RefreshCw,
} from "lucide-react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { AnswerReview } from "@/components/assessment/answer-review";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { diagnosticResults } from "@/lib/cloudready/results";
import { topics } from "@/lib/cloudready/content";

export function DiagnosticResults({ sessionId }: { sessionId: string }) {
  const { state, refresh } = useLearnerData();
  const heading = useRef<HTMLHeadingElement>(null);
  const session =
    state.status === "ready"
      ? state.data.sessions.find((item) => item.id === sessionId)
      : undefined;
  const ready =
    session?.kind === "diagnostic" && session.status === "completed";
  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [ready]);
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  const dashboard = (
    <Link
      href="/dashboard"
      className={buttonVariants({ variant: "secondary" })}
    >
      Back to dashboard
    </Link>
  );
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Loading your diagnostic results…" />
        ) : (
          <ErrorState
            title="Your results could not be loaded"
            description="Browser storage may be unavailable or contain unreadable data. Existing records have not been reset."
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
  if (!session)
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title="No diagnostic found for this link"
          description="Results belong to the browser and site where you completed the diagnostic. Its records may be on another device or may have been cleared."
          action={
            <div className="flex flex-wrap gap-3">
              {dashboard}
              <Link href="/assessment/start" className={buttonVariants()}>
                Open diagnostic setup
              </Link>
            </div>
          }
        />
      </LearnerShell>
    );
  if (session.kind !== "diagnostic")
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title="This is a practice session"
          description="This results page is for diagnostics. Your practice records are kept, and you can open the shared session screen."
          action={
            <Link
              href={`/assessment/${encodeURIComponent(session.id)}`}
              className={buttonVariants()}
            >
              Open saved session
            </Link>
          }
        />
      </LearnerShell>
    );
  if (session.status !== "completed")
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title={
            session.status === "abandoned"
              ? "This diagnostic was closed"
              : "Your diagnostic is still in progress"
          }
          description={
            session.status === "abandoned"
              ? "This session was replaced before completion. Its submitted answers remain in learning history, but it has no completed results."
              : `${session.responses.length} of ${session.questionIds.length} answers are saved. Finish the diagnostic before opening its results.`
          }
          action={
            session.status === "in-progress" ? (
              <Link
                href={`/assessment/${encodeURIComponent(session.id)}`}
                className={buttonVariants()}
              >
                Resume diagnostic
              </Link>
            ) : (
              dashboard
            )
          }
        />
      </LearnerShell>
    );
  const results = diagnosticResults(session);
  const completedLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: state.data.profile.preferences.timezone,
  }).format(new Date(session.completedAt!));
  function openAnswer(id: string) {
    const detail = document.getElementById(id) as HTMLDetailsElement | null;
    if (detail) {
      detail.open = true;
      detail.querySelector("summary")?.focus();
    }
  }
  return (
    <LearnerShell displayName={name} isDemo>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge tone="info">Completed diagnostic</Badge>
          <h1
            ref={heading}
            tabIndex={-1}
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Your starting point, explained.
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Completed {completedLabel} ·{" "}
            {state.data.profile.preferences.timezone}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            These results describe this diagnostic. Later practice updates your
            dashboard without changing this saved report.
          </p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          <RefreshCw aria-hidden="true" size={15} />
          Refresh
        </Button>
      </div>
      <div className="mt-7 grid items-start gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card className="border-primary/20 bg-accent">
          <CheckCircle2 aria-hidden="true" size={27} className="text-primary" />
          <p className="mt-4 text-sm font-medium">Diagnostic accuracy</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight">
            {results.score.percent}%
          </p>
          <p className="mt-3 text-sm font-medium">
            {results.score.correct} correct / {results.score.total} submitted
            answers
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Use the mistakes and confidence ratings to decide what to revisit.
            This is a learning snapshot, not a pass prediction, mastery score,
            or official exam simulation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#revision-priorities" className={buttonVariants()}>
              See learning priorities
              <ArrowRight aria-hidden="true" size={16} />
            </a>
            <a
              href="#answer-review"
              className={buttonVariants({ variant: "secondary" })}
            >
              Review all answers
            </a>
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Flag aria-hidden="true" size={19} className="text-primary" />
            Where to focus
          </h2>
          <p className="mt-4 text-3xl font-semibold">
            {results.priorities.length}{" "}
            {results.priorities.length === 1 ? "concept" : "concepts"}
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {results.priorities.length
              ? "Revisit incorrect answers first, especially those you chose confidently. Correct but uncertain answers also deserve attention."
              : "No revision priorities were identified from these answers. A small set of correct answers does not establish mastery."}
          </p>
          <p className="mt-4 border-t pt-4 text-xs leading-6 text-muted-foreground">
            Your saved result includes the answers you submitted. Reading
            explanations does not change your score or mark a lesson as
            reviewed.
          </p>
        </Card>
      </div>
      {results.unavailableCount ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-warning-soft p-4 text-sm leading-7 text-warning"
        >
          Current content cannot be safely shown for {results.unavailableCount}{" "}
          {results.unavailableCount === 1 ? "answer" : "answers"}. Saved results
          remain available; affected answer reviews explain the limitation.
        </p>
      ) : null}
      <section aria-labelledby="topic-results" className="mt-9">
        <h2 id="topic-results" className="text-xl font-semibold tracking-tight">
          Your topic breakdown
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {results.topics.map((topic) => (
            <Card key={topic.id}>
              <h3 className="text-base font-semibold">{topic.title}</h3>
              <p className="mt-4 text-3xl font-semibold">
                {topic.percent === null ? "—" : `${topic.percent}%`}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {topic.correct} correct / {topic.total} responses
              </p>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                {topic.total
                  ? "Small sample. Use answer review to understand the reasoning."
                  : "No responses in this topic. No percentage is inferred."}
              </p>
            </Card>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-6 text-muted-foreground">
          <CircleHelp aria-hidden="true" size={15} className="mt-1 shrink-0" />
          The initial diagnostic uses four questions per topic. Equal learning
          coverage does not represent official exam weighting.
        </p>
      </section>
      <section aria-labelledby="confidence-results" className="mt-9">
        <h2
          id="confidence-results"
          className="text-xl font-semibold tracking-tight"
        >
          Accuracy meets confidence
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          “Somewhat sure” and “Guessing” are grouped as uncertain. Confidence is
          your self-assessment, not a measured probability.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {results.confidence.map((category) => (
            <Card key={category.id}>
              <p className="text-sm font-semibold">{category.title}</p>
              <p className="mt-4 text-3xl font-semibold">
                {category.count}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  / {results.score.total}
                </span>
              </p>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                {category.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
      <section
        id="revision-priorities"
        aria-labelledby="priorities-title"
        className="mt-9 scroll-mt-6"
      >
        <h2
          id="priorities-title"
          className="text-xl font-semibold tracking-tight"
        >
          Priorities from this diagnostic
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          This is your session’s learning-gap list. It is separate from the
          dashboard’s current revision schedule.
        </p>
        {results.priorities.length ? (
          <ol className="mt-4 space-y-3">
            {results.priorities.map((item, index) => (
              <li key={item.conceptId}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-warning-soft text-sm font-medium text-warning">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">
                          {item.reason}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            topics.find(
                              (topic) => topic.id === item.response.topicId,
                            )?.title
                          }
                        </p>
                      </div>
                    </div>
                    <a
                      href={`#${item.reviewId}`}
                      className={buttonVariants({ variant: "secondary" })}
                      onClick={() => openAnswer(item.reviewId)}
                    >
                      Review this answer
                    </a>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        ) : (
          <Card className="mt-4">
            <p className="text-sm font-medium">
              No learning gaps flagged in this session.
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Keep exploring the explanations and broader source material. These
              results cover a small introductory question set.
            </p>
          </Card>
        )}
      </section>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">
          Turn this into your next study session
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Open a priority answer below, compare the alternatives, and follow its
          Microsoft Learn reference. Your saved explanation preference is
          available in each review.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" disabled>
            Concept lessons · Coming next
          </Button>
          <Button variant="secondary" disabled>
            Targeted practice · Coming later
          </Button>
          {dashboard}
        </div>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          Lesson and practice pages are not available yet. Reviewing an answer
          here does not record a new attempt or mark a concept as mastered.
        </p>
      </Card>
      <section
        id="answer-review"
        aria-labelledby="review-title"
        className="mt-9 scroll-mt-6"
      >
        <h2 id="review-title" className="text-xl font-semibold tracking-tight">
          Review every answer
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Expand a question to compare your choice, its confidence rating, and
          the explanation. These saved answers cannot be edited.
        </p>
        <div className="mt-4 space-y-3">
          {results.answers.map((answer) => (
            <AnswerReview
              key={answer.response.questionId}
              answer={answer}
              preference={state.data.profile.preferences.explanationStyle}
            />
          ))}
        </div>
      </section>
      <p className="mt-7 text-xs leading-6 text-muted-foreground">
        Unofficial AZ-900 study tool. Results are local to this browser and
        site. Opening this report does not create activity, alter revision
        dates, or change a saved response.
      </p>
    </LearnerShell>
  );
}
