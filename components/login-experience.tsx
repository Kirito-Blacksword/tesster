"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Layers,
  Shield,
  Sparkles,
  Timer,
} from "lucide-react";
import { examConfigs, type ExamId } from "@/lib/exams";
import { useAuth } from "@/components/auth-context";

const features = [
  {
    icon: Timer,
    title: "Exam-accurate timers",
    body: "Countdowns and auto-submit behave like the real CBT so you rehearse pressure, not surprises.",
  },
  {
    icon: Layers,
    title: "Exam-specific marking",
    body: "JEE, BITSAT, COMEDK, and KCET each carry their own scoring rules—including bonus flows where they apply.",
  },
  {
    icon: BarChart3,
    title: "Results that explain",
    body: "Score, accuracy, mistakes, and time use are summarized so each mock points to what to fix next.",
  },
  {
    icon: ClipboardList,
    title: "Organised mock library",
    body: "Full tests, PYQ-style sets, and drills grouped the way you actually browse during prep.",
  },
];

const legalSections = [
  {
    title: "Terms of use",
    body: `By creating a Tesster account, you agree to use the platform only for lawful personal study. You will not attempt to scrape, reverse engineer, or redistribute our content or software. We may update features, pricing descriptions, or these terms; continued use after notice means you accept the changes. Tesster is a practice tool and does not guarantee exam outcomes.`,
  },
  {
    title: "Privacy (summary)",
    body: `We store your profile and mock results locally in this browser session so your dashboard reflects your attempts. When you sign in on this demo, your name, email, and phone are saved only on your device—we do not run a live backend in this build. Do not use a password you reuse elsewhere; this login is for demonstration.`,
  },
  {
    title: "Disclaimer",
    body: `Mock papers and analytics are illustrative. Always cross-check syllabus and official notifications from NTA, BITS, KEA, and COMEDK. Tesster is not affiliated with any testing authority.`,
  },
];

export function LoginExperience() {
  const router = useRouter();
  const { user, isHydrated, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState<ExamId>("jee");
  const [accepted, setAccepted] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  useEffect(() => {
    if (isHydrated && user) {
      router.replace("/");
    }
  }, [isHydrated, user, router]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!accepted || !name.trim() || !email.trim()) return;
    login({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      primaryGoal: goal,
      acceptedTerms: accepted,
    });
    router.push("/");
  };

  if (!isHydrated) {
    return <div className="min-h-screen bg-surface" />;
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line/80 bg-panel/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <div className="flex items-center gap-3 text-brand">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-[0.28em]">Tesster</span>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
              Mock tests that feel like exam day—then show you what to fix.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted">
              Sign in to open your dashboard, track every attempt in this browser, and move between JEE, BITSAT, COMEDK, and KCET without losing context.
            </p>
          </div>
          <div className="rounded-[24px] border border-line/80 bg-panel/80 p-5 shadow-soft lg:max-w-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Covers</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {Object.values(examConfigs).map((exam) => (
                <li key={exam.id} className="flex items-center gap-2 text-ink">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  {exam.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">What you get</h2>
          <p className="mt-2 text-sm text-muted">
            Everything in the app today—same sidebar, mock library, live exam UI, and results center—unlocks after you sign in.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-[22px] border border-line/80 bg-panel/50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-[24px] border border-line/80 bg-surface p-6">
            <div className="flex items-center gap-2 text-brand">
              <BookOpen className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Fine print</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Tesster is built for serious practice: your stats on the home screen and mock cards come from attempts you finish in this browser. Read the full terms and privacy notes before you continue—they open in a panel so you do not leave this page.
            </p>
            <button
              type="button"
              onClick={() => setShowLegal(true)}
              className="mt-4 text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              Terms, privacy & disclaimer
            </button>
          </div>
        </section>

        <section className="lg:pt-2">
          <div className="sticky top-8 rounded-[28px] border border-line/80 bg-panel p-6 shadow-soft sm:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">Sign in</h2>
            <p className="mt-2 text-sm text-muted">
              Demo login—your details stay in this browser. Use a name you want to see on the dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Full name</span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-2xl border border-line/80 bg-surface px-4 py-3 text-ink outline-none ring-brand/30 focus:ring-2"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-2xl border border-line/80 bg-surface px-4 py-3 text-ink outline-none ring-brand/30 focus:ring-2"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Phone (optional)</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  className="mt-1.5 w-full rounded-2xl border border-line/80 bg-surface px-4 py-3 text-ink outline-none ring-brand/30 focus:ring-2"
                  placeholder="+91 …"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Password (demo)</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-2xl border border-line/80 bg-surface px-4 py-3 text-ink outline-none ring-brand/30 focus:ring-2"
                  placeholder="Not verified in this build"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Primary goal</span>
                <select
                  value={goal}
                  onChange={(event) => setGoal(event.target.value as ExamId)}
                  className="mt-1.5 w-full rounded-2xl border border-line/80 bg-surface px-4 py-3 text-ink outline-none ring-brand/30 focus:ring-2"
                >
                  {Object.values(examConfigs).map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line/60 bg-surface/80 p-4 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-line text-brand"
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowLegal(true)}
                    className="font-medium text-brand underline-offset-2 hover:underline"
                  >
                    Terms of use
                  </button>
                  , privacy summary, and disclaimer for this demo product.
                </span>
              </label>

              <button
                type="submit"
                disabled={!accepted}
                className="w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950"
              >
                Continue to Tesster
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              After you continue, you&apos;ll land on your dashboard with the full app and sidebar.
            </p>
          </div>
        </section>
      </div>

      <footer className="border-t border-line/80 bg-panel/30 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">© {new Date().getFullYear()} Tesster · Mock preparation platform</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <button type="button" onClick={() => setShowLegal(true)} className="text-brand hover:underline">
              Legal
            </button>
            <span className="text-muted">Contact support via your profile after sign-in.</span>
          </div>
        </div>
      </footer>

      {showLegal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-title"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-line/80 bg-panel p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-brand">
                <Shield className="h-5 w-5" />
                <h2 id="legal-title" className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
                  Terms & policies
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowLegal(false)}
                className="rounded-full border border-line/80 px-3 py-1 text-sm text-muted hover:bg-surface"
              >
                Close
              </button>
            </div>
            <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted">
              {legalSections.map((section) => (
                <div key={section.title}>
                  <h3 className="font-semibold text-ink">{section.title}</h3>
                  <p className="mt-2">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
