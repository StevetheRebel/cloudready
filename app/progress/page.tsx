import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress/progress-dashboard";

export const metadata: Metadata = {
  title: "Progress",
  robots: { index: false },
};
export default function Page() {
  return <ProgressDashboard />;
}
