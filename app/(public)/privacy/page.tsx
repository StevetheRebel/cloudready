import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
export const metadata: Metadata = { title: "Privacy information" };
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
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Data in this browser
          </h2>
          <p>
            Opening the separate demo learner space creates or resumes a local
            demo profile. Demo preferences and any demo learning records are
            saved under the CloudReady demo storage key. The diagnostic stores
            submitted answers, confidence ratings, timestamps, revision items,
            and completion activity there. Unsubmitted answer selections are not
            saved. In-progress onboarding values and the current setup step are
            saved as a separate local draft. The theme preference is saved
            separately. The home-page and demo-space sample questions keep
            answers only while their page is open and do not update saved
            progress.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Your controls
          </h2>
          <p>
            You can remove locally stored data using your browser’s site-data
            controls. The{" "}
            <Link
              href="/foundation"
              className="text-primary underline underline-offset-4"
            >
              foundation preview
            </Link>{" "}
            also provides a confirmed reset of demo learner data while keeping
            the theme preference.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            External resources and future features
          </h2>
          <p>
            Microsoft Learn links open an external website with its own privacy
            practices. This information will be updated before real accounts,
            email delivery, AI services, or server-side learner storage are
            introduced.
          </p>
        </section>
      </div>
      <Link
        href="/sign-up"
        className="mt-10 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Back to account setup
      </Link>
    </article>
  );
}
