"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useGanzy } from "@/lib/store";

interface Props {
  title?: string;
  showStreak?: boolean;
  showBack?: boolean;
  variant?: "brand" | "plain";
  children?: ReactNode;
}

export default function TopBar({
  title = "Ganzy",
  showStreak = true,
  showBack = false,
  variant = "brand",
  children,
}: Props) {
  const router = useRouter();
  const streak = useGanzy((s) => s.streak.count);

  return (
    <div
      className="h-16 px-4 flex items-center justify-between border-b sticky top-0 z-20"
      style={{
        background: variant === "brand" ? "var(--bg-surface-cream)" : "var(--bg-surface)",
        borderColor: "var(--stone-border)",
      }}
    >
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="p-1 text-[var(--ganzy-orange)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <span
          className="font-bold text-xl tracking-[-0.02em]"
          style={{ color: variant === "brand" ? "var(--ganzy-orange)" : "var(--fg-default)" }}
        >
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {showStreak && (
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: "var(--ganzy-orange-soft)", color: "var(--ganzy-orange)" }}
          >
            <span className="text-base">🔥</span>
            {streak}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
