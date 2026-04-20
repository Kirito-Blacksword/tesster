"use client";

import { useActionState } from "react";
import { registerStudent } from "@/app/auth/actions";
import Link from "next/link";
import type { Route } from "next";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerStudent, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-white/10 bg-[#111111] p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-slate-400">Join to take mocks and save your progress</p>
        </div>

        <div className="mt-8">
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </a>
        </div>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#111111] px-2 text-slate-500">Or continue with email</span>
          </div>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Full Name</label>
              <input name="name" type="text" required placeholder="John Doe"
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Email address</label>
              <input name="email" type="email" autoComplete="email" required placeholder="you@example.com"
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Phone number</label>
              <input name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210"
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input name="password" type="password" autoComplete="new-password" required placeholder="••••••••"
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Primary exam goal</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: "jee", name: "JEE Main" },
                  { id: "bitsat", name: "BITSAT" },
                  { id: "comedk", name: "COMEDK" },
                  { id: "kcet", name: "KCET" },
                ].map((exam) => (
                  <label key={exam.id} className="relative flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 transition has-[:checked]:border-brand has-[:checked]:bg-brand/10">
                    <input type="radio" name="primaryGoal" value={exam.id} defaultChecked={exam.id === "jee"} className="h-3.5 w-3.5 accent-brand" />
                    <span className="text-sm font-medium text-white">{exam.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {state?.error && (
            <div className="rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400">
              {state.error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-2xl bg-brand px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href={"/login" as Route} className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
