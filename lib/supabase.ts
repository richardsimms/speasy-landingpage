import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single supabase client for server-side operations
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Create an admin client for operations requiring service role permissions
export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Create a singleton instance for client components
let clientComponentClient: ReturnType<typeof createClientComponentClient> | null = null

// Export createClient for client components
export function createClient() {
  if (!clientComponentClient) {
    clientComponentClient = createClientComponentClient()
  }
  return clientComponentClient
}

// Create an admin client for operations requiring service role permissions
export function createAdminClient() {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  })
}

// Re-export the original createClient function from supabase-js from "@supabase/supabase-js"
