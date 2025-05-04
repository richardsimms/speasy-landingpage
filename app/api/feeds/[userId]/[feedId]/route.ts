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

export async function GET(request: NextRequest, context: { params: { userId: string; feedId: string } }) {
  const { userId, feedId } = context.params;

  // Initialize Supabase client without authentication for public RSS feed
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get actual deployed URL from request headers or fallback to env
    const host = request.headers.get('host') || 'speasy.app';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${proto}://${host}`;
    console.log("Using baseUrl:", baseUrl);
    
    const expectedFeedUrl = `${baseUrl}/api/feeds/${userId}/${feedId}`;
    const defaultFeedUrl = `${baseUrl}/api/feeds/${userId}/default`;
    
    // Just the path parts for comparison with database values that might have different domains
    const expectedPath = `/api/feeds/${userId}/${feedId}`;
    const defaultPath = `/api/feeds/${userId}/default`;
    
    console.log("Looking for feed URLs:", { expectedFeedUrl, defaultFeedUrl });

    // Get all feeds for this user and find the right one
    const { data: feeds } = await supabase
      .from("podcast_feeds")
      .select("*")
      .eq("user_id", userId);

    let feed = null;
    
    if (feeds && feeds.length > 0) {
      console.log("Found feeds for user:", feeds);
      
      // First look for an exact match
      feed = feeds.find(f => f.feed_url === expectedFeedUrl || f.feed_url === defaultFeedUrl);
      
      // Then try path matching (domain-agnostic)
      if (!feed) {
        feed = feeds.find(f => 
          (typeof f.feed_url === 'string') && 
          (f.feed_url.endsWith(expectedPath) || f.feed_url.endsWith(defaultPath))
        );
      }
      
      // Finally, try the is_default flag
      if (!feed) {
        feed = feeds.find(f => f.is_default === true);
      }
      
      // Last resort - just use the first feed
      if (!feed && feeds.length > 0) {
        feed = feeds[0];
      }
    }

    if (!feed) {
      console.error("Feed not found", { userId, feedId, expectedFeedUrl, defaultFeedUrl });
      return new NextResponse("Feed not found", { status: 404 });
    }

    console.log("Using feed:", feed);

    // 1. Get user's subscribed categories
    const { data: subscriptions } = await supabase
      .from("user_category_subscriptions")
      .select("category_id")
      .eq("user_id", userId);

    const subscribedCategoryIds = subscriptions?.map((sub) => sub.category_id) || [];
    console.log("User subscribed to categories:", subscribedCategoryIds);

    let latestContent: any[] = [];

    if (subscribedCategoryIds.length > 0) {
      const { data: contentItems } = await supabase
        .from("content_items")
        .select(`
          id,
          title,
          url,
          summary,
          published_at,
          content,
          source:content_sources(name, category_id),
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
          id,
          title,
          url,
          summary,
          published_at,
          content,
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
    console.log("Found content items:", latestContent?.length || 0);

    // Map content_items rows to ContentItem[] for the feed generator
    const contentItems: ContentItem[] = latestContent
      .filter((item) => item.audio && item.audio.length > 0)
      .map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        url: item.url,
        published_at: item.published_at,
        content_markdown: item.content, // Use content field as markdown
        source: item.source && item.source.length > 0 ? { name: item.source[0].name } : undefined,
        audio: item.audio
      }));

    console.log("Prepared items for feed:", contentItems.length);

    // Generate feed with our async generator (Apple Podcasts compliant)
    const rssFeedXml = await generateRssFeedAsync(contentItems, {
      title: feed.title || "Speasy Feed",
      description: feed.description || "Your personalized audio content feed",
      userId,
      feedId
    });

    // Return RSS feed
    return new NextResponse(rssFeedXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
