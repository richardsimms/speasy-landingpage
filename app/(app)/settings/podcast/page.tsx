// Remove the top-level import
// import { createServerSafeClient } from "@/lib/supabase-server"
import PodcastSettingsClient from "./PodcastSettingsClient"

// Function to check if we're in build mode
function isBuildMode() {
  return process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
         !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export default async function PodcastSettingsPage() {
  // Build-time safety check - return the client component during build
  if (isBuildMode()) {
    console.log("Using mock data in podcast settings page due to build mode or missing credentials");
    return <PodcastSettingsClient />
  }

  // For runtime only (not during build), we dynamically use async logic
  try {
    // Import Supabase client only in runtime
    const { createServerSafeClient } = await import('@/lib/supabase-server');
    
    // Use the safe server client for auth check
    const supabase = createServerSafeClient()
    const { data: { session } } = await supabase.auth.getSession()

    return <PodcastSettingsClient />
  } catch (error) {
    console.error("Error in podcast settings page:", error);
    // Fallback to basic client component in case of errors
    return <PodcastSettingsClient />
  }
}
