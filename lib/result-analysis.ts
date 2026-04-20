import type { ExamConfig, QuestionType } from "@/lib/exams";

export type QuestionPaletteStatus =
  | "notVisited"
  | "notAnswered"
  | "answered"
  | "marked"
  | "answeredMarked";

export type ResultAnalysis = {
  paper: {
    totalInPaper: number;
    attempted: number;
    correct: number;
    incorrect: number;
    skipped: number;
    notVisited: number;
    markedForReview: number;
    bonusAttempted: number;
    bonusCorrect: number;
    bonusIncorrect: number;
  };
  scoring: {
    marksPerCorrect: number;
    marksPerIncorrect: number;
    rawMarksFromCorrect: number;
    rawMarksLostToWrong: number;
    scoreEfficiencyPct: number;
    attemptYield: number;
  };
  time: {
    paperDurationSec: number;
    totalTrackedSec: number;
    utilizationPct: number;
    avgSecPerAttempted: number;
    avgSecWhenCorrect: number;
    avgSecWhenWrong: number;
    medianSecAttempted: number;
    idealAvgSecPerQ: number;
    slowest: { index: number; seconds: number; subject: string };
    fastestAttempted: { index: number; seconds: number; subject: string };
  };
  subjectsRanked: Array<{
    subject: string;
    attempted: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    score: number;
    shareOfAttemptsPct: number;
    avgTimeSec: number;
  }>;
  sections: Array<{
    section: string;
    attempted: number;
    correct: number;
    accuracy: number;
    avgTimeSec: number;
  }>;
  byQuestionType: {
    mcq: { attempted: number; correct: number; accuracy: number; avgTimeSec: number };
    numerical: { attempted: number; correct: number; accuracy: number; avgTimeSec: number };
  };
  riskFlags: {
    rushProne: boolean;
    timeLeftOnTable: boolean;
    subjectGap: number;
    weakSubject?: string;
    strongSubject?: string;
  };
  insights: string[];
};

type Row = {
  index: number;
  section: string;
  subject: string;
  type: QuestionType;
  isBonus?: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeSpent: number;
  status: QuestionPaletteStatus;
};

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : ((s[m - 1]! + s[m]!) / 2);
}

