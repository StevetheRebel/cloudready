import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
export const metadata: Metadata = {
  title: "Your study preferences",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <OnboardingWizard />;
}
