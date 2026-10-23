"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { concepts, topics } from "@/lib/cloudready/content";
import {
  createPracticeService,
  practicePool,
  unfinishedPractice,
  type PracticeOptions,
} from "@/lib/cloudready/practice";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import type { TopicId } from "@/lib/cloudready/models";

export function PracticeSetup() {
  const params = useSearchParams();
  const initialConcept = concepts.find(
    (concept) => concept.id === params.get("concept"),
  );
  const initialTopic =
    topics.find((topic) => topic.id === params.get("topic"))?.id ??
    initialConcept?.topicId ??
    null;
  const { state, refresh } = useLearnerData();
  const [mode, setMode] = useState<PracticeOptions["mode"]>(
    initialTopic
      ? "topic"
      : params.get("mode") === "weak-areas"
        ? "weak-areas"
        : "mixed",
  );
  const [topic, setTopic] = useState<TopicId>(initialTopic ?? "cloud-concepts");
  const [concept, setConcept] = useState(
    initialConcept?.topicId === initialTopic ? initialConcept.id : "",
  );
  const [count, setCount] = useState(6);
  const [confidence, setConfidence] = useState(true);
  const [timing, setTiming] =
    useState<PracticeOptions["explanationTiming"]>("after-answer");
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const router = useRouter();
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  const scope = {
    mode,
    topicId: mode === "topic" ? topic : null,
    conceptId: mode === "topic" ? concept || null : null,
  };
  const pool =
    state.status === "ready" ? practicePool(state.data, scope) : null;
  const effectiveCount = Math.min(count, pool?.total ?? count);
  const options: PracticeOptions = {
    ...scope,
    count: effectiveCount,
    confidenceEnabled: confidence,
    explanationTiming: timing,
  };
  async function start(replace?: string) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const session = createPracticeService(
        createDemoRepository(window.localStorage),
      ).start(options, replace);
      router.push(`/practice/${encodeURIComponent(session.id)}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Practice could not be saved. Check browser storage and retry.",
      );
      refresh();
      if (replace) throw error;
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Loading practice setup…" />
        ) : (
          <ErrorState
            title="Practice could not be loaded"
            description="Your saved records have not been reset. Check browser storage and try again."
            action={
              <div className="flex flex-wrap gap-3">
                <Button onClick={refresh}>Try again</Button>
                <Link
                  href="/foundation"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Manage demo data
                </Link>
              </div>
            }
          />
        )}
      </LearnerShell>
    );
  const unfinished = unfinishedPractice(state.data);
  const needsSetup =
    !state.data.profile.onboardingComplete ||
    state.hasDraft ||
    state.draftError;
  return (
    <LearnerShell displayName={name} isDemo>
      <Badge tone="info">Targeted practice</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Put the reasoning into practice.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground">
        Choose a focus and work at your pace. Questions without saved answers
        are selected first. The bank is finite, so repeats are clearly counted.
      </p>
      {unfinished ? (
        <Card className="mt-6">
          <Badge tone="warning">Saved practice session</Badge>
          <h2 className="mt-3 font-semibold">
            Continue without replacing your answers.
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {unfinished.responses.length} / {unfinished.questionIds.length}{" "}
            answers saved. The settings below only apply if you confirm a new
            session.
          </p>
          <Link
            href={`/practice/${encodeURIComponent(unfinished.id)}`}
            className={buttonVariants({ className: "mt-4" })}
          >
            Resume saved practice
          </Link>
        </Card>
      ) : null}
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Build your session</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field id="practice-mode" label="Practice mode">
              <Select
                id="practice-mode"
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as PracticeOptions["mode"])
                }
              >
                <option value="mixed">Mixed topics</option>
                <option value="topic">Topic or concept</option>
                <option value="weak-areas">Recorded weak areas</option>
              </Select>
            </Field>
            {mode === "topic" ? (
              <>
                <Field id="practice-topic" label="Topic group">
                  <Select
                    id="practice-topic"
                    value={topic}
                    onChange={(event) => {
                      setTopic(event.target.value as TopicId);
                      setConcept("");
                    }}
                  >
                    {topics.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="practice-concept" label="Concept (optional)">
                  <Select
                    id="practice-concept"
                    value={concept}
                    onChange={(event) => setConcept(event.target.value)}
                  >
                    <option value="">All concepts in this topic</option>
                    {concepts
                      .filter((item) => item.topicId === topic)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                  </Select>
                </Field>
              </>
            ) : null}
            <Field id="practice-count" label="Questions">
              <Select
                id="practice-count"
                disabled={!pool?.total}
                value={effectiveCount || 0}
                onChange={(event) => setCount(Number(event.target.value))}
              >
                {!pool?.total ? (
                  <option value="0">No eligible questions</option>
                ) : (
                  Array.from(
                    { length: Math.min(30, pool.total) },
                    (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ),
                  )
                )}
              </Select>
            </Field>
            <Field id="practice-timing" label="Show explanations">
              <Select
                id="practice-timing"
                value={timing}
                onChange={(event) =>
                  setTiming(
                    event.target.value as PracticeOptions["explanationTiming"],
                  )
                }
              >
                <option value="after-answer">After each answer</option>
                <option value="after-session">After the session</option>
              </Select>
            </Field>
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={confidence}
                onChange={(event) => setConfidence(event.target.checked)}
                className="size-4 accent-primary"
              />
              Rate confidence for each answer
            </label>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Confidence off stores unrated responses. After-session feedback
            hides correctness and explanations until the session is complete.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Your available questions</h2>
          <p role="status" className="mt-4 text-sm leading-8">
            <strong>{pool?.total ?? 0}</strong> eligible ·{" "}
            <strong>{pool?.fresh.length ?? 0}</strong> without saved answers ·{" "}
            <strong>{pool?.repeated.length ?? 0}</strong> previously answered
          </p>
          {!pool?.total ? (
            <p className="mt-3 text-sm leading-7 text-warning">
              {mode === "weak-areas"
                ? "No questions match recorded weak areas yet. Complete a diagnostic, add a concept to revision, or choose another mode."
                : "No questions match this focus. Choose another topic or concept."}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              This session will contain{" "}
              {Math.min(effectiveCount, pool.fresh.length)} questions without
              saved answers and{" "}
              {Math.max(0, effectiveCount - pool.fresh.length)} previously
              answered questions.
            </p>
          )}
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            “Without saved answers” checks diagnostic and practice history in
            this browser. It cannot establish whether you have read a question
            elsewhere or in an unsaved recap. First-practice and retry labels
            track practice history separately.
          </p>
          {needsSetup ? (
            <div className="mt-5">
              <p className="text-sm leading-7 text-muted-foreground">
                Finish or repair your study setup before starting a new practice
                session.
              </p>
              <Link
                href={state.draftError ? "/foundation" : "/onboarding"}
                className={buttonVariants({ className: "mt-4" })}
              >
                {state.draftError ? "Manage demo data" : "Open study setup"}
              </Link>
            </div>
          ) : (
            <Button
              className="mt-5 w-full"
              disabled={pending || !pool?.total}
              onClick={() =>
                unfinished ? setReplaceId(unfinished.id) : void start()
              }
            >
              {pending
                ? "Saving practice…"
                : unfinished
                  ? "Replace saved practice"
                  : "Start practice"}
              <ArrowRight aria-hidden="true" size={16} />
            </Button>
          )}
          {error ? (
            <p role="alert" className="mt-4 text-sm leading-7 text-destructive">
              {error}
            </p>
          ) : null}
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Starting practice does not replace an unfinished diagnostic.
            Submitted answers save locally; unsubmitted choices do not.
          </p>
        </Card>
      </div>
      <ConfirmDialog
        open={replaceId !== null}
        onOpenChange={(open) => {
          if (!open) setReplaceId(null);
        }}
        title="Replace saved practice?"
        description="The old practice session will be closed and cannot be resumed. Submitted answers stay in learning history. A new session uses your current settings and the available question pool."
        destructive
        confirmLabel="Close old session and start new"
        onConfirm={() => start(replaceId ?? undefined)}
      />
    </LearnerShell>
  );
}
