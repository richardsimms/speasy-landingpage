import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SupabaseClient } from '@supabase/supabase-js'

// Create a comprehensive mock that matches the real client's structure
const createMockAdminClient = () => {
  console.log('Using mock Supabase admin client for build or missing environment variables');
  
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
      upsert: (values: any, options?: any) => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
      update: (values: any) => ({
        eq: (field: string, value: any) => Promise.resolve({ data: null, error: null }),
        match: (query: Record<string, any>) => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: (field: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      admin: {
        inviteUserByEmail: (email: string, options?: any) => Promise.resolve({ data: {}, error: null })
      }
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

export function createAdminClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client can only be used on the server');
  }

  // During build time or if environment variables are missing, return a mock client
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createMockAdminClient();
  }

  // For runtime with environment variables, return the real Supabase client
  try {
    return createClientComponentClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    });
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return createMockAdminClient();
  }
}
