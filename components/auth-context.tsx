"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ExamId } from "@/lib/exams";
import { useRouter } from "next/navigation";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  primaryGoal?: ExamId;
  premiumExamIds?: ExamId[];
  allAccess?: boolean;
};

type AuthContextValue = {
  user: UserProfile | null;
  isHydrated: boolean;
  logout: () => void;
  login: (profile: any) => void;
  hasPremiumForExam: (examId: ExamId) => boolean;
  purchaseExamPremium: (examId: ExamId) => void;
  purchaseAllAccess: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser({
            ...data.user,
            primaryGoal: data.user.primaryGoal || "jee",
            premiumExamIds: data.user.premiumExamIds || [],
            allAccess: data.user.allAccess || false,
          });
        }
        setIsHydrated(true);
      })
      .catch(() => setIsHydrated(true));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }); // we should create this or use action
    window.location.href = "/";
  };

  const login = () => { };
  const hasPremiumForExam = (examId: ExamId) => {
    if (!user) return false;
    if (user.allAccess) return true;
    return user.premiumExamIds?.includes(examId) ?? false;
  };
  const purchaseExamPremium = () => { };
  const purchaseAllAccess = () => { };

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      logout,
      login,
      hasPremiumForExam,
      purchaseExamPremium,
      purchaseAllAccess,
    }),
    [user, isHydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function firstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || "there";
}
