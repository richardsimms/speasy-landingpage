import type React from "react"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { Analytics } from "@vercel/analytics/react"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Hide sidebar if onboarding is active (look for a data-onboarding attribute on the child)
  const isOnboarding =
    (Array.isArray(children) && children.some((child: any) => child?.props?.isOnboarding)) ||
    (typeof children === 'object' && (children as any)?.props?.isOnboarding);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1">
        {/* {!isOnboarding && <AppSidebar />} */}
        <main className="container items-center">{children}</main>
      </div>
      <Analytics />
    </div>
  )
}
