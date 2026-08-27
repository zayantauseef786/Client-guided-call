"use client";

// Ported verbatim from the design handoff's ganzy-components.jsx TopBar.

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
      className="sticky top-0 z-20"
      style={{
        height: 64,
        padding: "0 16px",
        background: variant === "brand" ? "var(--bg-surface-cream)" : "var(--bg-surface)",
        borderBottom: "1px solid var(--stone-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {showBack && (
          <button
            onClick={() => router.back()}
            aria-label="Back"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--ganzy-orange)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <span
          style={{
            fontWeight: 700,
            fontSize: 20,
            color: variant === "brand" ? "var(--ganzy-orange)" : "var(--fg-default)",
            letterSpacing: "-0.5px",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {showStreak && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--bg-accent-soft)",
              padding: "4px 12px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--ganzy-orange)",
            }}
          >
            <span style={{ fontSize: 16 }}>🔥</span>
            {streak}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
