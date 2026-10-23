import { Badge } from "@/components/ui/badge";
import { ExplanationPanel } from "@/components/assessment/explanation-panel";
import {
  confidenceLabel,
  type diagnosticResults,
} from "@/lib/cloudready/results";
import type { Profile } from "@/lib/cloudready/models";

type Answer = ReturnType<typeof diagnosticResults>["answers"][number];
export function AnswerReview({
  answer,
  preference,
}: {
  answer: Answer;
  preference: Profile["preferences"]["explanationStyle"];
}) {
  const { response, question, selectedOption, contentChanged } = answer;
  const canExplain = question && !contentChanged;
  return (
    <details
      id={answer.reviewId}
      className="group scroll-mt-6 rounded-2xl border bg-card"
    >
      <summary className="cursor-pointer rounded-2xl px-5 py-4 marker:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
        <span className="ml-1 text-sm font-semibold">
          {answer.index + 1}.{" "}
          {contentChanged
            ? `Question ${response.questionId} — content changed`
            : (question?.text ??
              `Question ${response.questionId} — content unavailable`)}
        </span>
        <span className="mt-3 flex flex-wrap gap-2">
          <Badge tone={response.correct ? "success" : "warning"}>
            {response.correct ? "Correct" : "Incorrect"}
          </Badge>
          <Badge>Confidence: {confidenceLabel(response.confidence)}</Badge>
          <span className="self-center text-xs text-muted-foreground">
            Expand answer review
          </span>
        </span>
      </summary>
      <div className="border-t px-5 py-5">
        <p className="text-sm leading-7">
          <span className="font-semibold">Your saved answer: </span>
          {canExplain && selectedOption
            ? `${selectedOption.id.toUpperCase()}. ${selectedOption.text}`
            : `Option ${response.selectedOptionId.toUpperCase()} (saved identifier)`}
        </p>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          Submitted{" "}
          <time dateTime={response.submittedAt}>
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
            }).format(new Date(response.submittedAt))}{" "}
            UTC
          </time>{" "}
          · Answer and confidence are locked.
        </p>
        {canExplain ? (
          <>
            <p className="mt-4 text-sm leading-7">
              <span className="font-semibold">Correct answer: </span>
              {
                question.options.find(
                  (option) => option.id === question.correctOptionId,
                )?.text
              }
            </p>
            <ExplanationPanel question={question} preference={preference} />
            <h3 className="mt-5 text-sm font-semibold">
              Why each option fits or does not fit
            </h3>
            <ul className="mt-2 divide-y">
              {question.options.map((option) => (
                <li key={option.id} className="py-3">
                  <p className="text-sm font-medium">
                    {option.id.toUpperCase()}. {option.text}
                    {option.id === question.correctOptionId
                      ? " · Correct answer"
                      : ""}
                    {option.id === response.selectedOptionId
                      ? " · Your answer"
                      : ""}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    {option.explanation}
                  </p>
                </li>
              ))}
            </ul>
            <a
              href={question.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
            >
              Microsoft Learn: {question.source.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="text-xs text-muted-foreground">
              Source checked {question.source.reviewedAt}. Original CloudReady
              question.
            </p>
          </>
        ) : (
          <p className="mt-4 rounded-xl bg-warning-soft p-4 text-sm leading-7 text-warning">
            {contentChanged
              ? "The current question or answer key differs from your saved response. Your recorded result is kept; current explanations are hidden to avoid mixing versions."
              : "This question’s current content is unavailable. Your recorded answer, confidence, and result are kept."}
          </p>
        )}
      </div>
    </details>
  );
}
