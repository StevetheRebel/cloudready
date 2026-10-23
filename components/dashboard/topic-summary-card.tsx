import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { dashboardSummary } from "@/lib/cloudready/dashboard";

type Topic = ReturnType<typeof dashboardSummary>["topics"][number];
export function TopicSummaryCard({ topic }: { topic: Topic }) {
  return (
    <Card className="flex flex-col">
      <Badge tone={topic.total ? "info" : "neutral"} className="self-start">
        {!topic.total
          ? "Not started"
          : !topic.enoughEvidence
            ? "Not enough evidence"
            : "Activity recorded"}
      </Badge>
      <h3 className="mt-4 text-lg leading-7 font-semibold">{topic.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
        {topic.summary}
      </p>
      <div className="mt-5 border-t pt-4">
        <div className="flex items-end justify-between gap-2">
          <span className="text-xs text-muted-foreground">Correct answers</span>
          <span className="text-2xl font-semibold tracking-tight">
            {topic.percent === null ? "—" : `${topic.percent}%`}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {topic.correct} correct / {topic.total} questions answered
        </p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          {topic.total
            ? `${topic.confident} confident · ${topic.uncertain} uncertain · ${topic.unrated} unrated`
            : "No confidence ratings yet."}
        </p>
        <p className="text-xs leading-6 text-muted-foreground">
          {topic.conceptsNeedingRevision}{" "}
          {topic.conceptsNeedingRevision === 1
            ? "concept needs"
            : "concepts need"}{" "}
          revision from the latest answers.
        </p>
        <Link
          href={`/practice?topic=${topic.id}`}
          className={buttonVariants({
            variant: "secondary",
            className: "mt-4 w-full",
          })}
        >
          Practise this topic
        </Link>
        <p className="mt-2 text-xs text-muted-foreground">
          Choose question count, confidence, and feedback settings.
        </p>
      </div>
    </Card>
  );
}
