import type { Metadata } from "next";
import { SettingsDashboard } from "@/components/settings/settings-dashboard";
export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};
export default function Page() {
  return <SettingsDashboard />;
}
