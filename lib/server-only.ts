import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client can only be used on the server');
  }

  // During build time or if environment variables are missing, return a mock client
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Using mock Supabase client for build or missing environment variables');
    
    // Create a mock Supabase client with methods used in the application
    return {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            }),
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          in: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            })
          }),
          neq: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
          match: () => Promise.resolve({ data: null, error: null })
        }),
        insert: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
        upsert: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        admin: {
          inviteUserByEmail: () => Promise.resolve({ data: {}, error: null })
        }
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: {}, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock-image.jpg' } })
        })
      },
      rpc: () => Promise.resolve({ data: null, error: null })
    } as unknown as SupabaseClient;
  }

  // For runtime with environment variables, return the real Supabase client
  try {
    return createClientComponentClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    });
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
}
