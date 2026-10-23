"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

const diagnosticNotice = {
  title: "Try a sample while the diagnostic is on its way",
  body: "The full 12-question diagnostic isn’t available yet. You can try an original sample question, rate your confidence, and see how an explanation helps you decide what to revisit.",
};

export function EntryAction({
  kind = "signup",
  children,
  variant = "primary",
  className,
}: {
  kind?: "diagnostic" | "signup" | "signin" | "privacy" | "terms";
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const notice = diagnosticNotice;
  if (kind !== "diagnostic") {
    const routes = {
      signup: "/sign-up",
      signin: "/sign-in",
      privacy: "/privacy",
      terms: "/terms",
    };
    return (
      <Link
        href={routes[kind]}
        className={buttonVariants({ variant, className })}
      >
        {children}
      </Link>
    );
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant={variant} className={className}>
          {children}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-6 shadow-xl">
          <Dialog.Title className="pr-8 text-xl font-semibold tracking-tight">
            {notice.title}
          </Dialog.Title>
          <Dialog.Description className="mt-4 text-sm leading-7 text-muted-foreground">
            {notice.body}
          </Dialog.Description>
          <div className="mt-6 flex flex-wrap gap-2">
            <Dialog.Close asChild>
              <Link href="/#demo" className={buttonVariants()}>
                Explore the sample
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="secondary">Close</Button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2 px-3"
              aria-label="Close dialog"
            >
              <X aria-hidden="true" size={18} />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
