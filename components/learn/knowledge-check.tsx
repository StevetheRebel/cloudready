"use client";
import { useId, useRef, useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/lib/cloudready/models";
import { cn } from "@/lib/utils";

export function KnowledgeCheck({ question }: { question: Question }) {
  const id = useId();
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const feedback = useRef<HTMLDivElement>(null);
  const resetRequested = useRef(false);
  useEffect(() => {
    if (submitted) feedback.current?.focus();
    else if (resetRequested.current) {
      document.getElementById(`${id}-a`)?.focus();
      resetRequested.current = false;
    }
  }, [submitted, id]);
  function check(event: FormEvent) {
    event.preventDefault();
    if (!selected) {
      setError("Choose one answer before checking.");
      document.getElementById(`${id}-a`)?.focus();
      return;
    }
    setError("");
    setSubmitted(true);
  }
  return (
    <div className="rounded-xl border p-4 sm:p-5">
      <Badge>Recap check · Not fresh practice</Badge>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">
        This reuses a diagnostic question. Your choice stays on this page and
        does not change saved scores or lesson status.
      </p>
      <form onSubmit={check} className="mt-4">
        <fieldset
          disabled={submitted}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <legend className="mb-3 text-sm font-semibold leading-7">
            {question.text}
          </legend>
          <div className="space-y-2">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-sm leading-7",
                  selected === option.id && "border-primary bg-accent",
                  !submitted && "cursor-pointer",
                )}
              >
                <input
                  id={`${id}-${option.id}`}
                  type="radio"
                  name={id}
                  value={option.id}
                  checked={selected === option.id}
                  onChange={() => setSelected(option.id)}
                  className="mt-1.5 size-4 shrink-0 accent-primary"
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
        {!submitted ? (
          <Button type="submit" className="mt-4">
            Check my understanding
          </Button>
        ) : null}
      </form>
      {submitted ? (
        <div ref={feedback} tabIndex={-1} className="mt-5 border-t pt-4">
          <Badge
            tone={selected === question.correctOptionId ? "success" : "warning"}
          >
            {selected === question.correctOptionId
              ? "Correct"
              : "Revisit the reasoning"}
          </Badge>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {question.explanation}
          </p>
          <ul className="mt-3 space-y-3">
            {question.options.map((option) => (
              <li key={option.id}>
                <p className="text-sm font-medium">
                  {option.text}
                  {option.id === question.correctOptionId
                    ? " · Correct answer"
                    : ""}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {option.explanation}
                </p>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              resetRequested.current = true;
              setSubmitted(false);
              setSelected("");
            }}
          >
            Try the recap again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
