import { ArrowUpRight, CircleCheck, Flag, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const breakdown = [
  { title: "Cloud concepts", correct: 3, width: "75%" },
  { title: "Architecture & services", correct: 2, width: "50%" },
  { title: "Management & governance", correct: 1, width: "25%" },
];

export function ProductPreview() {
  return (
    <div
      aria-label="Sample learning dashboard"
      className="overflow-hidden rounded-2xl border bg-card shadow-[0_12px_40px_-20px_#24253035]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Layers3 aria-hidden="true" size={17} className="text-primary" />
          Your learning, in focus
        </span>
        <Badge>Sample data</Badge>
      </div>
      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Diagnostic topic breakdown
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                A starting point,
                <br />
                not a final score.
              </p>
            </div>
            <span className="rounded-full bg-accent p-3 text-primary">
              <CircleCheck aria-hidden="true" size={22} />
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {breakdown.map((topic) => (
              <div key={topic.title}>
                <div className="mb-2 flex justify-between gap-3 text-xs">
                  <span className="font-medium">{topic.title}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {topic.correct}/4 correct · {topic.width}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/75"
                    style={{ width: topic.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning-soft p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-warning">
            <Flag aria-hidden="true" size={14} />
            REVISION PRIORITY
          </p>
          <p className="mt-2 font-semibold">Shared responsibility</p>
          <p className="mt-1 text-sm leading-6 text-warning">
            Answered incorrectly with high confidence.
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Revisit which responsibilities stay with you when you move to the
            cloud.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">
              Illustrative practice comparison
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm font-semibold">
              First attempt 3/5{" "}
              <ArrowUpRight
                size={16}
                aria-label="compared with"
                className="text-success"
              />
              <span className="text-success">Retry 4/5</span>
            </p>
          </div>
          <a
            href="#demo"
            className="rounded-lg p-2 text-primary hover:bg-accent"
            aria-label="Try a sample question"
          >
            <ArrowUpRight size={22} />
          </a>
        </div>
        <p className="text-[11px] leading-5 text-muted-foreground">
          Illustrative results only. Try the sample below to see how answer and
          confidence feedback work.
        </p>
      </div>
    </div>
  );
}
