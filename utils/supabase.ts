import { createClient } from '@supabase/supabase-js'

// Create a function to safely initialize Supabase
const createSafeClient = () => {
  // During build or if environment variables are missing, return a mock client
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Using mock Supabase client in utils/supabase.ts');
    
    // Return a mock client with all required methods
    return {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
        upsert: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signIn: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null })
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock-image.jpg' } })
        })
      }
    }
  }

  // For runtime with environment variables, return the real client
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    // Return a minimal mock in case of initialization error
    return {
      from: () => ({}),
      auth: { getUser: () => Promise.resolve({ data: null, error: null }) }
    }
  }
}

export const supabase = createSafeClient() 