import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Handle auth error parameters in the URL hash
  const url = new URL(req.url)
  if (url.hash && url.hash.includes('error=')) {
    const errorParams = new URLSearchParams(url.hash.substring(1))
    const error = errorParams.get('error')
    const errorCode = errorParams.get('error_code')
    const errorDescription = errorParams.get('error_description')

    if (error || errorCode || errorDescription) {
      const errorUrl = new URL('/auth/error', req.url)
      errorUrl.searchParams.set('error', error || '')
      errorUrl.searchParams.set('error_code', errorCode || '')
      errorUrl.searchParams.set('error_description', errorDescription || '')
      return NextResponse.redirect(errorUrl)
    }
  }

  // Refresh session
  const { data: { session } } = await supabase.auth.getSession()

  // Check if path is inside the app directory (protected routes)
  const isAppRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                    req.nextUrl.pathname.includes('/(app)') ||
                    req.nextUrl.pathname.startsWith('/settings') ||
                    req.nextUrl.pathname.startsWith('/onboarding')

  // Protect app routes - redirect to login if not authenticated
  if (isAppRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Auth routes - redirect to app home if already authenticated
  if (req.nextUrl.pathname.startsWith('/auth/login') && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/(app)/:path*',
    '/auth/login',
    '/auth/callback',
    '/auth/error',
  ],
}
