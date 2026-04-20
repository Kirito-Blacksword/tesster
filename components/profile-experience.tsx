"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { examConfigs, type ExamId } from "@/lib/exams";
import { useAuth } from "@/components/auth-context";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function ProfileExperience() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [phone, setPhone] = useState("");
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!user) router.replace("/login");
    else setPhone(user.phone ?? "");
  }, [user, router]);

  if (!user) return null;

  const goal = examConfigs[user.primaryGoal ?? "jee"];
  const planLabel = user.allAccess
    ? "All-Access Pass"
    : user.premiumExamIds && user.premiumExamIds.length > 0
      ? `Premium · ${user.premiumExamIds.map((id: string) => examConfigs[id as ExamId]?.name).filter(Boolean).join(", ")}`
      : "Free Basic Tier";

  const savePhone = async () => {
    if (!phone.trim()) { setPhoneError("Phone number is required"); return; }
    setSavingPhone(true);
    setPhoneError("");
    try {
      const res = await fetch("/api/user/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setEditingPhone(false);
        // Force re-fetch of user data
        const me = await fetch("/api/auth/me").then(r => r.json());
        if (me.user) setPhone(me.user.phone ?? "");
      } else {
        setPhoneError("Failed to save. Try again.");
      }
    } catch {
      setPhoneError("Network error.");
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <section className="official-panel overflow-hidden">
        <div className="border-b border-line/80 px-6 py-6">
          <p className="text-sm uppercase tracking-[0.28em] text-brand">Profile</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink">{user.name}</h1>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-[28px] border border-line/80 bg-surface p-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffb84d,#5fd6a8)] text-3xl font-semibold text-slate-950">
              {initialsFromName(user.name)}
            </div>
            <p className="mt-4 text-xl font-semibold text-ink">{user.name}</p>
            <p className="mt-1 text-sm text-muted">Student account</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ProfileField label="Email" value={user.email} />

            {/* Phone — editable */}
            <div className="rounded-[24px] border border-line/80 bg-surface p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Phone</p>
                {!editingPhone && (
                  <button
                    type="button"
                    onClick={() => { setEditingPhone(true); setPhone(user.phone ?? ""); }}
                    className="text-xs text-brand hover:underline"
                  >
                    {user.phone ? "Edit" : "Add"}
                  </button>
                )}
              </div>
              {editingPhone ? (
                <div className="mt-3 space-y-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    autoFocus
                    className="w-full rounded-xl border border-line/80 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                  />
                  {phoneError && <p className="text-xs text-rose-400">{phoneError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={savePhone}
                      disabled={savingPhone}
                      className="rounded-xl bg-brand px-4 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-50"
                    >
                      {savingPhone ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPhone(false)}
                      className="rounded-xl border border-line/80 px-4 py-1.5 text-xs text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-lg font-medium text-ink">
                  {user.phone?.trim() ? user.phone : <span className="text-muted">Not set</span>}
                </p>
              )}
            </div>

            <ProfileField label="Primary goal" value={goal.name} />
            <ProfileField label="Plan" value={planLabel} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-line/80 px-6 py-6">
          <Link
            href={`/mock-tests?exam=${user.primaryGoal ?? "jee"}` as Route}
            className="inline-flex rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-surface transition hover:opacity-90 dark:bg-white dark:text-slate-950"
          >
            Go to mock tests
          </Link>
          <button
            type="button"
            onClick={() => { logout(); router.replace("/login"); }}
            className="inline-flex rounded-2xl border border-line/80 bg-surface px-5 py-3 text-sm font-medium text-ink transition hover:bg-panel"
          >
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-line/80 bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-3 text-lg font-medium text-ink">{value}</p>
    </div>
  );
}
