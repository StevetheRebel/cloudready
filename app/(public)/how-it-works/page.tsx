import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  ListChecks,
  RotateCcw,
  Target,
  ChartNoAxesCombined,
  CalendarDays,
} from "lucide-react";
import { DemoEntry } from "@/components/auth/demo-entry";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How CloudReady works",
  description:
    "See how CloudReady connects an AZ-900 diagnostic, confidence ratings, concept lessons, focused practice, revision, and clear progress records.",
};
const steps = [
  {
    icon: CalendarDays,
    title: "Make a study plan",
    text: "Choose your background, study days, session length, and explanation style. Add an exam date if you have one.",
    href: "/onboarding",
    label: "Set preferences",
  },
  {
    icon: Target,
    title: "Find your starting point",
    text: "Answer 12 untimed diagnostic questions across three topic groups. Rate your confidence so a correct guess and a confident mistake tell different stories.",
    href: "/assessment/start",
    label: "Open diagnostic",
  },
  {
    icon: BookOpen,
    title: "Revisit the reasoning",
    text: "Open a concept lesson from your results. Compare related ideas, read explanations, and explore fictional local scenarios with Microsoft Learn references.",
    href: "/learn",
    label: "Browse lessons",
  },
  {
    icon: ListChecks,
    title: "Try focused practice",
    text: "Choose a topic, concept, mixed set, or weak areas. Unanswered questions come first; the setup shows when questions will repeat.",
    href: "/practice",
    label: "Set up practice",
  },
  {
    icon: RotateCcw,
    title: "Recall, reveal, review",
    text: "Explain a saved concept before revealing the recap. Rate recall as Again, Hard, Good, or Easy to schedule your next review.",
    href: "/revision",
    label: "Open revision",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Read progress in context",
    text: "Filter answer history by dates and attempt type. Look at topic accuracy, confidence, and response counts before deciding what to study next.",
    href: "/progress",
    label: "View progress",
  },
];
const confidenceExamples = [
  {
    title: "Confident and incorrect",
    text: "Start with the misconception. Read why your chosen answer does not fit before trying another question.",
  },
  {
    title: "Uncertain and correct",
    text: "A correct answer may still need reinforcement. Revisit the reasoning so you can explain why it fits.",
  },
  {
    title: "Uncertain and incorrect",
    text: "Review the concept, compare the options, then use focused practice to check your understanding.",
  },
  {
    title: "Confident and correct",
    text: "Keep building on the idea. One correct answer is useful evidence, but does not establish mastery.",
  },
];
export default function Page() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-12 sm:px-8 sm:pt-20">
        <Badge tone="info">Unofficial AZ-900 study companion</Badge>
        <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Turn answers into a clearer study plan.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
          CloudReady connects your answers, confidence, lessons, and practice so
          you can choose what deserves another look. Start with the local demo;
          no account is required.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <DemoEntry variant="primary">Open the demo</DemoEntry>
          <Link
            href="/#demo"
            className={buttonVariants({ variant: "secondary" })}
          >
            Try one sample
          </Link>
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          The home-page sample does not save progress. The learner demo saves
          submitted study activity in this browser.
        </p>
      </section>
      <section
        aria-labelledby="study-loop"
        className="mx-auto max-w-6xl px-5 py-10 sm:px-8"
      >
        <h2
          id="study-loop"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          One connected study loop
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Return to a lesson or resume a saved session whenever you need. These
          links open the working demo pages.
        </p>
        <ol className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.href}>
              <Card className="h-full">
                <div className="flex items-center justify-between gap-3">
                  <step.icon
                    aria-hidden="true"
                    size={22}
                    className="text-primary"
                  />
                  <span className="text-xs font-mono text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {step.text}
                </p>
                <Link
                  href={step.href}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
                >
                  {step.label}
                  <ArrowRight aria-hidden="true" size={15} />
                </Link>
              </Card>
            </li>
          ))}
        </ol>
      </section>
      <section
        aria-labelledby="confidence-explained"
        className="mt-6 border-y bg-card"
      >
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Badge tone="info">Illustrative responses · not your record</Badge>
          <h2
            id="confidence-explained"
            className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Correctness is only part of the picture.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Confidence is your own rating: Guessing, Somewhat confident, or
            Confident. The diagnostic requires it; practice can leave it off.
            Unrated answers stay separate from uncertain ones.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {confidenceExamples.map((example) => (
              <Card key={example.title}>
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {example.text}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section
        aria-labelledby="progress-context"
        className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16"
      >
        <div className="grid items-start gap-7 lg:grid-cols-2">
          <div>
            <h2
              id="progress-context"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Read the count behind the percentage.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              A score can change because the questions changed or became
              familiar. CloudReady separates diagnostics, first practice
              attempts, and retries. First practice may include a question
              already seen in the diagnostic.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              No answers displays a dash, not 0%. Small samples can move sharply
              after one answer. Lesson review and flashcard recall do not enter
              marked-question accuracy.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              These records help choose what to revisit. They do not predict
              your official exam result or certify mastery.
            </p>
          </div>
          <Card>
            <Badge>Illustration only</Badge>
            <h3 className="mt-4 font-semibold">
              Two scores, different evidence
            </h3>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">
                  First practice
                </dt>
                <dd className="mt-2 text-3xl font-semibold">60%</dd>
                <dd className="mt-2 text-xs text-muted-foreground">
                  6 correct / 10 responses
                </dd>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">Retries</dt>
                <dd className="mt-2 text-3xl font-semibold">80%</dd>
                <dd className="mt-2 text-xs text-muted-foreground">
                  4 correct / 5 responses
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              The higher retry score may reflect remembered answers. These
              groups alone cannot show a 20-point improvement on unseen
              questions.
            </p>
          </Card>
        </div>
      </section>
      <section
        aria-labelledby="demo-scope"
        className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-20"
      >
        <Card>
          <h2 id="demo-scope" className="text-2xl font-semibold tracking-tight">
            What this demo includes
          </h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Available now</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                A 30-question bank, including the 12-question diagnostic, twelve
                introductory lessons, focused practice, recall scheduling,
                progress analytics, and JSON export. Fictional organisations are
                used in local scenarios; this content does not cover every exam
                objective.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Know before you start</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Learner records stay in this browser; there is no cross-device
                sync. Account and recovery forms are previews. Live accounts,
                email, and generated explanations are not connected; the help
                panel uses prepared explanations.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Use{" "}
            <Link
              href="/settings"
              className="text-primary underline underline-offset-4"
            >
              Settings
            </Link>{" "}
            to export saved records or confirm a reset. Clearing site data can
            remove progress. Read the{" "}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-4"
            >
              privacy information
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="text-primary underline underline-offset-4"
            >
              demo terms
            </Link>{" "}
            for the current scope.
          </p>
          <div className="mt-6">
            <DemoEntry variant="primary" className="inline-block">
              Start a demo session
            </DemoEntry>
          </div>
        </Card>
      </section>
    </>
  );
}
