import type { Metadata } from "next";
import { RevisionDashboard } from "@/components/revision/revision-dashboard";
export const metadata: Metadata = {
  title: "Revision",
  robots: { index: false },
};
export default function Page() {
  return <RevisionDashboard />;
}
