import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
export const metadata: Metadata = {
  title: "Demo privacy information",
  description:
    "Understand what CloudReady saves in this browser, how settings drafts and exports work, and what each demo reset removes.",
};
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <Badge tone="info">Demo version · 23 October 2026</Badge>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight">
        Privacy information
      </h1>
      <p className="mt-5 text-base leading-8 text-muted-foreground">
        This page describes the current CloudReady demo. Real registration,
        authentication, email delivery, and server-side learner storage are not
        enabled.
      </p>
      <div className="mt-9 space-y-8 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Account-form previews
          </h2>
          <p>
            Sign-up and sign-in use fictional sample details. Entered values are
            processed in page memory by a simulated service. CloudReady does not
            send them to an account server or save entered passwords. No real
            account, verification email, or authenticated session is created.
            Please use sample details rather than personal credentials.
          </p>
          <p className="mt-3">
            Recovery and reset forms are also local previews. Example emails and
            passwords are checked in page memory without account lookup, email
            delivery, password storage, or credential changes. Reset-page
            examples use public preview states, not real reset tokens. A real
            reset token is not accepted by this demo.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Data in this browser
          </h2>
          <p>
            Opening a learner page creates or resumes a local demo profile.
            Saved names, study preferences, and demo learning records are saved
            under the CloudReady demo storage key. Diagnostic and practice
            sessions store submitted answers, confidence ratings, timestamps,
            revision items, completion activity, session settings, and
            question-exposure metadata there. Lesson reviews and recall ratings,
            timestamps, and scheduled review dates are also kept there.
            Unsubmitted answer selections are not saved. In-progress onboarding
            values and the current setup step are saved as a separate local
            draft. The theme preference is saved separately. The home-page and
            demo-space sample questions keep answers only while their page is
            open and do not update saved progress.
          </p>
          <p className="mt-3">
            Records belong to this browser profile and site address. Localhost
            and a hosted CloudReady site do not share saved progress. There is
            no server backup or cross-device sync. Clearing site data, changing
            browsers, or losing access to this browser can remove access to your
            records.
          </p>
          <p className="mt-3">
            Unsaved settings edits, including names and study preferences, are
            kept in a separate draft in this tab’s session storage when it is
            available. Save or discard them explicitly. Closing the tab normally
            clears session storage, though browser session restoration can
            retain it.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Your controls
          </h2>
          <p>
            You can remove locally stored data using your browser’s site-data
            controls. Your{" "}
            <Link
              href="/settings"
              className="text-primary underline underline-offset-4"
            >
              settings
            </Link>{" "}
            provide JSON export and confirmed learning-only or entire-demo
            resets. Entire-demo reset keeps the theme and previously downloaded
            exports; it clears this tab’s settings draft but cannot clear other
            tabs’ temporary drafts. Exports contain saved profile and learning
            data, so choose where to keep or share the downloaded file.
          </p>
          <p className="mt-3">
            Clearing learning records keeps your profile and preferences while
            removing saved sessions, answers, lesson reviews, recall schedules,
            and activity. Entire-demo reset also removes the local profile,
            preferences, and onboarding draft. Both require confirmation.
            Downloaded exports remain outside the app’s reset controls, and
            importing them is not available yet.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            External resources and future features
          </h2>
          <p>
            Microsoft Learn links open an external website with its own privacy
            practices. Study help currently uses prepared explanations; these
            help actions do not send prompts to a live AI provider. Loading the
            website still requests pages and assets from its host; local learner
            storage does not mean that visiting the site is network-free.
          </p>
          <p className="mt-3">
            This information will be updated before real accounts, email
            delivery, AI services, or server-side learner storage are
            introduced.
          </p>
        </section>
      </div>
      <Link
        href="/how-it-works"
        className="mt-10 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        How the demo works
      </Link>
    </article>
  );
}
