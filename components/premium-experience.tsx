"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo } from "react";
import { BrainCircuit, CalendarRange, CheckCircle2, Layers3, Radar, Sparkles } from "lucide-react";
import { examConfigs, type ExamId } from "@/lib/exams";
import { useUserAttempts } from "@/hooks/use-user-attempts";
import { getExamMockTests } from "@/lib/mock-tests";
import { computeQuickAnalysisFromAttempts, mergeCatalogWithAttempts } from "@/lib/user-attempts";

export function PremiumExperience({ examId }: { examId: ExamId }) {
  const exam = examConfigs[examId];
  const { attempts } = useUserAttempts();
  const tests = useMemo(
    () => mergeCatalogWithAttempts(getExamMockTests(examId), attempts),
    [examId, attempts],
  );
  const analytics = useMemo(() => computeQuickAnalysisFromAttempts(examId, attempts), [examId, attempts]);
  const attemptedCount = tests.filter((test) => test.status === "attempted").length;

  const premiumStats = useMemo(
    () => [
      {
        label: "Mocks you finished",
        value: String(attemptedCount),
        suffix: `for ${exam.name}`,
      },
      {
        label: "Tests in library",
        value: String(tests.length),
        suffix: "listed papers",
      },
      {
        label: "Your pace (avg.)",
        value: analytics.bestPace,
        suffix: "time use vs paper",
      },
    ],
    [attemptedCount, tests.length, analytics.bestPace, exam.name],
  );

  const features = [
    {
      icon: Layers3,
      title: "Full premium test packs",
      body: "Free users get only a limited starter set. Premium unlocks the complete exam pack with more full mocks, sectional ladders, and targeted practice sets.",
      benefit: "The main upgrade is simple: far more relevant tests to practice from.",
    },
    {
      icon: BrainCircuit,
      title: "AI mistake review",
      body: "Get grouped error patterns instead of a flat solution list so you know whether accuracy loss came from concepts, rushing, or careless marking.",
      benefit: "Reduces repeat mistakes across the next 2-3 mocks.",
    },
    {
      icon: Radar,
      title: "Weak-topic heatmaps",
      body: "Premium breaks your paper into topic clusters and shows where marks leak most often by subject, section, and question type.",
      benefit: "Makes revision time go to the topics that move your score fastest.",
    },
    {
      icon: CalendarRange,
      title: "Adaptive weekly plan",
      body: "Builds a revision rhythm from your recent attempts and spreads drills, full mocks, and PYQ practice across the week.",
      benefit: "Turns mock data into a realistic study plan instead of passive analytics.",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <section className="overflow-hidden rounded-[32px] border border-[#2c2109] bg-[radial-gradient(circle_at_top_right,rgba(255,184,77,0.34),transparent_28%),linear-gradient(120deg,#130a07,#1c1008_50%,#2d1a06)] p-8 sm:p-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.34em] text-amber-300">Tesster Premium • {exam.name}</p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Premium unlocks the full test pack, not just a few starter papers.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-amber-50/80 sm:text-lg">
            The free plan is intentionally limited. It gives you a small number of tests to explore the platform. Premium opens the full pack for your exam, then adds the analytics and review tools that help you extract more value from every attempt.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {premiumStats.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-amber-100/75">{item.label}</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-amber-200/70">{item.suffix}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/pricing?exam=${examId}` as Route}
              className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:brightness-105"
            >
              Unlock Premium
            </Link>
            <Link
              href={`/results?exam=${examId}` as Route}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-base font-medium text-white transition hover:bg-white/5"
            >
              See Current Results
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="official-panel p-6">
          <div className="flex items-center gap-3 text-brand">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm uppercase tracking-[0.32em]">Why Premium Exists</p>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
            <p>
              The first reason to upgrade is access: premium unlocks the complete set of test packs for your selected exam instead of the limited starter access in the free plan.
            </p>
            <p>
              After that, Tesster Premium helps you use those extra papers properly with better review, smarter sequencing, and clearer post-test feedback for {exam.name}.
            </p>
          </div>

          <div className="mt-6 rounded-[24px] border border-line/80 bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Free Vs Premium</p>
            <p className="mt-3 text-lg font-medium text-ink">
              Free gives you a limited set of starter mocks. Premium unlocks the full {exam.name} pack plus analytics built on top of your attempts.
            </p>
            <p className="mt-2 text-sm text-muted">
              That means more relevant papers to attempt now, and better guidance on what to do after each one.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="official-panel p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-ink">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{feature.body}</p>
                <div className="mt-4 flex items-start gap-2 rounded-[20px] bg-surface p-4 text-sm text-ink">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>{feature.benefit}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
