"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-5 py-2.5",
  lg: "text-lg px-7 py-4",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--ganzy-orange)] text-[var(--fg-on-accent)] shadow-[var(--shadow-cta)] active:scale-[0.97]",
  secondary:
    "bg-[var(--bg-surface)] text-[var(--fg-muted)] border-2 border-[var(--stone-border-2)] active:scale-[0.97]",
  ghost: "bg-transparent text-[var(--ganzy-orange)] active:scale-[0.97]",
  danger: "bg-red-500 text-white active:scale-[0.97]",
};

const Button = forwardRef<HTMLButtonElement, Props>(
  (
    { children, variant = "primary", size = "md", fullWidth, disabled, className = "", ...rest },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "font-bold rounded-full inline-flex items-center justify-center gap-2 transition-transform duration-150",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ganzy-orange-ring)]",
          sizeClasses[size],
          variantClasses[variant],
          fullWidth ? "w-full" : "",
          disabled ? "opacity-50 pointer-events-none" : "cursor-pointer",
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
