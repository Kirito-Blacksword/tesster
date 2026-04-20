"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import Link from "next/link";
import type { Route } from "next";

export default function DashboardPage() {
  const { user, isHydrated, logout } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !user) {
      window.location.href = "/login";
    }
  }, [user, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/results")
      .then((res) => res.json())
      .then((data) => {
        if (data.results) setResults(data.results);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, isHydrated]);

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
            Welcome, {user.name.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-slate-400">View your past mock attempts and track your progress.</p>
        </div>
        <button
          onClick={logout}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          Sign out
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-white">Your Past Results</h2>
        {loading ? (
          <p className="mt-4 text-slate-400">Loading your history...</p>
        ) : results.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-slate-400">
            You haven't attempted any mock tests yet.
            <div className="mt-4">
              <Link href={"/mock-tests?exam=jee" as Route} className="text-brand hover:underline">
                Take a test now
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
              <div key={result.id} className="rounded-2xl border border-white/10 bg-[#171e29] p-5 transition hover:border-white/20">
                <p className="text-sm font-medium text-slate-400">{new Date(result.createdAt).toLocaleDateString()}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{result.examName}</h3>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Score</p>
                    <p className="text-2xl font-bold text-[#8b9df8]">{result.score}<span className="text-sm text-slate-500">/{result.maxScore}</span></p>
                  </div>
                  <Link href={`/results?exam=${result.examId}&resultId=${result.id}` as Route} className="rounded-xl bg-white/5 px-3 py-1.5 text-sm font-medium text-brand hover:bg-white/10">
                    View Analysis
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
