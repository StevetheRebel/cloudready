import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { AssessmentSession } from "@/lib/cloudready/models";

export function SessionAction({ session }: { session: AssessmentSession }) {
  return (
    <Link
      href={`/assessment/${encodeURIComponent(session.id)}`}
      className={buttonVariants()}
    >
      Resume {session.kind === "diagnostic" ? "diagnostic" : "practice"}
    </Link>
  );
}
