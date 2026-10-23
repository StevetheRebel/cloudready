"use client";
import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}
export function NetworkStatus() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  return online ? null : (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning-soft px-4 py-3 text-sm text-warning"
    >
      <WifiOff aria-hidden="true" size={17} />
      You’re offline. Local demo changes can still be saved in this browser.
    </div>
  );
}
