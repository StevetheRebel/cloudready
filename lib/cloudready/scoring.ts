import {
  confidenceSchema,
  questionSchema,
  sessionSchema,
  type AssessmentSession,
  type Confidence,
  type Question,
  type QuestionResponse,
} from "./models";

export function accuracyOf(responses: readonly QuestionResponse[]) {
  const total = responses.length;
  const correct = responses.filter((response) => response.correct).length;
  return {
    total,
    correct,
    percent: total ? Math.round((correct / total) * 100) : null,
  };
}

export function classifyResponse(
  response: Pick<QuestionResponse, "correct" | "confidence">,
) {
  if (response.confidence === null)
    return response.correct ? "correct-unrated" : "incorrect-unrated";
  if (response.correct)
    return response.confidence === "confident"
      ? "confident-correct"
      : "uncertain-correct";
  return response.confidence === "confident"
    ? "confident-incorrect"
    : "uncertain-incorrect";
}

export function revisionPriority(
  response: Pick<QuestionResponse, "correct" | "confidence">,
) {
  if (!response.correct) return response.confidence === "confident" ? 3 : 2;
  return response.confidence !== null && response.confidence !== "confident"
    ? 1
    : 0;
}

// Marks against a reviewed key, never AI output. Submitted answers are immutable.
export function submitAnswer(
  sessionInput: AssessmentSession,
  questionInput: Question,
  optionId: string,
  confidence: Confidence | null,
  attemptType: QuestionResponse["attemptType"],
  now = new Date(),
): AssessmentSession {
  const session = sessionSchema.parse(sessionInput);
  const question = questionSchema.parse(questionInput);
  if (session.status !== "in-progress")
    throw new Error("This session has already ended.");
  if (session.questionIds[session.responses.length] !== question.id)
    throw new Error("Answer the current question first.");
  if (session.responses.some((response) => response.questionId === question.id))
    throw new Error("This answer has already been submitted.");
  if (!question.options.some((option) => option.id === optionId))
    throw new Error("Choose a valid answer option.");
  if (
    (session.kind === "diagnostic" || session.confidenceEnabled) &&
    !confidence
  )
    throw new Error("Select your confidence before submitting.");
  if (confidence !== null) confidenceSchema.parse(confidence);
  const response: QuestionResponse = {
    questionId: question.id,
    sessionId: session.id,
    topicId: question.topicId,
    conceptId: question.conceptId,
    selectedOptionId: optionId,
    correct: question.correctOptionId === optionId,
    confidence,
    submittedAt: now.toISOString(),
    attemptType,
  };
  const responses = [...session.responses, response];
  const completed = responses.length === session.questionIds.length;
  return sessionSchema.parse({
    ...session,
    responses,
    status: completed ? "completed" : "in-progress",
    completedAt: completed ? now.toISOString() : null,
  });
}
