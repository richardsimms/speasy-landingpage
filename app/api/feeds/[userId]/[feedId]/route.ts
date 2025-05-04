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
  const params = context.params;
  const { userId, feedId } = params;

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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

    // First try exact URL match
    let { data: feed } = await supabase
      .from("podcast_feeds")
      .select("*")
      .eq("user_id", userId)
      .eq("feed_url", expectedFeedUrl)
      .single();

    // Try domain-agnostic path match using LIKE operator
    if (!feed) {
      const { data: pathFeed } = await supabase
        .from("podcast_feeds")
        .select("*")
        .eq("user_id", userId)
        .or(`feed_url.like.%${expectedPath},feed_url.like.%${defaultPath}`)
        .single();
      
      feed = pathFeed;
    }

    // If still not found, try looking up by userId and is_default flag
    if (!feed) {
      const { data: defaultFeedByFlag } = await supabase
        .from("podcast_feeds")
        .select("*")
        .eq("user_id", userId)
        .eq("is_default", true)
        .single();
      
      feed = defaultFeedByFlag;
    }

    // As a last resort, try to find any feed for this user
    if (!feed) {
      const { data: anyFeed } = await supabase
        .from("podcast_feeds")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      feed = anyFeed;
    }

    if (!feed) {
      console.error("Feed not found", { userId, feedId, expectedFeedUrl, defaultFeedUrl });
      return new NextResponse("Feed not found", { status: 404 });
    }

    console.log("Found feed:", feed);

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
