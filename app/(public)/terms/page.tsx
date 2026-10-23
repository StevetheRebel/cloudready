import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
export const metadata: Metadata = { title: "Demo terms" };
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <Badge tone="info">Demo version · 23 October 2026</Badge>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight">
        About using this demo
      </h1>
      <p className="mt-5 text-base leading-8 text-muted-foreground">
        CloudReady is an unofficial study tool. It is not affiliated with or
        endorsed by Microsoft.
      </p>
      <div className="mt-9 space-y-8 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            A preview of the learning experience
          </h2>
          <p>
            The current version includes sample content and simulated account
            forms. Submitting those forms does not create an account, send
            email, record a real agreement, or start an authenticated session.
            The acceptance checkbox demonstrates a future registration
            interaction only.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Study guidance and sample results
          </h2>
          <p>
            Questions are original practice material, not real exam questions.
            Fictional scenarios and labelled sample scores illustrate the
            product. Practice activity does not predict an official AZ-900 exam
            result or guarantee a pass. The initial content does not cover every
            exam objective.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Demo progress and availability
          </h2>
          <p>
            The separate demo learner profile is stored in this browser.
            Clearing browser data or resetting the demo can remove its progress.
            Features shown as unavailable, including the full diagnostic and
            real account access, cannot be used in this version.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Before real account registration
          </h2>
          <p>
            These demo terms will be reviewed and updated before live accounts
            open. Read the{" "}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-4"
            >
              privacy information
            </Link>{" "}
            for details about the current version’s local data.
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
