import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BookOpen, Compass, Target } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeSelect } from "@/components/theme-select";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <Brand />
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to home
        </Link>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-12 px-5 py-6 sm:px-8 sm:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"
      >
        <aside className="hidden rounded-3xl bg-accent p-9 lg:block">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary">
            <Compass aria-hidden="true" size={24} />
          </span>
          <p className="mt-8 text-xs font-semibold tracking-widest text-primary uppercase">
            Your AZ-900 study companion
          </p>
          <h2 className="mt-4 text-4xl leading-tight font-semibold tracking-tight">
            Bring a little direction
            <br />
            to your next
            <br />
            study session.
          </h2>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Start with what you understand. Find what needs another look. Build
            from there.
          </p>
          <div className="mt-9 space-y-5 border-t border-primary/15 pt-7">
            {[
              {
                icon: Target,
                title: "Know what to revisit",
                text: "Use answers and confidence to spot learning gaps.",
              },
              {
                icon: BookOpen,
                title: "Understand the reasoning",
                text: "Study explanations and fictional local scenarios.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <Icon
                  aria-hidden="true"
                  size={19}
                  className="mt-1 shrink-0 text-primary"
                />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs leading-6 text-muted-foreground">
            Practice progress reflects activity in CloudReady. It does not
            predict an official exam result.
          </p>
        </aside>
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
      <footer className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs leading-6 text-muted-foreground sm:px-8">
        <p>
          Unofficial study tool. Not affiliated with or endorsed by Microsoft.
        </p>
        <ThemeSelect />
      </footer>
    </div>
  );
}
