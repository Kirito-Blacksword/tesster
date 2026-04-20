import type { ResultPayload } from "@/lib/exam-engine";
import type { ExamConfig, ExamId } from "@/lib/exams";
import type { MockTest } from "@/lib/mock-tests";

const STORAGE_KEY = "tesster_attempts_v1";

export type UserAttemptRecord = {
  id: string;
  examId: ExamId;
  testId: string;
  finishedAt: number;
  score: number;
  maxScore: number;
  accuracy: number;
  incorrect: number;
  pace: number;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadUserAttempts(): UserAttemptRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as UserAttemptRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveUserAttempts(attempts: UserAttemptRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}

export function recordAttemptFromResult(
  exam: ExamConfig,
  result: ResultPayload,
  testId: string,
): UserAttemptRecord {
  const durationSec = exam.durationMinutes * 60;
  const totalTimeSpent = result.questions.reduce((sum, question) => sum + question.timeSpent, 0);
  const pace =
    durationSec > 0 ? Math.min(100, Math.round((totalTimeSpent / durationSec) * 100)) : 0;

  const record: UserAttemptRecord = {
    id: generateId(),
    examId: exam.id,
    testId,
    finishedAt: Date.now(),
    score: result.score,
    maxScore: result.maxScore,
    accuracy: result.accuracy,
    incorrect: result.incorrect,
    pace,
  };

  const existing = loadUserAttempts();
  saveUserAttempts([...existing, record]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tesster-attempts-updated"));
  }
  return record;
}

export function getAttemptsForExam(examId: ExamId, attempts: UserAttemptRecord[]): UserAttemptRecord[] {
  return attempts.filter((attempt) => attempt.examId === examId);
}

export function computeQuickAnalysisFromAttempts(
  examId: ExamId,
  attempts: UserAttemptRecord[],
): {
  accuracy: string;
  mistaken: string;
  bestPace: string;
  attempted: number;
} {
  const list = getAttemptsForExam(examId, attempts);
  if (list.length === 0) {
    return {
      accuracy: "—",
      mistaken: "0",
      bestPace: "—",
      attempted: 0,
    };
  }

  const totalAccuracy = list.reduce((sum, attempt) => sum + attempt.accuracy, 0);
  const avgAccuracy = totalAccuracy / list.length;
  const totalMistakes = list.reduce((sum, attempt) => sum + attempt.incorrect, 0);
  const avgPace = list.reduce((sum, attempt) => sum + attempt.pace, 0) / list.length;

  return {
    accuracy: `${avgAccuracy.toFixed(1)}%`,
    mistaken: `${totalMistakes}`,
    bestPace: `${avgPace.toFixed(1)}%`,
    attempted: list.length,
  };
}

/** Latest attempt for a catalog test id (if any). */
export function getLatestAttemptForTest(
  testId: string,
  attempts: UserAttemptRecord[],
): UserAttemptRecord | undefined {
  const forTest = attempts.filter((attempt) => attempt.testId === testId);
  if (forTest.length === 0) return undefined;
  return forTest.reduce((latest, current) =>
    current.finishedAt > latest.finishedAt ? current : latest,
  );
}

export function mergeCatalogWithAttempts(
  tests: MockTest[],
  attempts: UserAttemptRecord[],
): MockTest[] {
  return tests.map((test) => {
    const latest = getLatestAttemptForTest(test.id, attempts);
    if (!latest) {
      return {
        ...test,
        status: "not_attempted",
        score: 0,
        accuracy: 0,
        questionsMistaken: 0,
        pace: 0,
      };
    }
    return {
      ...test,
      status: "attempted" as const,
      score: latest.score,
      maxScore: latest.maxScore,
      accuracy: latest.accuracy,
      questionsMistaken: latest.incorrect,
      pace: latest.pace,
    };
  });
}
