"use client";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast-provider";
import { NetworkStatus } from "@/components/network-status";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey="cloudready:theme"
    >
      <ToastProvider>
        <NetworkStatus />
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
