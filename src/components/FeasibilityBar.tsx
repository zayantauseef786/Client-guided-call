"use client";

import { useState } from "react";
import type { FeasibilityResult } from "@/lib/engine";
import ProgressBar from "./ui/ProgressBar";

const STATUS_COPY: Record<FeasibilityResult["status"], { label: string; color: string }> = {
  ahead: { label: "Ahead of pace", color: "var(--ahead-text)" },
  onTrack: { label: "On track", color: "var(--success-text)" },
  behind: { label: "Behind — recalibrate to catch up", color: "var(--danger-text)" },
};

interface Props {
  feasibility: FeasibilityResult;
  onRecalibrate: () => void;
}

export default function FeasibilityBar({ feasibility, onRecalibrate }: Props) {
  const [justUpdated, setJustUpdated] = useState(false);
  const status = STATUS_COPY[feasibility.status];

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2 mx-6 mt-4"
      style={{ background: "var(--bg-surface-cream)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
          Plan feasibility
        </span>
        <button
          onClick={() => {
            onRecalibrate();
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 2200);
          }}
          className="text-xs font-bold rounded-full px-3 py-1"
          style={{ background: "var(--ganzy-orange)", color: "white" }}
        >
          Recalibrate
        </button>
      </div>
      <ProgressBar value={Math.min(100, feasibility.percent)} color={status.color} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ color: status.color }}>
          {feasibility.percent}% · {status.label}
        </span>
        {justUpdated && (
          <span className="text-xs font-bold" style={{ color: "var(--success-text)" }}>
            ✓ Updated
          </span>
        )}
      </div>
    </div>
  );
}
