"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpen,
  ChartNoAxesCombined,
  LayoutDashboard,
  ListChecks,
  RotateCcw,
  Settings,
  UserRound,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { ThemeSelect } from "@/components/theme-select";
import { cn } from "@/lib/utils";
const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: ListChecks },
  { href: "/revision", label: "Revision", icon: RotateCcw },
  { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
];
export function LearnerShell({
  children,
  displayName,
  isDemo = false,
  availableRoutes = [
    "/dashboard",
    "/learn",
    "/practice",
    "/revision",
    "/progress",
  ],
}: {
  children: ReactNode;
  displayName: string;
  isDemo?: boolean;
  availableRoutes?: string[];
}) {
  const pathname = usePathname();
  function navItems(mobile: boolean) {
    return navigation.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      const classes = cn(
        "flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
        mobile ? "flex-col justify-center gap-1 px-1 text-[11px]" : "",
        active
          ? "bg-accent text-primary"
          : "text-muted-foreground hover:bg-muted",
      );
      return availableRoutes.includes(href) ? (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={classes}
        >
          <Icon aria-hidden="true" size={19} />
          {label}
        </Link>
      ) : (
        <span
          key={href}
          aria-disabled="true"
          title={`${label} will be available in a later build stage`}
          className={cn(classes, "cursor-not-allowed opacity-55")}
        >
          <Icon aria-hidden="true" size={19} />
          {label}
          {!mobile ? <span className="ml-auto text-[10px]">Soon</span> : null}
        </span>
      );
    });
  }
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card px-5 py-6 lg:flex">
        <Brand />
        <p className="mt-8 px-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Your study space
        </p>
        <nav aria-label="Learner navigation" className="mt-3 space-y-1">
          {navItems(false)}
        </nav>
        <div className="mt-auto rounded-xl bg-accent p-4">
          <p className="text-sm font-medium text-primary">
            One concept at a time.
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Build understanding, then put it into practice.
          </p>
        </div>
      </aside>
      <header className="border-b bg-card px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              AZ-900 study companion
            </span>
            {isDemo ? <Badge tone="info">Demo learner</Badge> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeSelect />
            <span className="flex items-center gap-2 text-sm">
              <UserRound aria-hidden="true" size={18} />
              {displayName}
            </span>
            {availableRoutes.includes("/settings") ? (
              <Link
                href="/settings"
                aria-label="Profile and settings"
                className="rounded-lg p-3 hover:bg-muted"
              >
                <Settings aria-hidden="true" size={18} />
              </Link>
            ) : (
              <span
                title="Settings are coming soon"
                aria-label="Settings unavailable"
                aria-disabled="true"
                className="p-3 text-muted-foreground opacity-50"
              >
                <Settings aria-hidden="true" size={18} />
              </span>
            )}
          </div>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-8 lg:pb-10"
      >
        {children}
      </main>
      <nav
        aria-label="Mobile learner navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {navItems(true)}
      </nav>
    </div>
  );
}
