"use client";

// Ported verbatim from the design handoff's ganzy-components.jsx BottomNav
// (routed via Next.js Link instead of the design tool's onNavigate callback).

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard" },
  { id: "planner", href: "/plan", label: "Planner" },
  { id: "assess", href: "/progress", label: "Progress" },
  { id: "profile", href: "/you", label: "Profile" },
] as const;

function NavIcon({ name, color }: { name: string; color: string }) {
  const s = { width: 22, height: 22, fill: "none" as const, stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M3 12l9-9 9 9" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "planner":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "assess":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z" />
          <path d="M8 8h8M8 12h6" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0116 0" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <div
      className="sticky bottom-0 left-0 right-0 z-30 safe-bottom"
      style={{
        background: "var(--bg-surface)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--stone-border)",
        borderRadius: "24px 24px 0 0",
        padding: "12px 20px 0",
        display: "flex",
        justifyContent: "space-around",
        boxShadow: "var(--shadow-nav)",
      }}
    >
      {TABS.map((t) => {
        const active = pathname?.startsWith(t.href);
        const color = active ? "var(--ganzy-orange)" : "var(--fg-subtle)";
        return (
          <Link
            key={t.id}
            href={t.href}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color,
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 700,
              padding: 4,
            }}
          >
            <NavIcon name={t.id} color="currentColor" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
