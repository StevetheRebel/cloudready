"use client";
import { Suspense, use } from "react";
import { AssessmentRunner } from "@/components/assessment/assessment-runner";
import { LoadingState } from "@/components/ui/states";

export default function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState label="Opening your diagnostic…" />}>
      <SessionPage params={params} />
    </Suspense>
  );
}
function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  return <AssessmentRunner key={sessionId} sessionId={sessionId} />;
}
