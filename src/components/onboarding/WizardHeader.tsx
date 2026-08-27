interface Props {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function WizardHeader({ step, total, title, subtitle, onBack }: Props) {
  return (
    <div className="px-6 pt-6 pb-4">
      {onBack && (
        <button onClick={onBack} className="p-1 -ml-1 mb-2" style={{ color: "var(--ganzy-orange)" }} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="flex items-center gap-1.5 mb-3">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === step ? 20 : 8,
              background: i <= step ? "var(--ganzy-orange)" : "var(--stone-border)",
            }}
          />
        ))}
        <span className="text-xs font-bold uppercase tracking-[0.06em] ml-2" style={{ color: "var(--fg-subtle)" }}>
          {step + 1} of {total}
        </span>
      </div>
      <h1 className="text-[28px] leading-tight font-bold" style={{ color: "var(--fg-default)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-base mt-2" style={{ color: "var(--fg-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
