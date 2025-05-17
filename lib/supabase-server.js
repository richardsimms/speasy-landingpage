import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Create a Supabase client for server components
export function createClient() {
  // Check for required environment variables
  if (typeof process !== 'undefined' && process.env) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
  }

  try {
    return createServerComponentClient({ cookies: async () => await cookies() });
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    // Return a mock client that will throw a clearer error when actually used
    return new Proxy({}, {
      get: (target, prop) => {
        if (prop === 'auth') {
          return new Proxy({}, {
            get: (authTarget, authProp) => {
              return (...args) => Promise.resolve({ data: {}, error: new Error('Supabase client not initialized properly') });
            }
          });
        }
        throw new Error(`Supabase server client not properly initialized. Make sure environment variables are set.`);
      }
    });
  }
} 