import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { SupabaseClient } from "@supabase/supabase-js"

// Create a mock implementation of common Supabase methods
const createMockSupabaseClient = () => {
  console.log('Using mock Supabase server component client');
  
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
      getUser: () => Promise.resolve({ 
        data: { 
          user: { 
            id: 'mock-user-id', 
            email: 'mock@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } 
        }, 
        error: null 
      }),
      getSession: () => Promise.resolve({
        data: { 
          session: { 
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600,
            expires_in: 3600,
            user: {
              id: 'mock-user-id',
              email: 'mock@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            }
          }
        },
        error: null
      }),
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

/**
 * Creates a Supabase client for use in server components that works during build
 */
export function createServerSafeClient() {
  // During build time or if environment variables are missing, return a mock client
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createMockSupabaseClient();
  }

  // For runtime with environment variables, return the real client
  try {
    // Next.js has improved error handling for context-dependent APIs like cookies()
    // Try-catch prevents errors during static site generation or outside request context
    try {
      return createServerComponentClient({ cookies });
    } catch (cookieError) {
      console.warn('Called cookies() outside request context, falling back to mock client');
      return createMockSupabaseClient();
    }
  } catch (error) {
    console.error('Error creating Supabase server component client:', error);
    return createMockSupabaseClient();
  }
} 