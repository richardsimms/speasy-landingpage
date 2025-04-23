import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { generateRssFeed, type ContentItem } from "@/lib/feed-generator"

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
          id,
          title,
          summary,
          url,
          published_at,
          content_markdown,
          source:content_sources(name),
          audio:audio_files(file_url, duration, type)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    // Extract content items for the feed and convert to the expected format
    const contentItems: ContentItem[] = []
    
    if (userContent) {
      // Using 'any' for simplicity with complex nested Supabase response
      const userContentAny = userContent as any[]
      
      for (const item of userContentAny) {
        if (!item.content) continue
        
        const content = item.content
        
        // Shape the content into the expected ContentItem format
        contentItems.push({
          id: content.id,
          title: content.title,
          summary: content.summary,
          url: content.url,
          published_at: content.published_at,
          content_markdown: content.content_markdown,
          source: content.source && content.source.length > 0 
            ? { name: content.source[0].name } 
            : undefined,
          audio: content.audio
        })
      }
    }
    
    // Generate feed with our new generator
    const rssFeedXml = generateRssFeed(contentItems, {
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
