import { topics } from "./content";
import { dateKeySchema, type LearnerData } from "./models";
import { accuracyOf } from "./scoring";
import { addCalendarDays, dateInTimezone } from "./scheduler";

export type ProgressPeriod = "7" | "30" | "all" | "custom";
export type ProgressScope =
  "practice" | "first-practice" | "retry" | "diagnostic";
export interface ProgressFilter {
  period: ProgressPeriod;
  scope: ProgressScope;
  from?: string;
  to?: string;
}

export function progressReport(
  data: LearnerData,
  filter: ProgressFilter,
  now = new Date(),
) {
  const timezone = data.profile.preferences.timezone;
  const today = dateInTimezone(now, timezone);
  const from =
    filter.period === "all"
      ? null
      : filter.period === "custom"
        ? filter.from
        : addCalendarDays(today, filter.period === "7" ? -6 : -29);
  const to = filter.period === "custom" ? filter.to : today;
  if (
    !to ||
    !dateKeySchema.safeParse(to).success ||
    (from !== null && (!from || !dateKeySchema.safeParse(from).success)) ||
    (from && from > to)
  ) {
    return { status: "invalid" as const };
  }
  const inRange = (at: string) => {
    const instant = new Date(at);
    if (instant.getTime() > now.getTime()) return false;
    const date = dateInTimezone(instant, timezone);
    return (!from || date >= from) && date <= to;
  };
  const allResponses = data.sessions.flatMap((session) => session.responses);
  const responses = allResponses.filter(
    (response) =>
      inRange(response.submittedAt) &&
      (filter.scope === "practice"
        ? response.attemptType !== "diagnostic"
        : response.attemptType === filter.scope),
  );
  const byDay = new Map<string, typeof responses>();
  for (const response of responses) {
    const date = dateInTimezone(new Date(response.submittedAt), timezone);
    byDay.set(date, [...(byDay.get(date) ?? []), response]);
  }
  const activity = data.activity.filter((event) => inRange(event.at));
  const completed = data.sessions
    .filter(
      (session) =>
        session.status === "completed" &&
        session.completedAt &&
        inRange(session.completedAt),
    )
    .sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!));
  return {
    status: "ready" as const,
    timezone,
    today,
    from,
    to,
    hasHistory: allResponses.some(
      (response) => Date.parse(response.submittedAt) <= now.getTime(),
    ),
    accuracy: accuracyOf(responses),
    uniqueQuestions: new Set(responses.map((response) => response.questionId))
      .size,
    topics: topics.map((topic) => ({
      ...topic,
      ...accuracyOf(
        responses.filter((response) => response.topicId === topic.id),
      ),
    })),
    confidence: (["confident", "somewhat", "guessing", null] as const).map(
      (confidence) => ({
        confidence,
        ...accuracyOf(
          responses.filter((response) => response.confidence === confidence),
        ),
      }),
    ),
    trend: [...byDay]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, marked]) => ({ date, ...accuracyOf(marked) })),
    completed,
    lessonsReviewed: activity.filter(
      (event) => event.kind === "lesson-reviewed",
    ).length,
    revisionReviewed: activity.filter(
      (event) => event.kind === "revision-reviewed",
    ).length,
  };
}
