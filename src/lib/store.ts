"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  dayIndexOf,
  emptyAvailability,
  generatePlanBlocks,
  isoWeekKey,
  redistributeMinutes,
  startOfWeek,
  todayISO,
  updateStreakOnCompletion,
} from "./engine";
import type {
  AppState,
  AvailabilityMark,
  BillingPlan,
  DayIndex,
  PlanBlock,
  Subject,
} from "./types";

function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

interface Actions {
  setProfile: (partial: Partial<AppState["profile"]>) => void;
  setOnboardingStep: (step: number) => void;

  addSubject: (subject: Omit<Subject, "id" | "color">) => void;
  updateSubject: (id: string, partial: Partial<Subject>) => void;
  removeSubject: (id: string) => void;

  setAvailabilityMark: (day: DayIndex, hour: number, mark: AvailabilityMark) => void;
  setAvailabilityRange: (
    day: DayIndex,
    startHour: number,
    endHour: number,
    mark: AvailabilityMark
  ) => void;
  clearAvailabilityDay: (day: DayIndex) => void;

  confirmPlan: () => void;
  ensureWeekGenerated: (weekOffset: number) => void;
  recalibrate: () => void;
  setPlanWeekOffset: (offset: number) => void;

  addPlanBlock: (block: Omit<PlanBlock, "id" | "weekKey">) => void;
  updatePlanBlock: (id: string, partial: Partial<PlanBlock>) => void;
  deletePlanBlock: (id: string) => void;
  markBlockSlipped: (id: string) => void;
  somethingCameUp: (minutesAway: number) => void;
  redistributeOverdueBlocks: () => void;
  dismissOverdueBlocks: () => void;

  startSession: (blockId: string) => void;
  endSession: (minutes: number, topicsCovered: number) => void;

  toggleDarkMode: () => void;
  setBillingPlan: (plan: BillingPlan) => void;
  touchLastSeen: () => { wasAway: boolean };
  resetAll: () => void;
}

const initialState: AppState = {
  onboardingStep: 0,
  onboardingComplete: false,
  planConfirmed: false,
  darkMode: false,

  profile: {
    name: "",
    email: "",
    age13Confirmed: false,
    schoolYear: "Junior",
    collegeGoal: "",
    whyTags: [],
  },
  subjects: [],
  availability: emptyAvailability(),
  planBlocks: [],
  sessionLogs: [],
  streak: {
    count: 0,
    lastCompletedDate: null,
    freezesAvailable: 1,
    freezeUsedDates: [],
  },
  billing: { plan: "none", subscribedAt: null },

  activeSessionBlockId: null,
  lastSeenDate: null,
  planWeekOffset: 0,
};

