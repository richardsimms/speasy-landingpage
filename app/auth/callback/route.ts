import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isTestEnvironment } from "@/utils/environment"

export async function GET(request: NextRequest) {
  // Skip in test environment
  if (isTestEnvironment()) {
    console.log('Test environment - skipping auth callback processing');
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth error:", error)
        return NextResponse.redirect(new URL("/auth/login?error=Authentication failed", request.url))
      }

      // Get the session to confirm authentication worked
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // If we have a session, redirect to dashboard, otherwise to login
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      console.error("Error in auth callback:", error);
      return NextResponse.redirect(new URL("/auth/login?error=Unexpected error", request.url))
    }
  }

  // If there's no code or authentication failed, redirect to login
  return NextResponse.redirect(new URL("/auth/login", request.url))
}
