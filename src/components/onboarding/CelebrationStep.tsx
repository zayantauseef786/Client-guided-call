"use client";

import Button from "../ui/Button";

interface Props {
  onDone: () => void;
}

export default function CelebrationStep({ onDone }: Props) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6"
      style={{ background: "var(--ganzy-orange)" }}
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/20">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-white">You&apos;re set.</h1>
      <p className="text-white/90 text-base max-w-xs">
        Your plan is live. We&apos;ll tell you exactly what to do next — starting today.
      </p>
      <Button variant="secondary" size="lg" onClick={onDone} style={{ background: "white", color: "var(--ganzy-orange)", border: "none" }}>
        Go to dashboard →
      </Button>
    </div>
  );
}
