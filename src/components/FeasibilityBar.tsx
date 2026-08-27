"use client";

import { useState } from "react";
import type { FeasibilityResult } from "@/lib/engine";
import ProgressBar from "./ui/ProgressBar";

const STATUS_COPY: Record<FeasibilityResult["status"], { label: string; color: string }> = {
  ahead: { label: "Ahead of pace — feasible", color: "var(--ahead-text)" },
  onTrack: { label: "On track — feasible", color: "var(--success-text)" },
  behind: { label: "Tight — recalibrate to catch up", color: "var(--danger-text)" },
};

interface Props {
  feasibility: FeasibilityResult;
  onRecalibrate: () => void;
}

export default function FeasibilityBar({ feasibility, onRecalibrate }: Props) {
  const [justUpdated, setJustUpdated] = useState(false);
  const [changeLogOpen, setChangeLogOpen] = useState(false);
  const status = STATUS_COPY[feasibility.status];

  return (
    <div
      className="rounded-[24px] border p-4 flex flex-col gap-2 mx-6 mt-4"
      style={{ background: "var(--bg-surface)", borderColor: "var(--stone-border)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-default)" }}>
          Plan feasibility
        </span>
        <button
          onClick={() => {
            onRecalibrate();
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 2200);
          }}
          className="text-xs font-bold rounded-full px-4 py-1.5 text-white"
          style={{ background: "var(--ganzy-orange)", boxShadow: "var(--shadow-cta)" }}
        >
          Recalibrate
        </button>
      </div>
      <ProgressBar value={Math.min(100, feasibility.percent)} color={status.color} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ color: status.color }}>
          {status.label}
        </span>
        {justUpdated && (
          <span className="text-xs font-bold" style={{ color: "var(--success-text)" }}>
            ✓ Updated
          </span>
        )}
      </div>
      <button
        onClick={() => setChangeLogOpen((v) => !v)}
        className="text-xs font-bold text-left"
        style={{ color: "var(--ganzy-orange)" }}
      >
        {changeLogOpen ? "▾" : "›"} What changed & why
      </button>
      {changeLogOpen && (
        <p className="text-xs" style={{ color: "var(--fg-subtle)" }}>
          {feasibility.percent}% of your weekly study workload fits inside your free time this
          week ({Math.round(feasibility.freeMinutes / 60)}h free vs {Math.round(feasibility.requiredMinutes / 60)}h needed).
        </p>
      )}
    </div>
  );
}
