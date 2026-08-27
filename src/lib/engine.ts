// The "real" calculation logic behind Ganzy's numbers. Nothing here is a
// hardcoded mock — every value is derived from the user's own subjects,
// availability grid, and logged study sessions.
//
// The model is intentionally simple and documented so it stays defensible:
// mastery is a normalized 0-100 scale per subject (works whether the user
// entered SAT points, AP grades, or Leaving Cert percentages — onboarding
// converts to 0-100 up front), and required study time scales with the size
// of the gap to target plus how close the exam is.

import { HOUR_END, HOUR_START } from "./constants";
import type {
  AvailabilityGrid,
  AvailabilityMark,
  DayIndex,
  PlanBlock,
  SessionLog,
  StreakState,
  Subject,
} from "./types";

export function isoWeekKey(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Monday=0..Sunday=6 index for a JS Date. */
export function dayIndexOf(date: Date): DayIndex {
  const js = date.getDay(); // 0 = Sunday
  return ((js + 6) % 7) as DayIndex;
}

export function startOfWeek(date: Date, weekOffset = 0): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = dayIndexOf(d);
  d.setDate(d.getDate() - diff + weekOffset * 7);
  return d;
}

export function dateForDay(weekStart: Date, day: DayIndex): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + day);
  return d;
}

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

/** Empty availability grid: 7 days x 24 hours, "sleep" outside 6am-11pm, "free" inside. */
export function emptyAvailability(): AvailabilityGrid {
  return Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, (_, h) =>
      h >= HOUR_START && h < HOUR_END ? "free" : "sleep"
    )
  );
}

/** Weekly required study minutes for one subject, from its mastery gap and exam urgency. */
export function requiredMinutesPerWeek(subject: Subject): number {
  const gap = Math.max(0, subject.targetLevel - subject.currentLevel);
  const dtExam = daysUntil(subject.examDate);
  // Closer exams need more weekly time; far-off or past exams taper off.
  const urgency =
    dtExam <= 0 ? 0.4 : Math.min(2, Math.max(0.6, 90 / Math.max(dtExam, 14)));
  const base = 60 + gap * 8; // minutes/week baseline + gap-scaled
  return Math.round(Math.min(480, Math.max(30, base * urgency)));
}

export interface FeasibilityResult {
  requiredMinutes: number;
  freeMinutes: number;
  percent: number; // can exceed 100 (ahead)
  status: "ahead" | "onTrack" | "behind";
}

export function freeMinutesInWeek(availability: AvailabilityGrid): number {
  let total = 0;
  for (const day of availability) {
    for (const mark of day) {
      if (mark === "free") total += 60;
    }
  }
  return total;
}

export function computeFeasibility(
  subjects: Subject[],
  availability: AvailabilityGrid
): FeasibilityResult {
  const requiredMinutes = subjects.reduce(
    (sum, s) => sum + requiredMinutesPerWeek(s),
    0
  );
  const freeMinutes = freeMinutesInWeek(availability);
  if (requiredMinutes === 0) {
    return { requiredMinutes, freeMinutes, percent: 100, status: "onTrack" };
  }
  const percent = Math.round((freeMinutes / requiredMinutes) * 100);
  const status: FeasibilityResult["status"] =
    percent >= 108 ? "ahead" : percent >= 85 ? "onTrack" : "behind";
  return { requiredMinutes, freeMinutes, percent, status };
}

export const STUDY_BLOCK_LEN = 45; // minutes per generated study block

/**
 * Greedily distributes study blocks across free availability slots,
 * weighted by each subject's remaining required minutes. Leftover free
 * time beyond what's required stays free (never force-filled).
 */
