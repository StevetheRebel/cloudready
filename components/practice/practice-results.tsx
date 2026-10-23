"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { AnswerReview } from "@/components/assessment/answer-review";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { practiceResults } from "@/lib/cloudready/practice-results";
import { concepts } from "@/lib/cloudready/content";

function Accuracy({
  title,
  score,
}: {
  title: string;
  score: { correct: number; total: number; percent: number | null };
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-3 text-3xl font-semibold">
        {score.percent === null ? "—" : `${score.percent}%`}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {score.correct} correct / {score.total} responses
      </p>
    </Card>
  );
}
export function PracticeResults({ sessionId }: { sessionId: string }) {
  const { state, refresh } = useLearnerData();
  const heading = useRef<HTMLHeadingElement>(null);
  const session =
    state.status === "ready"
      ? state.data.sessions.find((item) => item.id === sessionId)
      : undefined;
  const ready = session?.kind === "practice" && session.status === "completed";
  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [ready]);
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Loading practice results…" />
        ) : (
          <ErrorState
            title="Practice results could not be loaded"
            description="Your saved records have not been reset. Check browser storage and try again."
            action={<Button onClick={refresh}>Try again</Button>}
          />
        )}
      </LearnerShell>
    );
  if (!session)
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title="Practice not found in this browser"
          description="This link may belong to another browser or site, or local records may have been cleared."
          action={
            <Link href="/practice" className={buttonVariants()}>
              Open practice setup
            </Link>
          }
        />
      </LearnerShell>
    );
  if (session.kind !== "practice")
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title="This is a diagnostic session"
          description="Open the diagnostic screen to resume it or see its saved results."
          action={
            <Link
              href={`/assessment/${encodeURIComponent(session.id)}${session.status === "completed" ? "/results" : ""}`}
              className={buttonVariants()}
            >
              Open diagnostic
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
              ? "This practice session was closed"
              : "Practice is still in progress"
          }
          description={
            session.status === "abandoned"
              ? "Its submitted answers remain in history, but a replaced session has no completed report."
              : `${session.responses.length} of ${session.questionIds.length} answers are saved. Complete the session to see results.`
          }
          action={
            <Link
              href={
                session.status === "abandoned"
                  ? "/practice"
                  : `/practice/${encodeURIComponent(session.id)}`
              }
              className={buttonVariants()}
            >
              {session.status === "abandoned"
                ? "Open practice setup"
                : "Resume practice"}
            </Link>
          }
        />
      </LearnerShell>
    );
  const results = practiceResults(state.data, sessionId);
  return (
    <LearnerShell displayName={name} isDemo>
      <Badge tone="info">Completed practice</Badge>
      <h1
        ref={heading}
        tabIndex={-1}
        className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        Your practice, with the context.
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        This report uses only this session’s saved answers. A retry can reflect
        familiarity with a question; no score here predicts an exam result.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Accuracy title="Session accuracy" score={results.score} />
        <Accuracy
          title="First practice responses"
          score={results.firstPractice}
        />
        <Accuracy title="Retry responses" score={results.retries} />
      </div>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">
        First practice means the first saved practice response to a question,
        even if it appeared in a diagnostic. These groups can contain different
        questions, so their percentages alone do not establish improvement.
      </p>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Compare the same questions</h2>
        {results.comparison.first.total ? (
          <>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {results.comparison.first.total} current retries have an earlier
              first-practice answer for the same question.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Accuracy
                title="Earlier first-practice answers"
                score={results.comparison.first}
              />
              <Accuracy
                title="Current retries on those questions"
                score={results.comparison.retry}
              />
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Matched question IDs provide a like-for-like comparison, but
              repeats are not unseen-question evidence. This does not isolate
              the cause of a score change.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            No current retry has a matching earlier first-practice answer in the
            saved history. No before/after comparison is inferred.
          </p>
        )}
        {results.comparison.unmatched ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {results.comparison.unmatched} retries lack a matching
            first-practice record and are excluded from this comparison.
          </p>
        ) : null}
      </Card>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">
            Question exposure and confidence
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {results.freshCount === null
              ? "This older session did not record question exposure at creation."
              : `${results.freshCount} questions had no saved answers when this session started; ${session.questionIds.length - results.freshCount} had been answered before.`}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {results.unratedCount} unrated responses. Unrated is separate from
            guessing or uncertainty.
          </p>
          <ul className="mt-3 space-y-2">
            {results.confidence.map((category) => (
              <li
                key={category.id}
                className="flex justify-between gap-3 text-sm"
              >
                <span>{category.title}</span>
                <span>
                  {category.count} / {results.score.total}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Topic breakdown</h2>
          <ul className="mt-4 space-y-4">
            {results.topics.map((topic) => (
              <li key={topic.id}>
                <h3 className="text-sm font-medium">{topic.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {topic.percent === null ? "—" : `${topic.percent}%`} ·{" "}
                  {topic.correct} correct / {topic.total} responses
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Small samples describe these responses, not mastery.
          </p>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">
          Concepts to revisit from this session
        </h2>
        {results.priorities.length ? (
          <ul className="mt-4 space-y-4">
            {results.priorities.map((item) => {
              const lesson = concepts.find(
                (concept) => concept.id === item.conceptId,
              );
              return (
                <li key={item.conceptId}>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    {item.reason}
                  </p>
                  {lesson ? (
                    <Link
                      href={`/learn/${lesson.slug}`}
                      className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
                    >
                      Study this concept
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            No concepts were flagged by these responses. This does not establish
            mastery.
          </p>
        )}
      </Card>
      {results.unavailableCount ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-warning-soft p-4 text-sm text-warning"
        >
          Current content cannot safely be shown for {results.unavailableCount}{" "}
          answers. Saved results are retained; affected reviews explain the
          limitation.
        </p>
      ) : null}
      <section className="mt-8" aria-labelledby="practice-review">
        <h2 id="practice-review" className="text-xl font-semibold">
          Review your saved answers
        </h2>
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
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/practice" className={buttonVariants()}>
          Set up another practice
        </Link>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "secondary" })}
        >
          Open dashboard
        </Link>
      </div>
      <p className="mt-5 text-xs leading-6 text-muted-foreground">
        Reading this report changes no saved response, review date, or activity
        event. Progress remains local to this browser and site.
      </p>
    </LearnerShell>
  );
}
