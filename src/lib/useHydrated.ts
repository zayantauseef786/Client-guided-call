"use client";

import { useEffect, useState } from "react";
import { useGanzy } from "./store";

/** Zustand persist is skipHydration'd so SSR and first client render match;
 * this hook rehydrates from localStorage once mounted and reports when done. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useGanzy.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
