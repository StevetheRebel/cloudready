"use client";
import { Suspense, use } from "react";
import { PracticeResults } from "@/components/practice/practice-results";
import { LoadingState } from "@/components/ui/states";
export default function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState label="Opening practice results…" />}>
      <Results params={params} />
    </Suspense>
  );
}
function Results({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  return <PracticeResults key={sessionId} sessionId={sessionId} />;
}
