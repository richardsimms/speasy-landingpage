import { redirect } from 'next/navigation';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import OnboardingPageClient from './OnboardingPageClient';

async function getUserPreferences(userId: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

export default async function OnboardingPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    // Not logged in, redirect to login
    redirect('/auth/login');
  }

  // Check for category subscriptions
  const { data: categorySubscriptions } = await supabase
    .from("user_category_subscriptions")
    .select("*")
    .eq("user_id", userId);
  
  // Check for user preferences
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  // If user has both preferences and category subscriptions, redirect to main app page
  if (preferences && categorySubscriptions && categorySubscriptions.length > 0) {
    redirect('/(app)/(main)');
  }
  
  // Show onboarding
  return <OnboardingPageClient userId={userId} />;
} 