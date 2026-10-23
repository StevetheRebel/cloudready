"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
const ToastContext = createContext<((message: string) => void) | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((value: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(value);
    timer.current = setTimeout(() => setMessage(""), 6000);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <ToastContext value={notify}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed right-4 bottom-4 left-4 z-60 sm:left-auto sm:max-w-sm"
      >
        {message ? (
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-lg">
            <CheckCircle2 className="shrink-0 text-success" size={20} />
            <p className="flex-1 text-sm">{message}</p>
            <Button
              variant="ghost"
              className="px-2"
              aria-label="Dismiss notification"
              onClick={() => setMessage("")}
            >
              <X size={16} />
            </Button>
          </div>
        ) : null}
      </div>
    </ToastContext>
  );
}
export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used inside ToastProvider");
  return notify;
}
