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
    // Get tags matching the user's subscribed categories
    const { data: categoryNames } = await supabase
      .from("categories")
      .select("name")
      .in("id", subscribedCategoryIds)
    
    if (categoryNames && categoryNames.length > 0) {
      const categoryNamesList = categoryNames.map(cat => cat.name)
      console.log("Category names:", categoryNamesList)
      
      // Get tag IDs that match these category names
      const { data: tagIds } = await supabase
        .from("tags")
        .select("id")
        .in("name", categoryNamesList)
      
      if (tagIds && tagIds.length > 0) {
        const tagIdsList = tagIds.map(tag => tag.id)
        console.log("Tag IDs:", tagIdsList)
        
        // Get content IDs that match these tags
        const { data: contentIds, error: contentIdsError } = await supabase
          .from("content_item_tags")
          .select("content_id")
          .in("tag_id", tagIdsList)
        
        console.log("Content IDs error:", contentIdsError)
        
        if (contentIds && contentIds.length > 0) {
          const contentIdsList = contentIds.map(item => item.content_id)
          console.log("Content IDs:", contentIdsList)
          
          // Get the actual content items
          const { data: contentItems, error: contentError } = await supabase
            .from("content_items")
            .select(`
              *,
              source:content_sources(name, category_id),
              audio:audio_files(file_url, duration, type)
            `)
            .in("id", contentIdsList)
            .order("published_at", { ascending: false })
            .limit(10)
          
          console.log("Content items error:", contentError)
          
          if (contentItems) {
            latestContent = contentItems
            console.log("Found filtered content items:", contentItems.length)
          }
        } else {
          console.log("No content IDs found for the tags")
        }
      } else {
        console.log("No tag IDs found for the categories")
      }
    } else {
      console.log("No category names found")
    }
  } else {
    console.log("No subscribed categories")
  }
  
  // If no content was found through tags, show all content
  if (latestContent.length === 0) {
    console.log("Falling back to all content")
    const { data: allContent } = await supabase
      .from("content_items")
      .select(`
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type)
      `)
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
