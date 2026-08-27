"use client";

import { useMemo } from "react";
import { computeFeasibility, formatMinutesOfDay, generatePlanBlocks, startOfWeek } from "@/lib/engine";
import { BLOCK_TYPE_META, DAY_LABELS } from "@/lib/constants";
import type { AvailabilityGrid, Subject } from "@/lib/types";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";

interface Props {
  subjects: Subject[];
  availability: AvailabilityGrid;
  onBack: () => void;
  onBackToSubjects: () => void;
  onConfirm: () => void;
}

const STATUS_COPY = {
  ahead: { label: "Ahead of pace", color: "var(--ahead-text)" },
  onTrack: { label: "On track", color: "var(--success-text)" },
  behind: { label: "Tight — worth trimming commitments", color: "var(--danger-text)" },
};

export default function ReviewStep({ subjects, availability, onBack, onBackToSubjects, onConfirm }: Props) {
  const feasibility = useMemo(() => computeFeasibility(subjects, availability), [subjects, availability]);
  const blocks = useMemo(
    () => generatePlanBlocks(subjects, availability, startOfWeek(new Date(), 0)).filter((b) => b.type === "study" || b.type === "exam"),
    [subjects, availability]
  );
  const byDay = useMemo(() => {
    const map: Record<number, typeof blocks> = {};
    for (const b of blocks) {
      map[b.day] = map[b.day] || [];
      map[b.day].push(b);
    }
    return map;
  }, [blocks]);

  const status = STATUS_COPY[feasibility.status];

  return (
    <div className="px-6 pb-8 flex flex-col gap-5">
      <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
        This is generated from what you just told us — nothing is saved until you confirm. Every
        block stays adjustable afterward.
      </p>

      <div className="rounded-2xl p-4" style={{ background: "var(--bg-surface-cream)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
            Plan feasibility
          </span>
          <span className="text-sm font-bold" style={{ color: status.color }}>
            {feasibility.percent}% · {status.label}
          </span>
        </div>
        <ProgressBar value={Math.min(100, feasibility.percent)} color={status.color} />
        <p className="text-xs mt-2" style={{ color: "var(--fg-subtle)" }}>
          {Math.round(feasibility.freeMinutes / 60)}h free this week vs {Math.round(feasibility.requiredMinutes / 60)}h
          needed across {subjects.length} subject{subjects.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DAY_LABELS.map((label, day) => (
          <div key={label}>
            <span className="text-xs font-bold" style={{ color: "var(--fg-label)" }}>{label}</span>
            <div className="flex flex-col gap-1.5 mt-1">
              {(byDay[day] || []).length === 0 && (
                <span className="text-xs" style={{ color: "var(--fg-subtle)" }}>Free</span>
              )}
              {(byDay[day] || []).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold"
                  style={{ background: "var(--bg-canvas)", color: "var(--fg-default)" }}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: BLOCK_TYPE_META[b.type].color }} />
                    {b.label}
                  </span>
                  <span style={{ color: "var(--fg-subtle)" }}>{formatMinutesOfDay(b.startMin)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button fullWidth size="lg" onClick={onConfirm}>
          Confirm my plan →
        </Button>
        <button onClick={onBackToSubjects} className="text-sm font-bold" style={{ color: "var(--ganzy-orange)" }}>
          Adjust subjects
        </button>
        <button onClick={onBack} className="text-sm font-bold" style={{ color: "var(--fg-subtle)" }}>
          Adjust availability
        </button>
      </div>
    </div>
  );
}
