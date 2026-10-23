"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { ChoiceGroup } from "@/components/onboarding/choice-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExplanationPanel } from "@/components/assessment/explanation-panel";
import { topics } from "@/lib/cloudready/content";
import type {
  Confidence,
  Profile,
  Question,
  QuestionResponse,
} from "@/lib/cloudready/models";
import { cn } from "@/lib/utils";

export function QuestionPanel({
  question,
  response,
  onSubmit,
  onNext,
  last,
  confidenceEnabled,
  revealExplanation,
  preference,
  sessionLabel,
}: {
  question: Question;
  response?: QuestionResponse;
  onSubmit: (option: string, confidence: Confidence | null) => void;
  onNext: () => void;
  last: boolean;
  confidenceEnabled: boolean;
  revealExplanation: boolean;
  preference: Profile["preferences"]["explanationStyle"];
  sessionLabel: string;
}) {
  const [selected, setSelected] = useState("");
  const [confidence, setConfidence] = useState<Confidence | "">("");
  const [error, setError] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLHeadingElement>(null);
  const hasResponse = Boolean(response);
  useEffect(() => {
    title.current?.focus();
  }, []);
  useEffect(() => {
    if (hasResponse) feedback.current?.focus();
  }, [hasResponse]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || (confidenceEnabled && !confidence)) {
      setError(
        confidenceEnabled
          ? "Choose an answer and your confidence before submitting."
          : "Choose an answer before submitting.",
      );
      document.getElementById(!selected ? "answer-a" : "confidence")?.focus();
      return;
    }
    setError("");
    onSubmit(selected, confidenceEnabled ? (confidence as Confidence) : null);
  }
  return (
    <>
      <Card>
        <Badge tone="info">
          {topics.find((topic) => topic.id === question.topicId)?.title}
        </Badge>
        <h1
          ref={title}
          tabIndex={-1}
          className="mt-5 text-2xl leading-9 font-semibold tracking-tight"
        >
          {question.text}
        </h1>
        <form onSubmit={submit} className="mt-6">
          <fieldset
            disabled={Boolean(response)}
            aria-describedby={error ? "answer-error" : undefined}
          >
            <legend className="mb-3 text-sm font-semibold">
              Choose one answer
            </legend>
            <div className="space-y-3">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-7",
                    (response?.selectedOptionId ?? selected) === option.id
                      ? "border-primary bg-accent"
                      : "bg-card",
                    response && "cursor-default",
                  )}
                >
                  <input
                    id={`answer-${option.id}`}
                    type="radio"
                    name="answer"
                    value={option.id}
                    checked={
                      (response?.selectedOptionId ?? selected) === option.id
                    }
                    onChange={() => setSelected(option.id)}
                    className="mt-1.5 size-4 shrink-0 accent-primary"
                  />
                  <span>
                    <span className="mr-2 font-semibold uppercase">
                      {option.id}.
                    </span>
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {!response ? (
            <div className="mt-7">
              {confidenceEnabled ? (
                <ChoiceGroup<Confidence | "">
                  id="confidence"
                  legend="How sure are you?"
                  value={confidence}
                  onChange={setConfidence}
                  options={[
                    {
                      value: "guessing",
                      label: "Guessing",
                      hint: "I’m not sure why this fits.",
                    },
                    {
                      value: "somewhat",
                      label: "Somewhat sure",
                      hint: "I have a reason, with doubts.",
                    },
                    {
                      value: "confident",
                      label: "Confident",
                      hint: "I can explain my choice.",
                    },
                  ]}
                />
              ) : null}
              {error ? (
                <p
                  id="answer-error"
                  role="alert"
                  className="mt-3 text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="mt-6">
                Submit answer
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                Submission saves and locks your answer
                {confidenceEnabled ? " and confidence" : ""}. Your unsubmitted
                selections are not saved.
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              {response.confidence === null
                ? "Confidence was not requested"
                : "Your confidence: "}
              {response.confidence === null
                ? ""
                : response.confidence === "confident"
                  ? "Confident"
                  : response.confidence === "somewhat"
                    ? "Somewhat sure"
                    : "Guessing"}
              . This submitted answer is locked.
            </p>
          )}
        </form>
      </Card>
      {response ? (
        <Card className="mt-5">
          {revealExplanation ? (
            <>
              <Badge tone={response.correct ? "success" : "warning"}>
                {response.correct ? "Correct" : "Let’s revisit this"}
              </Badge>
              <h2
                ref={feedback}
                tabIndex={-1}
                className="mt-4 text-lg font-semibold"
              >
                Why this answer fits
              </h2>
              <ExplanationPanel question={question} preference={preference} />
              <ul className="mt-5 divide-y">
                {question.options.map((option) => (
                  <li key={option.id} className="py-3">
                    <p className="text-sm font-medium">
                      {option.id === question.correctOptionId
                        ? "Correct answer: "
                        : "Alternative: "}
                      {option.text}
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
                className="mt-3 inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
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
            <>
              <h2
                ref={feedback}
                tabIndex={-1}
                className="text-lg font-semibold"
              >
                Answer saved
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Explanations for this session appear after you finish. Your
                answer is saved and locked.
              </p>
            </>
          )}
          <Button className="mt-6" onClick={onNext}>
            {last ? `Finish ${sessionLabel}` : "Next question"}
            <ArrowRight aria-hidden="true" size={16} />
          </Button>
        </Card>
      ) : null}
    </>
  );
}
