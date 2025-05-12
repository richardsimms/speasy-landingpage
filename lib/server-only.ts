import { createClientComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client can only be used on the server');
  }
  
  // Use createRouteHandlerClient for API routes
  return createRouteHandlerClient(
    { cookies },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }
  );
}
