"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  color = "var(--ganzy-orange)",
  trackColor = "var(--stone-border)",
  label,
  sublabel,
}: Props) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(Math.max(0, Math.min(100, value))), 50);
    return () => clearTimeout(t);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 absolute inset-0">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.2,0.8,0.2,1)" }}
          />
        </svg>
        {label && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>
              {label}
            </span>
          </div>
        )}
      </div>
      {sublabel && (
        <span className="text-xs font-semibold text-[var(--fg-muted)] text-center">{sublabel}</span>
      )}
    </div>
  );
}
