export const dynamic = 'force-dynamic';

import { cookies } from "next/headers"
import { DashboardClient } from "@/components/dashboard-client"

// Sample mock data for build time
const MOCK_CONTENT_ITEMS = [
  {
    id: "1",
    title: "Getting Started with Speasy",
    url: "https://example.com/article",
    description: "This is a sample article for build time.",
    published_at: new Date().toISOString(),
    source: { name: "Mock Source", category_id: "1" },
    audio: [{ file_url: "https://example.com/audio.mp3", duration: 300, type: "mp3" }]
  }
];

const MOCK_CATEGORIES = [
  { id: "1", name: "Technology" },
  { id: "2", name: "Science" },
  { id: "3", name: "Business" }
];

// Function to check if we're in build mode
function isBuildMode() {
  return process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
         !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export default async function DashboardPage() {
  // Build-time safety check - immediate return
  if (isBuildMode()) {
    console.log("Using mock data in dashboard page due to build mode or missing credentials");
    return (
      <DashboardClient
        userName="User"
        latestContent={MOCK_CONTENT_ITEMS}
        savedContent={[]}
        submittedUrls={[]}
        categories={MOCK_CATEGORIES}
        subscribedCategoryIds={["1"]}
      />
    );
  }
  
  // Runtime-only section
  try {
    // Dynamic import of Supabase only during runtime
    const { createServerSafeClient } = await import("@/lib/supabase-server");
    const supabase = createServerSafeClient();
    
    // Get user profile
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // Return a basic version when not logged in
      return (
        <DashboardClient
          userName="User"
          latestContent={[]}
          savedContent={[]}
          submittedUrls={[]}
          categories={[]}
          subscribedCategoryIds={[]}
        />
      );
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
          audio:audio_files(file_url, duration, type)
        `)
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
        id, title, url, published_at,
        source:content_sources(name),
        audio:audio_files(file_url, duration)
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
  } catch (error) {
    console.error("Error in dashboard page:", error);
    // Fallback to mock data in case of errors
    return (
      <DashboardClient
        userName="User"
        latestContent={MOCK_CONTENT_ITEMS}
        savedContent={[]}
        submittedUrls={[]}
        categories={MOCK_CATEGORIES}
        subscribedCategoryIds={["1"]}
      />
    );
  }
}
