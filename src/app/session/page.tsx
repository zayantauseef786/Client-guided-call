"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGanzy } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import Button from "@/components/ui/Button";
import AppShell from "@/components/ui/AppShell";

function SessionInner() {
  const hydrated = useHydrated();
  const router = useRouter();
  const params = useSearchParams();
  const blockId = params.get("block");

  const planBlocks = useGanzy((s) => s.planBlocks);
  const subjects = useGanzy((s) => s.subjects);
  const streak = useGanzy((s) => s.streak);
  const startSession = useGanzy((s) => s.startSession);
  const endSession = useGanzy((s) => s.endSession);

  const [phase, setPhase] = useState<"pre" | "active" | "done">("pre");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [topics, setTopics] = useState(1);

  const block = planBlocks.find((b) => b.id === blockId);
  const subject = subjects.find((s) => s.id === block?.subjectId);

  useEffect(() => {
    if (phase !== "active") return;
    const t = setInterval(() => setElapsedSec((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  if (!hydrated) return null;
  if (!block) {
    return (
      <AppShell nav={false}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p style={{ color: "var(--fg-muted)" }}>This session block was not found.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to plan</Button>
        </div>
      </AppShell>
    );
  }

  const durationMin = Math.round((block.endMin - block.startMin));

  return (
    <AppShell nav={false}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5 relative">
        {phase !== "done" && (
          <button
            onClick={() => router.push("/dashboard")}
            className="absolute top-6 left-6 text-sm font-bold"
            style={{ color: "var(--fg-subtle)" }}
          >
            interrupt session
          </button>
        )}
        {phase === "pre" && (
          <>
            <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>Up next</span>
            <h1 className="text-2xl font-bold" style={{ color: "var(--fg-default)" }}>{subject?.name ?? block.label}</h1>
            <p style={{ color: "var(--fg-muted)" }}>{durationMin} minute session</p>
            <Button
              size="lg"
              onClick={() => {
                startSession(block.id);
                setPhase("active");
              }}
            >
              Clock In →
            </Button>
          </>
        )}

        {phase === "active" && (
          <>
            <span className="text-4xl font-bold" style={{ color: "var(--ganzy-orange)" }}>
              {String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:{String(elapsedSec % 60).padStart(2, "0")}
            </span>
            <p style={{ color: "var(--fg-muted)" }}>{subject?.name ?? block.label}</p>
            <p className="text-sm font-semibold" style={{ color: "var(--fg-subtle)" }}>Topic {topics}</p>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setTopics((t) => t + 1)}>Next Topic</Button>
              <Button
                onClick={() => {
                  endSession(Math.max(1, Math.round(elapsedSec / 60)), topics);
                  setPhase("done");
                }}
              >
                Clock Out
              </Button>
            </div>
          </>
        )}

        {phase === "done" && (
          <>
            <h1 className="text-2xl font-bold" style={{ color: "var(--fg-default)" }}>
              You covered {topics} topic{topics > 1 ? "s" : ""} in {Math.max(1, Math.round(elapsedSec / 60))} minutes.
            </h1>
            <p style={{ color: "var(--fg-muted)" }}>That&apos;s logged.</p>
            <div className="rounded-[24px] p-4 mt-2" style={{ background: "var(--bg-surface-cream)" }}>
              <p className="text-lg font-bold" style={{ color: "var(--ganzy-orange)" }}>🔥 {streak.count} days</p>
              <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>
                +1 today. Keep it alive tomorrow.
              </p>
            </div>
            <Button size="lg" onClick={() => router.push("/dashboard")}>Back to plan</Button>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={null}>
      <SessionInner />
    </Suspense>
  );
}