export function generatePlanBlocks(
  subjects: Subject[],
  availability: AvailabilityGrid,
  weekStart: Date
): PlanBlock[] {
  const weekKey = isoWeekKey(weekStart);
  const blocks: PlanBlock[] = [];
  let idCounter = 1;

  // Fixed commitments straight from the availability grid (merge consecutive hours).
  const fixedTypeMap: Record<Exclude<AvailabilityMark, "free">, PlanBlock["type"]> = {
    school: "school",
    ec: "ec",
    busy: "busy",
    sleep: "sleep",
  };
  for (let day = 0; day < 7; day++) {
    let runStart: number | null = null;
    let runMark: AvailabilityMark | null = null;
    const marks = availability[day];
    for (let h = 0; h <= 24; h++) {
      const mark = h < 24 ? marks[h] : null;
      const boundary = mark !== runMark;
      if (boundary) {
        if (runMark && runMark !== "free" && runMark !== "sleep" && runStart !== null) {
          blocks.push({
            id: `fixed-${idCounter++}`,
            day: day as DayIndex,
            startMin: runStart * 60,
            endMin: h * 60,
            label: fixedTypeMap[runMark].charAt(0).toUpperCase() + fixedTypeMap[runMark].slice(1),
            type: fixedTypeMap[runMark],
            recurring: true,
            weekKey,
          });
        }
        runStart = h;
        runMark = mark;
      }
    }
  }

  // Remaining minutes required per subject this week.
  const remaining = new Map<string, number>();
  for (const s of subjects) remaining.set(s.id, requiredMinutesPerWeek(s));

  // Walk the week hour-by-hour; whenever we hit a free hour, assign it to
  // whichever subject currently has the most remaining minutes.
  for (let day = 0; day < 7 && subjects.length > 0; day++) {
    const marks = availability[day];
    let h = HOUR_START;
    while (h < HOUR_END) {
      if (marks[h] !== "free") {
        h++;
        continue;
      }
      const candidate = [...remaining.entries()].sort((a, b) => b[1] - a[1])[0];
      if (!candidate || candidate[1] <= 0) break; // nothing left to schedule this week
      const subject = subjects.find((s) => s.id === candidate[0])!;
      const slotMinutesAvailable = 60;
      const minutes = Math.min(STUDY_BLOCK_LEN, slotMinutesAvailable, candidate[1]);
      const startMin = h * 60;
      blocks.push({
        id: `study-${idCounter++}`,
        day: day as DayIndex,
        startMin,
        endMin: startMin + minutes,
        label: subject.name,
        type: "study",
        subjectId: subject.id,
        weekKey,
      });
      remaining.set(subject.id, candidate[1] - minutes);
      h++;
    }
  }

  // Drop an exam marker on the day of any exam falling within this week.
  for (const s of subjects) {
    const dt = daysUntil(s.examDate);
    if (dt >= 0 && dt < 7) {
      const day = dayIndexOf(new Date(s.examDate + "T00:00:00"));
      blocks.push({
        id: `exam-${idCounter++}`,
        day,
        startMin: 9 * 60,
        endMin: 12 * 60,
        label: `${s.name} — Exam Day`,
        type: "exam",
        subjectId: s.id,
        weekKey,
      });
    }
  }

  return blocks.sort((a, b) => a.day - b.day || a.startMin - b.startMin);
}

/**
 * Finds free, unoccupied slots on/after a given day+minute and drops in new
 * study blocks for whichever subjects lost time, so "life happened" minutes
 * genuinely move elsewhere in the week rather than just vanishing.
 */
