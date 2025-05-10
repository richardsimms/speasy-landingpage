import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Export createClient for client components
export function createClient() {
  return createClientComponentClient()
}
