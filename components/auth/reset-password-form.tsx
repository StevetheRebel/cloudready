"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DemoNotice } from "@/components/auth/demo-notice";
import { PasswordField } from "@/components/auth/password-field";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  createDemoRecoveryService,
  recoveryLinkState,
  resetPasswordSchema,
  type RecoveryLinkState,
} from "@/lib/auth/recovery";
import { fieldErrors } from "@/lib/auth/validation";
import { DEMO_ACCOUNT } from "@/lib/auth/demo-service";

const service = createDemoRecoveryService();
const linkMessages = {
  missing: {
    title: "No reset preview selected",
    detail:
      "A reset link would normally come from a recovery email. Email delivery is not connected; choose the public demo preview to explore the form.",
  },
  invalid: {
    title: "This reset link is not supported",
    detail:
      "This demo cannot validate real reset tokens. The link may be missing required information, or it is not one of the public preview links.",
  },
  expired: {
    title: "Reset link expired — demo state",
    detail:
      "A live expired link would require a new recovery request. This state is a public example; no real token has expired.",
  },
  used: {
    title: "Reset link already used — demo state",
    detail:
      "A live used link could not be used again. This state is a public example; no token has been consumed and no password was changed.",
  },
};

function ResetPreview({ state }: { state: RecoveryLinkState }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    setError("");
    if (!parsed.success) {
      const next = fieldErrors(parsed.error);
      setErrors(next);
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    busy.current = true;
    setPending(true);
    setErrors({});
    try {
      const result = await service.reset(state, parsed.data);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setPassword("");
      setConfirmPassword("");
      setComplete(true);
    } catch {
      setError(
        "The local reset preview could not be completed. Try again; no password has changed.",
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
            Reset preview complete.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The example passwords matched and passed validation. No account
            password changed, no reset token was consumed, and your saved study
            records are kept.
          </p>
          <p className="mt-4 rounded-xl border bg-card p-4 text-sm leading-7 text-muted-foreground">
            Demo sign-in still uses{" "}
            <span className="break-all font-mono">{DEMO_ACCOUNT.email}</span>{" "}
            and the public sample password{" "}
            <span className="break-all font-mono">{DEMO_ACCOUNT.password}</span>
            .
          </p>
          <Link
            href="/sign-in"
            className={buttonVariants({ className: "mt-6 w-full" })}
          >
            Return to demo sign-in
          </Link>
        </>
      ) : state !== "valid" ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight">
            {linkMessages[state].title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {linkMessages[state].detail}
          </p>
          <Link
            href="/forgot-password"
            className={buttonVariants({ className: "mt-6 w-full" })}
          >
            Preview a new recovery request
          </Link>
          <Link
            href="/sign-in"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Public demo reset form
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Try a new sample password.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Use an invented password. This form checks the inputs only; it does
            not update credentials or authenticate you.
          </p>
          <form
            noValidate
            aria-busy={pending}
            onSubmit={submit}
            className="mt-6 space-y-5"
          >
            <PasswordField
              id="password"
              label="Example new password"
              hint="Use 8–128 characters. Do not enter a password you use elsewhere."
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrors((current) => ({
                  ...current,
                  password: "",
                  confirmPassword: "",
                }));
                setError("");
              }}
              error={errors.password}
              disabled={pending}
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm example password"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setErrors((current) => ({ ...current, confirmPassword: "" }));
                setError("");
              }}
              error={errors.confirmPassword}
              disabled={pending}
            />
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
              {pending ? "Checking example…" : "Preview password reset"}
            </Button>
          </form>
          <Link
            href="/sign-in"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </>
      )}
      <div className="mt-7 rounded-xl border p-4">
        <h2 className="text-sm font-semibold">Explore demo link states</h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          These public examples do not contain real reset tokens. Reloading a
          valid example starts it again.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {["valid", "expired", "used", "invalid"].map((preview) => (
            <Link
              key={preview}
              href={`/reset-password?preview=${preview}`}
              className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
              aria-current={state === preview ? "page" : undefined}
            >
              {preview === "valid"
                ? "Valid form"
                : preview === "expired"
                  ? "Expired link"
                  : preview === "used"
                    ? "Used link"
                    : "Invalid link"}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  const params = useSearchParams();
  const state = recoveryLinkState(params);
  return <ResetPreview key={state} state={state} />;
}
