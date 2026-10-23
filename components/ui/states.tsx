import type { ReactNode } from "react";
import { BookOpen, CircleAlert, LoaderCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center py-10 text-center">
      <BookOpen aria-hidden="true" className="mb-4 text-primary" size={28} />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card role="alert">
      <CircleAlert aria-hidden="true" className="mb-3 text-destructive" />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
export function LoadingState({
  label = "Loading your study space…",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 p-8 text-sm text-muted-foreground"
    >
      <LoaderCircle
        aria-hidden="true"
        className="animate-spin motion-reduce:animate-none"
        size={20}
      />
      {label}
    </div>
  );
}
