import { Badge } from "@/components/ui/badge";
export function DemoNotice() {
  return (
    <div className="mb-6 rounded-xl border border-warning/20 bg-warning-soft px-4 py-3">
      <Badge tone="warning" className="px-0 py-0">
        Demo account preview
      </Badge>
      <p className="mt-1 text-xs leading-6 text-warning">
        Use sample details, not your real password. No account is created and no
        email is sent.
      </p>
    </div>
  );
}
