import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "info" | "success" | "warning" | "error";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        {
          neutral: "bg-muted text-muted-foreground",
          info: "bg-accent text-primary",
          success: "bg-success-soft text-success",
          warning: "bg-warning-soft text-warning",
          error: "bg-destructive-soft text-destructive",
        }[tone],
        className,
      )}
      {...props}
    />
  );
}
