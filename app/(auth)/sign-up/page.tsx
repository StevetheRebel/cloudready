import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";
export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <SignUpForm />;
}
