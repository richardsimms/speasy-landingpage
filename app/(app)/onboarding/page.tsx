import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabase';
import OnboardingPageClient from './OnboardingPageClient';

export default async function OnboardingPage() {
  // Get user session from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  if (!accessToken) {
    // Not logged in, redirect to login
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
    return null;
  }
  // Fetch user and preferences
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
    return null;
  }
  const { data: userData } = await supabase.from('users').select('categoryPreferences').eq('id', user.id).single();
  const prefs = userData?.categoryPreferences;
  if (prefs && prefs !== 'all' && Array.isArray(prefs) && prefs.length > 0) {
    // Already onboarded, redirect to main feed
    if (typeof window !== 'undefined') window.location.href = '/dashboard';
    return null;
  }
  const preferences = await getUserPreferences(user.id);
  const needsOnboarding =
    !preferences?.categoryPreferences ||
    preferences.categoryPreferences.length === 0;

  if (needsOnboarding) {
    // Show onboarding
    return <OnboardingPageClient />;
  } else {
    // Redirect to dashboard or main app
    if (typeof window !== 'undefined') window.location.href = '/dashboard';
    return null;
  }
} 