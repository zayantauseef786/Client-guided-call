"use client";

import { useRouter } from "next/navigation";
import { useGanzy } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import AppShell from "@/components/ui/AppShell";
import TopBar from "@/components/ui/TopBar";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

export default function YouPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const profile = useGanzy((s) => s.profile);
  const setProfile = useGanzy((s) => s.setProfile);
  const subjects = useGanzy((s) => s.subjects);
  const streak = useGanzy((s) => s.streak);
  const darkMode = useGanzy((s) => s.darkMode);
  const toggleDarkMode = useGanzy((s) => s.toggleDarkMode);
  const billing = useGanzy((s) => s.billing);
  const setBillingPlan = useGanzy((s) => s.setBillingPlan);
  const resetAll = useGanzy((s) => s.resetAll);

  if (!hydrated) return null;

  return (
    <AppShell topBar={<TopBar />}>
      <div className="px-6 py-6 flex flex-col gap-8 pb-24">
        <section className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: "var(--ganzy-orange)" }}
          >
            {profile.name.slice(0, 1).toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate" style={{ color: "var(--fg-default)" }}>{profile.name || "Student"}</p>
            <p className="text-sm truncate" style={{ color: "var(--fg-subtle)" }}>{profile.email}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.06em] mb-2" style={{ color: "var(--fg-label)" }}>
            Targets
          </h2>
          <div className="flex flex-col gap-2">
            {subjects.map((s) => (
              <div key={s.id} className="flex justify-between text-sm">
                <span style={{ color: "var(--fg-default)" }}>{s.name}</span>
                <span style={{ color: "var(--fg-subtle)" }}>{s.currentLevel} → {s.targetLevel}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.06em] mb-2" style={{ color: "var(--fg-label)" }}>
            Exam dates
          </h2>
          <div className="flex flex-col gap-2">
            {subjects.map((s) => (
              <div key={s.id} className="flex justify-between text-sm">
                <span style={{ color: "var(--fg-default)" }}>{s.name}</span>
                <span style={{ color: "var(--fg-subtle)" }}>{s.examDate}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
              Appearance
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--fg-muted)" }}>Dark mode</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-12 h-7 rounded-full relative transition-colors"
            style={{ background: darkMode ? "var(--ganzy-orange)" : "var(--stone-border-2)" }}
            aria-label="Toggle dark mode"
          >
            <span
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform"
              style={{ transform: darkMode ? "translateX(22px)" : "translateX(2px)" }}
            />
          </button>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.06em] mb-2" style={{ color: "var(--fg-label)" }}>
            Streak
          </h2>
          <div className="rounded-[24px] p-4 flex items-center justify-between" style={{ background: "var(--bg-surface-cream)" }}>
            <span className="text-lg font-bold" style={{ color: "var(--ganzy-orange)" }}>🔥 {streak.count} days</span>
            <span className="text-xs font-bold rounded-full px-3 py-1" style={{ background: "var(--ganzy-orange-soft)", color: "var(--ganzy-orange)" }}>
              🛡 {streak.freezesAvailable} freeze available
            </span>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.06em] mb-2" style={{ color: "var(--fg-label)" }}>
            Ganzy Plus
          </h2>
          <div className="rounded-[24px] border p-4 flex flex-col gap-3" style={{ borderColor: "var(--stone-border)" }}>
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
              {billing.plan === "none"
                ? "Introductory price: $5 flat through August 20 — standard pricing applies after."
                : `Billed ${billing.plan} via Stripe.`}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={billing.plan === "monthly" ? "primary" : "secondary"}
                onClick={() => setBillingPlan("monthly")}
              >
                Monthly — $20/mo
              </Button>
              <Button
                size="sm"
                variant={billing.plan === "yearly" ? "primary" : "secondary"}
                onClick={() => setBillingPlan("yearly")}
              >
                Yearly — $180/yr
              </Button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.06em] mb-2" style={{ color: "var(--fg-label)" }}>
            Account
          </h2>
          <TextField
            label="Name"
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
          />
          <button
            className="text-sm font-bold mt-4"
            style={{ color: "var(--danger-text)" }}
            onClick={() => {
              resetAll();
              router.replace("/onboarding");
            }}
          >
            Delete account
          </button>
        </section>

        <p className="text-xs text-center" style={{ color: "var(--fg-subtle)" }}>
          🎓 Built by students, for students
        </p>
      </div>
    </AppShell>
  );
}
