import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LandingPage from "./landing-page"

export const dynamic = "force-dynamic"

export default async function RootPage({ searchParams }: { searchParams: { code?: string } }) {
  // If there's an auth code in the URL, redirect to the auth callback route
  if (searchParams.code) {
    redirect(`/auth/callback?code=${searchParams.code}`)
    return null
  }

  // Check if the user is authenticated
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If authenticated, redirect to dashboard
  if (session) {
    redirect("/dashboard")
    return null
  }

  // Otherwise, show the landing page
  return <LandingPage />
}
