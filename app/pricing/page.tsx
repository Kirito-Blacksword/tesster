import { PricingPlans } from "@/components/pricing-plans";
import { examConfigs, type ExamId } from "@/lib/exams";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam } = await searchParams;
  const highlightExamId = exam && exam in examConfigs ? (exam as ExamId) : undefined;

  return <PricingPlans highlightExamId={highlightExamId} />;
}
