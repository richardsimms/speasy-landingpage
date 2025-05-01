import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Export createClient for client components
export function createClient() {
  return createClientComponentClient()
}

// Create an admin client for operations requiring service role permissions
export function createAdminClient() {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  })
}

// Re-export the original createClient function from supabase-js from "@supabase/supabase-js"
