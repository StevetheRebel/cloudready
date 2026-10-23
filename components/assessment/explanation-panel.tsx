"use client";
import { useState, useSyncExternalStore } from "react";
import type { Profile, Question } from "@/lib/cloudready/models";
import {
  explanationContent,
  preferredExplanation,
  type ExplanationFormat,
} from "@/lib/cloudready/explanations";
import { Button } from "@/components/ui/button";

function subscribeNetwork(changed: () => void) {
  window.addEventListener("online", changed);
  window.addEventListener("offline", changed);
  return () => {
    window.removeEventListener("online", changed);
    window.removeEventListener("offline", changed);
  };
}
const readNetwork = () => navigator.onLine;
const serverNetwork = () => true;
const formats: { id: ExplanationFormat; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "simpler", label: "Simpler" },
  { id: "local", label: "Local example" },
  { id: "ai", label: "AI help" },
];

export function ExplanationPanel({
  question,
  preference,
}: {
  question: Question;
  preference: Profile["preferences"]["explanationStyle"];
}) {
  const [format, setFormat] = useState<ExplanationFormat>(() =>
    preferredExplanation(preference),
  );
  const online = useSyncExternalStore(
    subscribeNetwork,
    readNetwork,
    serverNetwork,
  );
  const content = explanationContent(question, format, online);
  return (
    <div className="mt-4">
      <div
        role="group"
        aria-label="Explanation format"
        className="flex flex-wrap gap-2"
      >
        {formats.map((item) => (
          <Button
            key={item.id}
            variant={format === item.id ? "primary" : "secondary"}
            aria-pressed={format === item.id}
            onClick={() => setFormat(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="mt-4 rounded-xl bg-muted/50 p-4"
      >
        {content.notice ? (
          <p className="mb-3 text-sm leading-7 text-muted-foreground">
            {content.notice}
          </p>
        ) : null}
        <h3 className="text-sm font-semibold">
          {format === "ai"
            ? "Source-checked fallback"
            : formats.find((item) => item.id === format)?.label}
        </h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {content.text}
        </p>
        {content.fictional ? (
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            This organisation and scenario are fictional teaching examples.
          </p>
        ) : null}
      </div>
    </div>
  );
}
