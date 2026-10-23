"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/cloudready/models";

const options = [
  {
    id: "institute",
    text: "The institute’s IT team",
    explanation:
      "With IaaS, the customer manages and patches the guest operating system.",
  },
  {
    id: "provider",
    text: "The cloud provider",
    explanation:
      "The provider maintains the physical infrastructure. The guest operating system stays with the IaaS customer.",
  },
  {
    id: "automatic",
    text: "No one; cloud hosting removes this task",
    explanation:
      "Moving to a virtual machine does not remove operating-system maintenance. It still needs an owner.",
  },
  {
    id: "students",
    text: "The applicants using the website",
    explanation:
      "Using an application does not make its visitors responsible for maintaining the server.",
  },
];
const confidenceOptions: { id: Confidence; label: string }[] = [
  { id: "guessing", label: "Guessing" },
  { id: "somewhat", label: "Somewhat sure" },
  { id: "confident", label: "Confident" },
];

export function SampleQuestion() {
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const firstOptionRef = useRef<HTMLInputElement>(null);
  const hasSubmitted = useRef(false);
  useEffect(() => {
    if (submitted) {
      hasSubmitted.current = true;
      feedbackRef.current?.focus();
    } else if (hasSubmitted.current) {
      firstOptionRef.current?.focus();
    }
  }, [submitted]);
  const correct = answer === "institute";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (answer && confidence && !submitted) setSubmitted(true);
  }
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="info">Cloud concepts</Badge>
        <span className="text-xs text-muted-foreground">
          Original sample · Not saved to progress
        </span>
      </div>
      <form onSubmit={submit} className="mt-6">
        <fieldset disabled={submitted}>
          <legend className="text-lg leading-8 font-semibold">
            A fictional training institute hosts its admissions website on an
            Azure virtual machine. Who is responsible for patching the guest
            operating system?
          </legend>
          <div className="mt-5 grid gap-2">
            {options.map((option, index) => (
              <label
                key={option.id}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                  !submitted && "cursor-pointer hover:border-primary/50",
                  answer === option.id ? "border-primary bg-accent" : "bg-card",
                )}
              >
                <input
                  type="radio"
                  ref={index === 0 ? firstOptionRef : undefined}
                  name="sample-answer"
                  value={option.id}
                  checked={answer === option.id}
                  onChange={() => setAnswer(option.id)}
                  className="size-4 shrink-0 accent-primary"
                />
                <span
                  className="text-xs font-mono text-muted-foreground"
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + index)}
                </span>
                {option.text}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={submitted} className="mt-6">
          <legend className="text-sm font-semibold">
            How sure do you feel?
          </legend>
          <p
            id="confidence-hint"
            className="mt-1 text-xs leading-5 text-muted-foreground"
          >
            There’s no penalty for uncertainty. It helps you choose what to
            revisit.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {confidenceOptions.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-xl border px-2 py-2 text-center text-xs font-medium sm:text-sm",
                  !submitted && "cursor-pointer hover:border-primary/50",
                  confidence === option.id
                    ? "border-primary bg-accent text-primary"
                    : "text-muted-foreground",
                )}
              >
                <input
                  type="radio"
                  name="sample-confidence"
                  value={option.id}
                  checked={confidence === option.id}
                  aria-describedby="confidence-hint"
                  onChange={() => setConfidence(option.id)}
                  className="size-3.5 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        {!submitted ? (
          <div className="mt-5">
            <Button
              type="submit"
              disabled={!answer || !confidence}
              className="w-full sm:w-auto"
            >
              See my feedback
              <ArrowRight aria-hidden="true" size={16} />
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Choose an answer and confidence level to continue.
            </p>
          </div>
        ) : null}
      </form>
      {submitted ? (
        <div className="mt-6 border-t pt-6">
          <div role="status" className="space-y-3">
            <Badge tone={correct ? "success" : "warning"}>
              {correct
                ? "Correct answer"
                : "Incorrect answer · A concept to revisit"}
            </Badge>
            <h3 ref={feedbackRef} tabIndex={-1} className="text-lg font-semibold">
              {!correct && confidence === "confident"
                ? "A confident answer can reveal a misunderstanding."
                : correct && confidence !== "confident"
                  ? "Correct, but still worth another look."
                  : correct
                    ? "You connected the responsibility to the service model."
                    : "Start with the responsibility split."}
            </h3>
            <p className="text-sm leading-7 text-muted-foreground">
              {!correct && confidence === "confident"
                ? "In CloudReady, a confident wrong answer receives the highest revision priority. "
                : correct && confidence !== "confident"
                  ? "A correct answer with uncertainty still deserves revision. "
                  : ""}
              The institute manages the guest operating system on its virtual
              machine. The provider manages the underlying physical
              infrastructure.
            </p>
            <p className="text-xs text-muted-foreground">
              Your answer:{" "}
              {options.find((option) => option.id === answer)?.text}. Correct
              answer: The institute’s IT team.
            </p>
          </div>
          <details className="mt-4 rounded-xl bg-muted/50 p-4">
            <summary className="text-sm font-medium">
              Why each option fits or doesn’t
            </summary>
            <ul className="mt-4 space-y-3">
              {options.map((option) => (
                <li key={option.id} className="text-sm leading-6">
                  <span className="font-medium">{option.text}: </span>
                  <span className="text-muted-foreground">
                    {option.explanation}
                  </span>
                </li>
              ))}
            </ul>
          </details>
          <a
            href="https://learn.microsoft.com/training/modules/describe-cloud-service-types/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
          >
            Read about cloud service types on Microsoft Learn ↗
          </a>
          <div className="mt-3">
            <Button
              variant="secondary"
              onClick={() => {
                setAnswer("");
                setConfidence(null);
                setSubmitted(false);
              }}
            >
              <RotateCcw aria-hidden="true" size={15} />
              Try the sample again
            </Button>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            This sample does not update the illustrative scores above or create
            a diagnostic session.
          </p>
        </div>
      ) : null}
    </div>
  );
}
