"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { SampleQuestion } from "@/components/site/sample-question";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { createDemoService } from "@/lib/cloudready/services";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import type { LearnerData } from "@/lib/cloudready/models";
import { createOnboardingDraftStore } from "@/lib/cloudready/onboarding-storage";

export function DemoSpace() {
  const [data, setData] = useState<LearnerData | null>(null);
  const [error, setError] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  useEffect(() => {
    let active = true;
    // Keep repository loading asynchronous and ignore results after unmount.
    async function load() {
      try {
        const data = await Promise.resolve().then(() => {
          const service = createDemoService(
            createDemoRepository(window.localStorage),
          );
          const data = service.start(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          );
          const draft = createOnboardingDraftStore(window.localStorage).load(
            data.profile.id,
          );
          return { data, hasDraft: draft.status === "ready" };
        });
        if (active) {
          setData(data.data);
          setHasDraft(data.hasDraft);
        }
      } catch {
        if (active)
          setError(
            "Your saved demo could not be opened. Browser storage may be blocked or contain unreadable demo data.",
          );
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  return (
    <LearnerShell
      displayName={data?.profile.displayName ?? "Demo learner"}
      isDemo
    >
      {error ? (
        <ErrorState
          title="Demo storage needs attention"
          description={error}
          action={
            <Link
              href="/foundation"
              className={buttonVariants({ variant: "secondary" })}
            >
              Manage demo data
            </Link>
          }
        />
      ) : !data ? (
        <LoadingState label="Opening your demo study space…" />
      ) : (
        <div>
          <Badge tone="info">Independent demo · No account required</Badge>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            A little practice,
            <br />a clearer starting point.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Try the question below to see how confidence changes your feedback.
            Your demo preferences stay in this browser, separate from any
            account. This sample answer is not saved to learning progress.
          </p>
          <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
            <SampleQuestion />
            <div className="space-y-5">
              <Card>
                <h2 className="text-lg font-semibold">Your demo is ready</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {data.profile.onboardingComplete
                    ? `Your study preferences are saved: ${data.profile.preferences.minutesPerSession} minutes per session across ${data.profile.preferences.studyDays.length} days each week.`
                    : "Set your learning background and study availability to give future sessions a clear starting point."}
                </p>
                <Link
                  href="/onboarding"
                  className={buttonVariants({
                    variant: "secondary",
                    className: "mt-5",
                  })}
                >
                  {hasDraft
                    ? "Resume setup"
                    : data.profile.onboardingComplete
                      ? "Edit study preferences"
                      : "Set study preferences"}
                </Link>
              </Card>
              <Card>
                <h2 className="font-semibold">
                  Account forms are a separate preview
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  You can try sign-up and sign-in without connecting this demo
                  to an account.
                </p>
                <Link
                  href="/sign-up"
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
                >
                  Try account setup
                </Link>
              </Card>
            </div>
          </div>
        </div>
      )}
    </LearnerShell>
  );
}
