"use client";

import { useState } from "react";
import BottomSheet from "./ui/BottomSheet";
import Button from "./ui/Button";
import TextField from "./ui/TextField";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (minutes: number) => void;
}

const DURATIONS = [30, 60, 120, 240];

export default function SomethingCameUpSheet({ open, onClose, onSubmit }: Props) {
  const [what, setWhat] = useState("");
  const [minutes, setMinutes] = useState(60);

  return (
    <BottomSheet open={open} onClose={onClose} title="Something came up">
      <div className="flex flex-col gap-4">
        <TextField
          label="What came up?"
          placeholder="e.g. Family dinner ran long"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
        />
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
            For how long?
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {DURATIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className="px-4 py-2 rounded-full text-sm font-bold border"
                style={{
                  background: minutes === m ? "var(--ganzy-orange)" : "var(--bg-surface)",
                  color: minutes === m ? "white" : "var(--fg-muted)",
                  borderColor: minutes === m ? "transparent" : "var(--stone-border-2)",
                }}
              >
                {m < 60 ? `${m}m` : `${m / 60}h`}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--fg-subtle)" }}>
          Nothing is lost — Ganzy will redistribute affected study time around the rest of your week.
        </p>
        <Button
          fullWidth
          onClick={() => {
            onSubmit(minutes);
            setWhat("");
            onClose();
          }}
        >
          Recalibrate my plan →
        </Button>
      </div>
    </BottomSheet>
  );
}
