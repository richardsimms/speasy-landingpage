"use client";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export default function OnboardingPageClient({ userId }: { userId: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-900">
      <OnboardingFlow userId={userId} />
    </div>
  );
} 