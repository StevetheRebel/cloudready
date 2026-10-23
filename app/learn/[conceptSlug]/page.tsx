import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { concepts } from "@/lib/cloudready/content";
import { ConceptLesson } from "@/components/learn/concept-lesson";
import { LoadingState } from "@/components/ui/states";
export const metadata: Metadata = {
  title: "Concept lesson",
  robots: { index: false },
};
export function generateStaticParams() {
  return concepts.map((concept) => ({ conceptSlug: concept.slug }));
}
export default function Page({
  params,
}: {
  params: Promise<{ conceptSlug: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState label="Opening your lesson…" />}>
      <LessonRoute params={params} />
    </Suspense>
  );
}
async function LessonRoute({
  params,
}: {
  params: Promise<{ conceptSlug: string }>;
}) {
  const { conceptSlug } = await params;
  const concept = concepts.find((item) => item.slug === conceptSlug);
  if (!concept) notFound();
  return <ConceptLesson conceptId={concept.id} />;
}
