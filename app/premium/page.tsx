import { PremiumExperience } from "@/components/premium-experience";
import { examConfigs, type ExamId } from "@/lib/exams";

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam } = await searchParams;
  const examId = (exam && exam in examConfigs ? exam : "jee") as ExamId;

  return <PremiumExperience examId={examId} />;
}
