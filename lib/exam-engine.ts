import type { ExamConfig, Question, QuestionType } from "@/lib/exams";
import { computeDeepAnalysis, type ResultAnalysis } from "@/lib/result-analysis";

export type { ResultAnalysis };

export type QuestionStatus = "notVisited" | "notAnswered" | "answered" | "marked" | "answeredMarked";

export type TestState = {
  answers: Record<string, string>;
  statuses: Record<string, QuestionStatus>;
  visited: Record<string, boolean>;
  review: Record<string, boolean>;
  timeSpent: Record<string, number>;
  currentQuestionId: string;
  remainingSeconds: number;
  unlockedBonus: boolean;
  startedAt: number;
};

export type ResultPayload = {
  examId: string;
  examName: string;
  score: number;
  maxScore: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  subjects: Array<{
    subject: string;
    attempted: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    score: number;
  }>;
  questions: Array<{
    id: string;
    index: number;
    section: string;
    subject: string;
    type: QuestionType;
    isBonus?: boolean;
    text: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    explanation: string;
    status: QuestionStatus;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  analysis?: ResultAnalysis;
};

export function getVisibleQuestions(exam: ExamConfig, unlockedBonus: boolean) {
  if (!exam.bonusUnlock) {
    return exam.questions;
  }

  return unlockedBonus
    ? exam.questions
    : exam.questions.filter((question) => !question.isBonus);
}

export function getQuestionStatus(hasAnswer: boolean, isMarked: boolean, visited: boolean): QuestionStatus {
  if (isMarked && hasAnswer) return "answeredMarked";
  if (isMarked) return "marked";
  if (hasAnswer) return "answered";
  if (visited) return "notAnswered";
  return "notVisited";
}

export function createInitialState(exam: ExamConfig): TestState {
  const firstQuestion = getVisibleQuestions(exam, false)[0];

  return {
    answers: {},
    statuses: {},
    visited: { [firstQuestion.id]: true },
    review: {},
    timeSpent: {},
    currentQuestionId: firstQuestion.id,
    remainingSeconds: exam.durationMinutes * 60,
    unlockedBonus: false,
    startedAt: Date.now(),
  };
}

export function shouldUnlockBonus(exam: ExamConfig, answers: Record<string, string>) {
  if (!exam.bonusUnlock) {
    return false;
  }

  const baseQuestions = exam.questions.filter((question) => !question.isBonus);
  return baseQuestions.every((question) => Boolean(answers[question.id]));
}

export function calculateResult(exam: ExamConfig, state: TestState): ResultPayload {
  const visibleQuestions = getVisibleQuestions(exam, state.unlockedBonus);
  let score = 0;
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;

  const subjectMap = new Map<string, ResultPayload["subjects"][number]>();

  const detailedQuestions = visibleQuestions.map((question) => {
    const selectedAnswer = state.answers[question.id] ?? null;
    const didAttempt = Boolean(selectedAnswer);
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (didAttempt) {
      attempted += 1;
      if (isCorrect) {
        score += exam.scoring.correct;
        correct += 1;
      } else {
        score += exam.scoring.incorrect;
        incorrect += 1;
      }
    }

    const aggregate = subjectMap.get(question.subject) ?? {
      subject: question.subject,
      attempted: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 0,
      score: 0,
    };

    if (didAttempt) {
      aggregate.attempted += 1;
      if (isCorrect) {
        aggregate.correct += 1;
        aggregate.score += exam.scoring.correct;
      } else {
        aggregate.incorrect += 1;
        aggregate.score += exam.scoring.incorrect;
      }
    }

    subjectMap.set(question.subject, aggregate);

    return {
      id: question.id,
      index: question.index,
      section: question.section,
      subject: question.subject,
      type: question.type,
      isBonus: question.isBonus,
      text: question.text,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      status: state.statuses[question.id] ?? "notVisited",
      isCorrect,
      timeSpent: state.timeSpent[question.id] ?? 0,
    };
  });

  const subjects = Array.from(subjectMap.values()).map((subject) => ({
    ...subject,
    accuracy: subject.attempted ? Math.round((subject.correct / subject.attempted) * 100) : 0,
  }));

  const analysis = computeDeepAnalysis(
    exam,
    detailedQuestions.map((q) => ({
      index: q.index,
      section: q.section,
      subject: q.subject,
      type: q.type,
      isBonus: q.isBonus,
      selectedAnswer: q.selectedAnswer,
      isCorrect: q.isCorrect,
      timeSpent: q.timeSpent,
      status: q.status,
    })),
  );

  return {
    examId: exam.id,
    examName: exam.name,
    score,
    maxScore: exam.maxMarks,
    attempted,
    correct,
    incorrect,
    accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
    subjects,
    questions: detailedQuestions,
    analysis,
  };
}

export function findQuestionIndex(questions: Question[], questionId: string) {
  return questions.findIndex((question) => question.id === questionId);
}