export function computeDeepAnalysis(exam: ExamConfig, rows: Row[]): ResultAnalysis {
  const totalInPaper = rows.length;
  let skipped = 0;
  let notVisited = 0;
  let markedForReview = 0;
  let bonusAttempted = 0;
  let bonusCorrect = 0;
  let bonusIncorrect = 0;

  for (const r of rows) {
    if (r.status === "notVisited") notVisited += 1;
    else if (!r.selectedAnswer) skipped += 1;
    if (r.status === "marked" || r.status === "answeredMarked") markedForReview += 1;
    if (r.isBonus && r.selectedAnswer) {
      bonusAttempted += 1;
      if (r.isCorrect) bonusCorrect += 1;
      else bonusIncorrect += 1;
    }
  }

  const attemptedRows = rows.filter((r) => r.selectedAnswer);
  const correctRows = attemptedRows.filter((r) => r.isCorrect);
  const wrongRows = attemptedRows.filter((r) => !r.isCorrect);

  const totalTrackedSec = rows.reduce((s, r) => s + r.timeSpent, 0);
  const paperDurationSec = exam.durationMinutes * 60;
  const utilizationPct =
    paperDurationSec > 0 ? Math.min(100, Math.round((totalTrackedSec / paperDurationSec) * 100)) : 0;

  const timesAttempted = attemptedRows.map((r) => r.timeSpent);
  const avgSecPerAttempted =
    attemptedRows.length > 0 ? Math.round(totalTrackedSec / attemptedRows.length) : 0;
  const avgSecWhenCorrect =
    correctRows.length > 0
      ? Math.round(correctRows.reduce((s, r) => s + r.timeSpent, 0) / correctRows.length)
      : 0;
  const avgSecWhenWrong =
    wrongRows.length > 0      ? Math.round(wrongRows.reduce((s, r) => s + r.timeSpent, 0) / wrongRows.length)
      : 0;
  const medianSecAttempted = Math.round(median(timesAttempted));
  const idealAvgSecPerQ =
    totalInPaper > 0 ? Math.round(paperDurationSec / totalInPaper) : 0;

  let slowest = { index: 0, seconds: 0, subject: "" };
  let fastestAttempted = { index: 0, seconds: Number.POSITIVE_INFINITY, subject: "" };
  for (const r of rows) {
    if (r.timeSpent > slowest.seconds) {
      slowest = { index: r.index, seconds: r.timeSpent, subject: r.subject };
    }
    if (r.selectedAnswer && r.timeSpent < fastestAttempted.seconds) {
      fastestAttempted = { index: r.index, seconds: r.timeSpent, subject: r.subject };
    }
  }
  if (fastestAttempted.seconds === Number.POSITIVE_INFINITY) {
    fastestAttempted = { index: 0, seconds: 0, subject: "" };
  }

  const correct = correctRows.length;
  const incorrect = wrongRows.length;
  const attempted = attemptedRows.length;
  const mc = exam.scoring.correct;
  const mi = exam.scoring.incorrect;
  const rawMarksFromCorrect = correct * mc;
  const rawMarksLostToWrong = incorrect * Math.abs(mi);
  const netScore = correct * mc + incorrect * mi;
  const scoreEfficiencyPct =
    exam.maxMarks > 0 ? Math.round((netScore / exam.maxMarks) * 100) : 0;
  const attemptYield = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  const subjectMap = new Map<
    string,
    { attempted: number; correct: number; incorrect: number; score: number; time: number }
  >();
  for (const r of attemptedRows) {
    const cur = subjectMap.get(r.subject) ?? {
      attempted: 0,
      correct: 0,
      incorrect: 0,
      score: 0,
      time: 0,
    };
    cur.attempted += 1;
    cur.time += r.timeSpent;
    if (r.isCorrect) {
      cur.correct += 1;
      cur.score += mc;
    } else {
      cur.incorrect += 1;
      cur.score += mi;
    }
    subjectMap.set(r.subject, cur);
  }

  const subjectsRanked = Array.from(subjectMap.entries())
    .map(([subject, v]) => ({
      subject,
      attempted: v.attempted,
      correct: v.correct,
      incorrect: v.incorrect,
      accuracy: v.attempted ? Math.round((v.correct / v.attempted) * 100) : 0,
      score: v.score,
      shareOfAttemptsPct: attempted > 0 ? Math.round((v.attempted / attempted) * 100) : 0,
      avgTimeSec: v.attempted ? Math.round(v.time / v.attempted) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const sectionMap = new Map<string, { attempted: number; correct: number; time: number }>();
  for (const r of attemptedRows) {
    const cur = sectionMap.get(r.section) ?? { attempted: 0, correct: 0, time: 0 };
    cur.attempted += 1;
    cur.time += r.timeSpent;
    if (r.isCorrect) cur.correct += 1;
    sectionMap.set(r.section, cur);
  }

  const sections = Array.from(sectionMap.entries())
    .map(([section, v]) => ({
      section,
      attempted: v.attempted,
      correct: v.correct,
      accuracy: v.attempted ? Math.round((v.correct / v.attempted) * 100) : 0,
      avgTimeSec: v.attempted ? Math.round(v.time / v.attempted) : 0,
    }))
    .sort((a, b) => b.attempted - a.attempted);

  const byType = (t: QuestionType) => {
    const list = attemptedRows.filter((r) => r.type === t);
    const cor = list.filter((r) => r.isCorrect).length;
    const att = list.length;
    const time = list.reduce((s, r) => s + r.timeSpent, 0);
    return {
      attempted: att,
      correct: cor,
      accuracy: att ? Math.round((cor / att) * 100) : 0,
      avgTimeSec: att ? Math.round(time / att) : 0,
    };
  };

  const byQuestionType = {
    mcq: byType("mcq"),
    numerical: byType("numerical"),
  };

  const overallAcc = attempted ? Math.round((correct / attempted) * 100) : 0;
  const weak = subjectsRanked[0];
  const strong = subjectsRanked[subjectsRanked.length - 1];
  const subjectGap =
    subjectsRanked.length >= 2 ? (strong?.accuracy ?? 0) - (weak?.accuracy ?? 0) : 0;

  const rushProne =
    wrongRows.length > 0 &&
    correctRows.length > 0 &&
    avgSecWhenWrong > 0 &&
    avgSecWhenWrong < avgSecWhenCorrect * 0.75;
  const timeLeftOnTable = utilizationPct < 65 && attempted > 0;

  const insights: string[] = [];

  if (weak && subjectsRanked.length > 1 && weak.accuracy < overallAcc - 8) {
    insights.push(
      `${weak.subject} is pulling your composite accuracy down (${weak.accuracy}% vs ${overallAcc}% overall). Schedule one focused revision block there before the next full mock.`,
    );
  }

  if (strong && strong.accuracy >= 75) {
    insights.push(
      `${strong.subject} is your most reliable block (${strong.accuracy}% on ${strong.attempted} attempts)—use it to bank time for harder stems elsewhere.`,
    );
  }

  if (subjectGap >= 25 && weak && strong) {
    insights.push(
      `You have a ${subjectGap} point accuracy gap between your weakest (${weak.subject}) and strongest (${strong.subject}) subjects—prioritise drills on the weaker side.`,
    );
  }

  if (byQuestionType.numerical.attempted > 0 && byQuestionType.mcq.attempted > 0) {
    if (byQuestionType.numerical.accuracy + 12 < byQuestionType.mcq.accuracy) {
      insights.push(
        `Numericals are underperforming MCQs (${byQuestionType.numerical.accuracy}% vs ${byQuestionType.mcq.accuracy}%). Re-check rounding, units, and sign before you lock an answer.`,
      );
    }
  }

  if (rushProne) {
    insights.push(
      `Wrong attempts were faster on average (${avgSecWhenWrong}s) than correct ones (${avgSecWhenCorrect}s). On unfamiliar questions, add a short second pass before moving on.`,
    );
  }

  if (timeLeftOnTable) {
    insights.push(
      `You used about ${utilizationPct}% of the exam clock for active thinking time. Practice distributing time so harder sections still get a fair share.`,
    );
  }

  if (skipped > Math.max(2, Math.floor(totalInPaper * 0.08))) {
    insights.push(
      `${skipped} questions were left blank after you moved past them—track “skip and return” in the next mock so easy marks are not stranded.`,
    );
  }

  if (markedForReview > 0 && attempted > 0 && markedForReview / attempted > 0.35) {
    insights.push(
      `You flagged many items for review (${markedForReview}). That is fine tactically, but tighten final pass discipline so the palette does not stay noisy in the last minutes.`,
    );
  }

  if (bonusAttempted > 0 && bonusCorrect / bonusAttempted < 0.4) {
    insights.push(
      `Bonus / extra segments scored ${bonusCorrect}/${bonusAttempted}. Treat them as high-leverage only after base paper stability.`,
    );
  }

  if (sections.length > 1) {
    const weakestSection = [...sections].sort((a, b) => a.accuracy - b.accuracy)[0];
    if (weakestSection && weakestSection.attempted >= 2 && weakestSection.accuracy < overallAcc - 10) {
      insights.push(
        `Section “${weakestSection.section}” is trailing (${weakestSection.accuracy}% accuracy). Map one micro-topic from explanations there for tomorrow’s drill.`,
      );
    }
  }

  if (insights.length === 0) {
    insights.push(
      attemptYield >= 70
        ? `Solid attempt yield (${attemptYield}%). Next step: shave time on confident questions and reinvest into your slowest subject.`
        : `Focus on accuracy before speed—review incorrect explanations and reattempt a smaller timed set on the same topics.`,
    );
  }

  return {
    paper: {
      totalInPaper,
      attempted,
      correct,
      incorrect,
      skipped,
      notVisited,
      markedForReview,
      bonusAttempted,
      bonusCorrect,
      bonusIncorrect,
    },
    scoring: {
      marksPerCorrect: mc,
      marksPerIncorrect: mi,
      rawMarksFromCorrect,
      rawMarksLostToWrong,
      scoreEfficiencyPct,
      attemptYield,
    },
    time: {
      paperDurationSec,
      totalTrackedSec,
      utilizationPct,
      avgSecPerAttempted,
      avgSecWhenCorrect,
      avgSecWhenWrong,
      medianSecAttempted,
      idealAvgSecPerQ,
      slowest,
      fastestAttempted,
    },
    subjectsRanked,
    sections,
    byQuestionType,
    riskFlags: {
      rushProne,
      timeLeftOnTable,
      subjectGap,
      weakSubject: weak?.subject,
      strongSubject: strong?.subject,
    },
    insights,
  };
}
