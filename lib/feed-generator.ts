import showdown from 'showdown';

// Configure Showdown converter with podcast-friendly options
const converter = new showdown.Converter({
  simpleLineBreaks: true,
  strikethrough: true,
  tables: true,
  tasklists: true,
  metadata: true,
  openLinksInNewWindow: true,
  emoji: true,
  parseImgDimensions: true,
  smoothLivePreview: true
});

// Add markdown styling options
converter.setOption('simpleLineBreaks', true);
converter.setOption('parseMetadata', true);

// URL configuration object to centralize all URL handling
export const CONFIG = {
  // Base URL for the application
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_URL || 'https://speasy.app';
  },

  // Specific URL generators
  urls: {
    audio: (path?: string) => {
      if (!path) return `${CONFIG.getBaseUrl()}/public/audio`;
      // Remove any leading/trailing slashes and normalize path
      const normalizedPath = path
        .replace(/^[\\/]+/, '') // Remove leading slashes
        .replace(/[\\/]+$/, '') // Remove trailing slashes
        .replace(/[\\/]+/g, '/'); // Replace multiple slashes with single slash
      if (normalizedPath.startsWith('public/audio/') || normalizedPath.startsWith('/public/audio/')) {
        return `${CONFIG.getBaseUrl()}/${normalizedPath.replace(/^\//, '')}`;
      }
      if (normalizedPath.startsWith('audio/')) {
        return `${CONFIG.getBaseUrl()}/public/${normalizedPath}`;
      }
      return `${CONFIG.getBaseUrl()}/public/audio/${normalizedPath}`;
    },
    article: (id: string) => `${CONFIG.getBaseUrl()}/content/${id}`,
    feed: (userId: string, feedId: string) => `${CONFIG.getBaseUrl()}/api/feeds/${userId}/${feedId}`,
    cover: (userId: string) => `${CONFIG.getBaseUrl()}/api/feed-image/${userId}`,
  },
};

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

export interface FeedInfo {
  title: string;
  description: string;
  userId: string;
  feedId: string;
}

// Helper to get file size in bytes for enclosure
async function getAudioFileSize(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const len = res.headers.get('content-length');
    return len ? parseInt(len, 10) : 0;
  } catch {
    return 0;
  }
}

// Async version for Apple Podcasts compliance
export async function generateRssFeedAsync(contentItems: ContentItem[], feedInfo: FeedInfo): Promise<string> {
  const now = new Date().toUTCString();

  const podcastItems = await Promise.all(
    contentItems
      .filter((item) => item.audio && item.audio.length > 0)
      .map(async (item) => {
        const pubDate = item.published_at
          ? new Date(item.published_at).toUTCString()
          : now;

        // Format duration as HH:MM:SS
        const audioFile = item.audio?.[0];
        const duration = audioFile?.duration || 0;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        // Handle audio URL construction
        const fullAudioUrl = audioFile?.file_url || '';
        let fileSize = 0;
        if (fullAudioUrl && fullAudioUrl.startsWith('http')) {
          fileSize = await getAudioFileSize(fullAudioUrl);
        }

        // Create a rich HTML description with the full article content
        // Convert markdown content to HTML
        const content = item.content_markdown || item.summary || '';
        const convertedHtml = converter.makeHtml(content);
        const htmlDescription = `
          <div class="podcast-content">
            <h1>${item.title}</h1>
            ${convertedHtml}
            ${
              item.url
                ? `<p><a href="${item.url}" target="_blank" rel="noopener">Read original article</a></p>`
                : ""
            }
          </div>
        `;

        return `
          <item>
            <title><![CDATA[${item.title}]]></title>
            <link>${CONFIG.urls.article(item.id)}</link>
            <guid isPermaLink="false">${item.id}</guid>

            <description><![CDATA[${item.summary || htmlDescription}]]></description>
            <content:encoded><![CDATA[${htmlDescription}]]></content:encoded>

            <pubDate>${pubDate}</pubDate>

            <enclosure 
              url="${escapeXml(fullAudioUrl)}" 
              type="audio/mpeg" 
              length="${fileSize}"
            />

            <itunes:title><![CDATA[${item.title}]]></itunes:title>
            <itunes:duration>${formattedDuration}</itunes:duration>
            <itunes:summary><![CDATA[${item.summary || content.substring(0, 400) + "..."}]]></itunes:summary>
            <itunes:explicit>no</itunes:explicit>
            ${
              item.source?.name
                ? `<itunes:author><![CDATA[${item.source.name}]]></itunes:author>`
                : ""
            }
          </item>
        `;
      })
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedInfo.title)}</title>
    <link>${CONFIG.getBaseUrl()}</link>
    <description><![CDATA[${feedInfo.description}]]></description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>Speasy RSS Generator</generator>

    <itunes:author>Speasy</itunes:author>
    <itunes:summary><![CDATA[${feedInfo.description}]]></itunes:summary>
    <itunes:category text="Technology"/>
    <itunes:explicit>no</itunes:explicit>
    <itunes:owner>
      <itunes:name>Speasy</itunes:name>
      <itunes:email>hello@speasy.app</itunes:email>
    </itunes:owner>

    <image>
      <url>${CONFIG.urls.cover(feedInfo.userId)}</url>
      <title>${escapeXml(feedInfo.title)}</title>
      <link>${CONFIG.getBaseUrl()}</link>
    </image>
    <itunes:image href="${CONFIG.urls.cover(feedInfo.userId)}"/>

    <atom:link href="${CONFIG.urls.feed(feedInfo.userId, feedInfo.feedId)}" rel="self" type="application/rss+xml"/>

    ${podcastItems.join("\n")}
  </channel>
</rss>`;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
} 