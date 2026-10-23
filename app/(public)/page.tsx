import type { Metadata } from "next";
import { DemoEntry } from "@/components/auth/demo-entry";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Compass,
  Gauge,
  MapPin,
  MessageSquareText,
  Route,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EntryAction } from "@/components/site/entry-action";
import { ProductPreview } from "@/components/site/product-preview";
import { SampleQuestion } from "@/components/site/sample-question";

export const metadata: Metadata = {
  title: { absolute: "CloudReady | Your unofficial AZ-900 study companion" },
  description:
    "Find the cloud concepts you need to revisit, study clear explanations, and practise weak topics with CloudReady, an unofficial AZ-900 study coach.",
};

const steps = [
  {
    title: "Answer. Then rate your confidence.",
    text: "Start with 12 original questions across three topic groups. Tell us how sure you feel about each answer.",
    icon: Gauge,
  },
  {
    title: "Find what needs another look.",
    text: "See the concepts behind your mistakes, with confident wrong answers at the top of your revision list.",
    icon: Target,
  },
  {
    title: "Make the concept click.",
    text: "Study clear explanations, compare related ideas, and work through fictional local scenarios.",
    icon: BookOpen,
  },
  {
    title: "Practise fresh. See what changes.",
    text: "Try new questions on the same concepts and compare your first attempts with later practice.",
    icon: TrendingUp,
  },
];
const features = [
  {
    title: "Every option, explained",
    text: "Understand why an answer fits and why the alternatives don’t.",
    icon: MessageSquareText,
  },
  {
    title: "Revision with a reason",
    text: "Focus on learning gaps revealed by your answers and confidence.",
    icon: Target,
  },
  {
    title: "Examples closer to home",
    text: "Explore cloud decisions through fictional African businesses and organisations.",
    icon: MapPin,
  },
  {
    title: "Progress you can interpret",
    text: "Track topic accuracy with question counts and first-attempt versus retry comparisons.",
    icon: TrendingUp,
  },
];

