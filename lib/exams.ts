import { customTests } from "./generated-custom-tests";

export type ExamId = "jee" | "bitsat" | "comedk" | "kcet" | (string & {});
export type QuestionType = "mcq" | "numerical";

export type Question = {
  id: string;
  index: number;
  section: string;
  subject: string;
  type: QuestionType;
  text: string;
  options?: { text: string; image?: string }[];
  correctAnswer: string;
  explanation: string;
  image?: string;
  isBonus?: boolean;
};

export type ExamConfig = {
  id: ExamId;
  name: string;
  durationMinutes: number;
  maxMarks: number;
  instructions: string[];
  scoring: {
    correct: number;
    incorrect: number;
  };
  cardDetails: string;
  questions: Question[];
  paletteLegend: string[];
  bonusUnlock?: {
    baseQuestionCount: number;
    bonusQuestionCount: number;
  };
  baseExamId?: string;
  isPremium?: boolean;
  category?: string;
  section?: string;
};

const subjectSeeds = {
  Physics: [
    { prompt: "A body travels with constant acceleration. Identify the valid kinematic conclusion.", answer: "v = u + at" },
    { prompt: "For a wave travelling through a medium, select the correct relation.", answer: "v = fλ" },
    { prompt: "In electrostatics, the SI unit of capacitance is:", answer: "farad" },
  ],
  Chemistry: [
    { prompt: "Select the law best associated with conservation of mass in reactions.", answer: "Lavoisier's law" },
    { prompt: "The pH of a neutral aqueous solution at 25°C is:", answer: "7" },
    { prompt: "Choose the correct statement about periodic trends.", answer: "Electronegativity generally increases across a period" },
  ],
  Maths: [
    { prompt: "Differentiate x^2 with respect to x.", answer: "2x" },
    { prompt: "The value of sin 90° is:", answer: "1" },
    { prompt: "For a linear equation ax + b = 0, the root is:", answer: "-b/a" },
  ],
  English: [
    { prompt: "Choose the correctly spelled word.", answer: "Accommodate" },
    { prompt: "Pick the sentence with correct subject-verb agreement.", answer: "The list of topics is on the board." },
  ],
  "Logical Reasoning": [
    { prompt: "If all A are B and some B are C, what definitely follows?", answer: "No definite conclusion about A and C" },
    { prompt: "Identify the next number in the pattern 2, 6, 12, 20, ?", answer: "30" },
  ],
};

const defaultMcqOptions = (answer: string) => [
  { text: answer },
  { text: "Both statements are incorrect" },
  { text: "Cannot be determined" },
  { text: "None of the above" },
];

const numericalAnswerPool = ["8", "12", "16", "24", "32"];

function buildQuestions(
  sections: Array<{ subject: string; section: string; count: number; type?: QuestionType; start?: number; isBonus?: boolean }>,
) {
  const questions: Question[] = [];
  let runningIndex = 1;

  sections.forEach((entry) => {
    const seeds = subjectSeeds[entry.subject as keyof typeof subjectSeeds];

    for (let i = 0; i < entry.count; i += 1) {
      const seed = seeds[i % seeds.length];
      const type = entry.type ?? "mcq";
      const correctAnswer =
        type === "numerical" ? numericalAnswerPool[i % numericalAnswerPool.length] : seed.answer;

      questions.push({
        id: `${entry.subject.toLowerCase().replace(/\s+/g, "-")}-${runningIndex}`,
        index: runningIndex,
        section: entry.section,
        subject: entry.subject,
        type,
        text:
          type === "numerical"
            ? `${entry.subject} Numerical ${i + 1}: Based on standard formulas, compute the required value.`
            : `${entry.subject} Question ${i + 1}: ${seed.prompt}`,
        options: type === "mcq" ? defaultMcqOptions(correctAnswer) : undefined,
        correctAnswer,
        explanation: `Placeholder explanation for ${entry.subject} question ${i + 1}. Replace with exam-specific worked solution text.`,
        isBonus: entry.isBonus ?? false,
      });
      runningIndex += 1;
    }
  });

  return questions;
}

