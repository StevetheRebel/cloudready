"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { DemoNotice } from "@/components/auth/demo-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, fieldDescription } from "@/components/ui/field";
import { emailSchema } from "@/lib/auth/validation";
import {
  createDemoRecoveryService,
  RECOVERY_CONFIRMATION,
} from "@/lib/auth/recovery";

const service = createDemoRecoveryService();
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const busy = useRef(false);
  const successRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (complete) successRef.current?.focus();
  }, [complete]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = emailSchema.safeParse(email);
    setError("");
    if (!parsed.success) {
      setFieldError("Enter a valid email address.");
      document.getElementById("recovery-email")?.focus();
      return;
    }
    busy.current = true;
    setPending(true);
    setFieldError("");
    try {
      const result = await service.request(parsed.data);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setEmail("");
      setComplete(true);
    } catch {
      setError(
        "The local preview could not be completed. Try again; no email has been sent.",
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <div>
      <DemoNotice />
      {complete ? (
        <>
          <h1
            ref={successRef}
            tabIndex={-1}
            className="text-3xl font-semibold tracking-tight"
          >
            Recovery request previewed.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {RECOVERY_CONFIRMATION}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Use the public example below to try the reset form. It is a UI
            preview, not an emailed or secure reset link.
          </p>
          <Link
            href="/reset-password?preview=valid"
            className={buttonVariants({ className: "mt-6 w-full" })}
          >
            Open demo reset form
          </Link>
          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => {
              setComplete(false);
              requestAnimationFrame(() =>
                document.getElementById("recovery-email")?.focus(),
              );
            }}
          >
            Try another example email
          </Button>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Account recovery preview
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Find your way back.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Try the recovery flow with an example email. No account lookup or
            email delivery happens in this demo.
          </p>
          <form
            noValidate
            aria-busy={pending}
            onSubmit={submit}
            className="mt-6 space-y-5"
          >
            <Field
              id="recovery-email"
              label="Example email address"
              error={fieldError}
              hint="Use a fictional address, such as learner@example.com."
            >
              <Input
                id="recovery-email"
                name="email"
                type="email"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="learner@example.com"
                value={email}
                disabled={pending}
                required
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldDescription(
                  "recovery-email",
                  "Use a fictional address",
                  fieldError,
                )}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldError("");
                  setError("");
                }}
              />
            </Field>
            {error ? (
              <p
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="rounded-xl bg-destructive-soft p-3 text-sm leading-7 text-destructive"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Previewing request…" : "Preview reset request"}
            </Button>
          </form>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            This local preview also works offline once the page has loaded. No
            recovery request is queued or sent.
          </p>
        </>
      )}
      <Link
        href="/sign-in"
        className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Back to sign in
      </Link>
    </div>
  );
}
