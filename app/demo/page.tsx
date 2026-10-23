import type { Metadata } from "next";
import { DemoSpace } from "@/components/auth/demo-space";
export const metadata: Metadata = {
  title: "Demo study space",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <DemoSpace />;
}
