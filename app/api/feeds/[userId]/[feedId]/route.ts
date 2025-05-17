import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/server-only"
import { generateRssFeedAsync, type ContentItem } from "@/lib/feed-generator"

export async function GET(
  request: NextRequest,
  context: { params: Record<string, string> }
) {
  const { userId, feedId } = context.params

  console.log("userId", userId)
  try {
    const supabase = createAdminClient()

    // Find feed with `feed_url = 'default'` for this user
    const { data: feed, error: feedError } = await supabase
      .from("podcast_feeds")
      .select("*")
      .eq("user_id", userId)
      .eq("feed_url", "default")
      .single()

    if (!feed || feedError) {
      console.error("Feed fetch error:", feedError)
      return new NextResponse("Feed not found", { status: 404 })
    }

    const { data: subscriptions } = await supabase
      .from("user_category_subscriptions")
      .select("category_id")
      .eq("user_id", userId)

    const subscribedCategoryIds = subscriptions?.map((s) => s.category_id) || []

    let latestContent: any[] = []

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
        .limit(10)

      latestContent = contentItems ?? []
    }

    if (latestContent.length === 0) {
      const { data: fallbackContent } = await supabase
        .from("content_items")
        .select(`
          *,
          source:content_sources(name, category_id),
          audio:audio_files(file_url, duration, type)
        `)
        .order("published_at", { ascending: false })
        .limit(10)

      latestContent = fallbackContent ?? []
    }

    const contentItems: ContentItem[] = latestContent
      .filter((item) => item.audio?.length > 0)
      .map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        url: item.url,
        published_at: item.published_at,
        content_markdown: item.content_markdown,
        source: item.source?.[0] ? { name: item.source[0].name } : undefined,
        audio: item.audio,
      }))

    const rssFeedXml = await generateRssFeedAsync(contentItems, {
      title: feed.title || "Speasy Feed",
      description: feed.description || "Your personalized audio feed",
      userId,
      feedId: feed.id, // use real UUID
    })

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
