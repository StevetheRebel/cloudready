"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { topics } from "@/lib/cloudready/content";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import {
  createRevisionService,
  revisionQueue,
  type RevisionView,
} from "@/lib/cloudready/revision";
import { scheduleNext } from "@/lib/cloudready/scheduler";
import type {
  Concept,
  RecallRating,
  RevisionItem,
} from "@/lib/cloudready/models";

const reasons = {
  "confident-incorrect": "Incorrect with high confidence",
  "uncertain-correct": "Correct with uncertainty",
  incorrect: "Incorrect answer",
  manual: "Added from a lesson",
};
const ratings: { value: RecallRating; label: string; detail: string }[] = [
  { value: "again", label: "Again", detail: "I could not recall it" },
  { value: "hard", label: "Hard", detail: "I needed substantial help" },
  { value: "good", label: "Good", detail: "I recalled it with some effort" },
  { value: "easy", label: "Easy", detail: "I recalled it easily" },
];

function RecallCard({
  item,
  concept,
  timezone,
  onReview,
  onRemove,
}: {
  item: RevisionItem;
  concept: Concept | null;
  timezone: string;
  onReview: (item: RevisionItem, rating: RecallRating) => void;
  onRemove: (item: RevisionItem) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Card>
      <div className="flex flex-wrap justify-between gap-3">
        <Badge tone="info">
          {concept
            ? topics.find((topic) => topic.id === concept.topicId)?.title
            : "Content unavailable"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Next review: {item.nextReviewDate}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-semibold">
        {concept?.title ?? item.conceptId}
      </h2>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        {reasons[item.reason]} · {item.reviews} saved recall reviews
        {item.lastRating ? ` · Last rating: ${item.lastRating}` : ""}
      </p>
      {concept ? (
        <>
          <p className="mt-5 text-sm leading-7">
            Explain {concept.title.toLowerCase()} in your own words. Name a
            useful distinction and when it matters.
          </p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            Pause and try to recall before revealing. Your self-rating schedules
            the next review; it is not a marked question.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            aria-expanded={revealed}
            onClick={() => setRevealed((value) => !value)}
          >
            {revealed ? "Hide explanation" : "Reveal explanation"}
          </Button>
          {revealed ? (
            <div className="mt-5 rounded-xl border bg-muted/30 p-4">
              <h3 className="font-semibold">Check your reasoning</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {concept.recap}
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {concept.comparison.map((entry) => (
                  <div key={entry.label}>
                    <dt className="text-sm font-medium">{entry.label}</dt>
                    <dd className="mt-1 text-sm leading-7 text-muted-foreground">
                      {entry.detail}
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                href={concept.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
              >
                Microsoft Learn source
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <h3 className="mt-4 text-sm font-semibold">
                How well did you recall it?
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {ratings.map((rating) => (
                  <Button
                    key={rating.value}
                    variant="secondary"
                    className="h-auto min-h-24 flex-col items-start whitespace-normal text-left"
                    onClick={() => onReview(item, rating.value)}
                  >
                    <span>
                      {rating.label} ·{" "}
                      {scheduleNext(item, rating.value, timezone).intervalDays}{" "}
                      days
                    </span>
                    <span className="text-xs font-normal">{rating.detail}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          <Link
            href={`/learn/${concept.slug}`}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
          >
            Open full lesson
          </Link>
        </>
      ) : (
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          This concept is no longer in the current lesson bank. Your schedule is
          kept; recall ratings are unavailable until the content returns.
        </p>
      )}
      <div className="mt-3 border-t pt-3">
        <Button variant="ghost" onClick={() => onRemove(item)}>
          Remove from revision
        </Button>
      </div>
    </Card>
  );
}

export function RevisionDashboard() {
  const { state, refresh, replaceData } = useLearnerData();
  const [view, setView] = useState<RevisionView>("due");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const service = useRef<ReturnType<typeof createRevisionService> | null>(null);
  const busy = useRef(false);
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  function act(
    action: "review" | "remove" | "undo",
    item?: RevisionItem,
    rating?: RecallRating,
  ) {
    if (busy.current) return;
    busy.current = true;
    setError("");
    try {
      service.current ??= createRevisionService(
        createDemoRepository(window.localStorage),
      );
      const data =
        action === "undo"
          ? service.current.undoRemove()
          : action === "remove"
            ? service.current.remove(item!)
            : service.current.review(item!, rating!);
      replaceData(data);
      setCanUndo(action === "remove");
      setMessage(
        action === "remove"
          ? "Removed from revision. Undo is available until your next successful change or until you leave this page."
          : action === "undo"
            ? "Revision item restored with its previous schedule."
            : `Recall saved. Next review: ${data.revision.find((value) => value.conceptId === item!.conceptId)!.nextReviewDate}. Your question scores are unchanged.`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "This change could not be saved. Check browser storage and try again.",
      );
    } finally {
      busy.current = false;
    }
  }
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Loading your revision queue…" />
        ) : (
          <ErrorState
            title="Your revision queue could not be loaded"
            description="Browser storage may be unavailable or unreadable. Your records have not been reset."
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
  const queue = revisionQueue(state.data, view);
  return (
    <LearnerShell displayName={name} isDemo>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-primary">
            Keep useful ideas close
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            A little recall, regularly.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Revisit concepts from your answers or saved lessons. Recall first,
            reveal the explanation, then choose how it felt.
          </p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          Refresh queue
        </Button>
      </div>
      <Card className="mt-7">
        <div
          className="flex flex-wrap gap-3"
          role="group"
          aria-label="Revision view"
        >
          {(
            [
              { value: "due", label: `Due today (${queue.dueCount})` },
              { value: "upcoming", label: `Upcoming (${queue.upcomingCount})` },
              { value: "all", label: `All items (${queue.total})` },
            ] as const
          ).map((option) => (
            <Button
              key={option.value}
              variant={view === option.value ? "primary" : "secondary"}
              aria-pressed={view === option.value}
              onClick={() => setView(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          {queue.today} · {queue.timezone}. Due today includes overdue items.
          Reviewing an upcoming item schedules it again from today.
        </p>
      </Card>
      <div role="status" aria-live="polite" className="mt-5 text-sm leading-7">
        {message ? <p>{message}</p> : null}
        {canUndo ? (
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => act("undo")}
          >
            Undo last removal
          </Button>
        ) : null}
      </div>
      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-destructive/30 p-4 text-sm text-destructive"
        >
          {error}{" "}
          <Button variant="secondary" onClick={refresh}>
            Refresh queue
          </Button>
        </div>
      ) : null}
      {queue.items.length ? (
        <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
          {queue.items.map(({ item, concept }) => (
            <RecallCard
              key={JSON.stringify(item)}
              item={item}
              concept={concept}
              timezone={queue.timezone}
              onReview={(expected, rating) => act("review", expected, rating)}
              onRemove={(expected) => act("remove", expected)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title={
              !queue.total
                ? "Your revision list is empty"
                : view === "due"
                  ? "You’re up to date for today"
                  : "No upcoming reviews"
            }
            description={
              !queue.total
                ? "Concepts needing attention appear after saved answers. You can also add any concept from its lesson."
                : view === "due"
                  ? `${queue.upcomingCount} items are scheduled for later. You can browse upcoming reviews or keep learning.`
                  : "Your saved items are due today or earlier. Open Due today to review them."
            }
            action={
              <Link href="/learn" className={buttonVariants()}>
                Explore concept lessons
              </Link>
            }
          />
        </div>
      )}
      <Card className="mt-7">
        <h2 className="font-semibold">How scheduling works</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Again: 1 day. Hard: 3 days. Good: 7 days. Easy: 16 days, doubling
          after each consecutive Easy rating, capped at 120 days. Other ratings
          reset the Easy streak. Dates use your saved timezone and start from
          the day you rate, even when overdue.
        </p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          Recall ratings are self-reported and remain separate from question
          accuracy. Removal keeps your previous answers and activity. Undo
          restores only the last removal while the saved records are unchanged.
          New answers may add a removed concept again if it needs attention.
        </p>
      </Card>
    </LearnerShell>
  );
}
