"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo } from "react";
import { Activity, BarChart3, Clock3, Sparkles, Target } from "lucide-react";
import { firstName, useAuth } from "@/components/auth-context";
import { examConfigs, type ExamId } from "@/lib/exams";
import { useUserAttempts } from "@/hooks/use-user-attempts";
import { computeQuickAnalysisFromAttempts } from "@/lib/user-attempts";

export function HomeDashboard({ activeExamId }: { activeExamId: ExamId }) {
  const { user, hasPremiumForExam } = useAuth();
  const hasPremium = hasPremiumForExam(activeExamId);
  const { attempts } = useUserAttempts();
  const activeExam = examConfigs[activeExamId];

  const quickAnalysis = useMemo(
    () => computeQuickAnalysisFromAttempts(activeExamId, attempts),
    [activeExamId, attempts],
  );

  const latestAttempt = useMemo(() => {
    const list = attempts
      .filter((attempt) => attempt.examId === activeExamId)
      .sort((a, b) => b.finishedAt - a.finishedAt);
    return list[0];
  }, [attempts, activeExamId]);

  const displayName = user ? firstName(user.name) : "there";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-base font-medium text-ink">Hey {displayName}</p>
        </div>
        <Link
          href={"/profile" as Route}
          className="w-full shrink-0 rounded-2xl border border-line/80 bg-panel px-4 py-3 text-right transition hover:border-brand/40 sm:w-auto sm:min-w-[14rem]"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Mock profile</p>
          <p className="mt-1 text-sm font-semibold text-ink">{user?.email ?? "—"}</p>
          <p className="mt-0.5 text-xs text-muted">{user?.phone?.trim() ? user.phone : "—"}</p>
        </Link>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[32px] border border-[#2c2109] bg-[radial-gradient(circle_at_top_right,rgba(255,184,77,0.34),transparent_28%),linear-gradient(120deg,#130a07,#1c1008_50%,#2d1a06)] p-8">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.34em] text-amber-300">Tesster Premium</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-white">
              {hasPremium                ? `Your ${activeExam.name} premium pack is active.`
                : "Unlock every mock after Full Test 1."}
            </h2>
            <p className="mt-4 text-lg text-amber-50/80">
              {hasPremium
                ? "Open any premium-tagged paper from Mock tests—no more locks for this exam."
                : "Free tier includes Full Test 1 per exam. Premium unlocks the rest of the library for this exam; all-access unlocks every exam."}
            </p>
            {latestAttempt ? (
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-amber-50/85">
                <span>
                  {hasPremium ? `${activeExam.name} premium active` : `${activeExam.name} · upgrade for more mocks`}
                </span>
                <span className="text-amber-200/70">
                  Latest score {latestAttempt.score}/{latestAttempt.maxScore}
                </span>
              </div>
            ) : (
              <p className="mt-6 text-sm text-amber-200/80">Finish a mock to see your latest score here.</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={hasPremium ? (`/mock-tests?exam=${activeExamId}` as Route) : (`/pricing?exam=${activeExamId}` as Route)}
                className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:brightness-105"
              >
                {hasPremium ? "Go to mock tests" : "Get premium"}
              </Link>
              <Link
                href={"/results?exam=jee&demo=1" as Route}
                className="inline-flex items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/10 px-6 py-3 text-base font-medium text-amber-100 transition hover:bg-amber-500/20"
              >
                See example analysis
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="official-panel p-6">
            <div className="flex items-center gap-3 text-brand">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm uppercase tracking-[0.32em]">Quick Signals</p>
            </div>
            <div className="mt-6 space-y-4">
              <Metric icon={Clock3} title="Live countdown" body="Each exam follows its own timer and auto-submits at zero." />
              <Metric icon={Target} title="Distinct marking logic" body="Negative marking and bonus unlocks are handled exam by exam." />
              <Metric icon={BarChart3} title="Result center" body="Accuracy, attempts, and time spent are summarized instantly." />
            </div>
          </div>

          <div className="official-panel p-6">
            <div className="flex items-center gap-3 text-brand">
              <Activity className="h-5 w-5" />
              <p className="text-sm uppercase tracking-[0.32em]">Quick analysis</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
              <QuickStat
                title="Accuracy"
                value={quickAnalysis.accuracy}
                subtitle={
                  quickAnalysis.attempted === 0
                    ? "Finish a mock to see this"
                    : `Across ${quickAnalysis.attempted} finished mock${quickAnalysis.attempted === 1 ? "" : "s"}`
                }
              />
              <QuickStat
                title="Mistakes"
                value={quickAnalysis.mistaken}
                subtitle={quickAnalysis.attempted === 0 ? "No attempts yet" : "Wrong answers across your mocks"}
              />
              <QuickStat
                title="Pace"
                value={quickAnalysis.bestPace}
                subtitle={
                  quickAnalysis.attempted === 0
                    ? "Finish a mock to see this"
                    : "Avg. time used vs paper length"
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Clock3;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="rounded-2xl bg-brand/10 p-3 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="text-sm text-muted">{body}</p>
      </div>
    </div>
  );
}

function QuickStat({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="flex h-full flex-col rounded-[20px] border border-line/70 bg-panel/50 p-4 text-left sm:p-5 dark:bg-panel/40">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{title}</p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums tracking-tight text-ink sm:text-[2rem]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-snug text-muted">{subtitle}</p>
    </div>
  );
}