export default function Page() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-24">
        <div>
          <Badge tone="info">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            Your AZ-900 study companion
          </Badge>
          <h1 className="mt-6 max-w-2xl text-[2.6rem] leading-[1.12] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-[3.65rem]">
            Understand your weak areas.
            <br />
            <span className="text-primary">Study with direction.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
            Find the cloud concepts you need to revisit, get clear explanations,
            and practise with a plan built around your progress.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EntryAction kind="diagnostic" className="min-h-12 px-5">
              Start my diagnostic
              <ArrowRight aria-hidden="true" size={17} />
            </EntryAction>
            <DemoEntry>Explore the demo</DemoEntry>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            12 questions. Confidence tracking. A focused starting point.
          </p>
          <p className="mt-6 max-w-md border-l-2 border-primary/25 pl-3 text-xs leading-6 text-muted-foreground">
            Try the diagnostic with locally saved demo progress. Account forms
            are a preview; real account access is coming soon.
          </p>
        </div>
        <ProductPreview />
      </section>

      <div className="border-y bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-6 sm:px-8">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            A clearer study loop
          </p>
          {[
            "Find the gap",
            "Understand the concept",
            "Try a fresh question",
          ].map((text) => (
            <span
              key={text}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Check className="text-success" aria-hidden="true" size={16} />
              {text}
            </span>
          ))}
        </div>
      </div>

      <section
        className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"
        aria-labelledby="problem-title"
      >
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Beyond the quiz score
          </p>
          <h2
            id="problem-title"
            className="mt-4 max-w-lg text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
          >
            You know the answer.
            <br />
            But do you understand why?
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            A score can tell you what went wrong. Your next study session needs
            to tell you what to do about it.
          </p>
        </div>
        <div className="divide-y">
          {[
            {
              title: "Remembering the answer, missing the idea",
              text: "A familiar question feels easy. Change the wording, and the underlying concept can still be unclear.",
              icon: Brain,
            },
            {
              title: "A study list without a starting point",
              text: "When everything feels important, choosing what to revise can use up the time you set aside to learn.",
              icon: Compass,
            },
            {
              title: "Another quiz, the same unanswered questions",
              text: "A total score alone doesn’t show which misunderstandings need attention or what has improved.",
              icon: Route,
            },
          ].map(({ title, text, icon: Icon }, index) => (
            <div key={title} className="flex gap-5 py-6 first:pt-0 last:pb-0">
              <span className="mt-1 text-xs font-mono text-muted-foreground">
                0{index + 1}
              </span>
              <div>
                <h3 className="flex items-center gap-3 text-base font-semibold">
                  <Icon
                    size={19}
                    aria-hidden="true"
                    className="shrink-0 text-primary"
                  />
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y bg-card"
        aria-labelledby="steps-title"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                How CloudReady works
              </p>
              <h2
                id="steps-title"
                className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Less guessing what to study next.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              A learning loop that connects each answer to a useful next step.
            </p>
          </div>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ title, text, icon: Icon }, index) => (
              <li key={title} className="border-t-2 border-primary/20 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-primary">
                    STEP 0{index + 1}
                  </span>
                  <Icon size={20} aria-hidden="true" className="text-primary" />
                </div>
                <h3 className="mt-5 text-lg leading-7 font-semibold">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
        aria-labelledby="features-title"
      >
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Built around understanding
        </p>
        <h2
          id="features-title"
          className="mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
        >
          An answer is only the beginning.
        </h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col rounded-2xl bg-accent p-7 sm:p-8">
            <Gauge size={28} className="text-primary" aria-hidden="true" />
            <h3 className="mt-6 text-2xl leading-8 font-semibold tracking-tight">
              Confidence tells
              <br />
              the other half of the story.
            </h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              A confident wrong answer may reveal a misunderstanding. A correct
              answer with low confidence still deserves another look.
            </p>
            <div className="mt-7 border-t border-primary/15 pt-5">
              <p className="text-xs font-semibold text-primary">
                CONFIDENCE-AWARE ASSESSMENTS
              </p>
              <p className="mt-2 text-sm leading-7">
                Your answer and how sure you felt help decide what comes next.
              </p>
            </div>
          </div>
          <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {features.map(({ title, text, icon: Icon }) => (
              <div key={title} className="border-t pt-5">
                <Icon aria-hidden="true" size={21} className="text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="demo"
        className="border-y bg-muted/35"
        aria-labelledby="demo-title"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <Badge tone="info">Try it yourself · Sample question</Badge>
            <h2
              id="demo-title"
              className="mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
            >
              A cloud decision,
              <br />
              closer to home.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Imagine a fictional training institute taking admissions online.
              Its IT team is comparing a virtual machine with a managed
              application platform.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Both can host an application. The responsibilities that stay with
              the institute are different.
            </p>
            <dl className="mt-7 space-y-5 border-l-2 border-primary/25 pl-5">
              <div>
                <dt className="text-sm font-semibold">
                  Virtual machine · IaaS
                </dt>
                <dd className="mt-1 text-sm leading-7 text-muted-foreground">
                  The institute manages its guest operating system and
                  application. The provider manages the physical infrastructure.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold">
                  Managed application platform · PaaS
                </dt>
                <dd className="mt-1 text-sm leading-7 text-muted-foreground">
                  The provider manages the operating system and platform. The
                  institute still manages its application code, data, and
                  access.
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-xs leading-6 text-muted-foreground">
              Fictional scenario. Original practice content, not a real exam
              question. This example is part of cloud concepts and does not
              cover every AZ-900 objective.
            </p>
          </div>
          <SampleQuestion />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <BookOpen aria-hidden="true" size={23} />
        </span>
        <h2 className="mt-6 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          Give your next study session
          <br className="hidden sm:block" /> a clear purpose.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          CloudReady helps AZ-900 learners identify misunderstandings, practise
          weak topics, and measure improvement.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <EntryAction>
            Create your free account
            <ArrowRight aria-hidden="true" size={16} />
          </EntryAction>
          <DemoEntry>Try the demo</DemoEntry>
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Try demo account setup. Real accounts are not connected yet.
        </p>
      </section>
    </>
  );
}
