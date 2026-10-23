import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingState } from "@/components/ui/states";
export const metadata: Metadata = {
  title: "Reset password preview",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Opening reset preview…" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
