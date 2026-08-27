import type { AvailabilityMark, BlockType, ExamKind } from "./types";

export const SUBJECT_COLORS = [
  "#F97316", // orange
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#16BB83", // green
  "#EC4899", // pink
  "#F59E0B", // amber
  "#06B6D4", // cyan
  "#EF4444", // red
];

export const EXAM_KINDS: { id: ExamKind; label: string }[] = [
  { id: "SAT", label: "SAT" },
  { id: "ACT", label: "ACT" },
  { id: "AP", label: "AP" },
  { id: "LeavingCert", label: "Leaving Cert" },
  { id: "IB", label: "IB" },
  { id: "Other", label: "Other" },
];

export const SUGGESTED_SUBJECTS: Record<ExamKind, string[]> = {
  SAT: ["SAT Math", "SAT Reading & Writing"],
  ACT: ["ACT Math", "ACT English", "ACT Science"],
  AP: [
    "AP Biology",
    "AP US History",
    "AP Calculus AB",
    "AP Chemistry",
    "AP English Lang",
    "AP Psychology",
  ],
  LeavingCert: [
    "Higher Maths",
    "English",
    "Irish",
    "Biology",
    "Chemistry",
    "Physics",
    "Business",
  ],
  IB: ["Maths AA HL", "Biology HL", "English A Lit", "Chemistry SL"],
  Other: [],
};

export const WHY_TAGS = [
  "College Access",
  "Scholarship",
  "Parent expectation",
  "Personal goal",
  "Keep options open",
];

export const HOUR_START = 6; // 6am
export const HOUR_END = 23; // 11pm (grid covers 6am-11pm, sleep hours implied outside)

export const AVAILABILITY_LABELS: Record<
  AvailabilityMark,
  { label: string; color: string }
> = {
  free: { label: "Free", color: "var(--stone-border)" },
  school: { label: "School", color: "#A78BFA" },
  ec: { label: "Extracurricular", color: "#38BDF8" },
  busy: { label: "Busy", color: "#F59E0B" },
  sleep: { label: "Sleep", color: "#6B7280" },
};

export const BLOCK_TYPE_META: Record<
  BlockType,
  { label: string; color: string }
> = {
  study: { label: "Study", color: "#F97316" },
  "exam-revision": { label: "Exam Revision", color: "#EA580C" },
  school: { label: "School", color: "#A78BFA" },
  ec: { label: "Extracurricular", color: "#38BDF8" },
  busy: { label: "Busy", color: "#F59E0B" },
  sleep: { label: "Sleep", color: "#6B7280" },
  break: { label: "Break", color: "#22C55E" },
  exam: { label: "Exam", color: "#B42318" },
};

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_LABELS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
