import { createServerSafeClient } from "@/lib/supabase-server"
import PodcastSettingsClient from "./PodcastSettingsClient"

export default async function PodcastSettingsPage() {
  // Build-time safety check - return the client component during build
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
    return <PodcastSettingsClient />
  }

  // Use the safe server client for auth check
  const supabase = createServerSafeClient()
  const { data: { session } } = await supabase.auth.getSession()

  return <PodcastSettingsClient />
}
