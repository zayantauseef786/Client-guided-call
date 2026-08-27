"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  color?: string;
}

export default function Chip({ children, active, onClick, color }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border",
        active
          ? "text-[var(--fg-on-accent)] border-transparent"
          : "text-[var(--fg-muted)] border-[var(--stone-border-2)] bg-[var(--bg-surface)]",
      ].join(" ")}
      style={active ? { background: color ?? "var(--ganzy-orange)" } : undefined}
    >
      {children}
    </button>
  );
}
