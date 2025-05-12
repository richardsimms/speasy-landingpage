// import { cookies } from "next/headers"
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { Analytics } from "@vercel/analytics/react"
// import { createServerSafeClient } from "@/lib/supabase-server"

interface AppLayoutWrapperProps {
  children: React.ReactNode
}

export default async function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  // Build-time safety check - return a simplified layout during build
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
    // Just render the layout with children during build
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-muted/40 pb-16 md:pb-0">{children}</main>
        </div>
        <Analytics />
      </div>
    )
  }

  // For runtime only (not during build), we dynamically use async logic
  try {
    // Import Supabase client only in runtime
    const { createServerSafeClient } = await import('@/lib/supabase-server');
    
    // Use our build-safe client
    const supabase = createServerSafeClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    // Fetch user profile data or any other data needed for layout
    // ...

    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-muted/40 pb-16 md:pb-0">{children}</main>
        </div>
        <Analytics />
      </div>
    )
  } catch (error) {
    console.error("Error in app layout:", error);
    // Fallback to simplified layout in case of errors
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-muted/40 pb-16 md:pb-0">{children}</main>
        </div>
        <Analytics />
      </div>
    )
  }
}
