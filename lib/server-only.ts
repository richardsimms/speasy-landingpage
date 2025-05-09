import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client can only be used on the server');
  }
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  });
}
