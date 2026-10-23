import { topics, concepts } from "./content";
import { accuracyOf, revisionPriority } from "./scoring";
import { addCalendarDays, dateInTimezone } from "./scheduler";
import type { LearnerData, QuestionResponse } from "./models";

// A display guideline, not a statistical mastery or readiness threshold.
export const MIN_TOPIC_RESPONSES = 3;
export function conceptTitle(id: string) {
  return (
    concepts.find((concept) => concept.id === id)?.title ??
    id.replace(/[-_]/g, " ").replace(/^\w/, (letter) => letter.toUpperCase())
  );
}

export function dashboardSummary(data: LearnerData, now = new Date()) {
  const timezone = data.profile.preferences.timezone;
  const today = dateInTimezone(now, timezone);
  const time = now.getTime();
  const throughNow = (value: string) => new Date(value).getTime() <= time;
  const responses = data.sessions
    .flatMap((session) => session.responses)
    .filter((response) => throughNow(response.submittedAt));
  const practiceResponses = responses.filter(
    (response) => response.attemptType !== "diagnostic",
  );
  const unfinished =
    data.sessions
      .filter(
        (session) =>
          session.status === "in-progress" && throughNow(session.startedAt),
      )
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0] ??
    null;
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const weekStart = addCalendarDays(today, -((weekday + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, index) =>
    addCalendarDays(weekStart, index),
  );
  const activityDates = new Set(
    [
      ...responses.map((response) => response.submittedAt),
      ...data.activity.map((event) => event.at),
      ...data.sessions
        .filter(
          (session) => session.status === "completed" && session.completedAt,
        )
        .map((session) => session.completedAt!),
    ]
      .filter(throughNow)
      .map((at) => dateInTimezone(new Date(at), timezone))
      .filter((date) => date >= weekStart && date <= today),
  );
  const dueRevision = data.revision.filter(
    (item) => item.nextReviewDate <= today,
  );
  const latestByConcept = new Map<string, QuestionResponse>();
  for (const response of [...responses].sort(
    (a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt),
  ))
    latestByConcept.set(response.conceptId, response);
  const priorityIds = new Set([
    ...latestByConcept.keys(),
    ...dueRevision.map((item) => item.conceptId),
  ]);
  const priorities = [...priorityIds]
    .map((id) => {
      const response = latestByConcept.get(id);
      const score = response ? revisionPriority(response) : 0;
      const due = dueRevision.some((item) => item.conceptId === id);
      const reason =
        score === 3
          ? "Answered incorrectly with high confidence."
          : score === 2
            ? "Answered incorrectly; revisit the reasoning."
            : score === 1
              ? "Correct answer, low confidence."
              : due
                ? "Due for another review."
                : null;
      return {
        id,
        title: conceptTitle(id),
        score,
        due,
        reason,
        lastAttemptAt: response?.submittedAt ?? "",
        topicId:
          response?.topicId ??
          concepts.find((concept) => concept.id === id)?.topicId ??
          null,
      };
    })
    .filter((item) => item.reason)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.due) - Number(a.due) ||
        (Date.parse(b.lastAttemptAt) || 0) - (Date.parse(a.lastAttemptAt) || 0),
    )
    .slice(0, 3);
  const topicSummaries = topics.map((topic) => {
    const marked = responses.filter(
      (response) => response.topicId === topic.id,
    );
    const accuracy = accuracyOf(marked);
    return {
      ...topic,
      ...accuracy,
      enoughEvidence: marked.length >= MIN_TOPIC_RESPONSES,
      confident: marked.filter(
        (response) => response.confidence === "confident",
      ).length,
      uncertain: marked.filter(
        (response) =>
          response.confidence !== null && response.confidence !== "confident",
      ).length,
      unrated: marked.filter((response) => response.confidence === null).length,
      conceptsNeedingRevision: [...latestByConcept.values()].filter(
        (response) =>
          response.topicId === topic.id && revisionPriority(response) > 0,
      ).length,
    };
  });
  const completedThisWeek = data.sessions.filter(
    (session) =>
      session.status === "completed" &&
      session.completedAt &&
      throughNow(session.completedAt) &&
      dateInTimezone(new Date(session.completedAt), timezone) >= weekStart,
  ).length;
  const recentActivity = data.activity
    .filter((event) => throughNow(event.at))
    .map((event) => ({
      ...event,
      label:
        event.kind === "session-completed"
          ? "Completed a study session"
          : event.kind === "lesson-reviewed"
            ? `Reviewed ${conceptTitle(event.targetId)}`
            : `Revisited ${conceptTitle(event.targetId)}`,
    }))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 5);
  const examDate = data.profile.preferences.examDate;
  const latestCompletedDiagnostic =
    data.sessions
      .filter(
        (session) =>
          session.kind === "diagnostic" &&
          session.status === "completed" &&
          session.completedAt &&
          throughNow(session.completedAt),
      )
      .sort(
        (a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!),
      )[0] ?? null;
  const examDays = examDate
    ? Math.round(
        (Date.parse(`${examDate}T00:00:00Z`) -
          Date.parse(`${today}T00:00:00Z`)) /
          86400000,
      )
    : null;
  return {
    today,
    timezone,
    unfinished,
    practice: accuracyOf(practiceResponses),
    totalResponses: responses.length,
    topicsAttempted: new Set(responses.map((response) => response.topicId))
      .size,
    hasDiagnostic: Boolean(latestCompletedDiagnostic),
    latestCompletedDiagnostic,
    dueCount: dueRevision.length,
    priorities,
    topics: topicSummaries,
    weekDates: weekDates.map((date) => ({
      date,
      active: activityDates.has(date),
      future: date > today,
    })),
    activeDaysThisWeek: activityDates.size,
    completedThisWeek,
    recentActivity,
    examDays,
  };
}

export function initialStudyPlan(minutes: number) {
  const sample = Math.min(5, Math.max(3, Math.floor(minutes / 3)));
  const explanation = Math.min(5, minutes - sample);
  const tasks = [
    {
      title: "Try the confidence sample",
      minutes: sample,
      href: "/demo#sample-question",
      external: false,
    },
    {
      title: "Read the answer explanations",
      minutes: explanation,
      href: "/demo#sample-question",
      external: false,
    },
  ];
  if (minutes >= 15)
    tasks.push({
      title: "Compare cloud service models",
      minutes: Math.min(5, minutes - sample - explanation),
      href: "https://learn.microsoft.com/training/modules/describe-cloud-service-types/",
      external: true,
    });
  return tasks;
}
