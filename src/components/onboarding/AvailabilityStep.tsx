"use client";

import { useState } from "react";
import { AVAILABILITY_LABELS, DAY_LABELS_FULL } from "@/lib/constants";
import { formatMinutesOfDay } from "@/lib/engine";
import type { AvailabilityGrid, AvailabilityMark, DayIndex } from "@/lib/types";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import BottomSheet from "../ui/BottomSheet";

interface Props {
  availability: AvailabilityGrid;
  onSetRange: (day: DayIndex, startHour: number, endHour: number, mark: AvailabilityMark) => void;
  onClearDay: (day: DayIndex) => void;
  onContinue: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const EDITABLE_MARKS: AvailabilityMark[] = ["school", "ec", "busy", "sleep"];

export default function AvailabilityStep({ availability, onSetRange, onClearDay, onContinue }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [days, setDays] = useState<DayIndex[]>([0]);
  const [mark, setMark] = useState<AvailabilityMark>("school");
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(15);

  const toggleDay = (d: DayIndex) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const apply = () => {
    if (endHour <= startHour) return;
    for (const d of days) onSetRange(d, startHour, endHour, mark);
    setSheetOpen(false);
  };

  return (
    <div className="px-6 pb-8 flex flex-col gap-4">
      <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
        Mark school, activities, and anything else that&apos;s fixed. Everything left blank counts
        as free time Ganzy can schedule around.
      </p>

      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        {Object.entries(AVAILABILITY_LABELS).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5" style={{ color: "var(--fg-muted)" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {DAY_LABELS_FULL.map((label, day) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: "var(--fg-label)" }}>{label}</span>
              <div className="flex gap-3">
                <button
                  className="text-xs font-bold"
                  style={{ color: "var(--ganzy-orange)" }}
                  onClick={() => {
                    setDays([day as DayIndex]);
                    setSheetOpen(true);
                  }}
                >
                  Add
                </button>
                <button
                  className="text-xs font-bold"
                  style={{ color: "var(--fg-subtle)" }}
                  onClick={() => onClearDay(day as DayIndex)}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden" style={{ background: "var(--stone-border)" }}>
              {availability[day].map((m, h) => (
                <div key={h} className="flex-1 h-full" style={{ background: AVAILABILITY_LABELS[m].color }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button fullWidth size="lg" onClick={onContinue}>
        Continue →
      </Button>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add a commitment">
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
              Type
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {EDITABLE_MARKS.map((m) => (
                <Chip key={m} active={mark === m} onClick={() => setMark(m)} color={AVAILABILITY_LABELS[m].color}>
                  {AVAILABILITY_LABELS[m].label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
              Days
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {DAY_LABELS_FULL.map((label, d) => (
                <Chip key={label} active={days.includes(d as DayIndex)} onClick={() => toggleDay(d as DayIndex)}>
                  {label.slice(0, 3)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex-1 flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>
              Start
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--stone-border-2)", background: "var(--bg-surface)", color: "var(--fg-default)" }}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{formatMinutesOfDay(h * 60)}</option>
                ))}
              </select>
            </label>
            <label className="flex-1 flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>
              End
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--stone-border-2)", background: "var(--bg-surface)", color: "var(--fg-default)" }}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{formatMinutesOfDay(h * 60)}</option>
                ))}
              </select>
            </label>
          </div>

          <Button fullWidth onClick={apply} disabled={endHour <= startHour || days.length === 0}>
            Save →
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
