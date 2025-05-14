import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabase';
import OnboardingPageClient from './OnboardingPageClient';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function OnboardingPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    // Not logged in, redirect to login or show nothing
    return null;
  }

  // Fetch user and preferences
  const { data: userData } = await supabase.from('users').select('categoryPreferences').eq('id', userId).single();
  const prefs = userData?.categoryPreferences;
  if (prefs && prefs !== 'all' && Array.isArray(prefs) && prefs.length > 0) {
    // Already onboarded, redirect to main feed
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }
  const preferences = await getUserPreferences(userId);
  const needsOnboarding =
    !preferences?.categoryPreferences ||
    preferences.categoryPreferences.length === 0;

  if (needsOnboarding) {
    // Show onboarding
    return <OnboardingPageClient userId={userId} />;
  } else {
    // Redirect to dashboard or main app
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }
} 