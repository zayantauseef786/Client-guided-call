"use client";

import { useEffect } from "react";
import { useGanzy } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

/** Keeps <html data-theme> in sync with persisted dark-mode state after hydration. */
export default function ThemeSync() {
  const hydrated = useHydrated();
  const darkMode = useGanzy((s) => s.darkMode);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [hydrated, darkMode]);

  return null;
}
