"use client";

import { ReactNode, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="w-full max-w-[480px] relative h-full">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
          aria-hidden
        />
        <div
          className="absolute left-0 right-0 bottom-0 rounded-t-[32px] p-6 pb-8 safe-bottom max-h-[85vh] overflow-y-auto"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-modal)" }}
        >
          <div className="w-10 h-1.5 rounded-full mx-auto mb-4" style={{ background: "var(--stone-border-2)" }} />
          {title && <h2 className="text-lg font-bold mb-4" style={{ color: "var(--fg-default)" }}>{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  );
}
