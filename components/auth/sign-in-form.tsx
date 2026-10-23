"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, fieldDescription } from "@/components/ui/field";
import { PasswordField } from "@/components/auth/password-field";
import { DemoNotice } from "@/components/auth/demo-notice";
import { DemoEntry } from "@/components/auth/demo-entry";
import {
  createDemoAccountService,
  DEMO_ACCOUNT,
} from "@/lib/auth/demo-service";
import { fieldErrors, signInSchema } from "@/lib/auth/validation";

const service = createDemoAccountService();
export function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (formError) errorRef.current?.focus();
  }, [formError]);
  useEffect(() => {
    if (complete) successRef.current?.focus();
  }, [complete]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next = fieldErrors(parsed.error);
      setErrors(next);
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    setErrors({});
    setFormError("");
    if (!navigator.onLine) {
      setFormError("You’re offline. Reconnect and try the demo sign-in again.");
      return;
    }
    setPending(true);
    try {
      const result = await service.signIn(parsed.data);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      setPassword("");
      setEmail("");
      setComplete(true);
    } catch {
      setFormError(
        "The demo sign-in could not be completed. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  if (complete)
    return (
      <div>
        <DemoNotice />
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success">
          <CircleCheck aria-hidden="true" size={26} />
        </span>
        <h1
          ref={successRef}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tight"
        >
          Demo sign-in complete
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          The sample details matched. This is a sign-in preview, not an
          authenticated account session.
        </p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Open the separate demo learner space to try the sample question. It
          won’t create account progress.
        </p>
        <DemoEntry variant="primary" className="mt-7" />
        <Button
          variant="ghost"
          className="mt-3 w-full"
          onClick={() => {
            setComplete(false);
            requestAnimationFrame(() =>
              document.getElementById("email")?.focus(),
            );
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  return (
    <div>
      <DemoNotice />
      {searchParams.get("reason") === "expired" ? (
        <div role="status" className="mb-5 rounded-xl border bg-card p-4">
          <p className="text-sm font-semibold">Your session has expired</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            Sign in again to continue. This is a demo state; no real session was
            active.
          </p>
        </div>
      ) : null}
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">
        Pick up where you left off
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Welcome back.
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        A little more understanding, one study session at a time.
      </p>
      <div className="mt-5 rounded-xl border bg-card p-4">
        <p className="text-xs font-medium">Try the shared sample account</p>
        <p className="mt-1 break-all font-mono text-xs leading-6 text-muted-foreground">
          {DEMO_ACCOUNT.email}
          <br />
          {DEMO_ACCOUNT.password}
        </p>
        <Button
          variant="ghost"
          className="mt-1 px-0 text-xs text-primary"
          disabled={pending}
          onClick={() => {
            setEmail(DEMO_ACCOUNT.email);
            setPassword(DEMO_ACCOUNT.password);
            setErrors({});
            setFormError("");
          }}
        >
          Fill sample details
        </Button>
      </div>
      <form
        noValidate
        aria-busy={pending}
        onSubmit={submit}
        className="mt-6 space-y-5"
      >
        <Field id="email" label="Email address" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: "" }));
              setFormError("");
            }}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            disabled={pending}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={fieldDescription(
              "email",
              undefined,
              errors.email,
            )}
            placeholder="you@example.com"
          />
        </Field>
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: "" }));
            setFormError("");
          }}
          error={errors.password}
          disabled={pending}
        />
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                disabled
                aria-describedby="remember-hint"
                className="size-4 accent-primary"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="inline-flex min-h-11 items-center text-xs font-semibold text-primary underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <p
            id="remember-hint"
            className="text-xs leading-6 text-muted-foreground"
          >
            Remember me is available with real account sign-in.
          </p>
        </div>
        {formError ? (
          <p
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="rounded-xl bg-destructive-soft p-3 text-sm leading-6 text-destructive"
          >
            {formError}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? (
            <>
              <LoaderCircle
                size={17}
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
              Signing in to demo…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        New to CloudReady?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-primary underline underline-offset-4"
        >
          Create account
        </Link>
      </p>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or explore without an account
        <span className="h-px flex-1 bg-border" />
      </div>
      <DemoEntry />
    </div>
  );
}
