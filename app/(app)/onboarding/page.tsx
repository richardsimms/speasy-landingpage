import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabase';
import OnboardingPageClient from './OnboardingPageClient';

async function getUserPreferences(userId: string) {
  const { data: categoryRows } = await supabase
    .from('user_category_subscriptions')
    .select('category_id')
    .eq('user_id', userId);
  
  const categoryPreferences = categoryRows?.map(row => row.category_id) || [];
  
  const { data: meta } = await supabase
    .from('user_onboarding_metadata')
    .select('listening_context, session_length, preferred_tone, exclusions')
    .eq('user_id', userId)
    .single();
  
  return {
    categoryPreferences,
    listening_context: meta?.listening_context || '',
    session_length: meta?.session_length || '',
    preferred_tone: meta?.preferred_tone || '',
    exclusions: meta?.exclusions || '',
  };
}

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
  
  // Get user preferences
  const preferences = await getUserPreferences(user.id);
  const needsOnboarding =
    !preferences?.categoryPreferences ||
    preferences.categoryPreferences.length === 0;

  if (needsOnboarding) {
    // Show onboarding
    return <OnboardingPageClient />;
  } else {
    // Redirect to dashboard or main app
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }
}  