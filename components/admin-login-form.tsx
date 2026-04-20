"use client";

import { useActionState } from "react";
import { loginEmployee } from "@/app/admin/actions";

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginEmployee as any, undefined);

  return (
    <form action={formAction} className="mx-auto mt-20 max-w-sm rounded-2xl border border-white/10 bg-[#171e29] p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-white">Employee Login</h2>
      <p className="mt-2 text-sm text-slate-400">Enter the internal passcode to continue.</p>
      
      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="passcode" className="block text-sm font-medium text-slate-300">Passcode</label>
          <input
            type="password"
            name="passcode"
            id="passcode"
            required
            autoComplete="current-password"
            className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
            placeholder="Enter admin password"
          />
          {(state as any)?.error && <p className="mt-1 text-sm text-rose-400">{(state as any).error}</p>}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-brand px-4 py-2 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Authenticating..." : "Login"}
        </button>
      </div>
    </form>
  );
}
