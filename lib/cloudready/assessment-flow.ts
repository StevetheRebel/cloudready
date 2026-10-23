import type { AssessmentSession, Question } from "./models";

export function confidenceRequired(session: AssessmentSession) {
  return session.kind === "diagnostic" || session.confidenceEnabled;
}

export function assessmentStep(
  session: AssessmentSession,
  reviewId: string | null,
  pool: readonly Question[],
) {
  // Only submitted answers can be reviewed; a stale/future review ID cannot skip ahead.
  const reviewing =
    reviewId &&
    session.responses.some((response) => response.questionId === reviewId)
      ? reviewId
      : null;
  const index = reviewing
    ? session.questionIds.indexOf(reviewing)
    : session.responses.length;
  const question = pool.find((item) => item.id === session.questionIds[index]);
  const response = session.responses.find(
    (item) => item.questionId === question?.id,
  );
  return {
    index,
    question,
    response,
    complete: session.status === "completed" && !reviewing,
    revealExplanation:
      Boolean(response) &&
      (session.explanationTiming === "after-answer" ||
        session.status === "completed"),
  };
}
