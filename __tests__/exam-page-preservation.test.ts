/**
 * Preservation Property Tests — Property 2
 *
 * Validates: Requirements 3.1, 3.2
 *
 * GOAL: Establish baseline behavior that MUST be preserved after the fix.
 *
 * Property: For any ExamPageRequest where isBugCondition returns false (i.e. testId is absent),
 * ExamPage SHALL produce exactly the same resolved ExamConfig as the original code, preserving
 * all static boilerplate configs for JEE, BITSAT, COMEDK, and KCET.
 *
 * EXPECTED OUTCOME: Tests PASS on unfixed code — confirms baseline behavior to preserve.
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
import { getExamConfig, examConfigs } from "../lib/exams";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CUSTOM_UUID = "clxpreserve-custom-uuid-9999";

const customExamConfig: ExamConfig = {
  id: CUSTOM_UUID,
  name: "Custom Exam via UUID Route",
  durationMinutes: 120,
  maxMarks: 200,
  cardDetails: "2 hours • 200 marks",
  scoring: { correct: 2, incorrect: -0.5 },
  instructions: ["Custom instruction"],
  paletteLegend: ["Not Visited", "Answered"],
  questions: [
    {
      id: "cq1",
      index: 1,
      section: "Physics",
      subject: "Physics",
      type: "mcq",
      text: "Custom UUID route question 1",
      options: [{ text: "Option A" }, { text: "Option B" }],
      correctAnswer: "Option A",
      explanation: "Explanation for custom question 1.",
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

describe("Preservation — Property 2: Standard Exam Config Unchanged When testId Is Absent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // getCustomExam returns the custom config when called with the custom UUID
    vi.mocked(getCustomExam).mockImplementation(async (id: string) => {
      if (id === CUSTOM_UUID) return customExamConfig;
      return null;
    });
  });

  // -------------------------------------------------------------------------
  // Observation-based unit tests: each base exam key with no testId
  // -------------------------------------------------------------------------

  it("JEE: examId='jee' with no testId returns static JEE config", async () => {
    const element = await callExamPage("jee") as React.ReactElement;
    const exam = extractExamProp(element);

    expect(exam.id).toBe("jee");
    expect(exam.scoring.correct).toBe(4);
    expect(exam.scoring.incorrect).toBe(-1);
    expect(exam.durationMinutes).toBe(180);
    expect(exam.maxMarks).toBe(300);
    // Questions should match the static config exactly
    expect(exam.questions).toHaveLength(examConfigs["jee"].questions.length);
    expect(exam.questions).toEqual(examConfigs["jee"].questions);
  });

  it("BITSAT: examId='bitsat' with no testId returns static BITSAT config with bonusUnlock", async () => {
    const element = await callExamPage("bitsat") as React.ReactElement;
    const exam = extractExamProp(element);

    expect(exam.id).toBe("bitsat");
    expect(exam.scoring.correct).toBe(3);
    expect(exam.scoring.incorrect).toBe(-1);
    expect(exam.durationMinutes).toBe(180);
    expect(exam.maxMarks).toBe(390);
    // BITSAT has bonusUnlock settings
    expect(exam.bonusUnlock).toBeDefined();
    expect(exam.bonusUnlock?.baseQuestionCount).toBe(130);
    expect(exam.bonusUnlock?.bonusQuestionCount).toBe(12);
    expect(exam.questions).toHaveLength(examConfigs["bitsat"].questions.length);
    expect(exam.questions).toEqual(examConfigs["bitsat"].questions);
  });

  it("COMEDK: examId='comedk' with no testId returns static COMEDK config with no negative marking", async () => {
    const element = await callExamPage("comedk") as React.ReactElement;
    const exam = extractExamProp(element);

    expect(exam.id).toBe("comedk");
    expect(exam.scoring.correct).toBe(1);
    expect(exam.scoring.incorrect).toBe(0);
    expect(exam.durationMinutes).toBe(180);
    expect(exam.maxMarks).toBe(180);
    expect(exam.questions).toHaveLength(examConfigs["comedk"].questions.length);
    expect(exam.questions).toEqual(examConfigs["comedk"].questions);
  });

  it("KCET: examId='kcet' with no testId returns static KCET config with durationMinutes=240", async () => {
    const element = await callExamPage("kcet") as React.ReactElement;
    const exam = extractExamProp(element);

    expect(exam.id).toBe("kcet");
    expect(exam.scoring.correct).toBe(1);
    expect(exam.scoring.incorrect).toBe(0);
    expect(exam.durationMinutes).toBe(240);
    expect(exam.maxMarks).toBe(180);
    expect(exam.questions).toHaveLength(examConfigs["kcet"].questions.length);
    expect(exam.questions).toEqual(examConfigs["kcet"].questions);
  });

  it("UUID examId with no testId falls through to getCustomExam(examId) and returns custom config", async () => {
    const element = await callExamPage(CUSTOM_UUID) as React.ReactElement;
    const exam = extractExamProp(element);

    // getCustomExam should have been called with the UUID examId (fallback path)
    expect(vi.mocked(getCustomExam)).toHaveBeenCalledWith(CUSTOM_UUID);
    expect(exam.id).toBe(CUSTOM_UUID);
    expect(exam.questions).toHaveLength(customExamConfig.questions.length);
    expect(exam.questions[0].id).toBe("cq1");
  });

  // -------------------------------------------------------------------------
  // Property-based tests: all base exam keys with no testId
  // -------------------------------------------------------------------------

  /**
   * Property 2 (scoped PBT): For all base exam keys with no testId,
   * the resolved exam.id equals the input examId and exam.questions matches
   * the static examConfigs entry exactly.
   *
   * Validates: Requirements 3.1, 3.2
   */
  const BASE_EXAM_KEYS = ["jee", "bitsat", "comedk", "kcet"] as const;

  for (const examId of BASE_EXAM_KEYS) {
    it(`[PROPERTY] examId="${examId}" with no testId -> exam.id === "${examId}" and questions match static config`, async () => {
      const element = await callExamPage(examId) as React.ReactElement;
      const exam = extractExamProp(element);

      // Property: exam.id must equal the input examId
      expect(exam.id).toBe(examId);

      // Property: exam.questions must exactly match the static examConfigs entry
      const staticConfig = examConfigs[examId];
      expect(exam.questions).toHaveLength(staticConfig.questions.length);
      expect(exam.questions).toEqual(staticConfig.questions);

      // Property: getCustomExam should NOT have been called (static config found immediately)
      expect(vi.mocked(getCustomExam)).not.toHaveBeenCalled();
    });
  }

  /**
   * Property 2 (UUID fallback): For a UUID examId with no testId,
   * getCustomExam(examId) is called and its result is used as the exam config.
   *
   * Validates: Requirements 3.1, 3.2
   */
  it("[PROPERTY] UUID examId with no testId -> getCustomExam(examId) is called and result is used", async () => {
    const element = await callExamPage(CUSTOM_UUID) as React.ReactElement;
    const exam = extractExamProp(element);

    // Property: getCustomExam must be called with the UUID examId
    expect(vi.mocked(getCustomExam)).toHaveBeenCalledWith(CUSTOM_UUID);
    expect(vi.mocked(getCustomExam)).toHaveBeenCalledTimes(1);

    // Property: the returned exam must be the one from getCustomExam
    expect(exam.id).toBe(CUSTOM_UUID);
    expect(exam.questions).toEqual(customExamConfig.questions);
  });
});
