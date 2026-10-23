"use client";
import Link from "next/link";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import {
  learningLibrary,
  type LearningStatus,
} from "@/lib/cloudready/learning";
import { concepts, topics } from "@/lib/cloudready/content";
import type { TopicId } from "@/lib/cloudready/models";

export function LearningLibrary() {
  const { state, refresh } = useLearnerData();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<TopicId | "all">("all");
  const [status, setStatus] = useState<LearningStatus>("all");
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  function clear() {
    setQuery("");
    setTopic("all");
    setStatus("all");
  }
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Opening your learning library…" />
        ) : (
          <ErrorState
            title="Your learning records could not be loaded"
            description="Browser storage may be blocked or unreadable. Your existing records have not been reset."
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
  const matches = learningLibrary(state.data, query, topic, status);
  const reviewedCount = concepts.filter((concept) =>
    state.data.lessonReviews.some((review) => review.conceptId === concept.id),
  ).length;
  return (
    <LearnerShell displayName={name} isDemo>
      <Badge tone="info">Learning library</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Make the concept click.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground">
        Explore {concepts.length} short lessons across the three topic groups.
        Compare ideas, work through fictional local examples, and revisit the
        reasoning behind your answers.
      </p>
      <p className="mt-3 text-sm font-medium">
        {reviewedCount} / {concepts.length} lessons marked reviewed
        <span className="ml-2 font-normal text-muted-foreground">
          · Reviewed does not mean mastered.
        </span>
      </p>
      <Card className="mt-6">
        <div className="grid items-end gap-4 md:grid-cols-[1.6fr_1fr_1fr_auto]">
          <Field id="lesson-search" label="Search concepts">
            <Input
              id="lesson-search"
              type="search"
              value={query}
              placeholder="Try regions, PaaS, or CostCenter"
              onChange={(event) => setQuery(event.target.value)}
            />
          </Field>
          <Field id="lesson-topic" label="Topic group">
            <Select
              id="lesson-topic"
              value={topic}
              onChange={(event) =>
                setTopic(event.target.value as TopicId | "all")
              }
            >
              <option value="all">All topics</option>
              {topics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="lesson-status" label="Learning status">
            <Select
              id="lesson-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as LearningStatus)
              }
            >
              <option value="all">All lessons</option>
              <option value="not-reviewed">Not reviewed</option>
              <option value="reviewed">Reviewed</option>
              <option value="needs-attention">Needs attention</option>
            </Select>
          </Field>
          <Button variant="ghost" onClick={clear}>
            Clear filters
          </Button>
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Needs attention includes concepts in your revision list or flagged by
          their latest recorded answer. It is independent of whether you have
          reviewed the lesson.
        </p>
      </Card>
      <p role="status" className="mt-5 text-sm text-muted-foreground">
        {matches.length} {matches.length === 1 ? "lesson" : "lessons"} match
        your filters.
      </p>
      {matches.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((concept) => (
            <Card key={concept.id} className="flex flex-col">
              <div className="flex flex-wrap gap-2">
                <Badge tone={concept.reviewed ? "success" : "neutral"}>
                  {concept.reviewed ? "Reviewed" : "Not reviewed"}
                </Badge>
                {concept.needsAttention ? (
                  <Badge tone="warning">Needs attention</Badge>
                ) : null}
              </div>
              <h2 className="mt-4 text-lg font-semibold">{concept.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">
                {concept.summary}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                {topics.find((item) => item.id === concept.topicId)?.title} ·
                About {concept.readingMinutes} min
              </p>
              <Link
                href={`/learn/${concept.slug}`}
                className={buttonVariants({
                  variant: "secondary",
                  className: "mt-4 w-full",
                })}
              >
                <BookOpen aria-hidden="true" size={16} />
                {concept.reviewed ? "Revisit lesson" : "Open lesson"}
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="No lessons match these filters"
            description="Try a shorter search, another topic, or a different learning status."
            action={<Button onClick={clear}>Clear filters</Button>}
          />
        </div>
      )}
      <p className="mt-7 text-xs leading-6 text-muted-foreground">
        These introductory lessons support the current diagnostic; they do not
        cover every AZ-900 objective. Source links and source-check dates appear
        in each lesson.
      </p>
    </LearnerShell>
  );
}
