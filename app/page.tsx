import { HomeDashboard } from "@/components/home-dashboard";
import { examConfigs, type ExamId } from "@/lib/exams";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam } = await searchParams;
  const activeExamId = (exam && exam in examConfigs ? exam : "jee") as ExamId;

  return <HomeDashboard activeExamId={activeExamId} />;
}
