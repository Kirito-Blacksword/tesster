import { Suspense } from "react";
import { ResultCenter } from "@/components/result-center";

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10">Loading result center...</div>}>
      <ResultCenter />
    </Suspense>
  );
}
