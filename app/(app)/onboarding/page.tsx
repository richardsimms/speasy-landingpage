import { cookies } from 'next/headers';
import OnboardingPageClient from './OnboardingPageClient';

// Sample mock data for build time
const MOCK_PREFERENCES = {
  categoryPreferences: ['1', '2'],
  listening_context: 'commuting',
  session_length: '10-20',
  preferred_tone: 'friendly',
  exclusions: '',
};

export default function OnboardingPage() {
  // This is a component that will be rendered statically at build time
  // No server actions or dynamic imports should be used at the top level
  
  // Immediately return for build mode
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
    return <OnboardingPageClient />;
  }
  
  // For runtime only (not during build), we dynamically use async logic
  // We have to use a dynamic import hack to defer the async logic
  const runtime = async () => {
    try {
      // Import Supabase client only in runtime
      const { createServerSafeClient } = await import('@/lib/supabase-server');
      
      // Define the getUserPreferences function inside runtime context
      const getUserPreferences = async (userId: string) => {
        const client = createServerSafeClient();
        
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
      };
      
      // Get user session from cookies
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('sb-access-token')?.value;
      
      if (!accessToken) {
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
    } catch (error) {
      console.error('Error in onboarding page:', error);
      // Fallback to basic client component in case of errors
      return <OnboardingPageClient />;
    }
  };
  
  // Next.js will automatically unwrap the Promise
  return runtime();
}  