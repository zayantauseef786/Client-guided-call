"use client";

// Ported verbatim from the design handoff's ganzy-components.jsx Button.

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const sizes: Record<Size, React.CSSProperties> = {
  sm: { fontSize: 16, padding: "8px 18px" },
  md: { fontSize: 16, padding: "10px 22px" },
  lg: { fontSize: 20, padding: "16px 28px" },
};

const variants: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--ganzy-orange)",
    color: "var(--fg-on-accent)",
    boxShadow: "var(--shadow-cta)",
  },
  secondary: {
    background: "var(--bg-surface)",
    color: "var(--fg-muted)",
    border: "2px solid var(--stone-border-2)",
  },
  ghost: { background: "transparent", color: "var(--ganzy-orange)" },
  danger: { background: "#EF4444", color: "#fff" },
};

const hoverGlow: Partial<Record<Variant, string>> = {
  primary: "0 0 0 6px rgba(255,130,16,0.28), var(--shadow-cta)",
  secondary: "0 0 0 4px rgba(255,130,16,0.16)",
  ghost: "0 0 0 4px rgba(255,130,16,0.14)",
};
const hoverBorder: Partial<Record<Variant, string>> = { secondary: "2px solid var(--ganzy-orange)" };

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, variant = "primary", size = "md", fullWidth, disabled, style, ...rest }, ref) => {
    const base: React.CSSProperties = {
      fontFamily: "inherit",
      fontWeight: 700,
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      borderRadius: 9999,
      display: fullWidth ? "flex" : "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "transform 140ms, background 140ms, box-shadow 140ms",
      ...(fullWidth ? { width: "100%" } : {}),
      ...(disabled ? { opacity: 0.5 } : {}),
    };
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
        onMouseEnter={(e) => {
          if (disabled) return;
          if (hoverGlow[variant]) e.currentTarget.style.boxShadow = hoverGlow[variant]!;
          if (hoverBorder[variant]) e.currentTarget.style.border = hoverBorder[variant]!;
        }}
        onMouseLeave={(e) => {
          if (disabled) return;
          e.currentTarget.style.boxShadow = (variants[variant].boxShadow as string) || "none";
          if (hoverBorder[variant]) e.currentTarget.style.border = (variants[variant].border as string) || "none";
        }}
        onMouseDown={(e) => {
          if (disabled) return;
          e.currentTarget.style.transform = "scale(0.97)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
