/**
 * Bug Condition Exploration Test — Property 1
 *
 * Validates: Requirements 1.2, 1.3
 *
 * GOAL: Surface counterexamples that demonstrate the bug exists on UNFIXED code.
 *
 * Bug: When ExamPage receives `testId` as a search param pointing to a custom exam UUID
 * while `examId` is a base exam key (e.g. "jee"), the page ignores `testId` and loads
 * the static boilerplate config for `examId` instead of the custom exam.
 *
 * EXPECTED OUTCOME: Tests FAIL on unfixed code — exam.id equals "jee" instead of the
 * custom UUID, confirming the bug exists.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import type { ExamConfig } from "../lib/exams";

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the module under test
// ---------------------------------------------------------------------------

// Mock next/navigation so notFound() / redirect() don't throw
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

// Mock the custom-exams module
vi.mock("../lib/custom-exams", () => ({
  getCustomExam: vi.fn(),
}));

// Mock the exams module — keep getExamConfig returning the real static configs
vi.mock("../lib/exams", async (importOriginal) => {
  const original = await importOriginal<typeof import("../lib/exams")>();
  return {
    ...original,
    getExamConfig: vi.fn(original.getExamConfig),
  };
});

// Mock ExamShell as a simple component so JSX doesn't fail
vi.mock("../components/exam-shell", () => ({
  ExamShell: vi.fn((_props: { exam: ExamConfig; testId?: string }) => null),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are registered)
// ---------------------------------------------------------------------------

import { getCustomExam } from "../lib/custom-exams";
import { getExamConfig } from "../lib/exams";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CUSTOM_UUID = "clxabc123-custom-uuid";

const customExamConfig: ExamConfig = {
  id: CUSTOM_UUID,
  name: "Custom JEE Mock #1",
  durationMinutes: 180,
  maxMarks: 300,
  cardDetails: "3 hours • 300 marks",
  scoring: { correct: 4, incorrect: -1 },
  instructions: ["Custom instruction"],
  paletteLegend: ["Not Visited", "Answered"],
  baseExamId: "jee",
  questions: [
    {
      id: "q1",
      index: 1,
      section: "Physics",
      subject: "Physics",
      type: "mcq",
      text: "Custom Q1: What is the speed of light?",
      options: [{ text: "3x10^8 m/s" }, { text: "3x10^6 m/s" }],
      correctAnswer: "3x10^8 m/s",
      explanation: "Speed of light in vacuum.",
    },
    {
      id: "q2",
      index: 2,
      section: "Chemistry",
      subject: "Chemistry",
      type: "mcq",
      text: "Custom Q2: What is the atomic number of Carbon?",
      options: [{ text: "6" }, { text: "12" }],
      correctAnswer: "6",
      explanation: "Carbon has atomic number 6.",
    },
  ],
};

/**
 * Call ExamPage as a plain async function (Next.js server components are just async functions).
 * Returns the React element so we can inspect the props passed to ExamShell.
 */
async function callExamPage(examId: string, testId?: string) {
  const { default: ExamPage } = await import("../app/exam/[examId]/page");
  return ExamPage({
    params: Promise.resolve({ examId }),
    searchParams: Promise.resolve({ testId }),
  });
}

/**
 * Extract the `exam` prop from the returned JSX element (ExamShell).
 * ExamPage returns <ExamShell exam={...} testId={...} /> — we read props directly.
 */
function extractExamProp(element: React.ReactElement | null): ExamConfig {
  if (!element || !element.props) {
    throw new Error("ExamPage did not return a React element with props");
  }
  return (element.props as { exam: ExamConfig }).exam;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Bug Condition Exploration — Property 1: Custom Exam Config Loads When testId Is Present", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // getCustomExam returns the custom config when called with the custom UUID
    vi.mocked(getCustomExam).mockImplementation(async (id: string) => {
      if (id === CUSTOM_UUID) return customExamConfig;
      return null;
    });
  });

  const BASE_EXAM_IDS = ["jee", "bitsat", "comedk", "kcet"] as const;

  /**
   * Scoped PBT: for each base examId, when testId is a custom UUID,
   * the exam prop passed to ExamShell MUST have id === testId (not the base examId).
   *
   * On UNFIXED code this FAILS because getExamConfig(examId) short-circuits and
   * returns the static boilerplate — testId is never consulted for config resolution.
   *
   * Counterexample: exam.id = "jee" when testId = "clxabc123-custom-uuid"
   */
  for (const examId of BASE_EXAM_IDS) {
    it(`[BUG] examId="${examId}" + testId="${CUSTOM_UUID}" -> exam.id should be "${CUSTOM_UUID}" (not "${examId}")`, async () => {
      const element = await callExamPage(examId, CUSTOM_UUID) as React.ReactElement;
      const receivedExam = extractExamProp(element);

      // PROPERTY 1: exam.id must equal testId, not the base examId
      // COUNTEREXAMPLE on unfixed code: exam.id === "jee" (not "clxabc123-custom-uuid")
      expect(receivedExam.id).toBe(CUSTOM_UUID);

      // PROPERTY 1: exam.questions must be the custom questions, not boilerplate
      // COUNTEREXAMPLE on unfixed code: exam.questions has 75 placeholder questions
      expect(receivedExam.questions).toHaveLength(customExamConfig.questions.length);
      expect(receivedExam.questions[0].id).toBe("q1");
      expect(receivedExam.questions[0].text).toBe("Custom Q1: What is the speed of light?");
    });
  }

  it("[BUG] getCustomExam(testId) should be called when testId is present", async () => {
    await callExamPage("jee", CUSTOM_UUID);

    // On unfixed code, getCustomExam is NOT called with testId — it's only called
    // as a fallback when getExamConfig returns undefined (which never happens for "jee")
    // COUNTEREXAMPLE: getCustomExam call count = 0 (never called with testId)
    expect(vi.mocked(getCustomExam)).toHaveBeenCalledWith(CUSTOM_UUID);
  });
});
