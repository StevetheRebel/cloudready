import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { ThemeSelect } from "@/components/theme-select";
import { MarketingHeader } from "@/components/site/marketing-header";
import { MarketingFooter } from "@/components/site/marketing-footer";
type PublicLink = { href: string; label: string };
export function PublicLayout({
  children,
  links = [],
  marketing = false,
}: {
  children: ReactNode;
  links?: PublicLink[];
  marketing?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {marketing ? (
        <MarketingHeader />
      ) : (
        <header className="border-b bg-card">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Brand />
            <nav
              aria-label="Public navigation"
              className="flex flex-wrap items-center gap-5"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <ThemeSelect />
            </nav>
          </div>
        </header>
      )}
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      {marketing ? (
        <MarketingFooter />
      ) : (
        <footer className="border-t px-5 py-6 text-sm text-muted-foreground">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
            <span>CloudReady · Study with direction.</span>
            <span>
              Unofficial study tool. Not affiliated with or endorsed by
              Microsoft.
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}
