"use client";

import { useRouter } from "next/navigation";
import { useGanzy } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import WizardHeader from "@/components/onboarding/WizardHeader";
import SignUpStep from "@/components/onboarding/SignUpStep";
import BasicsStep from "@/components/onboarding/BasicsStep";
import SubjectsStep from "@/components/onboarding/SubjectsStep";
import AvailabilityStep from "@/components/onboarding/AvailabilityStep";
import ReviewStep from "@/components/onboarding/ReviewStep";
import CelebrationStep from "@/components/onboarding/CelebrationStep";

const TOTAL_STEPS = 4; // basics, subjects, availability, review

export default function OnboardingPage() {
  const hydrated = useHydrated();
  const router = useRouter();

  const step = useGanzy((s) => s.onboardingStep);
  const setStep = useGanzy((s) => s.setOnboardingStep);
  const profile = useGanzy((s) => s.profile);
  const setProfile = useGanzy((s) => s.setProfile);
  const subjects = useGanzy((s) => s.subjects);
  const addSubject = useGanzy((s) => s.addSubject);
  const updateSubject = useGanzy((s) => s.updateSubject);
  const removeSubject = useGanzy((s) => s.removeSubject);
  const availability = useGanzy((s) => s.availability);
  const setAvailabilityRange = useGanzy((s) => s.setAvailabilityRange);
  const clearAvailabilityDay = useGanzy((s) => s.clearAvailabilityDay);
  const confirmPlan = useGanzy((s) => s.confirmPlan);

  if (!hydrated) return null;

  const titles: Record<number, { title: string; subtitle?: string }> = {
    1: { title: "Tell us about you", subtitle: "This helps Ganzy frame your plan around what actually matters to you." },
    2: { title: "What are you working on?", subtitle: "Add every exam or subject you want Ganzy to plan around." },
    3: { title: "What does your week look like?", subtitle: "Mark school, activities, and anything fixed — the rest becomes study time." },
    4: { title: "Here's your plan", subtitle: undefined },
  };

  return (
    <div className="min-h-screen flex justify-center" style={{ background: "var(--bg-canvas)" }}>
      <div className="w-full max-w-[480px] min-h-screen flex flex-col" style={{ background: "var(--bg-page)" }}>
        {step === 0 && (
          <>
            <div className="px-6 pt-10 pb-2">
              <span className="text-2xl font-extrabold" style={{ color: "var(--ganzy-orange)" }}>Ganzy</span>
              <h1 className="text-[28px] leading-tight font-bold mt-4" style={{ color: "var(--fg-default)" }}>
                Let&apos;s get you set up
              </h1>
              <p className="text-base mt-2" style={{ color: "var(--fg-muted)" }}>
                A study plan that adjusts to your real life.
              </p>
            </div>
            <SignUpStep
              name={profile.name}
              email={profile.email}
              age13Confirmed={profile.age13Confirmed}
              onChange={(partial) => setProfile(partial)}
              onContinue={() => setStep(1)}
            />
          </>
        )}

        {step >= 1 && step <= 4 && (
          <>
            <WizardHeader
              step={step - 1}
              total={TOTAL_STEPS}
              title={titles[step].title}
              subtitle={titles[step].subtitle}
              onBack={() => setStep(step - 1)}
            />
            {step === 1 && (
              <BasicsStep
                schoolYear={profile.schoolYear}
                collegeGoal={profile.collegeGoal}
                whyTags={profile.whyTags}
                onChange={(partial) => setProfile(partial)}
                onContinue={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <SubjectsStep
                subjects={subjects}
                onAdd={addSubject}
                onUpdate={updateSubject}
                onRemove={removeSubject}
                onContinue={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <AvailabilityStep
                availability={availability}
                onSetRange={setAvailabilityRange}
                onClearDay={clearAvailabilityDay}
                onContinue={() => setStep(4)}
              />
            )}
            {step === 4 && (
              <ReviewStep
                subjects={subjects}
                availability={availability}
                onBack={() => setStep(3)}
                onBackToSubjects={() => setStep(2)}
                onConfirm={() => {
                  confirmPlan();
                  setStep(5);
                }}
              />
            )}
          </>
        )}

        {step === 5 && (
          <CelebrationStep onDone={() => router.replace("/dashboard")} />
        )}
      </div>
    </div>
  );
}
