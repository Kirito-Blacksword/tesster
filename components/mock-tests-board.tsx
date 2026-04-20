"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import clsx from "clsx";
import { CheckCheck, ChevronRight, Lock, Search, SlidersHorizontal, Sparkles, Target } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { examConfigs, type ExamId } from "@/lib/exams";
import { useUserAttempts } from "@/hooks/use-user-attempts";
import { mergeCatalogWithAttempts } from "@/lib/user-attempts";
import { examSeries, getExamMockTests, type MockTestStatus } from "@/lib/mock-tests";

const filters: Array<{ label: string; value: "all" | MockTestStatus }> = [
  { label: "All", value: "all" },
  { label: "Not Attempted", value: "not_attempted" },
  { label: "Attempted", value: "attempted" },
  { label: "Upcoming", value: "upcoming" },
];

export function MockTestsBoard({ 
  examId, 
  customMockTests = [],
  layoutGroups,
}: { 
  examId: ExamId, 
  customMockTests?: import("@/lib/mock-tests").MockTest[],
  layoutGroups?: any[]
}) {
  const [activeFilter, setActiveFilter] = useState<"all" | MockTestStatus>("all");
  const [activeTab, setActiveTab] = useState<{ category: string, section: string } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [savedResultIds, setSavedResultIds] = useState<Record<string, string>>({});
  const { hasPremiumForExam } = useAuth();
  const { attempts } = useUserAttempts();

  // Load saved resultIds from localStorage on mount
  useEffect(() => {
    const map: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("tesster-resultId-")) {
        const testId = key.replace("tesster-resultId-", "");
        map[testId] = localStorage.getItem(key)!;
      }
    }
    setSavedResultIds(map);
  }, []);
  const tests = useMemo(
    () => mergeCatalogWithAttempts([...getExamMockTests(examId), ...customMockTests], attempts),
    [examId, attempts, customMockTests],
  );
  const series = examSeries[examId];
  const exam = examConfigs[examId];

  const dynamicGroups = useMemo(() => {
    // Use layoutGroups if provided, otherwise deep clone the static groups
    const baseGroups = layoutGroups || series.groups;
    const groups = JSON.parse(JSON.stringify(baseGroups)) as typeof series.groups;
    
    customMockTests.forEach(test => {
      const cat = test.category;
      const sec = test.section;
      let group = groups.find(g => g.label === cat);
      if (!group) {
        group = { label: cat, items: [] };
        groups.push(group);
      }
      if (!group.items.find(i => i.label === sec)) {
        group.items.push({
          id: `custom-${cat}-${sec}`.toLowerCase().replace(/\s+/g, '-'),
          label: sec,
        });
      }
    });

    // Filter out groups and items that have no tests
    const allTests = [...getExamMockTests(examId), ...customMockTests];
    const filteredGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => allTests.some(t => t.category === group.label && t.section === item.label))
    })).filter(group => group.items.length > 0);

    return filteredGroups;
  }, [series.groups, customMockTests, examId, layoutGroups]);

  const currentTab = activeTab || {
    category: dynamicGroups[0]?.label,
    section: dynamicGroups[0]?.items[0]?.label,
  };

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      if (test.category !== currentTab.category || test.section !== currentTab.section) return false;
      const matchesFilter = activeFilter === "all" ? true : test.status === activeFilter;
      const matchesSearch = `${test.title} ${test.section} ${test.category}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search, tests, currentTab]);

  return (
    <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-10">
      <aside className="official-panel p-6">
        <p className="text-3xl font-semibold text-ink">All Tests</p>
        <div className="mt-8 space-y-8">
          {dynamicGroups.map((group) => {
            const isExpanded = expandedGroups[group.label] !== false;
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => setExpandedGroups(prev => ({ ...prev, [group.label]: !isExpanded }))}
                  className="flex w-full items-center justify-between gap-3 text-left outline-none transition opacity-80 hover:opacity-100"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">{group.label}</p>
                    <div className="h-px flex-1 bg-line/80" />
                  </div>
                  <ChevronRight className={clsx("h-4 w-4 text-muted transition-transform", isExpanded && "rotate-90")} />
                </button>
                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab({ category: group.label, section: item.label })}
                        className={clsx(
                          "flex w-full items-center justify-between rounded-[22px] px-4 py-4 text-left text-sm transition",
                          currentTab.category === group.label && currentTab.section === item.label
                            ? "bg-ink text-surface"
                            : "bg-surface text-muted hover:bg-panel hover:text-ink",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge ? (
                            <span className="rounded-full bg-[#f699aa] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-950">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <section className="space-y-6">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted">{exam.name}</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink">
              {series.title}
            </h1>
          </div>

          <label className="flex w-full items-center gap-3 rounded-full border border-line/80 bg-panel px-5 py-3 text-muted xl:max-w-sm">
            <Search className="h-5 w-5" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tests"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>
        </header>

        <div className="rounded-[24px] border border-line/80 bg-panel p-2">
          <div className="flex flex-wrap gap-2">
            {Object.values(examConfigs).map((item) => (
              <Link
                key={item.id}
                href={`/mock-tests?exam=${item.id}` as Route}
                className={clsx(
                  "inline-flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm transition",
                  item.id === examId
                    ? "bg-ink text-surface"
                    : "text-muted hover:bg-surface hover:text-ink",
                )}
              >
                <span
                  className={clsx(
                    "h-2 w-2 rounded-full",
                    item.id === examId ? "bg-emerald-500" : "bg-slate-600",
                  )}
                />
                <span>{item.name}</span>
                <span className="text-xs opacity-60">{item.maxMarks}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-full border border-line/80 bg-panel px-4 py-3 text-sm text-muted">
              <SlidersHorizontal className="h-4 w-4" />
              Sort by
            </div>
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={clsx(
                  "rounded-full border px-5 py-3 text-sm font-medium transition",
                  activeFilter === filter.value
                    ? "border-ink bg-ink text-surface"
                    : "border-line/80 bg-panel text-ink hover:bg-surface",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-muted">{filteredTests.length} tests available</div>
        </div>

        <div className="space-y-6">
          {filteredTests.map((test) => {
            const premiumLocked = test.requiresPremium && !hasPremiumForExam(examId);
            const isUpcoming = test.status === "upcoming";
            const canOpen = !premiumLocked && !isUpcoming;

            return (
              <article
                key={test.id}
                className={clsx(
                  "overflow-hidden rounded-[28px] border bg-panel",
                  premiumLocked ? "border-amber-500/40" : "border-line/80",
                )}
              >
                <div className="flex flex-col gap-6 p-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex gap-4">
                    <div
                      className={clsx(
                        "rounded-full p-3",
                        premiumLocked ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-emerald-400/15 text-emerald-300",
                      )}
                    >
                      {premiumLocked ? <Lock className="h-5 w-5" /> : <CheckCheck className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold text-ink">{test.title}</h2>
                        {test.requiresPremium ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand">
                            <Sparkles className="h-3 w-3" />
                            Premium
                          </span>
                        ) : (
                          <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">Free</span>
                        )}
                      </div>
                      <p className="mt-2 text-base text-muted">{test.subtitle}</p>
                      <p className="mt-2 text-sm uppercase tracking-[0.28em] text-muted">{test.section}</p>
                      {premiumLocked ? (
                        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                          Included with {exam.name} premium or the all-access pass.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={
                        savedResultIds[test.id]
                          ? `/results?exam=${test.id}&resultId=${savedResultIds[test.id]}` as Route
                          : `/results?exam=${examId}` as Route
                      }
                      className="inline-flex items-center justify-center rounded-full border border-line/80 bg-surface px-6 py-3 text-sm font-medium text-ink transition hover:bg-panel"
                    >
                      View Analysis
                    </Link>
                    {canOpen ? (
                      <Link
                        href={`/exam/${examId}?testId=${encodeURIComponent(test.id)}` as Route}
                        className="inline-flex items-center justify-center rounded-full bg-[#78e2b8] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105"
                      >
                        {test.status === "resume" ? "Resume Test" : "Open Test"}
                      </Link>
                    ) : premiumLocked ? (
                      <Link
                        href={`/pricing?exam=${examId}` as Route}
                        className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105"
                      >
                        Unlock premium
                      </Link>
                    ) : (
                      <span className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-line/80 bg-surface px-6 py-3 text-sm font-medium text-muted">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 border-t border-line/80 bg-surface px-6 py-4 text-sm text-ink sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted" />
                    <span>
                      Score: <strong>{test.score}/{test.maxScore}</strong>
                    </span>
                  </div>
                  <div>Accuracy: <strong>{test.accuracy}%</strong></div>
                  <div>Status: <strong className="capitalize">{test.status.replace("_", " ")}</strong></div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
