"use client";

import { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export default function TextField({ label, icon, trailing, className = "", ...rest }: Props) {
  return (
    <label className="flex flex-col gap-2 w-full">
      {label && (
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--fg-label)]">
          {label}
        </span>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-4 text-[var(--fg-subtle)] flex items-center">{icon}</span>
        )}
        <input
          className={[
            "w-full rounded-2xl border border-[var(--stone-border-2)] bg-[var(--bg-surface)]",
            "px-4 py-3 text-base text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)]",
            "focus:outline-none focus:border-[var(--ganzy-orange)] focus:ring-4 focus:ring-[var(--ganzy-orange-ring)]",
            icon ? "pl-11" : "",
            trailing ? "pr-11" : "",
            className,
          ].join(" ")}
          {...rest}
        />
        {trailing && <span className="absolute right-4 flex items-center">{trailing}</span>}
      </div>
    </label>
  );
}
