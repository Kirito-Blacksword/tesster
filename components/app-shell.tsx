"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  ClipboardList,
  Home,
  LayoutDashboard,
  Menu,
  MoonStar,
  UserRound,
  SunMedium,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { examConfigs, getExamConfig, type ExamId } from "@/lib/exams";
import { useAuth } from "@/components/auth-context";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Mock Tests", href: "/mock-tests?exam=jee", icon: ClipboardList },
  { label: "My Results", href: "/dashboard", icon: LayoutDashboard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeExam = useMemo(() => {
    if (pathname.startsWith("/exam/")) {
      const examId = pathname.split("/")[2];
      return getExamConfig(examId) ?? examConfigs.jee;
    }

    const resultExam = searchParams.get("exam");
    if (resultExam) {
      return getExamConfig(resultExam) ?? examConfigs.jee;
    }

    if (pathname.startsWith("/mock-tests")) {
      const testsExam = searchParams.get("exam");
      if (testsExam) {
        return getExamConfig(testsExam) ?? examConfigs.jee;
      }
    }

    return examConfigs.jee;
  }, [pathname, searchParams]);

  return (
    <div className="min-h-screen bg-surface text-ink transition-colors">
      <div className="flex min-h-screen">
        <aside className="hidden w-[310px] shrink-0 border-r-0 bg-surface lg:flex">
          <SidebarContent
            pathname={pathname}
            activeExamId={activeExam.id}
            mounted={mounted}
            resolvedTheme={resolvedTheme}
            setTheme={setTheme}
          />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line/80 bg-surface/92 px-4 py-4 backdrop-blur sm:px-6 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-2xl border border-line/80 bg-panel/80 p-2"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold">Tesster</p>
              <p className="text-xs text-muted">{activeExam.name}</p>
            </div>
            <Link href={(user ? "/dashboard" : "/login") as Route} className="rounded-full border border-line/80 bg-panel/80 px-3 py-2 text-xs text-muted">
              {user ? "Dashboard" : "Log In"}
            </Link>
          </header>

          <div className="flex-1 overflow-x-hidden">{children}</div>
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden">
          <div className="h-full w-[300px] bg-surface">
            <div className="flex items-center justify-end p-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-2xl border border-line/80 bg-panel/80 p-2"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              activeExamId={activeExam.id}
              mounted={mounted}
              resolvedTheme={resolvedTheme}
              setTheme={setTheme}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SidebarContent({
  pathname,
  activeExamId,
  mounted,
  resolvedTheme,
  setTheme,
  onNavigate,
}: {
  pathname: string;
  activeExamId: ExamId;
  mounted: boolean;
  resolvedTheme?: string;
  setTheme: (theme: string) => void;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();

  return (
    <div className="flex h-full w-full flex-col px-7 py-8">
      <div className="flex items-center gap-4 px-1">
        <div className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center">
          <img src="/logo.png" alt="Tesster Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-5xl font-black tracking-[-0.045em] text-ink">
            Tesster
          </p>
          <p className="mt-1.5 text-base font-extrabold uppercase tracking-[0.4em] text-muted">Mock Platform</p>
        </div>
      </div>

      <nav className="mt-12 space-y-3">
        {navItems.map((item) => {
          const href = (
            item.label === "Mock Tests"
              ? `/mock-tests?exam=${activeExamId}`
              : item.href
          ) as Route;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.label === "Mock Tests"
                ? pathname.startsWith("/mock-tests")
                : item.label === "My Results"
                  ? pathname.startsWith("/dashboard")
                  : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-4 rounded-[26px] px-6 py-4 text-[1.375rem] font-semibold leading-snug transition",
                isActive
                  ? "bg-ink text-surface shadow-soft"
                  : "text-muted hover:bg-panel hover:text-ink",
              )}
            >
              <Icon className="h-7 w-7 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-4 px-1">
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line/80 bg-panel/80 text-muted transition hover:bg-panel hover:text-ink"
          aria-label="Toggle dark mode"
        >
          {mounted && resolvedTheme === "dark" ? (
            <SunMedium className="h-5 w-5" />
          ) : (
            <MoonStar className="h-5 w-5" />
          )}
        </button>
        <span className="text-sm font-medium uppercase tracking-[0.34em] text-muted">
          {mounted ? (resolvedTheme === "dark" ? "Dark" : "Light") : "Theme"}
        </span>
      </div>

      <Link
        href={(user ? "/profile" : "/login") as Route}
        onClick={onNavigate}
        className="mt-6 rounded-[30px] border border-line/80 bg-panel px-5 py-5 text-ink transition hover:border-brand/40 hover:bg-panel/90"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffb84d,#5fd6a8)] text-base font-semibold text-slate-950">
            {user ? initialsFromName(user.name) : "?"}
          </div>
          <div>
            <p className="text-base font-semibold">{user?.name ?? "Log In / Register"}</p>
            <p className="text-sm text-muted">{user ? "View profile" : "Create your account"}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm text-muted">
          <UserRound className="h-4 w-4" />
          {user ? `${user.phone ?? "Add phone number"}` : "Save progress and take mocks."}
        </div>
      </Link>
    </div>
  );
}