export function redistributeMinutes(
  subjects: Subject[],
  availability: AvailabilityGrid,
  existingBlocks: PlanBlock[],
  weekStart: Date,
  lostBySubject: Record<string, number>,
  notBefore: { day: DayIndex; minute: number }
): PlanBlock[] {
  const weekKey = isoWeekKey(weekStart);
  const occupied = new Set(
    existingBlocks
      .filter((b) => b.weekKey === weekKey && !b.skipped)
      .map((b) => `${b.day}-${Math.floor(b.startMin / 60)}`)
  );
  const newBlocks: PlanBlock[] = [];
  let idCounter = Date.now();

  for (const [subjectId, lostMinutesRaw] of Object.entries(lostBySubject)) {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) continue;
    let lost = lostMinutesRaw;

    for (let day = notBefore.day; day < 7 && lost > 0; day++) {
      const marks = availability[day];
      for (let h = HOUR_START; h < HOUR_END && lost > 0; h++) {
        if (day === notBefore.day && h * 60 < notBefore.minute) continue;
        if (marks[h] !== "free") continue;
        const key = `${day}-${h}`;
        if (occupied.has(key)) continue;
        const minutes = Math.min(STUDY_BLOCK_LEN, lost);
        newBlocks.push({
          id: `redis-${idCounter++}`,
          day: day as DayIndex,
          startMin: h * 60,
          endMin: h * 60 + minutes,
          label: subject.name,
          type: "study",
          subjectId,
          weekKey,
        });
        occupied.add(key);
        lost -= minutes;
      }
    }
  }
  return newBlocks;
}

/** Predicted mastery (0-100) for a subject given actual logged study time so far. */
export function predictedLevel(subject: Subject, logs: SessionLog[]): number {
  const gap = subject.targetLevel - subject.currentLevel;
  if (gap <= 0) return subject.targetLevel;
  const requiredTotalMinutes = requiredMinutesPerWeek(subject) * 6; // ~6 weeks of runway assumed
  const loggedMinutes = logs
    .filter((l) => l.subjectId === subject.id)
    .reduce((sum, l) => sum + l.minutes, 0);
  const progress = Math.min(1, loggedMinutes / Math.max(requiredTotalMinutes, 1));
  return Math.round(subject.currentLevel + gap * progress);
}

export function updateStreakOnCompletion(
  streak: StreakState,
  completionDate = todayISO()
): StreakState {
  if (streak.lastCompletedDate === completionDate) return streak; // already counted today
  const last = streak.lastCompletedDate;
  const gapDays = last
    ? Math.round(
        (new Date(completionDate).getTime() - new Date(last).getTime()) / 86400000
      )
    : null;

  if (gapDays === 1 || gapDays === null) {
    return {
      ...streak,
      count: streak.count + 1,
      lastCompletedDate: completionDate,
    };
  }
  if (gapDays === 2 && streak.freezesAvailable > 0) {
    return {
      count: streak.count + 1,
      lastCompletedDate: completionDate,
      freezesAvailable: streak.freezesAvailable - 1,
      freezeUsedDates: [...streak.freezeUsedDates, last as string],
    };
  }
  return {
    ...streak,
    count: 1,
    lastCompletedDate: completionDate,
  };
}

/**
 * Adjusts the raw availability-vs-workload feasibility status by how well the
 * student has actually kept up with study blocks that already came due this
 * week — so the dashboard verdict reacts to real behavior, not just intent.
 */
export function dashboardStatus(
  feasibility: FeasibilityResult,
  planBlocks: PlanBlock[],
  weekStart: Date
): FeasibilityResult["status"] {
  const today = todayISO();
  const pastStudyBlocks = planBlocks.filter((b) => {
    if (b.type !== "study" || b.skipped) return false;
    const d = dateForDay(weekStart, b.day).toISOString().slice(0, 10);
    return d < today;
  });
  if (pastStudyBlocks.length < 3) return feasibility.status;

  const completed = pastStudyBlocks.filter((b) => b.completed).length;
  const rate = completed / pastStudyBlocks.length;
  const order: FeasibilityResult["status"][] = ["behind", "onTrack", "ahead"];
  let idx = order.indexOf(feasibility.status);
  if (rate < 0.5) idx = Math.max(0, idx - 1);
  else if (rate >= 0.9) idx = Math.min(2, idx + 1);
  return order[idx];
}

export function minutesToHours(min: number): string {
  const h = min / 60;
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
}

export function formatMinutesOfDay(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}
