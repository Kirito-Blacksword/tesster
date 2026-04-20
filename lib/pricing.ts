import type { ExamId } from "./exams";

/** Display order on the pricing page */
export const pricingExamOrder: ExamId[] = ["jee", "kcet", "comedk", "bitsat"];

export type ExamPremiumPlan = {
  examId: ExamId;
  tagline: string;
  amount: number;
  currency: string;
  billingNote: string;
};

export const examPremiumPlans: Record<ExamId, ExamPremiumPlan> = {
  jee: {
    examId: "jee",
    tagline: "Full JEE Main–style mocks, sectional drills, and analytics.",
    amount: 1499,
    currency: "\u20B9",
    billingNote: "per year",
  },
  kcet: {
    examId: "kcet",
    tagline: "Complete KCET pack with exam-accurate timing and marking.",
    amount: 999,
    currency: "\u20B9",
    billingNote: "per year",
  },
  comedk: {
    examId: "comedk",
    tagline: "All COMEDK full tests plus topic-level review tools.",
    amount: 999,
    currency: "\u20B9",
    billingNote: "per year",
  },
  bitsat: {
    examId: "bitsat",
    tagline: "BITSAT pack including bonus-question flow and pacing stats.",
    amount: 1199,
    currency: "\u20B9",
    billingNote: "per year",
  },
};

export const allAccessPass = {
  name: "All-access pass",
  shortName: "All exams",
  description:
    "Every full test library on Tesster—JEE, KCET, COMEDK, and BITSAT—with premium analytics for each.",
  amount: 3499,
  currency: "\u20B9",
  billingNote: "per year",
  includedExamIds: pricingExamOrder,
};

export function sumIndividualPremiums(): number {
  return pricingExamOrder.reduce((sum, id) => sum + examPremiumPlans[id].amount, 0);
}
