"use client";

import { AuthProvider } from "@/components/auth-context";
import { ShellGate } from "@/components/shell-gate";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ShellGate>{children}</ShellGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