export const useGanzy = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (partial) =>
        set((s) => ({ profile: { ...s.profile, ...partial } })),

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      addSubject: (subject) => {
        const color =
          ["#F97316", "#3B82F6", "#8B5CF6", "#16BB83", "#EC4899", "#F59E0B", "#06B6D4", "#EF4444"][
            get().subjects.length % 8
          ];
        set((s) => ({
          subjects: [...s.subjects, { ...subject, id: uid("subj"), color }],
        }));
      },
      updateSubject: (id, partial) =>
        set((s) => ({
          subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...partial } : sub)),
        })),
      removeSubject: (id) =>
        set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) })),

      setAvailabilityMark: (day, hour, mark) =>
        set((s) => {
          const grid = s.availability.map((row) => [...row]);
          grid[day][hour] = mark;
          return { availability: grid };
        }),
      setAvailabilityRange: (day, startHour, endHour, mark) =>
        set((s) => {
          const grid = s.availability.map((row) => [...row]);
          for (let h = startHour; h < endHour; h++) grid[day][h] = mark;
          return { availability: grid };
        }),
      clearAvailabilityDay: (day) =>
        set((s) => {
          const grid = s.availability.map((row) => [...row]);
          grid[day] = emptyAvailability()[0];
          return { availability: grid };
        }),

      confirmPlan: () => {
        const s = get();
        const weekStart = startOfWeek(new Date(), 0);
        const blocks = generatePlanBlocks(s.subjects, s.availability, weekStart);
        set({
          planConfirmed: true,
          onboardingComplete: true,
          planBlocks: blocks,
          planWeekOffset: 0,
          lastSeenDate: todayISO(),
        });
      },

      ensureWeekGenerated: (weekOffset) => {
        const s = get();
        if (!s.planConfirmed) return;
        const weekStart = startOfWeek(new Date(), weekOffset);
        const key = isoWeekKey(weekStart);
        const exists = s.planBlocks.some((b) => b.weekKey === key);
        if (exists) return;
        const blocks = generatePlanBlocks(s.subjects, s.availability, weekStart);
        set({ planBlocks: [...s.planBlocks, ...blocks] });
      },

      recalibrate: () => {
        const s = get();
        const weekStart = startOfWeek(new Date(), s.planWeekOffset);
        const key = isoWeekKey(weekStart);
        const today = todayISO();
        // Keep past/completed blocks for this week untouched; regenerate the rest.
        const otherWeeks = s.planBlocks.filter((b) => b.weekKey !== key);
        const keepThisWeek = s.planBlocks.filter(
          (b) => b.weekKey === key && (b.completed || dateOfBlockBefore(weekStart, b, today))
        );
        const fresh = generatePlanBlocks(s.subjects, s.availability, weekStart).filter(
          (b) => !dateOfBlockBefore(weekStart, b, today)
        );
        set({ planBlocks: [...otherWeeks, ...keepThisWeek, ...fresh] });
      },

      setPlanWeekOffset: (offset) => set({ planWeekOffset: offset }),

      addPlanBlock: (block) => {
        const s = get();
        const weekStart = startOfWeek(new Date(), s.planWeekOffset);
        set({
          planBlocks: [
            ...s.planBlocks,
            { ...block, id: uid("block"), weekKey: isoWeekKey(weekStart) },
          ],
        });
      },
      updatePlanBlock: (id, partial) =>
        set((s) => ({
          planBlocks: s.planBlocks.map((b) => (b.id === id ? { ...b, ...partial } : b)),
        })),
      deletePlanBlock: (id) =>
        set((s) => ({ planBlocks: s.planBlocks.filter((b) => b.id !== id) })),
      markBlockSlipped: (id) =>
        set((s) => ({
          planBlocks: s.planBlocks.map((b) => (b.id === id ? { ...b, skipped: true } : b)),
        })),

      somethingCameUp: (minutesAway) => {
        const s = get();
        const weekStart = startOfWeek(new Date(), s.planWeekOffset);
        const weekKey = isoWeekKey(weekStart);
        const now = new Date();
        const today = dayIndexOf(now);
        const nowMinute = now.getHours() * 60 + now.getMinutes();
        const cutoff = nowMinute + minutesAway;
        const affected = s.planBlocks.filter(
          (b) =>
            b.weekKey === weekKey &&
            b.day === today &&
            b.type === "study" &&
            !b.completed &&
            !b.skipped &&
            b.startMin < cutoff &&
            b.endMin > nowMinute
        );
        const lostBySubject: Record<string, number> = {};
        for (const b of affected) {
          if (!b.subjectId) continue;
          lostBySubject[b.subjectId] = (lostBySubject[b.subjectId] || 0) + (b.endMin - b.startMin);
        }
        const affectedIds = new Set(affected.map((b) => b.id));
        const redistributed = redistributeMinutes(
          s.subjects,
          s.availability,
          s.planBlocks,
          weekStart,
          lostBySubject,
          { day: today, minute: cutoff }
        );
        set({
          planBlocks: [
            ...s.planBlocks.map((b) => (affectedIds.has(b.id) ? { ...b, skipped: true } : b)),
            ...redistributed,
          ],
        });
      },

      redistributeOverdueBlocks: () => {
        const s = get();
        const weekStart = startOfWeek(new Date(), s.planWeekOffset);
        const weekKey = isoWeekKey(weekStart);
        const today = todayISO();
        const overdue = s.planBlocks.filter(
          (b) =>
            b.weekKey === weekKey &&
            b.type === "study" &&
            !b.completed &&
            !b.skipped &&
            dateOfBlockBefore(weekStart, b, today)
        );
        const lostBySubject: Record<string, number> = {};
        for (const b of overdue) {
          if (!b.subjectId) continue;
          lostBySubject[b.subjectId] = (lostBySubject[b.subjectId] || 0) + (b.endMin - b.startMin);
        }
        const overdueIds = new Set(overdue.map((b) => b.id));
        const now = new Date();
        const redistributed = redistributeMinutes(
          s.subjects,
          s.availability,
          s.planBlocks,
          weekStart,
          lostBySubject,
          { day: dayIndexOf(now), minute: now.getHours() * 60 + now.getMinutes() }
        );
        set({
          planBlocks: [
            ...s.planBlocks.map((b) => (overdueIds.has(b.id) ? { ...b, skipped: true } : b)),
            ...redistributed,
          ],
        });
      },

      dismissOverdueBlocks: () => {
        const s = get();
        const weekStart = startOfWeek(new Date(), s.planWeekOffset);
        const weekKey = isoWeekKey(weekStart);
        const today = todayISO();
        set({
          planBlocks: s.planBlocks.map((b) =>
            b.weekKey === weekKey &&
            b.type === "study" &&
            !b.completed &&
            !b.skipped &&
            dateOfBlockBefore(weekStart, b, today)
              ? { ...b, skipped: true }
              : b
          ),
        });
      },

      startSession: (blockId) => set({ activeSessionBlockId: blockId }),
      endSession: (minutes, topicsCovered) => {
        const s = get();
        const blockId = s.activeSessionBlockId;
        if (!blockId) return;
        const block = s.planBlocks.find((b) => b.id === blockId);
        const log = {
          id: uid("log"),
          blockId,
          subjectId: block?.subjectId,
          date: todayISO(),
          minutes,
          topicsCovered,
        };
        set({
          sessionLogs: [...s.sessionLogs, log],
          planBlocks: s.planBlocks.map((b) =>
            b.id === blockId ? { ...b, completed: true, actualMin: minutes } : b
          ),
          streak: updateStreakOnCompletion(s.streak),
          activeSessionBlockId: null,
        });
      },

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setBillingPlan: (plan) =>
        set({ billing: { plan, subscribedAt: plan === "none" ? null : todayISO() } }),

      touchLastSeen: () => {
        const s = get();
        const today = todayISO();
        const wasAway = !!s.lastSeenDate && s.lastSeenDate !== today &&
          daysBetween(s.lastSeenDate, today) >= 2;
        set({ lastSeenDate: today });
        return { wasAway };
      },

      resetAll: () => set({ ...initialState, availability: emptyAvailability() }),
    }),
    {
      name: "ganzy-app-state",
      version: 1,
      skipHydration: true,
    }
  )
);

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function dateOfBlockBefore(weekStart: Date, block: PlanBlock, todayIso: string): boolean {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + block.day);
  return d.toISOString().slice(0, 10) < todayIso;
}
