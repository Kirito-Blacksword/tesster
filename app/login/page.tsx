"use client";

import { useActionState } from "react";
import { loginStudent } from "@/app/auth/actions";
import Link from "next/link";
import type { Route } from "next";
import { BarChart3, CheckCircle2, ClipboardList, Timer, Layers } from "lucide-react";

const features = [
  { icon: Timer,        title: "Real exam timers",       body: "Auto-submit countdowns that mirror the actual CBT environment." },
  { icon: Layers,       title: "Exam-specific marking",  body: "JEE, BITSAT, COMEDK & KCET each use their own scoring rules." },
  { icon: ClipboardList,title: "Organised mock library", body: "Full tests, PYQ sets, and drills grouped the way you browse during prep." },
  { icon: BarChart3,    title: "Deep result analysis",   body: "Score, accuracy, time-per-question, and subject breakdowns after every mock." },
];

const exams = ["JEE Main", "BITSAT", "COMEDK", "KCET"];

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginStudent, undefined);

  return (
    <main className="flex min-h-screen bg-[#0a0f1a]">

      {/* ── LEFT: branding + features ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0d1424] border-r border-white/5 px-14 py-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Tesster" className="h-10 w-10 object-contain" />
          <span className="font-[family-name:var(--font-display)] text-2xl font-black tracking-tight text-white">Tesster</span>
        </div>

        {/* Hero text */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b9df8]">Mock Test Platform</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-white">
            Practice like it's exam day.<br />Analyse like a topper.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Tesster gives JEE, BITSAT, COMEDK, and KCET aspirants a CBT-accurate mock environment with instant deep analytics — so every practice session tells you exactly what to fix.
          </p>

          {/* Exam badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {exams.map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {e}
              </span>
            ))}
          </div>

          {/* Feature grid */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b9df8]/15 text-[#8b9df8]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Tesster · Not affiliated with NTA, BITS, KEA, or COMEDK.</p>
      </div>

      {/* ── RIGHT: login form ── */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">

        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <img src="/logo.png" alt="Tesster" className="h-9 w-9 object-contain" />
          <span className="font-[family-name:var(--font-display)] text-2xl font-black text-white">Tesster</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">Sign in to access your mocks and results.</p>

          {/* Google */}
          <a
            href="/api/auth/google"
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0a0f1a] px-3 text-slate-500">or continue with email</span>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Email address</label>
              <input
                name="email" type="email" autoComplete="email" required
                placeholder="you@example.com"
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-[#8b9df8] focus:ring-1 focus:ring-[#8b9df8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                name="password" type="password" autoComplete="current-password" required
                placeholder="••••••••"
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-[#8b9df8] focus:ring-1 focus:ring-[#8b9df8]"
              />
            </div>

            {(state as any)?.error && (
              <div className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-400">
                {(state as any).error}
              </div>
            )}

            <button
              type="submit" disabled={isPending}
              className="mt-2 flex w-full justify-center rounded-2xl bg-[#8b9df8] px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link href={"/register" as Route} className="font-semibold text-[#8b9df8] hover:underline">
              Register here
            </Link>
          </p>

          <p className="mt-3 text-center text-xs text-slate-600">
            New here? Register to save your phone number, track all attempts, and access your results from any device.
          </p>

          {/* Mobile feature list */}
          <div className="mt-10 rounded-2xl border border-white/8 bg-white/4 p-5 lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">What you get</p>
            <ul className="mt-3 space-y-2">
              {features.map(({ title }) => (
                <li key={title} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
