"use client";

// Ported verbatim from the design handoff's ganzy-components.jsx TextField.

import { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export default function TextField({ label, icon, trailing, style, ...rest }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {label && (
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-label)", letterSpacing: 0.2 }}>
          {label}
        </span>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 18,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--fg-muted)",
              display: "flex",
            }}
          >
            {icon}
          </span>
        )}
        <input
          {...rest}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--neutral-150)",
            border: "none",
            borderRadius: 9999,
            padding: icon ? "15px 48px" : "15px 20px",
            fontFamily: "inherit",
            fontSize: 16,
            color: "var(--fg-default)",
            outline: "none",
            ...style,
          }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--ring-focus)")}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
        />
        {trailing && (
          <span
            style={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--fg-muted)",
            }}
          >
            {trailing}
          </span>
        )}
      </div>
    </div>
  );
}
