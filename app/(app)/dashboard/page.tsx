import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user profile
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Get user's subscribed categories
  const { data: subscriptions } = await supabase
    .from("user_category_subscriptions")
    .select("category_id")
    .eq("user_id", session.user.id)

  const subscribedCategoryIds = subscriptions?.map((sub) => sub.category_id) || []

  // Get latest content items
  const { data: latestContent } = await supabase
    .from("content_items")
    .select(`
      *,
      source:content_sources(name, category_id),
      audio:audio_files(file_url, duration, type)
    `)
    .order("published_at", { ascending: false })
    .limit(10)

  // Get user's saved content
  const { data: savedContent } = await supabase
    .from("user_content_items")
    .select(`
      *,
      content:content_items(
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type)
      )
    `)
    .eq("user_id", session.user.id)
    .eq("is_favorite", true)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user's submitted URLs
  const { data: submittedUrls } = await supabase
    .from("user_submitted_urls")
    .select(`
      *,
      content:content_items(
        *,
        audio:audio_files(file_url, duration, type)
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get all categories
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  return (
    <DashboardClient
      userName={session.user.email?.split("@")[0] || "User"}
      latestContent={latestContent || []}
      savedContent={savedContent?.map((item) => item.content) || []}
      submittedUrls={submittedUrls || []}
      categories={categories || []}
      subscribedCategoryIds={subscribedCategoryIds}
    />
  )
}
