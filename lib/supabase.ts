import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single supabase client for interacting with your database
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Export createClient for client components
export function createClient() {
  return createClientComponentClient()
}

// Re-export the original createClient function from supabase-js from "@supabase/supabase-js"
