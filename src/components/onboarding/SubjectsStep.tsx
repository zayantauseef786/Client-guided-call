"use client";

import { useState } from "react";
import { EXAM_KINDS, SUGGESTED_SUBJECTS } from "@/lib/constants";
import type { ExamKind, Subject } from "@/lib/types";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import TextField from "../ui/TextField";

interface Props {
  subjects: Subject[];
  onAdd: (s: Omit<Subject, "id" | "color">) => void;
  onUpdate: (id: string, partial: Partial<Subject>) => void;
  onRemove: (id: string) => void;
  onContinue: () => void;
}

function defaultExamDate(daysOut: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOut);
  return d.toISOString().slice(0, 10);
}

export default function SubjectsStep({ subjects, onAdd, onUpdate, onRemove, onContinue }: Props) {
  const [kind, setKind] = useState<ExamKind>("SAT");
  const [customName, setCustomName] = useState("");

  const addSubject = (name: string) => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      kind,
      examDate: defaultExamDate(90),
      currentLevel: 50,
      targetLevel: 80,
    });
    setCustomName("");
  };

  return (
    <div className="px-6 pb-8 flex flex-col gap-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
          Exam type
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          {EXAM_KINDS.map((k) => (
            <Chip key={k.id} active={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
          Add subjects
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          {SUGGESTED_SUBJECTS[kind].map((name) => (
            <Chip key={name} onClick={() => addSubject(name)}>
              + {name}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <TextField
            placeholder="Custom subject name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject(customName)}
          />
          <Button variant="secondary" onClick={() => addSubject(customName)}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border p-4 flex flex-col gap-3"
            style={{ borderColor: "var(--stone-border)", background: "var(--bg-surface)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="font-bold truncate" style={{ color: "var(--fg-default)" }}>{s.name}</span>
              </div>
              <button onClick={() => onRemove(s.id)} className="text-xs font-bold" style={{ color: "var(--danger-text)" }}>
                Remove
              </button>
            </div>

            <label className="flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>
              Exam date
              <input
                type="date"
                value={s.examDate}
                onChange={(e) => onUpdate(s.id, { examDate: e.target.value })}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--stone-border-2)", background: "var(--bg-surface)", color: "var(--fg-default)" }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>
              Where you are now: {s.currentLevel}
              <input
                type="range"
                min={0}
                max={100}
                value={s.currentLevel}
                onChange={(e) => onUpdate(s.id, { currentLevel: Number(e.target.value) })}
                className="accent-[var(--ganzy-orange)]"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>
              Target: {s.targetLevel}
              <input
                type="range"
                min={0}
                max={100}
                value={s.targetLevel}
                onChange={(e) => onUpdate(s.id, { targetLevel: Number(e.target.value) })}
                className="accent-[var(--ganzy-orange)]"
              />
            </label>
          </div>
        ))}
        {subjects.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: "var(--fg-subtle)" }}>
            Add at least one subject to build your plan.
          </p>
        )}
      </div>

      <Button fullWidth size="lg" disabled={subjects.length === 0} onClick={onContinue}>
        Continue →
      </Button>
    </div>
  );
}
