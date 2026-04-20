import { examConfigs, type ExamId } from "@/lib/exams";

export type MockTestStatus = "attempted" | "not_attempted" | "upcoming" | "resume";

export type MockTest = {
  id: string;
  examId: ExamId;
  title: string;
  subtitle: string;
  status: MockTestStatus;
  score: number;
  maxScore: number;
  accuracy: number;
  questionsMistaken: number;
  pace: number;
  category: string;
  section: string;
  /** Full Test 1 per exam is free; numbered tests 2+ need premium for that exam (or all-access). */
  requiresPremium: boolean;
};

export type ExamSeries = {
  examId: ExamId;
  title: string;
  groups: Array<{
    label: string;
    items: Array<{
      id: string;
      label: string;
      badge?: string;
    }>;
  }>;
};

const makeTests = (
  examId: ExamId,
  items: Array<{
    num: number;
    score: number;
    accuracy: number;
    questionsMistaken: number;
    pace: number;
    status: MockTestStatus;
    category: string;
    section: string;
  }>,
): MockTest[] =>
  items.map((item) => ({
    id: `${examId}-test-${item.num}`,
    examId,
    title: `${examConfigs[examId].name} Full Test ${item.num}`,
    subtitle: `${examConfigs[examId].cardDetails} • Detailed solutions available`,
    maxScore: examConfigs[examId].maxMarks,
    requiresPremium: item.num > 1,
    ...item,
  }));

export const mockTests: MockTest[] = [];

export const examSeries: Record<ExamId, ExamSeries> = {
  jee: {
    examId: "jee",
    title: "JEE Main Mock Tests",
    groups: [
      {
        label: "Tesster Mock Tests",
        items: [{ id: "jee-series", label: "JEE Main 2026 Series" }],
      },
      {
        label: "PYQs as Mock Tests",
        items: [
          { id: "jee-2025", label: "2025 PYQs" },
          { id: "jee-2024", label: "2024 PYQs", badge: "New" },
          { id: "jee-rpyq", label: "Reordered 2023-2021" },
        ],
      },
    ],
  },
  bitsat: {
    examId: "bitsat",
    title: "BITSAT Mock Tests",
    groups: [
      {
        label: "Tesster Mock Tests",
        items: [{ id: "bitsat-series", label: "BITSAT Power Series" }],
      },
      {
        label: "Targeted Practice",
        items: [
          { id: "bitsat-speed", label: "English + LR Speed Drills" },
          { id: "bitsat-bonus", label: "Bonus Simulators" },
        ],
      },
    ],
  },
  comedk: {
    examId: "comedk",
    title: "COMEDK Mock Tests",
    groups: [
      {
        label: "Tesster Mock Tests",
        items: [{ id: "comedk-series", label: "COMEDK 2026 Cycle" }],
      },
      {
        label: "PYQ Practice",
        items: [{ id: "comedk-pyq", label: "2025 PYQs" }],
      },
    ],
  },
  kcet: {
    examId: "kcet",
    title: "KCET Mock Tests",
    groups: [
      {
        label: "Tesster Mock Tests",
        items: [{ id: "kcet-series", label: "KCET 2026 Cycle" }],
      },
      {
        label: "Subject Boosters",
        items: [{ id: "kcet-boosters", label: "PCM Sectional Mix" }],
      },
    ],
  },
};

export function getExamMockTests(examId: ExamId) {
  return mockTests.filter((test) => test.examId === examId);
}
