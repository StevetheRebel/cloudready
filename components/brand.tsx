import Link from "next/link";
import { Cloud } from "lucide-react";
export function Brand() {
  return (
    <Link
      href="/"
      aria-label="CloudReady home"
      className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight"
    >
      <span className="rounded-xl bg-primary p-2 text-primary-foreground">
        <Cloud aria-hidden="true" size={22} strokeWidth={1.8} />
      </span>
      <span>
        Cloud<span className="text-primary">Ready</span>
      </span>
    </Link>
  );
}
