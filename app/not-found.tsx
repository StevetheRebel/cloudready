import Link from "next/link";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
export default function NotFound() {
  return (
    <PublicLayout marketing>
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <Badge tone="info">404 · Page not found</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          Let’s find your next step.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
          This address does not match an available page. Check the link, return
          home, or choose an available concept from the learning library.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants()}>
            Return home
          </Link>
          <Link
            href="/learn"
            className={buttonVariants({ variant: "secondary" })}
          >
            Open learning library
          </Link>
          <Link
            href="/how-it-works"
            className={buttonVariants({ variant: "secondary" })}
          >
            How it works
          </Link>
        </div>
        <p className="mt-6 text-xs leading-6 text-muted-foreground">
          Viewing this page does not reset or change your saved learner records.
        </p>
      </section>
    </PublicLayout>
  );
}
