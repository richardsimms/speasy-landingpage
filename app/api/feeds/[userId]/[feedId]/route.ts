import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import RSS from "rss"

export async function GET(request: NextRequest, { params }: { params: { userId: string; feedId: string } }) {
  const { userId, feedId } = params

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify that the feed exists
    const { data: feed } = await supabase.from("podcast_feeds").select("*").eq("user_id", userId).single()

    if (!feed) {
      return new NextResponse("Feed not found", { status: 404 })
    }

    // Get user's content items
    const { data: userContent } = await supabase
      .from("user_content_items")
      .select(`
        content:content_items(
          *,
          source:content_sources(name),
          audio:audio_files(file_url, duration, type)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    // Create RSS feed
    const feedUrl = `${request.nextUrl.origin}/api/feeds/${userId}/${feedId}`

    const rssFeed = new RSS({
      title: feed.title || "Speasy Feed",
      description: feed.description || "Your personalized audio content feed",
      feed_url: feedUrl,
      site_url: `${request.nextUrl.origin}`,
      image_url: `${request.nextUrl.origin}/api/feed-image/${userId}`,
      language: "en",
      pubDate: new Date(),
      ttl: 60,
    })

    // Add items to feed
    if (userContent) {
      userContent.forEach((item) => {
        const content = item.content

        if (content && content.audio && content.audio.length > 0) {
          rssFeed.item({
            title: content.title,
            description: content.summary || content.title,
            url: content.url,
            guid: content.id,
            date: new Date(content.published_at),
            enclosure: {
              url: content.audio[0].file_url,
              size: 0, // Size is required but we don't know it
              type: "audio/mpeg",
            },
            custom_elements: [
              { "itunes:duration": Math.floor(content.audio[0].duration) },
              { "itunes:author": content.source?.name || "Speasy" },
            ],
          })
        }
      })
    }

    // Return RSS feed
    return new NextResponse(rssFeed.xml(), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Error generating feed:", error)
    return new NextResponse("Error generating feed", { status: 500 })
  }
}
