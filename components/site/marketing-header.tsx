import Link from "next/link";
import { Brand } from "@/components/brand";
import { EntryAction } from "@/components/site/entry-action";

export function MarketingHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-8 lg:grid-cols-[1fr_auto_auto]">
        <Brand />
        <nav
          aria-label="Public navigation"
          className="order-3 col-span-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t pt-2 text-sm lg:order-none lg:col-span-1 lg:border-0 lg:pt-0"
        >
          <Link
            href="/#how-it-works"
            className="inline-flex min-h-11 items-center font-medium text-muted-foreground hover:text-primary"
          >
            How CloudReady works
          </Link>
          <Link
            href="/#features"
            className="inline-flex min-h-11 items-center font-medium text-muted-foreground hover:text-primary"
          >
            Features
          </Link>
          <EntryAction kind="signin" variant="ghost" className="px-0">
            Sign in
          </EntryAction>
        </nav>
        <EntryAction className="text-xs sm:text-sm">Start learning</EntryAction>
      </div>
    </header>
  );
}
