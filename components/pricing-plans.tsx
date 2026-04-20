"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { examConfigs, type ExamId } from "@/lib/exams";
import {
  allAccessPass,
  examPremiumPlans,
  pricingExamOrder,
  sumIndividualPremiums,
} from "@/lib/pricing";

const bundleFeatures = [
  "Full mock libraries for all four exams",
  "Premium analytics and mistake review on every attempt",
  "One subscription for multi-exam prep",
];

export function PricingPlans({ highlightExamId }: { highlightExamId?: ExamId }) {
  const router = useRouter();
  const { hasPremiumForExam, purchaseExamPremium, purchaseAllAccess, user } = useAuth();
  const bundleCompare = sumIndividualPremiums();
  const savings = bundleCompare - allAccessPass.amount;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <section className="overflow-hidden rounded-[32px] border border-[#2c2109] bg-[radial-gradient(circle_at_top_right,rgba(255,184,77,0.34),transparent_28%),linear-gradient(120deg,#130a07,#1c1008_50%,#2d1a06)] p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-3 text-amber-300">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm uppercase tracking-[0.34em]">Tesster Premium • Pricing</p>
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Pick your exam—or unlock everything.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-amber-50/80 sm:text-lg">
          Each plan unlocks the full premium test pack for that exam (every mock after Full Test 1). The all-access pass unlocks premium tests across JEE, KCET, COMEDK, and BITSAT.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-amber-200/70">
          Demo mode: choosing a plan saves entitlement in this browser only—no real payment is processed.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">Exam plans</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Prices are illustrative. Activation below unlocks premium mocks immediately in this session.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {pricingExamOrder.map((examId) => {
            const exam = examConfigs[examId];
            const plan = examPremiumPlans[examId];
            const highlighted = highlightExamId === examId;
            const active = hasPremiumForExam(examId);

            return (
              <article
                key={examId}
                className={clsx(
                  "official-panel flex flex-col p-6 transition",
                  highlighted && "ring-2 ring-brand ring-offset-2 ring-offset-surface dark:ring-offset-surface",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">{exam.name} Premium</p>
                  {active ? (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">{plan.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-4xl font-bold text-ink">
                    {plan.currency}
                    {plan.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-muted">{plan.billingNote}</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-muted">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>All premium mocks for {exam.name} (Full Test 2 onward)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>Same analytics and result tools you already use</span>
                  </li>
                </ul>
                {active ? (
                  <Link
                    href={`/mock-tests?exam=${examId}` as Route}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-line/80 bg-surface px-5 py-3 text-center text-sm font-semibold text-ink transition hover:bg-panel"
                  >
                    Go to {exam.name} tests
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      purchaseExamPremium(examId);
                      router.push(`/mock-tests?exam=${examId}` as Route);
                    }}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-surface transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                  >
                    Activate {exam.name} premium
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">All-access pass</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          One entitlement for every premium test on the platform—ideal if you are preparing for more than one exam.
        </p>

        <article className="relative mt-6 overflow-hidden rounded-[28px] border-2 border-brand/40 bg-gradient-to-br from-brand/10 via-surface to-panel p-8 shadow-soft dark:from-brand/15">
          <div className="absolute right-6 top-6 rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            Best value
          </div>
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">{allAccessPass.name}</p>
              {user?.allAccess ? (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Active
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-lg font-medium text-ink">{allAccessPass.description}</p>
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-[family-name:var(--font-display)] text-4xl font-bold text-ink sm:text-5xl">
                {allAccessPass.currency}
                {allAccessPass.amount.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted">{allAccessPass.billingNote}</span>
              {savings > 0 ? (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Save {allAccessPass.currency}
                  {savings.toLocaleString("en-IN")} vs buying separately
                </span>
              ) : null}
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              {bundleFeatures.map((line) => (
                <li key={line} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-ink">{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Includes: {allAccessPass.includedExamIds.map((id) => examConfigs[id].name).join(", ")}.
            </p>
            {user?.allAccess ? (
              <Link
                href={"/mock-tests?exam=jee" as Route}
                className="mt-8 inline-flex items-center justify-center rounded-full border border-brand/40 bg-panel px-6 py-3 text-sm font-semibold text-ink transition hover:bg-surface"
              >
                Browse mock tests
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  purchaseAllAccess();
                  router.push("/mock-tests?exam=jee" as Route);
                }}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Activate all-access pass
              </button>
            )}
          </div>
        </article>
      </section>

      <p className="mt-10 text-center text-sm text-muted">
        <Link href={"/" as Route} className="font-medium text-brand underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