export const examConfigs: Record<ExamId, ExamConfig> = {
  jee: {
    id: "jee",
    name: "JEE Main",
    durationMinutes: 180,
    maxMarks: 300,
    cardDetails: "3 hours • 300 marks",
    scoring: {
      correct: 4,
      incorrect: -1,
    },
    instructions: [
      "Each subject contains 20 MCQs and 5 numerical questions.",
      "Incorrect answers carry negative marking.",
      "Use Mark for Review to revisit flagged questions before submission.",
    ],
    paletteLegend: ["Not Visited", "Answered", "Not Answered", "Marked for Review", "Answered & Marked"],
    questions: buildQuestions([
      { subject: "Physics", section: "Physics MCQ", count: 20 },
      { subject: "Physics", section: "Physics Numerical", count: 5, type: "numerical" },
      { subject: "Chemistry", section: "Chemistry MCQ", count: 20 },
      { subject: "Chemistry", section: "Chemistry Numerical", count: 5, type: "numerical" },
      { subject: "Maths", section: "Maths MCQ", count: 20 },
      { subject: "Maths", section: "Maths Numerical", count: 5, type: "numerical" },
    ]),
  },
  bitsat: {
    id: "bitsat",
    name: "BITSAT",
    durationMinutes: 180,
    maxMarks: 390,
    cardDetails: "3 hours • 390 marks",
    scoring: {
      correct: 3,
      incorrect: -1,
    },
    bonusUnlock: {
      baseQuestionCount: 130,
      bonusQuestionCount: 12,
    },
    instructions: [
      "Attempt all 130 base questions to unlock 12 bonus questions.",
      "Every correct answer adds 3 marks; each incorrect answer deducts 1 mark.",
      "English and Logical Reasoning are grouped in the same part but tracked separately.",
    ],
    paletteLegend: ["Not Visited", "Answered", "Not Answered", "Marked for Review", "Answered & Marked"],
    questions: buildQuestions([
      { subject: "Physics", section: "Part I: Physics", count: 30 },
      { subject: "Chemistry", section: "Part II: Chemistry", count: 30 },
      { subject: "English", section: "Part III: English Proficiency", count: 10 },
      { subject: "Logical Reasoning", section: "Part III: Logical Reasoning", count: 20 },
      { subject: "Maths", section: "Part IV: Mathematics", count: 40 },
      { subject: "Maths", section: "Bonus Questions", count: 12, isBonus: true },
    ]),
  },
  comedk: {
    id: "comedk",
    name: "COMEDK",
    durationMinutes: 180,
    maxMarks: 180,
    cardDetails: "3 hours • 180 marks",
    scoring: {
      correct: 1,
      incorrect: 0,
    },
    instructions: [
      "No negative marking applies in COMEDK.",
      "Physics, Chemistry, and Maths contribute 60 questions each.",
      "A calm pace matters because every question carries equal weight.",
    ],
    paletteLegend: ["Not Visited", "Answered", "Not Answered", "Marked for Review", "Answered & Marked"],
    questions: buildQuestions([
      { subject: "Physics", section: "Physics", count: 60 },
      { subject: "Chemistry", section: "Chemistry", count: 60 },
      { subject: "Maths", section: "Maths", count: 60 },
    ]),
  },
  kcet: {
    id: "kcet",
    name: "KCET",
    durationMinutes: 240,
    maxMarks: 180,
    cardDetails: "240 mins simulated • 180 marks",
    scoring: {
      correct: 1,
      incorrect: 0,
    },
    instructions: [
      "KCET is simulated here as a full 240-minute combined mock.",
      "Each correct answer adds 1 mark with no negative marking.",
      "Subject-wise pacing is still surfaced in the analytics dashboard.",
    ],
    paletteLegend: ["Not Visited", "Answered", "Not Answered", "Marked for Review", "Answered & Marked"],
    questions: buildQuestions([
      { subject: "Physics", section: "Physics", count: 60 },
      { subject: "Chemistry", section: "Chemistry", count: 60 },
      { subject: "Maths", section: "Maths", count: 60 },
    ]),
  },
};

customTests.forEach((test) => {
  examConfigs[test.id as ExamId] = test;
});

export function getExamConfig(examId: string) {
  return examConfigs[examId as ExamId];
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${mins}m`;
}
