"use client";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export default function OnboardingPageClient({ userId }: { userId: string }) {
  return (
    <div className="flex items-center justify-center">
      <OnboardingFlow userId={userId} />
    </div>
  );
} 