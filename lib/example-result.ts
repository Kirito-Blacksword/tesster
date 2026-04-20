import type { QuestionStatus, ResultPayload } from "@/lib/exam-engine";
import { getExamConfig } from "@/lib/exams";
import { computeDeepAnalysis } from "@/lib/result-analysis";

function aggregateSubjects(
  questions: ResultPayload["questions"],
  scoring: { correct: number; incorrect: number },
): ResultPayload["subjects"] {
  const map = new Map<string, { attempted: number; correct: number; incorrect: number; score: number }>();
  for (const q of questions) {
    if (!q.selectedAnswer) continue;
    const cur = map.get(q.subject) ?? { attempted: 0, correct: 0, incorrect: 0, score: 0 };
    cur.attempted += 1;
    if (q.isCorrect) {
      cur.correct += 1;
      cur.score += scoring.correct;
    } else {
      cur.incorrect += 1;
      cur.score += scoring.incorrect;
    }
    map.set(q.subject, cur);
  }
  return Array.from(map.entries()).map(([subject, v]) => ({
    subject,
    attempted: v.attempted,
    correct: v.correct,
    incorrect: v.incorrect,
    score: v.score,
    accuracy: v.attempted ? Math.round((v.correct / v.attempted) * 100) : 0,
  }));
}

/**
 * Rich sample result for `/results?demo=1` — uses real JEE question stems with synthetic attempt data.
 */
export function getExampleJeeResult(): ResultPayload {
  const exam = getExamConfig("jee")!;
  const sample = exam.questions.slice(0, 28);
  const { correct: mc, incorrect: mi } = exam.scoring;

  const questions: ResultPayload["questions"] = sample.map((q, i) => {
    const cycle = i % 7;
    const timeBase = [38, 95, 52, 120, 44, 78, 61][cycle] + (i % 5) * 4;

    if (cycle === 3) {
      return {
        id: q.id,
        index: q.index,
        section: q.section,
        subject: q.subject,
        type: q.type,
        isBonus: q.isBonus,
        text: q.text,
        selectedAnswer: null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        status: "notAnswered" as QuestionStatus,
        isCorrect: false,
        timeSpent: timeBase,
      };
    }

    if (cycle === 5) {
      return {
        id: q.id,
        index: q.index,
        section: q.section,
        subject: q.subject,
        type: q.type,
        isBonus: q.isBonus,
        text: q.text,
        selectedAnswer: q.options?.[2]?.text ?? "distractor",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        status: "answeredMarked" as QuestionStatus,
        isCorrect: false,
        timeSpent: timeBase,
      };
    }

    const isCorrect = cycle === 0 || cycle === 2 || cycle === 6;
    return {
      id: q.id,
      index: q.index,
      section: q.section,
      subject: q.subject,
      type: q.type,
      isBonus: q.isBonus,
      text: q.text,
      selectedAnswer: isCorrect ? q.correctAnswer : (q.options?.[1]?.text ?? "distractor"),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      status: (cycle === 2 ? "answeredMarked" : "answered") as QuestionStatus,
      isCorrect,
      timeSpent: timeBase,
    };
  });

  let score = 0;
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  for (const q of questions) {
    if (!q.selectedAnswer) continue;
    attempted += 1;
    if (q.isCorrect) {
      correct += 1;
      score += mc;
    } else {
      incorrect += 1;
      score += mi;
    }
  }

  const subjects = aggregateSubjects(questions, exam.scoring);
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;

  const analysis = computeDeepAnalysis(
    exam,
    questions.map((row) => ({
      index: row.index,
      section: row.section,
      subject: row.subject,
      type: row.type,
      isBonus: row.isBonus,
      selectedAnswer: row.selectedAnswer,
      isCorrect: row.isCorrect,
      timeSpent: row.timeSpent,
      status: row.status,
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
    accuracy,
    subjects,
    questions,
    analysis,
  };
}
