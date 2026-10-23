"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Layers3,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { LearnerShell } from "@/components/layouts/learner-shell";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, fieldDescription } from "@/components/ui/field";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast-provider";
import { topics } from "@/lib/cloudready/content";
import { createDemoRepository } from "@/lib/cloudready/persistence";
import { createDemoService } from "@/lib/cloudready/services";
import { createSettingsDraftStore } from "@/lib/cloudready/settings";
import type { LearnerData } from "@/lib/cloudready/models";

function browserService() {
  return createDemoService(createDemoRepository(window.localStorage));
}

export function FoundationPreview() {
  const [shell, setShell] = useState<"learner" | "public">("learner");
  const [data, setData] = useState<LearnerData | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const notify = useToast();

  useEffect(() => {
    function read() {
      try {
        const result = browserService().read();
        if (result.status === "error") setStorageError(result.message);
        else {
          setStorageError("");
          setData(result.status === "ready" ? result.data : null);
          setName(
            result.status === "ready" ? result.data.profile.displayName : "",
          );
        }
      } catch {
        setStorageError(
          "Browser storage is unavailable. You can still inspect the components.",
        );
      }
      setReady(true);
    }
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = name.trim();
    if (!displayName || displayName.length > 50) {
      setFieldError("Enter a display name between 1 and 50 characters.");
      return;
    }
    setFieldError("");
    try {
      const service = browserService();
      const current = service.start(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      const next = service.updateProfile({ ...current.profile, displayName });
      setData(next);
      setStorageError("");
      notify("Demo preference saved. Refresh to check it persists.");
    } catch {
      setStorageError(
        "Your demo preference could not be saved. Check browser storage permissions or reset unreadable demo data.",
      );
    }
  }

  const content = (
    <div
      className={
        shell === "public" ? "mx-auto max-w-6xl px-5 py-10 sm:px-8" : ""
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Badge tone="info">
          <Layers3 size={13} aria-hidden="true" />
          Foundation preview
        </Badge>
        <div role="group" aria-label="Preview layout" className="flex gap-2">
          <Button
            variant={shell === "learner" ? "primary" : "secondary"}
            aria-pressed={shell === "learner"}
            onClick={() => setShell("learner")}
          >
            Learner shell
          </Button>
          <Button
            variant={shell === "public" ? "primary" : "secondary"}
            aria-pressed={shell === "public"}
            onClick={() => setShell("public")}
          >
            Public shell
          </Button>
        </div>
      </div>
      <div className="mt-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          CloudReady / Step 01
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Good learning starts with
          <br className="hidden sm:block" /> a clear foundation.
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Review the shared styles, layouts, and interactions we’ll use
          throughout CloudReady. This is a component preview; learning pages
          come next.
        </p>
      </div>

      <section
        aria-labelledby="principles-heading"
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        <h2 id="principles-heading" className="sr-only">
          Foundation principles
        </h2>
        {[
          {
            title: "A consistent study space",
            description:
              "Shared layouts, readable type, and a focused indigo palette.",
          },
          {
            title: "Accessible by default",
            description:
              "Visible focus, labelled controls, and keyboard-friendly dialogs.",
          },
          {
            title: "Progress with evidence",
            description:
              "Typed records and calculated scores. No invented learning activity.",
          },
        ].map((item, index) => (
          <Card key={item.title}>
            <span className="text-xs font-mono text-primary">0{index + 1}</span>
            <h3 className="mt-4 font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </Card>
        ))}
      </section>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">
            Small details. Shared everywhere.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Buttons, status labels, and feedback use the same language across
            pages.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => notify("The primary button is working.")}>
              Primary action
              <ArrowRight aria-hidden="true" size={16} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => notify("The secondary button is working.")}
            >
              Secondary action
            </Button>
            <Button
              variant="ghost"
              onClick={() => notify("The quiet action is working.")}
            >
              Quiet action
            </Button>
            <Button disabled>Unavailable</Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="success">
              <Check size={12} aria-hidden="true" />
              Reviewed
            </Badge>
            <Badge tone="warning">Needs revision</Badge>
            <Badge tone="info">Demo learner</Badge>
            <Badge tone="error">Check your answer</Badge>
            <Badge>Not started</Badge>
          </div>
          <div className="mt-7 border-t pt-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck
                size={18}
                aria-hidden="true"
                className="text-success"
              />
              Clear feedback, without the pressure.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Colour always comes with a text label. Reviewing a lesson will not
              automatically mark it mastered.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Try a saved preference</h2>
            <Badge tone="info">Demo only</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Save a display name, then refresh. This uses this browser’s demo
            storage and creates no real account.
          </p>
          {!ready ? (
            <LoadingState label="Checking demo storage…" />
          ) : (
            <form onSubmit={save} noValidate className="mt-5 space-y-4">
              <Field
                id="preview-name"
                label="Preferred display name"
                hint="Up to 50 characters. No password or email is needed."
                error={fieldError}
              >
                <Input
                  id="preview-name"
                  name="displayName"
                  autoComplete="nickname"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldDescription(
                    "preview-name",
                    "hint",
                    fieldError,
                  )}
                  placeholder="What should we call you?"
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button type="submit">Save demo preference</Button>
                <Button variant="ghost" onClick={() => setDialogOpen(true)}>
                  <RotateCcw aria-hidden="true" size={15} />
                  Reset demo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {data
                  ? `Saved as ${data.profile.displayName}. No questions attempted yet.`
                  : "No demo learning data has been created."}
              </p>
            </form>
          )}
          {storageError ? (
            <div className="mt-4">
              <ErrorState
                title="Demo storage needs attention"
                description={storageError}
              />
            </div>
          ) : null}
        </Card>
      </div>

      <section className="mt-8" aria-labelledby="topics-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="topics-heading" className="text-lg font-semibold">
            Three topics. One learning journey.
          </h2>
          <span className="text-xs text-muted-foreground">
            Content structure preview
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic.id} className="shadow-none">
              <Badge>Not started</Badge>
              <h3 className="mt-4 font-semibold">{topic.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {topic.summary}
              </p>
            </Card>
          ))}
        </div>
      </section>
      <section
        className="mt-8 grid gap-6 md:grid-cols-2"
        aria-label="Shared state examples"
      >
        <EmptyState
          title="A fresh start"
          description="Your learning activity will appear after you begin. This preview contains no sample scores."
        />
        <Card>
          <h2 className="font-semibold">Loading state example</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Used while a page retrieves learning records.
          </p>
          <LoadingState label="Loading example…" />
        </Card>
      </section>
      <p className="mt-8 text-xs leading-6 text-muted-foreground">
        Learner navigation is marked unavailable until its pages are
        implemented. Database, authentication, and live AI are not connected in
        this stage.
      </p>
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Reset this browser’s demo?"
        description="This removes the demo profile, preferences, onboarding draft, sessions, responses, lesson reviews, revision schedule, activity, and this tab’s settings draft. Theme and downloaded exports are kept. Other tabs’ settings drafts cannot be cleared here. Real accounts are not affected."
        confirmLabel="Reset demo"
        destructive
        onConfirm={() => {
          createSettingsDraftStore(window.sessionStorage).clear();
          browserService().reset();
          setData(null);
          setName("");
          setFieldError("");
          setStorageError("");
          notify("Demo data reset for this browser.");
        }}
      />
    </div>
  );
  return shell === "learner" ? (
    <LearnerShell
      displayName={data?.profile.displayName ?? "Demo learner"}
      isDemo
    >
      {content}
    </LearnerShell>
  ) : (
    <PublicLayout>{content}</PublicLayout>
  );
}
