"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardList,
  Flag,
  Layers3,
  RefreshCw,
  Target,
  type LucideIcon,
} from "lucide-react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { EntryAction } from "@/components/site/entry-action";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { TopicSummaryCard } from "@/components/dashboard/topic-summary-card";
import { SessionAction } from "@/components/dashboard/session-action";
import { useLearnerData } from "@/components/learner/use-learner-data";
import {
  dashboardSummary,
  studyPlan,
  MIN_TOPIC_RESPONSES,
} from "@/lib/cloudready/dashboard";
import { topics, concepts } from "@/lib/cloudready/content";
import { cn } from "@/lib/utils";

function Stat({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon aria-hidden="true" className="shrink-0 text-primary" size={18} />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">{detail}</p>
    </Card>
  );
}

export function Dashboard() {
  const { state, refresh } = useLearnerData();
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Loading your dashboard…" />
        ) : (
          <ErrorState
            title="Your dashboard could not be loaded"
            description="Browser storage may be unavailable or contain unreadable demo data. Existing records have not been reset."
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
  const summary = dashboardSummary(data);
  const preferences = data.profile.preferences;
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${summary.today}T12:00:00Z`));
  const { tasks, scheduledToday } = studyPlan(data, hasDraft);
  const suggestedMinutes = tasks.reduce(
    (total, task) => total + task.minutes,
    0,
  );
  const needsSetup = !data.profile.onboardingComplete || hasDraft;

  return (
    <LearnerShell displayName={name} isDemo>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {dateLabel} · {summary.timezone}
          </p>
          <h1 className="mt-3 max-w-full text-3xl font-semibold tracking-tight break-words sm:text-4xl">
            Hello, {name}.
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {summary.totalResponses
              ? "Use your recorded answers to choose what deserves another look."
              : "A clear starting point is more useful than an empty score."}
          </p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          <RefreshCw aria-hidden="true" size={15} />
          Refresh
        </Button>
      </div>
      {draftError ? (
        <div
          role="alert"
          className="mt-5 rounded-xl bg-warning-soft p-4 text-sm leading-7 text-warning"
        >
          Your saved learner records loaded, but your setup draft needs
          attention.{" "}
          <Link
            href="/foundation"
            className="font-medium underline underline-offset-4"
          >
            Manage demo data
          </Link>{" "}
          before resuming setup.
        </div>
      ) : null}
      <div className="mt-7 grid items-start gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Card className="border-primary/20 bg-accent">
          <Badge tone="info">Your next step</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            {needsSetup
              ? hasDraft
                ? "Pick up your study setup."
                : "Make room for your learning."
              : summary.unfinished
                ? "Continue where you paused."
                : !summary.hasDiagnostic
                  ? "Find your starting point."
                  : summary.priorities.length
                    ? "Give a weak concept another look."
                    : "Keep building your understanding."}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            {needsSetup
              ? "Set your study preferences so your time, explanation style, and starting topics are ready for the next session."
              : summary.unfinished
                ? "An unfinished session is saved in this browser. Your submitted answers are kept when you resume."
                : !summary.hasDiagnostic
                  ? "Explore twelve untimed questions across the three topic groups. Choose an answer and a confidence rating, then learn from the explanation."
                  : "Your latest answers and confidence ratings help prioritise revision. Open a concept lesson to revisit the reasoning; targeted practice is available, and the full revision queue is coming later."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {needsSetup ? (
              <Link href="/onboarding" className={buttonVariants()}>
                {hasDraft ? "Resume setup" : "Set study preferences"}
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            ) : summary.unfinished ? (
              <SessionAction session={summary.unfinished} />
            ) : !summary.hasDiagnostic ? (
              <EntryAction kind="diagnostic">
                Start my diagnostic
                <ArrowRight aria-hidden="true" size={16} />
              </EntryAction>
            ) : summary.priorities.length ? (
              <a href="#revision-priorities" className={buttonVariants()}>
                See revision priorities
              </a>
            ) : (
              <Link href="/learn" className={buttonVariants()}>
                Browse concept lessons
              </Link>
            )}
            {needsSetup ||
            summary.unfinished ||
            !summary.hasDiagnostic ||
            summary.priorities.length ? (
              <Link
                href="/demo"
                className={buttonVariants({ variant: "secondary" })}
              >
                Explore the demo sample
              </Link>
            ) : null}
            {!needsSetup ? (
              <Link
                href="/practice"
                className={buttonVariants({ variant: "secondary" })}
              >
                Set up practice
              </Link>
            ) : null}
            {summary.latestCompletedDiagnostic ? (
              <Link
                href={`/assessment/${encodeURIComponent(summary.latestCompletedDiagnostic.id)}/results`}
                className={buttonVariants({ variant: "secondary" })}
              >
                View latest diagnostic results
              </Link>
            ) : null}
            {summary.latestCompletedPractice ? (
              <Link
                href={`/practice/${encodeURIComponent(summary.latestCompletedPractice.id)}/results`}
                className={buttonVariants({ variant: "secondary" })}
              >
                View latest practice results
              </Link>
            ) : null}
            <Link
              href="/progress"
              className={buttonVariants({ variant: "secondary" })}
            >
              View progress
            </Link>
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <CalendarDays
              aria-hidden="true"
              className="text-primary"
              size={19}
            />
            Your study routine
          </h2>
          <p className="mt-4 text-2xl font-semibold">
            {preferences.minutesPerSession} minutes
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              per session
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.profile.onboardingComplete
              ? `${preferences.studyDays.length} study ${preferences.studyDays.length === 1 ? "day" : "days"} selected each week.`
              : "Finish setup to choose your study days."}
          </p>
          {summary.examDays !== null ? (
            <div className="mt-4 rounded-xl bg-muted/60 p-3">
              <p className="text-sm font-semibold">
                {summary.examDays < 0
                  ? "Your exam date has passed"
                  : summary.examDays === 0
                    ? "Your exam date is today"
                    : `${summary.examDays} ${summary.examDays === 1 ? "day" : "days"} until your exam date`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {preferences.examDate} · Your chosen date, not a readiness
                prediction.
              </p>
            </div>
          ) : null}
          <Link
            href="/onboarding"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
          >
            Edit study preferences
          </Link>
        </Card>
      </div>

      <section
        aria-label="Learning activity summary"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Stat
          icon={Target}
          title="Practice accuracy"
          value={
            summary.practice.percent === null
              ? "—"
              : `${summary.practice.percent}%`
          }
          detail={`${summary.practice.correct} correct / ${summary.practice.total} practice responses. Diagnostic answers excluded.`}
        />
        <Stat
          icon={ClipboardList}
          title="Questions answered"
          value={String(summary.totalResponses)}
          detail="Submitted diagnostic and practice responses, including retries."
        />
        <Stat
          icon={Layers3}
          title="Topics attempted"
          value={`${summary.topicsAttempted} / 3`}
          detail="Topics with at least one submitted response."
        />
        <Stat
          icon={Flag}
          title="Revision items due"
          value={String(summary.dueCount)}
          detail="Scheduled for today or earlier in your chosen timezone."
        />
      </section>

      {summary.unfinished ? (
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge tone="warning">Saved session</Badge>
              <h2 className="mt-3 font-semibold">
                {summary.unfinished.kind === "diagnostic"
                  ? "Diagnostic"
                  : "Practice"}{" "}
                in progress
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {summary.unfinished.responses.length} of{" "}
                {summary.unfinished.questionIds.length} answers saved. No
                responses have been replaced.
              </p>
            </div>
            <SessionAction session={summary.unfinished} />
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Submitted answers are saved. Resume your session or open practice
            setup to choose a new focus.
          </p>
        </Card>
      ) : null}

      <section className="mt-9" aria-labelledby="topics-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="topics-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Your topic overview
          </h2>
          <span className="text-xs text-muted-foreground">
            From diagnostic and practice responses
          </span>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {summary.topics.map((topic) => (
            <TopicSummaryCard key={topic.id} topic={topic} />
          ))}
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-6 text-muted-foreground">
          <CircleHelp aria-hidden="true" size={14} className="mt-1 shrink-0" />
          Fewer than {MIN_TOPIC_RESPONSES} responses is labelled Not enough
          evidence. This display guideline does not establish mastery or predict
          an exam result.
        </p>
      </section>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-2">
        <Card id="revision-priorities">
          <h2 className="text-lg font-semibold">Revision priorities</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Based on the latest answer for each concept and any scheduled
            review.
          </p>
          {summary.priorities.length ? (
            <ol className="mt-5 divide-y">
              {summary.priorities.map((item, index) => (
                <li key={item.id} className="py-4 first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-warning-soft text-xs text-warning">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">
                        {concepts.find((concept) => concept.id === item.id) ? (
                          <Link
                            href={`/learn/${concepts.find((concept) => concept.id === item.id)!.slug}`}
                            className="text-primary underline underline-offset-4"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.reason}
                      </p>
                      {item.topicId ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            topics.find((topic) => topic.id === item.topicId)
                              ?.title
                          }
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-5 rounded-xl bg-muted/50 p-5">
              <p className="text-sm font-medium">No revision priorities yet.</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Your answers and confidence ratings will show which concepts
                need attention. This is not a mastery assessment.
              </p>
            </div>
          )}
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Concept lessons are available now. The full revision queue is coming
            later.
          </p>
        </Card>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">
              A short study plan for today
            </h2>
            <Badge>{suggestedMinutes} min suggested</Badge>
          </div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {scheduledToday
              ? "Today is one of your selected study days."
              : "Today is outside your selected study days; this plan is optional."}{" "}
            A suggested plan within your {preferences.minutesPerSession}-minute
            budget. Times are estimates; you can pause a session.
          </p>
          <ol className="mt-5 divide-y">
            {tasks.map((task, index) => (
              <li
                key={task.title}
                className="flex items-start gap-3 py-4 first:pt-0"
              >
                <span className="mt-0.5 text-xs font-mono text-primary">
                  0{index + 1}
                </span>
                <div className="flex-1">
                  {task.external ? (
                    <a
                      href={task.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary underline underline-offset-4"
                    >
                      {task.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link
                      href={task.href}
                      className="text-sm font-medium text-primary underline underline-offset-4"
                    >
                      {task.title}
                    </Link>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    About {task.minutes} minutes
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            Suggestions use saved sessions and concept priorities. Following a
            link does not mark a task complete or change your scores.
          </p>
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Study activity this week</h2>
            <span className="text-sm font-medium text-success">
              {summary.activeDaysThisWeek} active{" "}
              {summary.activeDaysThisWeek === 1 ? "day" : "days"}
            </span>
          </div>
          <ul className="mt-5 grid grid-cols-7 gap-1.5">
            {summary.weekDates.map((item) => (
              <li
                key={item.date}
                aria-label={`${item.date}: ${item.future ? "upcoming day" : item.active ? "study activity recorded" : "no recorded study activity"}`}
                className={cn(
                  "flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-1 text-xs",
                  item.active
                    ? "border-success/30 bg-success-soft text-success"
                    : "bg-muted/30 text-muted-foreground",
                  item.future && "border-dashed",
                )}
              >
                <span>
                  {new Intl.DateTimeFormat("en-GB", {
                    weekday: "short",
                    timeZone: "UTC",
                  }).format(new Date(`${item.date}T12:00:00Z`))}
                </span>
                {item.active ? (
                  <Check aria-hidden="true" size={15} />
                ) : (
                  <span aria-hidden="true">—</span>
                )}
                <span className="text-[10px]">
                  {item.future ? "Next" : item.active ? "Study" : "None"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            {summary.completedThisWeek} study sessions completed this week.
            Weeks start Monday in {summary.timezone}. Opening a page or changing
            preferences does not count as studying.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Recent activity</h2>
          {summary.recentActivity.length ? (
            <ul className="mt-4 divide-y">
              {summary.recentActivity.map((event) => (
                <li key={event.id} className="py-3">
                  <p className="text-sm font-medium">
                    {event.href ? (
                      <Link
                        href={event.href}
                        className="text-primary underline underline-offset-4"
                      >
                        {event.label}
                      </Link>
                    ) : (
                      event.label
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: summary.timezone,
                    }).format(new Date(event.at))}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-xl bg-muted/50 p-5">
              <p className="text-sm font-medium">
                Your learning story starts here.
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Completed study sessions, lesson reviews, and revision events
                will appear when they are recorded. No sample activity has been
                added.
              </p>
            </div>
          )}
        </Card>
      </div>
      <p className="mt-7 text-xs leading-6 text-muted-foreground">
        This dashboard uses your local demo records. It is separate from real
        accounts. Confidence is self-reported; practice performance does not
        predict your official AZ-900 result.
      </p>
    </LearnerShell>
  );
}
