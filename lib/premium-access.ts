import type { ExamId } from "@/lib/exams";
import { mockTests } from "@/lib/mock-tests";

/** Direct `/exam/[id]` without a catalog test id — treated as the free starter attempt. */
export function isOpenPracticeTestId(examId: ExamId, testId: string): boolean {
  return testId === `${examId}-open`;
}

export function getCatalogTestById(testId: string) {
  return mockTests.find((test) => test.id === testId);
}

export function canAccessMockTest(
  examId: ExamId,
  testId: string,
  hasPremiumForExam: (id: ExamId) => boolean,
): boolean {
  if (isOpenPracticeTestId(examId, testId)) {
    return true;
  }
  const catalog = getCatalogTestById(testId);
  if (!catalog || catalog.examId !== examId) {
    return true;
  }
  if (!catalog.requiresPremium) {
    return true;
  }
  return hasPremiumForExam(examId);
}
