"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock3,
  Gauge,
  Layers,
  Lightbulb,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ResultPayload } from "@/lib/exam-engine";
import { getExampleJeeResult } from "@/lib/example-result";
import { getExamConfig, type ExamConfig } from "@/lib/exams";
import type { QuestionType } from "@/lib/exams";
import { computeDeepAnalysis } from "@/lib/result-analysis";

function buildAnalysisRows(result: ResultPayload) {
  return result.questions.map((q) => ({
    index: q.index,
    section: "section" in q && q.section ? q.section : q.subject,
    subject: q.subject,
    type: ("type" in q && q.type ? q.type : "mcq") as QuestionType,
    isBonus: "isBonus" in q ? q.isBonus : undefined,
    selectedAnswer: q.selectedAnswer,
    isCorrect: q.isCorrect,
    timeSpent: q.timeSpent,
    status: q.status,
  }));
}

export function ResultCenter() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("exam");
  const resultId = searchParams.get("resultId");
  const isDemo = searchParams.get("demo") === "1";
  const demoResult = useMemo(() => (isDemo ? getExampleJeeResult() : null), [isDemo]);
  const [sessionResult, setSessionResult] = useState<ResultPayload | null>(null);

  useEffect(() => {
    if (isDemo) return;
    if (!examId && !resultId) {
      setSessionResult(null);
      return;
    }

    // 1. If resultId is in URL, go straight to DB for the authoritative record
    if (resultId) {
      fetch(`/api/results?resultId=${resultId}`)
        .then((res) => res.json())
        .then((data) => setSessionResult(data.result ?? null))
        .catch(() => setSessionResult(null));
      return;
    }

    // 2. Check sessionStorage (immediate post-submit fallback)
    if (examId) {
      const rawResult = sessionStorage.getItem(`tesster-result-${examId}`);
      if (rawResult) {
        try {
          setSessionResult(JSON.parse(rawResult) as ResultPayload);
          return;
        } catch {}
      }

      // 3. Fall back to latest DB record for this examId
      fetch(`/api/results?examId=${examId}`)
        .then((res) => res.json())
        .then((data) => setSessionResult(data.result ?? null))
        .catch(() => setSessionResult(null));
    }
  }, [examId, resultId, isDemo]);

  const result = demoResult ?? sessionResult;

  const [exam, setExam] = useState<ExamConfig | undefined>(undefined);
  const [isLoadingExam, setIsLoadingExam] = useState(true);

  useEffect(() => {
    const idToFetch = result?.examId || examId;
    if (!idToFetch) {
      setIsLoadingExam(false);
      return;
    }

    const staticExam = getExamConfig(idToFetch);
    if (staticExam) {
      setExam(staticExam);
      setIsLoadingExam(false);
      return;
    }

    setIsLoadingExam(true);
    fetch(`/api/exams/${idToFetch}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setExam(data);
      })
      .finally(() => setIsLoadingExam(false));
  }, [result?.examId, examId]);

  const analysis = useMemo(() => {
    if (!result || !exam) return null;
    if (result.analysis) return result.analysis;
    return computeDeepAnalysis(exam, buildAnalysisRows(result));
  }, [result, exam]);

  const maxTime = useMemo(
    () => Math.max(...(result?.questions.map((question) => question.timeSpent) ?? [1])),
    [result],
  );

  if (!isDemo && (!examId || (!exam && !isLoadingExam && !sessionResult))) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="official-panel p-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">Result unavailable</h1>
          <p className="mt-3 text-slate-400">Launch a mock test first so the result center has data to display.</p>
          <Link href={"/" as Route} className="mt-6 inline-flex rounded-2xl bg-brand px-5 py-3 text-sm font-medium text-slate-950">
            Return home
          </Link>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="official-panel p-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">No saved result</h1>
          <p className="mt-3 text-slate-400">
            This session does not have a stored submission for {exam?.name ?? examId}.
          </p>
          <Link
            href={"/results?exam=jee&demo=1" as Route}
            className="mt-6 inline-flex rounded-2xl bg-brand px-5 py-3 text-sm font-medium text-slate-950"
          >
            See example analysis
          </Link>
        </div>
      </main>
    );
  }  if (!analysis || isLoadingExam || (examId && !result && !isDemo)) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="official-panel p-8 text-white">Loading result...</div>
      </main>
    );
  }

  const { paper, scoring, time: timeBlock, subjectsRanked, sections, byQuestionType, riskFlags, insights } = analysis;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      {isDemo ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <span className="font-semibold text-amber-50">Example analysis — </span>
          Sample JEE Main attempt with synthetic timing and answers so you can explore the full breakdown before your own mocks. Not your data.
        </div>
      ) : null}

      <section className="rounded-[30px] bg-[#f699aa] px-6 py-5 text-[#1d2736] shadow-soft sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Result synced for {result.examName}</p>
            <p className="text-sm opacity-80">
              Deep breakdown: timing, subjects, sections, question types, and actionable insights.
            </p>
          </div>
          <Link
            href={
              isDemo
                ? (`/mock-tests?exam=${result.examId}` as Route)
                : (`/exam/${result.examId}` as Route)
            }
            className="inline-flex items-center justify-center rounded-2xl bg-[#1d2736] px-5 py-3 text-sm font-semibold text-white"
          >
            {isDemo ? "Try a real mock" : "Reattempt mock"}
          </Link>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[#171e29] p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.34em] text-brand">Scorecard</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white">
              {result.examName} analysis
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Raw outcome plus how you used time, where marks leaked, and how subjects and formats compare.
            </p>
          </div>
          <div className="rounded-[28px] border border-[#8b9df8]/25 bg-[#8b9df8]/10 px-6 py-5">
            <p className="text-sm uppercase tracking-[0.3em] text-[#aeb8ff]">Net score</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-white">
              {result.score} / {result.maxScore}
            </p>
            <p className="mt-1 text-sm text-[#aeb8ff]/90">
              Efficiency {scoring.scoreEfficiencyPct}% of full marks · Yield {scoring.attemptYield}% correct per attempt
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <StatCard label="Attempted" value={String(paper.attempted)} hint={`of ${paper.totalInPaper} in paper`} />
          <StatCard label="Correct" value={String(paper.correct)} />
          <StatCard label="Incorrect" value={String(paper.incorrect)} />
          <StatCard label="Accuracy" value={`${result.accuracy}%`} />
          <StatCard label="Skipped" value={String(paper.skipped)} hint="Seen, left blank" />
          <StatCard label="Not visited" value={String(paper.notVisited)} hint="Palette untouched" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Marked for review"
            value={String(paper.markedForReview)}
            hint="Flagged in palette"
            icon={Layers}
          />
          <StatCard
            label="Clock utilization"
            value={`${timeBlock.utilizationPct}%`}
            hint={`${timeBlock.totalTrackedSec}s active / ${timeBlock.paperDurationSec}s paper`}
            icon={Timer}
          />
          <StatCard
            label="Marks from correct"
            value={`+${scoring.rawMarksFromCorrect}`}
            hint={`${scoring.marksPerCorrect} each`}
            icon={TrendingUp}
          />
          <StatCard
            label="Marks lost (wrong)"
            value={`−${scoring.rawMarksLostToWrong}`}
            hint={`${scoring.marksPerIncorrect} each`}
            icon={TrendingDown}
          />
        </div>

        {paper.bonusAttempted > 0 && (
          <div className="mt-4 rounded-[20px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <span className="font-semibold">Bonus segment: </span>
            {paper.bonusCorrect} correct / {paper.bonusAttempted} attempted
            {paper.bonusIncorrect > 0 ? ` · ${paper.bonusIncorrect} incorrect` : null}
          </div>
        )}
      </section>

      <section className="rounded-[30px] border border-emerald-500/20 bg-emerald-950/20 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-emerald-300">
          <Lightbulb className="h-6 w-6" />
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">Insights</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Generated from your attempt pattern—not generic coaching copy.
        </p>
        <ul className="mt-6 space-y-4">
          {insights.map((line, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-[22px] border border-white/10 bg-[#171e29] px-4 py-4 text-sm leading-relaxed text-slate-200"
            >
              <Brain className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {riskFlags.rushProne ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              Rush risk on wrongs
            </span>
          ) : null}
          {riskFlags.timeLeftOnTable ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-200">
              <Clock3 className="h-3.5 w-3.5" />
              Time left on table
            </span>
          ) : null}
          {riskFlags.subjectGap >= 20 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-200">
              <Target className="h-3.5 w-3.5" />
              Subject spread {riskFlags.subjectGap}%
            </span>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[30px] border border-white/10 bg-[#171e29] p-6">
          <div className="flex items-center gap-2 text-brand">
            <Gauge className="h-5 w-5" />
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">Time intelligence</h2>
          </div>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-500">Avg per attempted question</dt>
              <dd className="font-medium text-white">{timeBlock.avgSecPerAttempted}s</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-500">Median time (attempted)</dt>
              <dd className="font-medium text-white">{timeBlock.medianSecAttempted}s</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-500">Avg when correct</dt>
              <dd className="font-medium text-emerald-300">{timeBlock.avgSecWhenCorrect}s</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-500">Avg when wrong</dt>
              <dd className="font-medium text-rose-300">{timeBlock.avgSecWhenWrong}s</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-500">Fair-share time per Q</dt>
              <dd className="font-medium text-white">{timeBlock.idealAvgSecPerQ}s</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Slowest · Fastest (attempted)</dt>
              <dd className="text-right font-medium text-white">
                Q{timeBlock.slowest.index} ({timeBlock.slowest.seconds}s) · Q{timeBlock.fastestAttempted.index} (
                {timeBlock.fastestAttempted.seconds}s)
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#171e29] p-6">
          <div className="flex items-center gap-2 text-brand">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">Format split</h2>
          </div>
          <div className="mt-5 space-y-5">
            <FormatBlock label="MCQ" data={byQuestionType.mcq} />
            <FormatBlock label="Numerical" data={byQuestionType.numerical} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#171e29]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
            Subject ladder (weakest → strongest)
          </h2>
          <p className="mt-2 text-sm text-slate-500">Ranked by accuracy. Share shows fraction of your attempts.</p>
        </div>
        <div className="divide-y divide-white/10 px-6 py-2">
          {subjectsRanked.map((subject) => (
            <div key={subject.subject} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">{subject.subject}</p>
                <p className="text-xs text-slate-500">
                  {subject.correct}/{subject.attempted} right · {subject.shareOfAttemptsPct}% of attempts · avg{" "}
                  {subject.avgTimeSec}s / Q
                </p>
              </div>
              <div className="flex min-w-[200px] items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#8b9df8]"
                    style={{ width: `${Math.max(4, subject.accuracy)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-white">{subject.accuracy}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#171e29]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">Paper sections</h2>
            <p className="mt-1 text-sm text-slate-500">How each syllabus section behaved under time.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Section</th>
                  <th className="px-6 py-4 font-medium">Attempted</th>
                  <th className="px-6 py-4 font-medium">Correct</th>
                  <th className="px-6 py-4 font-medium">Accuracy</th>
                  <th className="px-6 py-4 font-medium">Avg time</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((row) => (
                  <tr key={row.section} className="border-t border-white/10 text-slate-200">
                    <td className="px-6 py-4">{row.section}</td>
                    <td className="px-6 py-4">{row.attempted}</td>
                    <td className="px-6 py-4">{row.correct}</td>
                    <td className="px-6 py-4">{row.accuracy}%</td>
                    <td className="px-6 py-4">{row.avgTimeSec}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#171e29] p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">Time per question</h2>
          <p className="mt-1 text-sm text-slate-500">All questions · bar width vs your slowest single question.</p>
          <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-2">
            {result.questions.map((question) => (
              <div key={question.id}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Q{question.index} · {question.subject}
                    {"section" in question && question.section ? ` · ${question.section}` : ""}
                    {"type" in question && question.type ? ` · ${question.type}` : ""}
                  </span>
                  <span className="text-slate-500">{question.timeSpent}s</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5">
                  <div
                    className={`h-2.5 rounded-full ${question.isCorrect ? "bg-emerald-500/70" : question.selectedAnswer ? "bg-rose-500/70" : "bg-slate-600/50"}`}
                    style={{ width: `${Math.max(6, (question.timeSpent / maxTime) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#171e29]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">Subject table (classic)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Attempted</th>
                <th className="px-6 py-4 font-medium">Correct</th>
                <th className="px-6 py-4 font-medium">Incorrect</th>
                <th className="px-6 py-4 font-medium">Accuracy</th>
                <th className="px-6 py-4 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((subject) => (
                <tr key={subject.subject} className="border-t border-white/10 text-slate-200">
                  <td className="px-6 py-4">{subject.subject}</td>
                  <td className="px-6 py-4">{subject.attempted}</td>
                  <td className="px-6 py-4">{subject.correct}</td>
                  <td className="px-6 py-4">{subject.incorrect}</td>
                  <td className="px-6 py-4">{subject.accuracy}%</td>
                  <td className="px-6 py-4">{subject.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#171e29]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">Solution key</h2>
          <p className="mt-1 text-sm text-slate-500">Full paper walkthrough with explanations.</p>
        </div>
        <div className="max-h-[560px] divide-y divide-white/10 overflow-y-auto">
          {result.questions.map((question) => {
            const examQuestion = exam?.questions.find((q: any) => q.id === question.id);
            const correctOption = examQuestion?.options?.find((o: any) => o.text === question.correctAnswer);
            const selectedOption = examQuestion?.options?.find((o: any) => o.text === question.selectedAnswer);

            return (
            <div key={question.id} className="px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-brand">
                    {question.subject}
                    {"section" in question && question.section ? ` · ${question.section}` : ""}
                    {"type" in question && question.type ? ` · ${question.type}` : ""} · Q{question.index}
                  </p>
                  <p className="mt-2 text-base text-slate-200">{question.text}</p>
                  {examQuestion?.image && (
                    <img src={examQuestion.image} alt="Question" className="mt-4 max-h-48 rounded border border-white/10 object-contain" />
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    question.isCorrect
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                  }`}
                >
                  {question.isCorrect ? "Correct" : question.selectedAnswer ? "Incorrect" : "Skipped"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Your answer</p>
                  <p className="mt-2 font-medium text-slate-200">{question.selectedAnswer ?? "Not attempted"}</p>
                  {selectedOption?.image && (
                    <img src={selectedOption.image} alt="Selected Option" className="mt-3 max-h-24 rounded border border-white/10 object-contain" />
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Correct answer</p>
                  <p className="mt-2 font-medium text-slate-200">{question.correctAnswer}</p>
                  {correctOption?.image && (
                    <img src={correctOption.image} alt="Correct Option" className="mt-3 max-h-24 rounded border border-white/10 object-contain" />
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
                {question.explanation}
              </div>
            </div>
          );
          })}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
      </div>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-white sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function FormatBlock({
  label,
  data,
}: {
  label: string;
  data: { attempted: number; correct: number; accuracy: number; avgTimeSec: number };
}) {
  if (data.attempted === 0) {
    return (
      <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs text-slate-500">No attempts in this format.</p>
      </div>
    );
  }
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{label}</p>
        <span className="text-sm font-semibold text-[#8b9df8]">{data.accuracy}%</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {data.correct}/{data.attempted} correct · avg {data.avgTimeSec}s per question
      </p>
    </div>
  );
}
