import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

// Create a comprehensive mock that matches the real client's structure
const createMockClient = () => {
  console.log('Using mock Supabase client in utils/supabase.ts');
  
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (field: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          order: (column: string, options?: { ascending?: boolean }) => ({
            limit: (count: number) => Promise.resolve({ data: [], error: null })
          }),
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        in: (field: string, values: any[]) => ({
          order: (column: string, options?: { ascending?: boolean }) => ({
            limit: (count: number) => Promise.resolve({ data: [], error: null })
          })
        }),
        neq: (field: string, value: any) => ({
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        limit: (count: number) => Promise.resolve({ data: [], error: null })
      }),
      insert: (values: any) => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
      upsert: (values: any) => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
      update: (values: any) => ({
        eq: (field: string, value: any) => Promise.resolve({ data: null, error: null }),
        match: (query: Record<string, any>) => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: (field: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    }),
    auth: {
      getUser: (token?: string) => Promise.resolve({ 
        data: { user: { id: 'mock-user-id', email: 'mock@example.com' } as User }, 
        error: null 
      }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: any) => Promise.resolve({ data: {}, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: 'https://example.com/mock-image.jpg' } })
      })
    },
    rpc: (fn: string, params?: any) => Promise.resolve({ data: null, error: null })
  } as unknown as SupabaseClient;
};

// Create a function to safely initialize Supabase
const createSafeClient = (): SupabaseClient => {
  // During build or if environment variables are missing, return a mock client
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createMockClient();
  }

  // For runtime with environment variables, return the real client
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    // Return the same mock in case of initialization error
    return createMockClient();
  }
};

export const supabase = createSafeClient(); 