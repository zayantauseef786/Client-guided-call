// Core domain model for Ganzy. Everything here is persisted to localStorage
// via src/lib/store.ts — there is no backend, so this file is the schema.

export type ExamKind = "SAT" | "ACT" | "AP" | "LeavingCert" | "IB" | "Other";

export interface Subject {
  id: string;
  name: string; // e.g. "AP Biology", "SAT Math", "Higher Maths"
  kind: ExamKind;
  examDate: string; // ISO date (yyyy-mm-dd)
  currentLevel: number; // 0-100 normalized mastery, self-rated at onboarding
  targetLevel: number; // 0-100 normalized mastery
  color: string; // subject accent color, assigned at creation
}

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Monday

// One hour cell of the weekly availability grid the user fills in onboarding.
export type AvailabilityMark = "free" | "school" | "ec" | "busy" | "sleep";

// availability[day][hour] -> mark. hour is 0-23.
export type AvailabilityGrid = AvailabilityMark[][];

export type BlockType =
  | "study"
  | "exam-revision"
  | "school"
  | "ec"
  | "busy"
  | "sleep"
  | "break"
  | "exam";

export interface PlanBlock {
  id: string;
  day: DayIndex;
  startMin: number; // minutes from midnight
  endMin: number;
  label: string;
  type: BlockType;
  subjectId?: string;
  recurring?: boolean;
  completed?: boolean;
  skipped?: boolean; // "life happened" - slipped block
  actualMin?: number; // minutes actually logged via a study session
  weekKey?: string; // ISO week the block belongs to, e.g. "2026-W09"
}

export interface SessionLog {
  id: string;
  blockId: string;
  subjectId?: string;
  date: string; // ISO date completed
  minutes: number;
  topicsCovered: number;
}

export interface StreakState {
  count: number;
  lastCompletedDate: string | null; // ISO date
  freezesAvailable: number;
  freezeUsedDates: string[];
}

export type BillingPlan = "none" | "monthly" | "yearly";

export interface BillingState {
  plan: BillingPlan;
  subscribedAt: string | null;
}

export interface Profile {
  name: string;
  email: string;
  age13Confirmed: boolean;
  schoolYear: string;
  collegeGoal: string;
  whyTags: string[];
}

export interface AppState {
  onboardingStep: number;
  onboardingComplete: boolean;
  planConfirmed: boolean;
  darkMode: boolean;

  profile: Profile;
  subjects: Subject[];
  availability: AvailabilityGrid;
  planBlocks: PlanBlock[];
  sessionLogs: SessionLog[];
  streak: StreakState;
  billing: BillingState;

  activeSessionBlockId: string | null;
  lastSeenDate: string | null; // for welcome-back banner
  planWeekOffset: number; // 0 = current week
}
