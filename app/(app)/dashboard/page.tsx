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
  
  console.log("User subscribed to categories:", subscribedCategoryIds)

  let latestContent: any[] = []

  if (subscribedCategoryIds.length > 0) {
    // Get content from sources that match the user's subscribed categories
    const { data: contentItems, error: contentError } = await supabase
      .from("content_items")
      .select(`
        *,
        source:content_sources!inner(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
      `)
      .eq("user_content_items.user_id", session.user.id)
      .in("source.category_id", subscribedCategoryIds)
      .order("published_at", { ascending: false })
      .limit(10)
    
    console.log("Content items error:", contentError)
    
    if (contentItems && contentItems.length > 0) {
      latestContent = contentItems
      console.log("Found filtered content items:", contentItems.length)
    } else {
      console.log("No content found for subscribed categories")
    }
  } else {
    console.log("No subscribed categories")
  }
  
  // If no content was found through categories, show all content
  if (latestContent.length === 0) {
    console.log("Falling back to all content")
    const { data: allContent } = await supabase
      .from("content_items")
      .select(`
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
      `)
      .eq("user_content_items.user_id", session.user.id)
      .order("published_at", { ascending: false })
      .limit(10)
    
    if (allContent) {
      latestContent = allContent
    }
  }

  // Get user's saved content
  const { data: savedContent } = await supabase
    .from("user_content_items")
    .select(`
      *,
      content:content_items(
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
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
      id, title, url, published_at,
      source:content_sources(name),
      audio:audio_files(file_url, duration),
      content_item_id
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get all categories
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  return (
    <DashboardClient
      userName={session.user.email?.split("@")[0] || "User"}
      userId={session.user.id}
      latestContent={latestContent || []}
      savedContent={savedContent?.map((item) => item.content) || []}
      submittedUrls={submittedUrls || []}
      categories={categories || []}
      subscribedCategoryIds={subscribedCategoryIds}
      isOnboarding={!subscribedCategoryIds || subscribedCategoryIds.length === 0}
    />
  )
}
