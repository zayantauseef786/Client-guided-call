"use client";

import { useMemo, useState } from "react";
import { useGanzy } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { computeFeasibility, formatMinutesOfDay, isoWeekKey, startOfWeek } from "@/lib/engine";
import { BLOCK_TYPE_META, DAY_LABELS_FULL } from "@/lib/constants";
import type { BlockType, DayIndex } from "@/lib/types";
import AppShell from "@/components/ui/AppShell";
import TopBar from "@/components/ui/TopBar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import BottomSheet from "@/components/ui/BottomSheet";
import TextField from "@/components/ui/TextField";
import FeasibilityBar from "@/components/FeasibilityBar";

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const ADDABLE_TYPES: BlockType[] = ["study", "busy", "ec"];

export default function PlanPage() {
  const hydrated = useHydrated();
  const subjects = useGanzy((s) => s.subjects);
  const availability = useGanzy((s) => s.availability);
  const planBlocks = useGanzy((s) => s.planBlocks);
  const recalibrate = useGanzy((s) => s.recalibrate);
  const addPlanBlock = useGanzy((s) => s.addPlanBlock);
  const updatePlanBlock = useGanzy((s) => s.updatePlanBlock);
  const deletePlanBlock = useGanzy((s) => s.deletePlanBlock);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({
    day: 0 as DayIndex,
    type: "study" as BlockType,
    subjectId: subjects[0]?.id ?? "",
    label: "",
    startHour: 16,
    endHour: 17,
  });

  const weekStart = useMemo(() => startOfWeek(new Date(), 0), []);
  const weekKey = useMemo(() => isoWeekKey(weekStart), [weekStart]);
  const feasibility = useMemo(() => computeFeasibility(subjects, availability), [subjects, availability]);

  const byDay = useMemo(() => {
    const map: Record<number, typeof planBlocks> = {};
    for (const b of planBlocks.filter((b) => b.weekKey === weekKey && !b.skipped)) {
      map[b.day] = map[b.day] || [];
      map[b.day].push(b);
    }
    for (const d of Object.keys(map)) map[Number(d)].sort((a, b) => a.startMin - b.startMin);
    return map;
  }, [planBlocks, weekKey]);

  const detail = planBlocks.find((b) => b.id === detailId);
  const subjectOf = (id?: string) => subjects.find((s) => s.id === id);

  const submitAdd = () => {
    if (form.endHour <= form.startHour) return;
    const subject = subjectOf(form.subjectId);
    addPlanBlock({
      day: form.day,
      startMin: form.startHour * 60,
      endMin: form.endHour * 60,
      label: form.type === "study" ? subject?.name ?? "Study" : form.label || BLOCK_TYPE_META[form.type].label,
      type: form.type,
      subjectId: form.type === "study" ? form.subjectId : undefined,
    });
    setSheetOpen(false);
  };

  if (!hydrated) return null;

  return (
    <AppShell topBar={<TopBar title="Plan" />}>
      <FeasibilityBar feasibility={feasibility} onRecalibrate={recalibrate} />

      <div className="px-6 mt-4 pb-24 flex flex-col gap-5">
        {DAY_LABELS_FULL.map((label, day) => (
          <div key={label}>
            <span className="text-xs font-bold" style={{ color: "var(--fg-label)" }}>{label}</span>
            <div className="flex flex-col gap-1.5 mt-1.5">
              {(byDay[day] || []).length === 0 && (
                <span className="text-xs" style={{ color: "var(--fg-subtle)" }}>Free</span>
              )}
              {(byDay[day] || []).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setDetailId(b.id)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-left"
                  style={{ background: "var(--bg-canvas)" }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: subjectOf(b.subjectId)?.color ?? BLOCK_TYPE_META[b.type].color }} />
                    <span
                      className="text-sm font-semibold truncate"
                      style={{
                        color: "var(--fg-default)",
                        textDecoration: b.completed ? "line-through" : "none",
                        opacity: b.completed ? 0.6 : 1,
                      }}
                    >
                      {b.label}
                    </span>
                  </span>
                  <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--fg-subtle)" }}>
                    {formatMinutesOfDay(b.startMin)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-1/2 translate-x-[190px] w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white"
        style={{ background: "var(--ganzy-orange)", boxShadow: "var(--shadow-cta)" }}
        aria-label="Add block"
      >
        +
      </button>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add a block">
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>Day</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {DAY_LABELS_FULL.map((l, d) => (
                <Chip key={l} active={form.day === d} onClick={() => setForm((f) => ({ ...f, day: d as DayIndex }))}>
                  {l.slice(0, 3)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>Type</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {ADDABLE_TYPES.map((t) => (
                <Chip key={t} active={form.type === t} onClick={() => setForm((f) => ({ ...f, type: t }))} color={BLOCK_TYPE_META[t].color}>
                  {BLOCK_TYPE_META[t].label}
                </Chip>
              ))}
            </div>
          </div>
          {form.type === "study" ? (
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>Subject</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((s) => (
                  <Chip key={s.id} active={form.subjectId === s.id} onClick={() => setForm((f) => ({ ...f, subjectId: s.id }))} color={s.color}>
                    {s.name}
                  </Chip>
                ))}
              </div>
            </div>
          ) : (
            <TextField label="Label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          )}
          <div className="flex gap-3">
            <label className="flex-1 flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>
              Start
              <select
                value={form.startHour}
                onChange={(e) => setForm((f) => ({ ...f, startHour: Number(e.target.value) }))}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--stone-border-2)", background: "var(--bg-surface)", color: "var(--fg-default)" }}
              >
                {HOURS.map((h) => <option key={h} value={h}>{formatMinutesOfDay(h * 60)}</option>)}
              </select>
            </label>
            <label className="flex-1 flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>
              End
              <select
                value={form.endHour}
                onChange={(e) => setForm((f) => ({ ...f, endHour: Number(e.target.value) }))}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--stone-border-2)", background: "var(--bg-surface)", color: "var(--fg-default)" }}
              >
                {HOURS.map((h) => <option key={h} value={h}>{formatMinutesOfDay(h * 60)}</option>)}
              </select>
            </label>
          </div>
          <Button fullWidth onClick={submitAdd} disabled={form.endHour <= form.startHour}>Save →</Button>
        </div>
      </BottomSheet>

      <BottomSheet open={!!detail} onClose={() => setDetailId(null)} title={detail?.label}>
        {detail && (
          <div className="flex flex-col gap-3">
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
              {DAY_LABELS_FULL[detail.day]} · {formatMinutesOfDay(detail.startMin)}–{formatMinutesOfDay(detail.endMin)}
            </p>
            {detail.type === "study" && (
              <Button
                fullWidth
                variant="secondary"
                onClick={() => {
                  updatePlanBlock(detail.id, { completed: !detail.completed });
                  setDetailId(null);
                }}
              >
                {detail.completed ? "Mark incomplete" : "Mark complete"}
              </Button>
            )}
            <Button
              fullWidth
              variant="danger"
              onClick={() => {
                deletePlanBlock(detail.id);
                setDetailId(null);
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </BottomSheet>
    </AppShell>
  );
}
