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

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  // Auth routes
  if (req.nextUrl.pathname.startsWith('/auth/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
