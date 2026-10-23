import type { Metadata } from "next";
import { LearningLibrary } from "@/components/learn/learning-library";
export const metadata: Metadata = {
  title: "Learning library",
  robots: { index: false },
};
export default function Page() {
  return <LearningLibrary />;
}
