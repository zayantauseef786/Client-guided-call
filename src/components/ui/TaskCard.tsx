"use client";

import { formatMinutesOfDay } from "@/lib/engine";
import type { PlanBlock } from "@/lib/types";

interface Props {
  block: PlanBlock;
  color: string;
  onToggle?: () => void;
}

export default function TaskCard({ block, color, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 py-3 text-left"
      disabled={!onToggle}
    >
      <span
        className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
        style={{
          borderColor: block.completed ? color : "var(--stone-border-2)",
          background: block.completed ? color : "transparent",
        }}
      >
        {block.completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      <span
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <span className="flex-1 min-w-0">
        <span
          className="block text-sm font-bold truncate"
          style={{
            color: "var(--fg-default)",
            textDecoration: block.completed ? "line-through" : "none",
            opacity: block.completed ? 0.6 : 1,
          }}
        >
          {block.label}
        </span>
      </span>
      <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--fg-subtle)" }}>
        {formatMinutesOfDay(block.startMin)}
      </span>
    </button>
  );
}
