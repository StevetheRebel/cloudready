import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
export const metadata: Metadata = {
  title: "Password recovery preview",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <ForgotPasswordForm />;
}
