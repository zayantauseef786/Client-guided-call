"use client";

// Ported verbatim from the design handoff's ganzy-components.jsx ProgressRing,
// with an added mount-in animation (0 -> value) per the Rebuild Spec.

import { useEffect, useState } from "react";

interface Props {
  value: number; // 0-100
  label?: string; // caption under the ring, e.g. "Predicted Score"
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
}

export default function ProgressRing({
  value = 64,
  label = "Predicted Score",
  size = 110,
  stroke = 8,
  color,
  track,
}: Props) {
  const resolvedColor = color || "var(--ganzy-orange)";
  const resolvedTrack = track || "var(--bg-accent-soft)";
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;

  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(Math.max(0, Math.min(100, value))), 50);
    return () => clearTimeout(t);
  }, [value]);

  const off = c * (1 - animated / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={resolvedTrack} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={off}
            style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.2,0.8,0.2,1)" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            color: resolvedColor,
          }}
        >
          {value}%
        </div>
      </div>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ganzy-orange)", letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}
        </div>
      )}
    </div>
  );
}
