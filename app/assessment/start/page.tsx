import type { Metadata } from "next";
import { DiagnosticSetup } from "@/components/assessment/diagnostic-setup";

export const metadata: Metadata = {
  title: "Start your diagnostic",
  robots: { index: false },
};
export default function Page() {
  return <DiagnosticSetup />;
}
