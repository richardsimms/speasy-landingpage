import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SupabaseClient } from "@supabase/supabase-js"
import { isTestEnvironment, isBuildTime } from "@/utils/environment"

// Mock client for test and build environments
const createMockClient = () => {
  console.log('Using mock Supabase client for tests or build');
  
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (field: string, value: any) => ({
          single: () => Promise.resolve({ data: {}, error: null }),
        }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
      }),
      insert: (values: any) => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      }),
      getUser: () => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      }),
      signInWithOtp: (options: any) => Promise.resolve({ 
        data: {}, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null })
    }
  } as unknown as SupabaseClient;
};

// Export createClient for client components
export function createClient() {
  // If we're in test environment or during build, use a mock client
  if (isTestEnvironment() || isBuildTime()) {
    return createMockClient();
  }
  
  // For non-test environments, create a real client
  try {
    return createClientComponentClient();
  } catch (error) {
    console.error('Error creating Supabase client component:', error);
    return createMockClient();
  }
}
