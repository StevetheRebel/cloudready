import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { LoadingState } from "@/components/ui/states";
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Loading sign-in…" />}>
      <SignInForm />
    </Suspense>
  );
}
