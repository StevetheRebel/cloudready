"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, fieldDescription } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast-provider";
import { PasswordField } from "@/components/auth/password-field";
import { DemoNotice } from "@/components/auth/demo-notice";
import { DemoEntry } from "@/components/auth/demo-entry";
import {
  createDemoAccountService,
  DEMO_ACCOUNT,
} from "@/lib/auth/demo-service";
import {
  fieldErrors,
  signUpSchema,
  type SignUpValues,
} from "@/lib/auth/validation";

const service = createDemoAccountService();
const emptyValues: SignUpValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export function SignUpForm() {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );
  const [cooldown, setCooldown] = useState(0);
  const successTitle = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const notify = useToast();
  useEffect(() => {
    if (verificationEmail) successTitle.current?.focus();
  }, [verificationEmail]);
  useEffect(() => {
    if (formError) errorRef.current?.focus();
  }, [formError]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timeout = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [cooldown]);

  function update<K extends keyof SignUpValues>(
    key: K,
    value: SignUpValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setFormError("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      const next = fieldErrors(parsed.error);
      setErrors(next);
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    setErrors({});
    setFormError("");
    if (!navigator.onLine) {
      setFormError(
        "You’re offline. Reconnect and try the demo submission again.",
      );
      return;
    }
    setPending(true);
    try {
      const result = await service.signUp(parsed.data);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      setValues(emptyValues);
      setCooldown(0);
      setVerificationEmail(result.email);
    } catch {
      setFormError(
        "The demo submission could not be completed. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  async function resend() {
    if (!verificationEmail || pending || cooldown) return;
    setPending(true);
    setFormError("");
    try {
      if (!navigator.onLine) throw new Error("offline");
      await service.resendVerification(verificationEmail);
      setCooldown(30);
      notify("Demo resend complete. No verification email was sent.");
    } catch {
      setFormError(
        "The demo resend could not be completed. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  if (verificationEmail)
    return (
      <div>
        <DemoNotice />
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success">
          <Mail aria-hidden="true" size={26} />
        </span>
        <h1
          ref={successTitle}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tight"
        >
          Check your email
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          This is a simulated verification screen. No account was created and no
          email was sent.
        </p>
        <div className="my-6 rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Preview email address</p>
          <p className="mt-1 break-all text-sm font-semibold">
            {verificationEmail}
          </p>
        </div>
        <p className="text-sm leading-7 text-muted-foreground">
          With a real account, you would follow the verification link before
          continuing. For now, you can explore the demo without an account.
        </p>
        {formError ? (
          <p
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="mt-4 text-sm text-destructive"
          >
            {formError}
          </p>
        ) : null}
        <div className="mt-6 space-y-3">
          <DemoEntry variant="primary" />
          <Button
            className="w-full"
            variant="secondary"
            onClick={resend}
            disabled={pending || cooldown > 0}
          >
            {pending
              ? "Previewing resend…"
              : cooldown
                ? `Resend available in ${cooldown}s`
                : "Resend verification"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={pending}
            onClick={() => {
              setValues({ ...emptyValues, email: verificationEmail });
              setVerificationEmail(null);
              setFormError("");
              setCooldown(0);
              requestAnimationFrame(() =>
                document.getElementById("email")?.focus(),
              );
            }}
          >
            Change email address
          </Button>
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Want to try the sign-in screen?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary underline underline-offset-4"
          >
            Use the sample account
          </Link>
        </p>
      </div>
    );

  return (
    <div>
      <DemoNotice />
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">
        A clearer way to study
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        Find what needs another look, then build a study plan around it.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Try this screen with fictional details.
        </p>
        <Button
          variant="ghost"
          className="px-0 text-xs text-primary"
          disabled={pending}
          onClick={() => {
            setValues({
              fullName: "Amina Demo",
              email: "amina@example.com",
              password: DEMO_ACCOUNT.password,
              confirmPassword: DEMO_ACCOUNT.password,
              acceptTerms: false,
            });
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
        className="mt-3 space-y-4"
      >
        <Field id="fullName" label="Full name" error={errors.fullName}>
          <Input
            id="fullName"
            name="fullName"
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            autoComplete="name"
            required
            disabled={pending}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={fieldDescription(
              "fullName",
              undefined,
              errors.fullName,
            )}
            placeholder="Your full name"
          />
        </Field>
        <Field id="email" label="Email address" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
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
          value={values.password}
          onChange={(value) => update("password", value)}
          error={errors.password}
          hint="Use 8–128 characters. In this demo, use a sample password."
          disabled={pending}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          value={values.confirmPassword}
          onChange={(value) => update("confirmPassword", value)}
          error={errors.confirmPassword}
          disabled={pending}
        />
        <div>
          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={values.acceptTerms}
              onChange={(event) => update("acceptTerms", event.target.checked)}
              required
              disabled={pending}
              aria-invalid={Boolean(errors.acceptTerms)}
              aria-describedby={
                errors.acceptTerms ? "acceptTerms-error" : "consent-note"
              }
              className="mt-1 size-4 shrink-0 accent-primary"
            />
            <span>I accept the terms and acknowledge the privacy policy.</span>
          </label>
          <p className="mt-2 pl-7 text-xs leading-6 text-muted-foreground">
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Read terms<span className="sr-only"> (opens in a new tab)</span>
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              privacy policy
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
            .
          </p>
          <p
            id="consent-note"
            className="mt-1 pl-7 text-xs text-muted-foreground"
          >
            Demo only. No agreement or account is recorded.
          </p>
          {errors.acceptTerms ? (
            <p
              id="acceptTerms-error"
              role="alert"
              className="mt-2 text-sm text-destructive"
            >
              {errors.acceptTerms}
            </p>
          ) : null}
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
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
                size={17}
              />
              Creating demo preview…
            </>
          ) : (
            <>
              Create account
              <ArrowRight aria-hidden="true" size={17} />
            </>
          )}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-primary underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or explore without an account
        <span className="h-px flex-1 bg-border" />
      </div>
      <DemoEntry />
      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Check aria-hidden="true" size={13} />
        Demo progress stays in this browser.
      </p>
    </div>
  );
}
