"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { BookOpen, CheckCircle2, Flag } from "lucide-react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { useLearnerData } from "@/components/learner/use-learner-data";
import { KnowledgeCheck } from "@/components/learn/knowledge-check";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { concepts, questions, topics } from "@/lib/cloudready/content";
import { createLearningService } from "@/lib/cloudready/learning";
import { createDemoRepository } from "@/lib/cloudready/persistence";

export function ConceptLesson({ conceptId }: { conceptId: string }) {
  const { state, refresh, replaceData } = useLearnerData();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const busy = useRef(false);
  const concept = concepts.find((item) => item.id === conceptId);
  const name =
    state.status === "ready" ? state.data.profile.displayName : "Demo learner";
  function save(action: "review" | "revision") {
    if (busy.current || !concept) return;
    busy.current = true;
    setError("");
    setMessage("");
    try {
      const service = createLearningService(
        createDemoRepository(window.localStorage),
      );
      const data =
        action === "review"
          ? service.markReviewed(concept.id)
          : service.addToRevision(concept.id);
      replaceData(data);
      setMessage(
        action === "review"
          ? "Lesson marked reviewed. Your saved answer scores are unchanged; reviewed does not mean mastered."
          : `Revision is saved for ${data.revision.find((item) => item.conceptId === concept.id)?.nextReviewDate}. Any existing schedule is kept.`,
      );
    } catch {
      setError(
        "This change could not be saved. Check browser storage and try again. Your lesson remains open.",
      );
    } finally {
      busy.current = false;
    }
  }
  if (!concept)
    return (
      <LearnerShell displayName={name} isDemo>
        <EmptyState
          title="Lesson not found"
          description="Choose another concept from the learning library."
          action={
            <Link href="/learn" className={buttonVariants()}>
              Open library
            </Link>
          }
        />
      </LearnerShell>
    );
  if (state.status !== "ready")
    return (
      <LearnerShell displayName={name} isDemo>
        {state.status === "loading" ? (
          <LoadingState label="Opening your lesson…" />
        ) : (
          <ErrorState
            title="Your learning records could not be loaded"
            description="Browser storage may be unavailable or contain unreadable records. Existing data has not been reset."
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
  const reviewed = state.data.lessonReviews.find(
    (review) => review.conceptId === concept.id,
  );
  const revision = state.data.revision.find(
    (item) => item.conceptId === concept.id,
  );
  const checks = concept.knowledgeCheckIds
    .map((id) => questions.find((question) => question.id === id))
    .filter((question) => question !== undefined);
  return (
    <LearnerShell displayName={name} isDemo>
      <Link
        href="/learn"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Back to learning library
      </Link>
      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[1.8fr_1fr]">
        <article>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">
              {topics.find((topic) => topic.id === concept.topicId)?.title}
            </Badge>
            <Badge>About {concept.readingMinutes} minutes · estimate</Badge>
            {reviewed ? (
              <Badge tone="success">Reviewed</Badge>
            ) : (
              <Badge>Not reviewed</Badge>
            )}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            {concept.title}
          </h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            {concept.objective}
          </p>
          <Card className="mt-6">
            <h2 className="text-lg font-semibold">The idea</h2>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              {concept.explanation}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {concept.keyTerms.map((term) => (
                <Badge key={term}>{term}</Badge>
              ))}
            </div>
          </Card>
          <Card className="mt-5">
            <h2 className="text-lg font-semibold">Compare the concepts</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {concept.comparison.map((item) => (
                <div key={item.label} className="rounded-xl bg-muted/50 p-4">
                  <dt className="text-sm font-semibold">{item.label}</dt>
                  <dd className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="mt-5">
            <Badge tone="info">Fictional local scenario</Badge>
            <h2 className="mt-4 text-lg font-semibold">Put it in context</h2>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              {concept.localScenario}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Organisations and events in this example are fictional.
            </p>
          </Card>
          <Card className="mt-5">
            <h2 className="text-lg font-semibold">
              A misunderstanding to avoid
            </h2>
            {concept.misunderstandings.map((item) => (
              <p
                key={item}
                className="mt-3 text-sm leading-8 text-muted-foreground"
              >
                {item}
              </p>
            ))}
            <h3 className="mt-5 text-sm font-semibold">In simpler words</h3>
            <p className="mt-2 text-sm leading-8 text-muted-foreground">
              {concept.recap}
            </p>
            <a
              href={concept.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
            >
              Microsoft Learn reference
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="text-xs text-muted-foreground">
              Source checked {concept.source.reviewedAt}. Read the full source
              for detail beyond this introductory lesson.
            </p>
          </Card>
          <section aria-labelledby="recap-checks" className="mt-7">
            <h2 id="recap-checks" className="text-xl font-semibold">
              Check your understanding
            </h2>
            <div className="mt-4 space-y-4">
              {checks.map((question) => (
                <KnowledgeCheck key={question.id} question={question} />
              ))}
              {!checks.length ? (
                <p className="text-sm text-muted-foreground">
                  No recap question is available for this lesson yet.
                </p>
              ) : null}
            </div>
          </section>
        </article>
        <aside className="space-y-5">
          <Card>
            <BookOpen aria-hidden="true" size={23} className="text-primary" />
            <h2 className="mt-4 text-lg font-semibold">Your lesson status</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {reviewed
                ? "You marked this lesson reviewed. This records study activity, not mastery or an exam prediction."
                : "When you have read the explanation and reflected on it, mark this lesson reviewed. Opening the page does not change its status."}
            </p>
            <Button
              className="mt-5 w-full"
              disabled={Boolean(reviewed)}
              onClick={() => save("review")}
            >
              <CheckCircle2 aria-hidden="true" size={17} />
              {reviewed ? "Lesson reviewed" : "Mark lesson reviewed"}
            </Button>
            <Button
              variant="secondary"
              className="mt-3 w-full"
              disabled={Boolean(revision)}
              onClick={() => save("revision")}
            >
              <Flag aria-hidden="true" size={16} />
              {revision ? "In your revision list" : "Add to revision"}
            </Button>
            {revision ? (
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                Next review: {revision.nextReviewDate}. Your existing schedule
                is kept.
              </p>
            ) : null}
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              Changes save to this browser. Full revision recall and scheduling
              controls are coming later.
            </p>
            {message ? (
              <p role="status" className="mt-4 text-sm leading-7 text-success">
                {message}
              </p>
            ) : null}
            {error ? (
              <p
                role="alert"
                className="mt-4 text-sm leading-7 text-destructive"
              >
                {error}
              </p>
            ) : null}
          </Card>
          <Card>
            <h2 className="font-semibold">After the lesson</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Targeted practice selects questions without saved answers first.
              The recap check is not evidence of improvement on an unseen
              question.
            </p>
            <Link
              href={`/practice?topic=${concept.topicId}&concept=${concept.id}`}
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4 w-full",
              })}
            >
              Practise this concept
            </Link>
            <Link
              href="/dashboard"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
            >
              Return to dashboard
            </Link>
          </Card>
        </aside>
      </div>
    </LearnerShell>
  );
}
