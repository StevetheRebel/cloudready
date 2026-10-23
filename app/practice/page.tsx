import { Suspense } from "react";
import type { Metadata } from "next";
import { PracticeSetup } from "@/components/practice/practice-setup";
import { LoadingState } from "@/components/ui/states";
export const metadata: Metadata = {
  title: "Practice",
  robots: { index: false },
};
export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Opening practice setup…" />}>
      <PracticeSetup />
    </Suspense>
  );
}
