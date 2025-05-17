import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore })

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
  }

  // If there's no code or authentication failed, redirect to login
  return NextResponse.redirect(new URL("/auth/login", request.url))
}
