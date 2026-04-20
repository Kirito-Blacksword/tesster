import { notFound } from "next/navigation";
import { ExamShell } from "@/components/exam-shell";
import { getExamConfig, type ExamConfig } from "@/lib/exams";
import { getCustomExam } from "@/lib/custom-exams";

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ testId?: string }>;
}) {
  const { examId } = await params;
  const { testId } = await searchParams;
  let exam: ExamConfig | undefined;

  if (testId) {
    exam = (await getCustomExam(testId)) ?? undefined;
    if (!exam) {
      notFound();
    }
  } else {
    exam = getExamConfig(examId);
    if (!exam) {
      exam = (await getCustomExam(examId)) ?? undefined;
    }
    if (!exam) {
      notFound();
    }
  }

  return <ExamShell exam={exam} testId={testId} />;
}
