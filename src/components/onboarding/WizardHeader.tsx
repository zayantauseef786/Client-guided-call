interface Props {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function WizardHeader({ step, total, title, subtitle, onBack }: Props) {
  return (
    <div className="px-6 pt-8 pb-4">
      <div className="flex items-center gap-3 mb-5">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1" style={{ color: "var(--ganzy-orange)" }} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex gap-1.5 flex-1">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: i <= step ? "var(--ganzy-orange)" : "var(--stone-border)" }}
            />
          ))}
        </div>
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>
        {step + 1} of {total}
      </span>
      <h1 className="text-[28px] leading-tight font-bold mt-1" style={{ color: "var(--fg-default)" }}>
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
