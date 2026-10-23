import type { Metadata } from "next";
import { FoundationPreview } from "@/components/foundation-preview";
export const metadata: Metadata = {
  title: "Foundation preview",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <FoundationPreview />;
}
