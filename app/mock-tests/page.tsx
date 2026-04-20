import { MockTestsBoard } from "@/components/mock-tests-board";
import { examConfigs, type ExamId } from "@/lib/exams";
import { getAllCustomExams } from "@/lib/custom-exams";
import type { MockTest } from "@/lib/mock-tests";
import { prisma } from "@/lib/db";

export default async function MockTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam } = await searchParams;
  const examId = (exam && exam in examConfigs ? exam : "jee") as ExamId;

  const customConfigs = await getAllCustomExams();
  const filteredCustom = customConfigs.filter(c => c.baseExamId === examId);
  const customMockTests: MockTest[] = filteredCustom.map(c => ({
    id: c.id,
    examId: examId,
    title: c.name,
    subtitle: c.cardDetails,
    status: "not_attempted",
    score: 0,
    maxScore: c.maxMarks,
    accuracy: 0,
    questionsMistaken: 0,
    pace: 0,
    category: c.category || "Custom Tests",
    section: c.section || "Admin Created",
    requiresPremium: c.isPremium || false,
  }));

  const layout = await prisma.examLayout.findUnique({ where: { examId } });
  const layoutGroups = layout ? JSON.parse(layout.groups) : undefined;

  return <MockTestsBoard examId={examId} customMockTests={customMockTests} layoutGroups={layoutGroups} />;
}
