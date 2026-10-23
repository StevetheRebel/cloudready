import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
export const metadata: Metadata = {
  title: "Demo terms",
  description:
    "Read CloudReady’s current demo scope, study-content limitations, local-progress behaviour, and unavailable account services.",
};
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
          <p className="mt-3">
            Recovery and reset-password screens are also previews. They send no
            email and change no credentials. Live accounts, cloud-saved learner
            records, and generated explanations are not connected. Current study
            help uses prepared content.
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
          <p className="mt-3">
            Confidence ratings describe how certain you felt; they do not prove
            understanding. Retry accuracy can reflect familiar questions.
            Reviewing a lesson or rating recall does not change your earlier
            marked answers. Use the explanations and linked sources to check
            your reasoning as you study.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Demo progress and availability
          </h2>
          <p>
            The separate demo learner profile is stored in this browser.
            Clearing browser data or resetting the demo can remove its progress.
            The diagnostic and practice save submitted answers and confidence
            ratings locally. Lesson reviews, recall schedules, and activity also
            remain in this browser; they do not sync between devices or site
            addresses. Export copies saved records to a JSON download; import is
            not available. Review each reset’s scope before confirming it.
          </p>
          <p className="mt-3">
            Real account access and features labelled unavailable cannot be used
            in this version. No paid plan or checkout is available. Demo content
            and features can change as the project develops. An export is a copy
            of your saved data, not a guarantee of a future restore service.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Before real account registration
          </h2>
          <p>
            These notes describe the current demonstration; the registration
            checkbox does not record a live agreement. The terms will be
            reviewed and updated before live accounts open. Read the{" "}
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
        href="/how-it-works"
        className="mt-10 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        How the demo works
      </Link>
    </article>
  );
}
