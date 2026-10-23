"use client";

import { useState } from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import {
  progressReport,
  type ProgressPeriod,
  type ProgressScope,
} from "@/lib/cloudready/progress";

const scopes: { value: ProgressScope; label: string }[] = [
  { value: "practice", label: "All practice" },
  { value: "first-practice", label: "First practice attempts" },
  { value: "retry", label: "Practice retries" },
  { value: "diagnostic", label: "Diagnostic" },
];
const controlClass =
  "mt-2 block min-h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm";
const percent = (value: number | null) => (value === null ? "—" : `${value}%`);

export function ProgressDashboard() {
  const { state, refresh } = useLearnerData();
  const [period, setPeriod] = useState<ProgressPeriod>("30");
  const [scope, setScope] = useState<ProgressScope>("practice");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Loading your progress…" />
        ) : (
          <ErrorState
            title="Your progress could not be loaded"
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
  const report = progressReport(state.data, { period, scope, from, to });
  const scopeLabel = scopes.find((item) => item.value === scope)!.label;
  return (
    <LearnerShell displayName={name} isDemo>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-primary">
            Your learning record
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Progress, with context.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Look at what you answered, how confident you felt, and what needs
            another pass. Every figure comes from your saved demo records.
          </p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          Refresh records
        </Button>
      </div>
      <Card className="mt-7">
        <h2 className="font-semibold">Choose your view</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium">
            Date range
            <select
              className={controlClass}
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as ProgressPeriod)
              }
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
              <option value="custom">Custom dates</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Answer type
            <select
              className={controlClass}
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as ProgressScope)
              }
            >
              {scopes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {period === "custom" ? (
            <>
              <label className="text-sm font-medium">
                From
                <input
                  type="date"
                  className={controlClass}
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </label>
              <label className="text-sm font-medium">
                Through
                <input
                  type="date"
                  className={controlClass}
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                />
              </label>
            </>
          ) : null}
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Dates include both endpoints in{" "}
          {state.data.profile.preferences.timezone}. Answers are grouped by
          submission date, including unfinished sessions. First practice means
          the first saved practice attempt on a question; it may have appeared
          in a diagnostic. Retries can benefit from familiarity.
        </p>
      </Card>
      {report.status === "invalid" ? (
        <div className="mt-5" role="status">
          <ErrorState
            title="Choose a valid date range"
            description="Enter both dates, with the start on or before the end."
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground" role="status">
            {scopeLabel} · {report.from ?? "First saved record"} to {report.to}{" "}
            · {report.accuracy.total} responses
          </p>
          <section
            aria-label="Selected answer summary"
            className="mt-4 grid gap-4 sm:grid-cols-3"
          >
            <Card>
              <p className="text-sm text-muted-foreground">Answer accuracy</p>
              <p className="mt-3 text-3xl font-semibold">
                {percent(report.accuracy.percent)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {report.accuracy.correct} correct / {report.accuracy.total}{" "}
                responses
              </p>
            </Card>
            <Card>
              <p className="text-sm text-muted-foreground">
                Distinct questions
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {report.uniqueQuestions}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Repeated responses count in accuracy.
              </p>
            </Card>
            <Card>
              <p className="text-sm text-muted-foreground">
                Completed sessions
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {report.completed.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                All answer types, by completion date.
              </p>
            </Card>
          </section>
          {!report.accuracy.total ? (
            <div className="mt-6">
              <EmptyState
                title={
                  report.hasHistory
                    ? "No answers in this view"
                    : "Your progress starts with an answer"
                }
                description={
                  report.hasHistory
                    ? "Try another date range or answer type. Your saved history is still available."
                    : "Complete a diagnostic or practice question to start your record. No sample scores have been added."
                }
                action={
                  <Link href="/practice" className={buttonVariants()}>
                    Open practice
                  </Link>
                }
              />
            </div>
          ) : null}
          <Card className="mt-6">
            <h2 className="text-lg font-semibold">Accuracy over time</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {scopeLabel}, grouped by study date. Only days with answers
              appear. Different questions and repeat exposure can change
              percentages; this is not a controlled improvement measure.
            </p>
            {report.trend.length ? (
              <div className="mt-5 max-h-96 overflow-auto rounded-xl border">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Daily accuracy with counts and a visual bar. Days without
                    answers are omitted.
                  </caption>
                  <thead className="bg-muted">
                    <tr>
                      <th scope="col" className="p-3">
                        Date
                      </th>
                      <th scope="col" className="p-3">
                        Correct / answered
                      </th>
                      <th scope="col" className="p-3">
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.trend.map((day) => (
                      <tr key={day.date} className="border-t">
                        <th
                          scope="row"
                          className="p-3 font-normal whitespace-nowrap"
                        >
                          {day.date}
                        </th>
                        <td className="p-3">
                          {day.correct} / {day.total}
                        </td>
                        <td className="min-w-32 p-3">
                          <span>{percent(day.percent)}</span>
                          <div
                            aria-hidden="true"
                            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                          >
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${day.percent ?? 0}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No daily trend yet for this view.
              </p>
            )}
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              {report.trend.length
                ? `${report.trend.length} study dates recorded. Latest: ${report.trend.at(-1)!.date}, ${report.trend.at(-1)!.correct} correct out of ${report.trend.at(-1)!.total} answers.`
                : "No answers is shown as a dash, never as 0% accuracy."}{" "}
              Small samples can shift sharply after one answer. These figures do
              not establish mastery or predict an exam result.
            </p>
          </Card>
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
            <Card>
              <h2 className="text-lg font-semibold">By topic</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Same date range and answer type as the trend.
              </p>
              <ul className="mt-4 divide-y">
                {report.topics.map((topic) => (
                  <li key={topic.id} className="py-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <Link
                        href={`/practice?topic=${topic.id}`}
                        className="text-sm font-medium text-primary underline underline-offset-4"
                      >
                        {topic.title}
                      </Link>
                      <span className="font-semibold">
                        {percent(topic.percent)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {topic.correct} correct / {topic.total} responses
                      {topic.total > 0 && topic.total < 3
                        ? " · Small sample: fewer than 3 answers"
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold">
                Confidence and correctness
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Compare accuracy within each self-reported confidence group.
                Unrated answers stay separate.
              </p>
              <ul className="mt-4 divide-y">
                {report.confidence.map((group) => (
                  <li
                    key={group.confidence ?? "unrated"}
                    className="flex items-center justify-between gap-3 py-4 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {group.confidence === null
                          ? "Unrated"
                          : group.confidence === "confident"
                            ? "Confident"
                            : group.confidence === "somewhat"
                              ? "Somewhat confident"
                              : "Guessing"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.correct} correct · {group.total - group.correct}{" "}
                        incorrect / {group.total} responses
                      </p>
                    </div>
                    <span className="font-semibold">
                      {percent(group.percent)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <Card className="mt-6">
            <h2 className="text-lg font-semibold">Learning beyond questions</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {report.lessonsReviewed} lesson review events ·{" "}
              {report.revisionReviewed} revision review events in this date
              range, across all answer types. Reading and flashcard recall do
              not enter marked-question accuracy.
            </p>
          </Card>
          <Card className="mt-6">
            <h2 className="text-lg font-semibold">Completed session reports</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              All answer types completed in the selected dates. Reports cover
              each full session.
            </p>
            {report.completed.length ? (
              <ul className="mt-4 max-h-80 divide-y overflow-auto">
                {report.completed.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-wrap justify-between gap-2 py-4 text-sm"
                  >
                    <Link
                      href={`/${session.kind === "diagnostic" ? "assessment" : "practice"}/${encodeURIComponent(session.id)}/results`}
                      className="font-medium text-primary underline underline-offset-4"
                    >
                      {session.kind === "diagnostic"
                        ? "Diagnostic"
                        : "Practice"}{" "}
                      · {session.responses.length} answers
                    </Link>
                    <span className="text-muted-foreground">
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: report.timezone,
                      }).format(new Date(session.completedAt!))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No completed sessions in these dates. Saved answers from
                unfinished sessions still appear above.
              </p>
            )}
          </Card>
          <p className="mt-6 text-xs leading-6 text-muted-foreground">
            Local demo data, saved in this browser. This report uses historical
            marked answers; reviewed lesson status and recall ratings do not
            change earlier scores.
          </p>
        </>
      )}
    </LearnerShell>
  );
}
