"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-context";

export function ShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (pathname === "/login" || pathname === "/register") return;
    if (!user) {
      router.replace("/login");
    }
  }, [isHydrated, user, pathname, router]);

  if (!isHydrated) {
    return <div className="min-h-screen bg-surface" aria-hidden />;
  }

  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  // Exam pages and onboarding render their own full UI — skip the app shell
  if (pathname.startsWith("/exam/") || pathname.startsWith("/onboarding/")) {
    return <>{children}</>;
  }

  if (!user) {
    return <div className="min-h-screen bg-surface" aria-hidden />;
  }

  return <AppShell>{children}</AppShell>;
}
