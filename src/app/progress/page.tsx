"use client";

import { useMemo } from "react";
import { useGanzy } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { daysUntil, isoWeekKey, minutesToHours, predictedLevel, startOfWeek } from "@/lib/engine";
import AppShell from "@/components/ui/AppShell";
import TopBar from "@/components/ui/TopBar";
import ProgressRing from "@/components/ui/ProgressRing";
import ProgressBar from "@/components/ui/ProgressBar";

export default function ProgressPage() {
  const hydrated = useHydrated();
  const subjects = useGanzy((s) => s.subjects);
  const planBlocks = useGanzy((s) => s.planBlocks);
  const sessionLogs = useGanzy((s) => s.sessionLogs);
  const profile = useGanzy((s) => s.profile);

  const weekKey = useMemo(() => isoWeekKey(startOfWeek(new Date(), 0)), []);

  if (!hydrated) return null;

  return (
    <AppShell topBar={<TopBar />}>
      <div className="px-6 py-6 flex flex-col gap-6 pb-24">
        {subjects.map((s) => {
          const predicted = predictedLevel(s, sessionLogs);
          const plannedMin = planBlocks
            .filter((b) => b.weekKey === weekKey && b.subjectId === s.id && !b.skipped)
            .reduce((sum, b) => sum + (b.endMin - b.startMin), 0);
          const actualMin = planBlocks
            .filter((b) => b.weekKey === weekKey && b.subjectId === s.id && b.completed)
            .reduce((sum, b) => sum + (b.actualMin ?? b.endMin - b.startMin), 0);
          const ahead = predicted >= s.targetLevel;
          const dt = daysUntil(s.examDate);

          return (
            <div key={s.id} className="rounded-[24px] border p-4 flex flex-col gap-4" style={{ borderColor: "var(--stone-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold" style={{ color: "var(--fg-default)" }}>{s.name}</span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fg-subtle)" }}>
                    {dt >= 0 ? `Exam in ${dt} days` : "Exam date passed"}
                  </p>
                </div>
                <ProgressRing
                  value={predicted}
                  size={80}
                  stroke={8}
                  color={ahead ? "var(--ahead-fill)" : s.color}
                  label=""
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: "var(--fg-muted)" }}>
                  <span>Planned {minutesToHours(plannedMin)}</span>
                  <span>Actual {minutesToHours(actualMin)}</span>
                </div>
                <ProgressBar value={plannedMin > 0 ? (actualMin / plannedMin) * 100 : 0} color={s.color} />
              </div>
              <p className="text-xs font-semibold" style={{ color: ahead ? "var(--ahead-text)" : "var(--fg-subtle)" }}>
                {ahead ? "Ahead of target" : `Trending toward ${predicted} vs target ${s.targetLevel}`}
              </p>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "var(--fg-subtle)" }}>
            No subjects yet — add some from onboarding.
          </p>
        )}

        {profile.collegeGoal && (
          <p className="text-xs text-center" style={{ color: "var(--fg-subtle)" }}>
            One step closer to: {profile.collegeGoal}
          </p>
        )}
      </div>
    </AppShell>
  );
}
