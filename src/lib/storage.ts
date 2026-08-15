import { useEffect, useState } from "react";

export const STORE = {
  audit: "s2i.audit.v1",
  resume: "s2i.resume.v1",
  xray: "s2i.xray.v1",
  passport: "s2i.passport.v1",
} as const;

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): { ok: boolean; error?: string } {
  if (typeof window === "undefined") return { ok: false, error: "no window" };
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "storage full" };
  }
}

export function removeKey(key: string) {
  if (typeof window !== "undefined") window.localStorage.removeItem(key);
}

/**
 * Client-side persisted state. Reads after hydration so SSR markup stays stable.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(loadJSON<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (hydrated) saveJSON(key, value);
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
