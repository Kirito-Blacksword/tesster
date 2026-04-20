"use client";

import { useActionState } from "react";
import { savePhone } from "./actions";

export default function PhoneOnboardingPage() {
  const [state, formAction, isPending] = useActionState(savePhone, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0f1a] px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <img src="/logo.png" alt="Tesster" className="h-10 w-10 object-contain" />
          <span className="font-[family-name:var(--font-display)] text-2xl font-black text-white">Tesster</span>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8b9df8]/15 text-3xl">
              📱
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
              One last step
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Add your phone number so we can reach you about your account.
            </p>
          </div>

          <form action={formAction} className="mt-7 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Phone number
              </label>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                autoFocus
                placeholder="+91 98765 43210"
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-[#8b9df8] focus:ring-1 focus:ring-[#8b9df8]"
              />
            </div>

            {(state as any)?.error && (
              <p className="text-sm text-rose-400">{(state as any).error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-[#8b9df8] py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
