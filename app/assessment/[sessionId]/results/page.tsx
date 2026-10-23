"use client";
import { Suspense, use } from "react";
import { DiagnosticResults } from "@/components/assessment/diagnostic-results";
import { LoadingState } from "@/components/ui/states";

export default function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <Suspense
      fallback={<LoadingState label="Opening your diagnostic results…" />}
    >
      <ResultsPage params={params} />
    </Suspense>
  );
}
function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  return <DiagnosticResults key={sessionId} sessionId={sessionId} />;
}
