import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LandingPage from "./landing-page"

export default async function RootPage() {
  // Check if the user is authenticated
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If authenticated, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  // Otherwise, show the landing page
  return <LandingPage />
}
