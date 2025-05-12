import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabase';
import OnboardingPageClient from './OnboardingPageClient';
import { createServerSafeClient } from '@/lib/supabase-server';

// Sample mock data for build time
const MOCK_PREFERENCES = {
  categoryPreferences: ['1', '2'],
  listening_context: 'commuting',
  session_length: '10-20',
  preferred_tone: 'friendly',
  exclusions: '',
};

async function getUserPreferences(userId: string) {
  // Use the safe client for build time
  const client = supabase;
  
  const { data: categoryRows } = await client
    .from('user_category_subscriptions')
    .select('category_id')
    .eq('user_id', userId);
  
  const categoryPreferences = categoryRows?.map(row => row.category_id) || [];
  
  const { data: meta } = await client
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
  // Build-time safety
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
    return <OnboardingPageClient />;
  }
  
  // Get user session from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  if (!accessToken) {
    // Return the component for build time
    return <OnboardingPageClient />;
  }
  
  // Use safe server client for auth
  const serverClient = createServerSafeClient();
  
  // Fetch user and preferences
  const { data: { user } } = await serverClient.auth.getUser(accessToken);
  if (!user) {
    return <OnboardingPageClient />;
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
    // For server components, we can't redirect directly
    // We'll show the component and handle redirect on the client side
    return <OnboardingPageClient redirectToDashboard={true} />;
  }
}  