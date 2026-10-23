import { questions, topics } from "./content";
import { conceptTitle } from "./dashboard";
import { sessionSchema, type AssessmentSession, type Question } from "./models";
import { accuracyOf, classifyResponse, revisionPriority } from "./scoring";

export const confidenceCategories = [
  {
    id: "confident-correct",
    title: "Confident and correct",
    description: "You chose correctly and felt able to explain why.",
  },
  {
    id: "confident-incorrect",
    title: "Confident and incorrect",
    description: "A useful place to challenge an assumption.",
  },
  {
    id: "uncertain-correct",
    title: "Uncertain and correct",
    description: "The answer fits, but the reasoning deserves another look.",
  },
  {
    id: "uncertain-incorrect",
    title: "Uncertain and incorrect",
    description: "Build the reasoning, then try fresh practice when available.",
  },
] as const;

export function diagnosticResults(
  input: AssessmentSession,
  pool: readonly Question[] = questions,
) {
  const session = sessionSchema.parse(input);
  if (session.kind !== "diagnostic" || session.status !== "completed")
    throw new Error("Results require a completed diagnostic.");
  return sessionResults(session, pool);
}

export function sessionResults(
  input: AssessmentSession,
  pool: readonly Question[] = questions,
) {
  const session = sessionSchema.parse(input);
  if (session.status !== "completed")
    throw new Error("Results require a completed session.");
  const questionMap = new Map(pool.map((question) => [question.id, question]));
  const responseMap = new Map(
    session.responses.map((response) => [response.questionId, response]),
  );
  const answers = session.questionIds.map((id, index) => {
    const response = responseMap.get(id)!; // A completed, validated session has every response.
    const question = questionMap.get(id) ?? null;
    const selectedOption =
      question?.options.find(
        (option) => option.id === response.selectedOptionId,
      ) ?? null;
    // Historical correctness is retained. Never silently re-mark saved answers against changed content.
    const contentChanged = Boolean(
      question &&
      (!selectedOption ||
        question.topicId !== response.topicId ||
        question.conceptId !== response.conceptId ||
        (question.correctOptionId === response.selectedOptionId) !==
          response.correct),
    );
    return {
      index,
      response,
      question,
      selectedOption,
      contentChanged,
      category: classifyResponse(response),
      reviewId: `answer-review-${index + 1}`,
    };
  });
  const latestByConcept = new Map<string, (typeof answers)[number]>();
  for (const answer of [...answers].sort(
    (a, b) =>
      Date.parse(a.response.submittedAt) - Date.parse(b.response.submittedAt),
  ))
    latestByConcept.set(answer.response.conceptId, answer);
  const priorities = [...latestByConcept.values()]
    .map((answer) => ({
      ...answer,
      conceptId: answer.response.conceptId,
      title: conceptTitle(answer.response.conceptId),
      priority: revisionPriority(answer.response),
      reason: !answer.response.correct
        ? answer.response.confidence === "confident"
          ? "Incorrect with high confidence. Revisit the assumption behind this answer."
          : "Incorrect with uncertainty. Rebuild the reasoning step by step."
        : "Correct with uncertainty. Explain why this answer fits before moving on.",
    }))
    .filter((item) => item.priority > 0)
    .sort((a, b) => b.priority - a.priority || a.index - b.index);
  return {
    score: accuracyOf(session.responses),
    topics: topics.map((topic) => ({
      ...topic,
      ...accuracyOf(
        session.responses.filter((response) => response.topicId === topic.id),
      ),
    })),
    confidence: confidenceCategories.map((category) => ({
      ...category,
      count: answers.filter((answer) => answer.category === category.id).length,
    })),
    priorities,
    answers,
    unavailableCount: answers.filter(
      (answer) => !answer.question || answer.contentChanged,
    ).length,
  };
}

export function confidenceLabel(
  value: AssessmentSession["responses"][number]["confidence"],
) {
  return value === "confident"
    ? "Confident"
    : value === "somewhat"
      ? "Somewhat sure"
      : value === "guessing"
        ? "Guessing"
        : "Unrated";
}
