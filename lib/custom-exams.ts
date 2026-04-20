import { prisma } from "@/lib/db";
import type { ExamConfig } from "@/lib/exams";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomExamRow = any;

function mapQuestion(q: CustomExamRow) {
  return {
    id: q.id as string,
    index: q.index as number,
    section: q.section as string,
    subject: q.subject as string,
    type: q.type as "mcq" | "numerical",
    text: q.text as string,
    options: q.options ? JSON.parse(q.options as string) : undefined,
    correctAnswer: q.correctAnswer as string,
    explanation: q.explanation as string,
    image: (q.image as string | null) ?? undefined,
    isBonus: q.isBonus as boolean,
  };
}

function mapExam(customExam: CustomExamRow): ExamConfig {
  return {
    id: customExam.id,
    name: customExam.name,
    durationMinutes: customExam.durationMinutes,
    maxMarks: customExam.maxMarks,
    cardDetails: customExam.cardDetails,
    scoring: {
      correct: customExam.scoringCorrect,
      incorrect: customExam.scoringIncorrect,
    },
    baseExamId: customExam.baseExamId ?? undefined,
    isPremium: customExam.isPremium,
    category: customExam.category ?? undefined,
    section: customExam.section ?? undefined,
    instructions: JSON.parse(customExam.instructions),
    paletteLegend: JSON.parse(customExam.paletteLegend),
    questions: (customExam.questions ?? []).map(mapQuestion),
  };
}

export async function getCustomExam(examId: string): Promise<ExamConfig | null> {
  const customExam = await prisma.customExam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { index: "asc" } } },
  });
  if (!customExam) return null;
  return mapExam(customExam);
}

export async function getAllCustomExams(): Promise<ExamConfig[]> {
  const exams = await prisma.customExam.findMany({
    where: { published: true },
    include: { questions: { orderBy: { index: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return exams.map(mapExam);
}

export async function getAllCustomExamsAdmin() {
  const exams = await prisma.customExam.findMany({
    include: { questions: { orderBy: { index: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return exams.map((e: CustomExamRow) => ({ ...mapExam(e), published: e.published as boolean }));
}
