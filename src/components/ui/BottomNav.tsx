"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard" },
  { id: "plan", href: "/plan", label: "Plan" },
  { id: "progress", href: "/progress", label: "Progress" },
  { id: "you", href: "/you", label: "You" },
] as const;

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const s = {
    width: 22,
    height: 22,
    fill: "none" as const,
    stroke: active ? "var(--ganzy-orange)" : "var(--fg-subtle)",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M3 12l9-9 9 9" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "plan":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "progress":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z" />
          <path d="M8 8h8M8 12h6" />
        </svg>
      );
    case "you":
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
    <nav
      className="sticky bottom-0 left-0 right-0 z-30 flex justify-around px-5 pt-3 safe-bottom rounded-t-3xl"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--stone-border)",
        boxShadow: "var(--shadow-nav)",
      }}
    >
      {TABS.map((t) => {
        const active = pathname?.startsWith(t.href);
        return (
          <Link
            key={t.id}
            href={t.href}
            className="flex flex-col items-center gap-1 py-1 px-2 text-xs font-bold"
            style={{ color: active ? "var(--ganzy-orange)" : "var(--fg-subtle)" }}
          >
            <NavIcon name={t.id} active={!!active} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
