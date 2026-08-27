"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGanzy } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

export default function Home() {
  const hydrated = useHydrated();
  const planConfirmed = useGanzy((s) => s.planConfirmed);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(planConfirmed ? "/dashboard" : "/onboarding");
  }, [hydrated, planConfirmed, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-canvas)" }}
    >
      <span className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--ganzy-orange)" }}>
        Ganzy
      </span>
    </div>
  );
}
