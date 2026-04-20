"use client";

import { useCallback, useEffect, useState } from "react";
import { loadUserAttempts, type UserAttemptRecord } from "@/lib/user-attempts";

export function useUserAttempts(): { attempts: UserAttemptRecord[]; refresh: () => void } {
  const [attempts, setAttempts] = useState<UserAttemptRecord[]>([]);

  const refresh = useCallback(() => {
    setAttempts(loadUserAttempts());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("storage", onUpdate);
    window.addEventListener("tesster-attempts-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("tesster-attempts-updated", onUpdate);
    };
  }, [refresh]);

  return { attempts, refresh };
}
