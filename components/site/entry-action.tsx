import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";

const routes = {
  diagnostic: "/assessment/start",
  signup: "/sign-up",
  signin: "/sign-in",
  privacy: "/privacy",
  terms: "/terms",
};
export function EntryAction({
  kind = "signup",
  children,
  variant = "primary",
  className,
}: {
  kind?: keyof typeof routes;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <Link
      href={routes[kind]}
      className={buttonVariants({ variant, className })}
    >
      {children}
    </Link>
  );
}
