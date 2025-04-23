# Podcast Feed Configuration

This document provides a comprehensive guide to the podcast feed system in Speasy, covering the architecture, implementation, and usage.

## Overview

Speasy generates podcast-compliant RSS feeds that allow users to listen to their content in standard podcast players like Apple Podcasts, Spotify, Overcast, and others. Each user gets a personalized feed URL containing their saved articles and audio content.

## Architecture

The podcast feed system consists of several key components:

1. **Feed Generator**: A utility that transforms content items into RSS-formatted XML with podcast-specific tags
2. **API Endpoint**: A dynamic route that fetches user content and generates the feed
3. **Settings UI**: A user interface for customizing feed settings and regenerating feed URLs
4. **Feed Image Generator**: An API endpoint that creates a dynamic podcast cover image

## Feed URL Structure

Feed URLs follow this pattern:
```
https://{domain}/api/feeds/{userId}/{feedId}
```

- `{domain}`: The application domain (dynamically detected from the user's environment)
- `{userId}`: The unique ID of the user
- `{feedId}`: A feed identifier (typically timestamp-based) for versioning

## Feed Generator

The feed generator (`lib/feed-generator.ts`) is responsible for creating RSS XML with podcast-specific elements. It supports:

- iTunes podcast namespace tags
- Content namespace for rich HTML descriptions
- Atom links for feed discovery
- Proper XML encoding and CDATA handling

### Configuration Options

The generator includes a centralized configuration object:

```typescript
export const CONFIG = {
  // Base URL detection based on environment
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_URL || 'https://speasy.app';
  },

  // URL generators for different content types
  urls: {
    audio: (path?: string) => { /* ... */ },
    article: (id: string) => `${CONFIG.getBaseUrl()}/content/${id}`,
    feed: (userId: string, feedId: string) => 
      `${CONFIG.getBaseUrl()}/api/feeds/${userId}/${feedId}`,
    cover: (userId: string) => 
      `${CONFIG.getBaseUrl()}/api/feed-image/${userId}`,
  },
};
```

### Content Format

The generator expects content items in this format:

```typescript
export interface ContentItem {
  id: string;
  title: string;
  summary?: string;
  url?: string;
  published_at?: string;
  audio?: {
    file_url: string;
    duration: number;
    type: string;
  }[];
  source?: {
    name: string;
  };
  content_markdown?: string;
}
```

### Feed Customization

Feed metadata can be customized with:

```typescript
export interface FeedInfo {
  title: string;        // Podcast title
  description: string;  // Podcast description
  userId: string;       // For user-specific content
  feedId: string;       // For feed versioning
}
```

## API Endpoint

The API endpoint (`app/api/feeds/[userId]/[feedId]/route.ts`) handles feed requests by:

1. Verifying the feed exists for the requested user
2. Fetching user's content items from the database
3. Transforming the content into the expected format
4. Generating and returning the RSS feed

### Database Queries

The endpoint queries multiple related tables:

```typescript
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
```

## User Settings

Users can customize their podcast feed through the settings interface (`app/(app)/settings/podcast/page.tsx`), which provides options to:

1. View and copy their feed URL
2. Regenerate the feed URL (for privacy/security)
3. Customize the feed title and description
4. Save feed settings

### Regenerating Feed URLs

Feed URLs can be regenerated using:

```typescript
const feedId = Date.now().toString()
const newFeedUrl = `${window.location.origin}/api/feeds/${session.user.id}/${feedId}`

// Update in database
await supabase
  .from("podcast_feeds")
  .update({
    feed_url: newFeedUrl,
    updated_at: new Date().toISOString(),
  })
  .eq("user_id", session.user.id)
  .eq("is_default", true)
```

## Feed Image Generator

The feed image API (`app/api/feed-image/[userId]/route.tsx`) generates dynamic podcast cover images using Next.js Image Response API.

## Database Schema

The podcast feed system relies on these database tables:

1. `podcast_feeds`: Stores feed URLs and metadata
   - `id`: UUID (primary key)
   - `user_id`: Reference to user profile
   - `title`: Feed title
   - `description`: Feed description
   - `feed_url`: The unique feed URL
   - `is_default`: Boolean flag for default feed
   - `created_at`: Timestamp

2. Related content tables:
   - `content_items`: Stores article content
   - `audio_files`: Stores audio file metadata
   - `user_content_items`: Maps content to users

## Using The Podcast Feed

To use the feed in a podcast app:

1. Go to the Podcast Settings page
2. Copy the private feed URL
3. Open a podcast app
4. Add a new podcast by URL/RSS feed
5. Paste the URL
6. Save

For optimal compatibility:
- Apple Podcasts requires proper iTunes tags
- All apps require proper enclosure elements for audio files
- Duration should be formatted as HH:MM:SS

## Troubleshooting

Common issues and solutions:

1. **Feed not appearing in app**:
   - Ensure the feed URL is accessible from the internet
   - Check that content items have valid audio files
   - Verify the feed is valid XML (use a feed validator)

2. **Audio not playing**:
   - Confirm audio files are accessible and properly encoded
   - Check that file URLs are absolute and publicly accessible
   - Verify MIME types are correct (typically audio/mpeg)

3. **Missing artwork**:
   - Verify the feed image API endpoint is accessible
   - Check for proper image dimensions (minimum 1400x1400px recommended)

## Implementation Notes

The feed generator uses:
- `showdown` for Markdown to HTML conversion
- CDATA sections to protect HTML content in XML
- XML escaping for special characters
- iTunes-specific podcast tags for compatibility

## Security Considerations

1. Feed URLs contain user IDs and should be treated as private
2. Row-level security in Supabase ensures users can only access their own content
3. Feed regeneration provides a way to revoke access if a URL is compromised 