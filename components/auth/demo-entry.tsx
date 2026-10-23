"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import { createDemoService } from "@/lib/cloudready/services";
import { createOnboardingDraftStore } from "@/lib/cloudready/onboarding-storage";

export function DemoEntry({
  className,
  children = "Explore demo",
  variant = "secondary",
}: {
  className?: string;
  children?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  function enter() {
    setPending(true);
    setError("");
    try {
      const data = createDemoService(
        createDemoRepository(window.localStorage),
      ).start(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const draft = createOnboardingDraftStore(window.localStorage).load(
        data.profile.id,
      );
      if (draft.status === "error") throw new Error(draft.message);
      router.push(
        !data.profile.onboardingComplete || draft.status === "ready"
          ? "/onboarding"
          : "/dashboard",
      );
    } catch {
      setError(
        "Your browser’s demo data could not be opened. Check browser storage permissions, or manage existing demo data in the foundation preview.",
      );
      setPending(false);
    }
  }
  return (
    <div className={className}>
      <Button
        variant={variant}
        onClick={enter}
        disabled={pending}
        className="w-full"
      >
        {pending ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin motion-reduce:animate-none"
              size={16}
            />
            Opening demo…
          </>
        ) : (
          <>
            {children}
            <ArrowRight aria-hidden="true" size={16} />
          </>
        )}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}{" "}
          <Link href="/foundation" className="underline">
            Open demo data controls
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
