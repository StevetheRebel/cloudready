import Link from "next/link";
import { Brand } from "@/components/brand";
import { ThemeSelect } from "@/components/theme-select";
import { EntryAction } from "@/components/site/entry-action";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-card px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Identify misunderstandings. Practise weak topics.
              <br />
              Track your practice.
            </p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
          >
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 items-center text-muted-foreground hover:text-primary"
            >
              How it works
            </Link>
            <EntryAction
              kind="privacy"
              variant="ghost"
              className="px-0 font-normal"
            >
              Privacy
            </EntryAction>
            <EntryAction
              kind="terms"
              variant="ghost"
              className="px-0 font-normal"
            >
              Terms
            </EntryAction>
          </nav>
          <ThemeSelect />
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t pt-6 text-xs leading-6 text-muted-foreground">
          <p>
            CloudReady is an unofficial study tool. Not affiliated with or
            endorsed by Microsoft.
          </p>
          <p>Practice progress is not an exam result prediction.</p>
        </div>
      </div>
    </footer>
  );
}
