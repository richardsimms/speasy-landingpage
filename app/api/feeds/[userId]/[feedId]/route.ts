import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { generateRssFeedAsync, type ContentItem } from "@/lib/feed-generator"

// Define types for Supabase responses
type AudioFile = {
  file_url: string
  duration: number
  type: string
}

type ContentSource = {
  name: string
}

type ContentItemResponse = {
  id: string
  title: string
  summary?: string
  url?: string
  published_at?: string
  content_markdown?: string
  source?: ContentSource[]
  audio?: AudioFile[]
}

type UserContentResponse = {
  content: ContentItemResponse
}

export async function GET(request: NextRequest, { params }: { params: { userId: string; feedId: string } }) {
  const { userId, feedId } = params

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Build the expected feed URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://speasy.app'
    const expectedFeedUrl = `${baseUrl}/api/feeds/${userId}/${feedId}`

    // Verify that the feed exists for both user and feed URL
    const { data: feed } = await supabase
      .from("podcast_feeds")
      .select("*")
      .eq("user_id", userId)
      .eq("feed_url", expectedFeedUrl)
      .single()

    if (!feed) {
      return new NextResponse("Feed not found", { status: 404 })
    }

    // 1. Get user's subscribed categories
    const { data: subscriptions } = await supabase
      .from("user_category_subscriptions")
      .select("category_id")
      .eq("user_id", userId);

    const subscribedCategoryIds = subscriptions?.map((sub) => sub.category_id) || [];

    let latestContent: any[] = [];

    if (subscribedCategoryIds.length > 0) {
      const { data: contentItems } = await supabase
        .from("content_items")
        .select(`
          *,
          source:content_sources!inner(name, category_id),
          audio:audio_files(file_url, duration, type)
        `)
        .in("source.category_id", subscribedCategoryIds)
        .order("published_at", { ascending: false })
        .limit(10);

      if (contentItems && contentItems.length > 0) {
        latestContent = contentItems;
      }
    }

    if (latestContent.length === 0) {
      const { data: allContent } = await supabase
        .from("content_items")
        .select(`
          *,
          source:content_sources(name, category_id),
          audio:audio_files(file_url, duration, type)
        `)
        .order("published_at", { ascending: false })
        .limit(10);

      if (allContent) {
        latestContent = allContent;
      }
    }

    // Debug log for content
    console.log("latestContent", JSON.stringify(latestContent, null, 2));

    // Map content_items rows to ContentItem[] for the feed generator
    const contentItems: ContentItem[] = latestContent
      .filter((item) => item.audio && item.audio.length > 0)
      .map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        url: item.url,
        published_at: item.published_at,
        content_markdown: item.content_markdown,
        source: item.source && item.source.length > 0 ? { name: item.source[0].name } : undefined,
        audio: item.audio
      }));

    // Generate feed with our async generator (Apple Podcasts compliant)
    const rssFeedXml = await generateRssFeedAsync(contentItems, {
      title: feed.title || "Speasy Feed",
      description: feed.description || "Your personalized audio content feed",
      userId,
      feedId
    })

    // Return RSS feed
    return new NextResponse(rssFeedXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Error generating feed:", error)
    return new NextResponse("Error generating feed", { status: 500 })
  }
}
