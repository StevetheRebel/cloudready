import Link from "next/link";
import { EmptyState } from "@/components/ui/states";
import { buttonVariants } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-5 py-16">
      <EmptyState
        title="That lesson could not be found"
        description="The lesson may have moved or the link may be incorrect. Open the learning library to choose an available concept."
        action={
          <Link href="/learn" className={buttonVariants()}>
            Open learning library
          </Link>
        }
      />
    </main>
  );
}
