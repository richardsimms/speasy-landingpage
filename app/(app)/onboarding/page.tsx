import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabase';
import OnboardingPageClient from './OnboardingPageClient';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    // Not logged in, redirect to login or show nothing
    redirect('/auth/login');
  }

  // Fetch user preferences
  const { data: userData } = await supabase
    .from('users')
    .select('categoryPreferences')
    .eq('id', userId)
    .single();
  
  // Also check for category subscriptions
  const { data: categorySubscriptions } = await supabase
    .from('user_category_subscriptions')
    .select('category_id')
    .eq('user_id', userId);
    
  const hasSubscriptions = categorySubscriptions && categorySubscriptions.length > 0;
  const prefs = userData?.categoryPreferences;

  // If they have preferences or subscriptions, they're already onboarded
  if ((prefs && prefs !== 'all' && Array.isArray(prefs) && prefs.length > 0) || hasSubscriptions) {
    // Already onboarded, redirect to dashboard
    redirect('/dashboard');
  }

  // Needs onboarding
  return <OnboardingPageClient userId={userId} />;
} 