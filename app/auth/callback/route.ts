import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    // If there's no code, redirect to login
    return NextResponse.redirect(new URL("/auth/login?error=No code provided", request.url))
  }

  try {
    // Create a Supabase client for the Route Handler
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth error:", error)
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url))
    }

    // Get the session to confirm authentication worked
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If we have a session, redirect to dashboard, otherwise to login
    if (session) {
      // Redirect to the dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/auth/login?error=No session created", request.url))
    }
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    return NextResponse.redirect(new URL("/auth/login?error=Unexpected error", request.url))
  }
}
