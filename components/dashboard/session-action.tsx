"use client";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AssessmentSession } from "@/lib/cloudready/models";

export function SessionAction({ session }: { session: AssessmentSession }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>View saved session</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-6 shadow-xl">
          <Dialog.Title className="pr-7 text-xl font-semibold">
            Your saved session is kept
          </Dialog.Title>
          <Dialog.Description className="mt-4 text-sm leading-7 text-muted-foreground">
            {session.responses.length} of {session.questionIds.length} answers
            are saved. The assessment runner is not available yet, so this
            version cannot resume the session. Your saved answers have not been
            discarded or replaced.
          </Dialog.Description>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/demo" className={buttonVariants()}>
              Try the separate sample
            </Link>
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
