import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Create a Supabase client for server components
export function createClient() {
  return createServerComponentClient({ cookies })
} 