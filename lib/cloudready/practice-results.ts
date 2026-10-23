import type { LearnerData } from "./models";
import { sessionResults } from "./results";
import { accuracyOf } from "./scoring";

export function practiceResults(data: LearnerData, sessionId: string) {
  const session = data.sessions.find((item) => item.id === sessionId);
  if (!session || session.kind !== "practice" || session.status !== "completed")
    throw new Error("Practice results require a completed practice session.");
  const firstPractice = session.responses.filter(
    (response) => response.attemptType === "first-practice",
  );
  const retries = session.responses.filter(
    (response) => response.attemptType === "retry",
  );
  const prior = data.sessions
    .filter((item) => item.id !== sessionId)
    .flatMap((item) => item.responses)
    .filter((response) => response.attemptType === "first-practice")
    .sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt));
  const matched = retries.flatMap((response) => {
    const first = prior.find(
      (item) =>
        item.questionId === response.questionId &&
        Date.parse(item.submittedAt) <= Date.parse(response.submittedAt),
    );
    return first ? [{ first, retry: response }] : [];
  });
  return {
    ...sessionResults(session),
    firstPractice: accuracyOf(firstPractice),
    retries: accuracyOf(retries),
    unratedCount: session.responses.filter(
      (response) => response.confidence === null,
    ).length,
    freshCount: session.freshQuestionIds?.length ?? null,
    comparison: {
      first: accuracyOf(matched.map((item) => item.first)),
      retry: accuracyOf(matched.map((item) => item.retry)),
      unmatched: retries.length - matched.length,
    },
  };
}
