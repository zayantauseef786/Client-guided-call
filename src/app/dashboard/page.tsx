"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useGanzy } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import {
  computeFeasibility,
  dashboardStatus,
  daysUntil,
  isoWeekKey,
  startOfWeek,
  dayIndexOf,
} from "@/lib/engine";
import AppShell from "@/components/ui/AppShell";
import TopBar from "@/components/ui/TopBar";
import Button from "@/components/ui/Button";
import TaskCard from "@/components/ui/TaskCard";
import ProgressBar from "@/components/ui/ProgressBar";
import FeasibilityBar from "@/components/FeasibilityBar";
import SomethingCameUpSheet from "@/components/SomethingCameUpSheet";

export default function DashboardPage() {
  const hydrated = useHydrated();
  const profile = useGanzy((s) => s.profile);
  const subjects = useGanzy((s) => s.subjects);
  const availability = useGanzy((s) => s.availability);
  const planBlocks = useGanzy((s) => s.planBlocks);
  const ensureWeekGenerated = useGanzy((s) => s.ensureWeekGenerated);
  const recalibrate = useGanzy((s) => s.recalibrate);
  const touchLastSeen = useGanzy((s) => s.touchLastSeen);
  const somethingCameUp = useGanzy((s) => s.somethingCameUp);
  const redistributeOverdueBlocks = useGanzy((s) => s.redistributeOverdueBlocks);
  const dismissOverdueBlocks = useGanzy((s) => s.dismissOverdueBlocks);
  const updatePlanBlock = useGanzy((s) => s.updatePlanBlock);

  const [wasAway, setWasAway] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    ensureWeekGenerated(0);
    setWasAway(touchLastSeen().wasAway);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const weekStart = useMemo(() => startOfWeek(new Date(), 0), []);
  const weekKey = useMemo(() => isoWeekKey(weekStart), [weekStart]);
  const todayIdx = useMemo(() => dayIndexOf(new Date()), []);
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const feasibility = useMemo(() => computeFeasibility(subjects, availability), [subjects, availability]);
  const status = useMemo(
    () => dashboardStatus(feasibility, planBlocks, weekStart),
    [feasibility, planBlocks, weekStart]
  );

  const todaysBlocks = useMemo(
    () =>
      planBlocks
        .filter((b) => b.weekKey === weekKey && b.day === todayIdx && !b.skipped && b.type === "study")
        .sort((a, b) => a.startMin - b.startMin),
    [planBlocks, weekKey, todayIdx]
  );
  const upNext = todaysBlocks.find((b) => !b.completed);
  const allDone = todaysBlocks.length > 0 && todaysBlocks.every((b) => b.completed);
  const completedCount = todaysBlocks.filter((b) => b.completed).length;

  const overdue = useMemo(
    () =>
      planBlocks.filter((b) => {
        if (b.weekKey !== weekKey || b.type !== "study" || b.completed || b.skipped) return false;
        const d = new Date(weekStart);
        d.setDate(d.getDate() + b.day);
        return d.toISOString().slice(0, 10) < todayISO;
      }),
    [planBlocks, weekKey, weekStart, todayISO]
  );

  const upcomingExams = useMemo(
    () =>
      subjects
        .map((s) => ({ s, days: daysUntil(s.examDate) }))
        .filter((x) => x.days >= 0)
        .sort((a, b) => a.days - b.days)
        .slice(0, 3),
    [subjects]
  );

  const subjectOf = (id?: string) => subjects.find((s) => s.id === id);

  if (!hydrated) return null;

  return (
    <AppShell topBar={<TopBar title="Ganzy" />}>
      <div className="pb-8">
        {wasAway && (
          <div className="mx-6 mt-4 rounded-[24px] p-4" style={{ background: "var(--bg-surface-cream)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--fg-default)" }}>Welcome back</p>
            <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>
              Your plan picked up where you left off — nothing to catch up on right now.
            </p>
          </div>
        )}

        {overdue.length > 0 && (
          <div className="mx-6 mt-4 rounded-[24px] p-4 flex flex-col gap-3" style={{ background: "var(--amber-bg)" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--fg-default)" }}>
                Life happened — {overdue.length} study block{overdue.length > 1 ? "s" : ""} slipped past.
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>
                Nothing is lost. Ganzy can redistribute them around the rest of your week, or you can adjust things yourself.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={redistributeOverdueBlocks}>Redistribute</Button>
              <Button size="sm" variant="secondary" onClick={dismissOverdueBlocks}>I&apos;ll adjust myself</Button>
            </div>
          </div>
        )}

        {upcomingExams.length > 0 && (
          <div className="flex gap-3 px-6 mt-4 overflow-x-auto">
            {upcomingExams.map(({ s, days }) => (
              <div
                key={s.id}
                className="flex-shrink-0 rounded-[24px] px-6 py-4 text-center min-w-[140px]"
                style={{ background: "var(--bg-surface-cream)" }}
              >
                <div className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
                  {s.name}
                </div>
                <div
                  className="text-[48px] leading-[48px] font-bold mt-1"
                  style={{ color: days <= 14 ? "var(--danger-text)" : "var(--ganzy-orange)" }}
                >
                  {days}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>
                  days left
                </div>
              </div>
            ))}
          </div>
        )}

        <FeasibilityBar feasibility={feasibility} onRecalibrate={recalibrate} />

        <div className="px-6 mt-4">
          {upNext ? (
            <div
              className="rounded-[24px] p-5"
              style={{ background: "var(--ganzy-orange)", boxShadow: "var(--shadow-cta)" }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.06em] text-white/80">
                Up next · {new Date().getHours() < 12 ? "this morning" : "today"}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {subjectOf(upNext.subjectId)?.name ?? upNext.label}
              </h3>
              <p className="text-sm text-white/85 mt-1">{upNext.endMin - upNext.startMin} min session</p>
              <Link href={`/session?block=${upNext.id}`}>
                <Button
                  size="md"
                  className="mt-4"
                  style={{ background: "white", color: "var(--ganzy-orange)" }}
                >
                  Start now →
                </Button>
              </Link>
            </div>
          ) : allDone ? (
            <div className="rounded-[24px] p-5" style={{ background: "var(--bg-surface-cream)" }}>
              <p className="text-lg font-bold" style={{ color: "var(--fg-default)" }}>🌙 You&apos;re done for today.</p>
              <p className="text-sm mt-1" style={{ color: "var(--fg-muted)" }}>
                Rest is part of the plan — tomorrow starts fresh. Nothing else is expected of you tonight.
              </p>
            </div>
          ) : (
            <div className="rounded-[24px] p-5 border-2 border-dashed" style={{ borderColor: "var(--stone-border-dashed)" }}>
              <p className="font-bold" style={{ color: "var(--fg-default)" }}>Nothing scheduled right now.</p>
              <p className="text-sm mt-1" style={{ color: "var(--fg-muted)" }}>
                You&apos;re free until your next block. Want to get ahead?
              </p>
            </div>
          )}
        </div>

        {todaysBlocks.length > 0 && (
          <div className="px-6 mt-5">
            <div className="rounded-[24px] p-4 border" style={{ borderColor: "var(--stone-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: "var(--fg-default)" }}>Today&apos;s progress</span>
                <span className="text-xs font-bold" style={{ color: "var(--fg-subtle)" }}>
                  {completedCount}/{todaysBlocks.length}
                </span>
              </div>
              <ProgressBar value={(completedCount / todaysBlocks.length) * 100} />
              <div className="mt-2 divide-y" style={{ borderColor: "var(--stone-border)" }}>
                {todaysBlocks.map((b) => (
                  <TaskCard
                    key={b.id}
                    block={b}
                    color={subjectOf(b.subjectId)?.color ?? "var(--ganzy-orange)"}
                    onToggle={() => updatePlanBlock(b.id, { completed: !b.completed })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setSheetOpen(true)}
          className="mx-6 mt-5 text-sm font-bold underline"
          style={{ color: "var(--fg-subtle)" }}
        >
          Something came up
        </button>

        {profile.collegeGoal && (
          <p className="px-6 mt-4 text-xs" style={{ color: "var(--fg-subtle)" }}>
            One step closer to: {profile.collegeGoal}
          </p>
        )}

        <p className="px-6 mt-2 text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>
          Status: {status === "ahead" ? "Ahead" : status === "onTrack" ? "On track" : "Behind"}
        </p>
      </div>

      <SomethingCameUpSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={(minutes) => somethingCameUp(minutes)}
      />
    </AppShell>
  );
}
