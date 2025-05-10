import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateRssFeedAsync, ContentItem, FeedInfo } from '@/lib/feed-generator';

global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    headers: {
      get: vi.fn().mockReturnValue('1000')
    }
  })
);

describe('Feed Generator', () => {
  let mockContentItems: ContentItem[];
  let mockFeedInfo: FeedInfo;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockContentItems = [
      {
        id: 'test-id-1',
        title: 'Test Article 1',
        summary: 'This is a test summary',
        url: 'https://example.com/article1',
        published_at: '2023-01-01T12:00:00Z',
        audio: [
          {
            file_url: 'https://example.com/audio1.mp3',
            duration: 300, // 5 minutes
            type: 'audio/mpeg'
          }
        ],
        source: {
          name: 'Test Source'
        },
        content_markdown: '# Test Content\n\nThis is test content.'
      }
    ];

    mockFeedInfo = {
      title: 'Test Feed',
      description: 'This is a test feed',
      userId: 'test-user-id',
      feedId: 'test-feed-id'
    };
  });

  it('should generate a valid RSS feed', async () => {
    const result = await generateRssFeedAsync(mockContentItems, mockFeedInfo);
    
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<rss version="2.0"');
    
    expect(result).toContain(`<title>${mockFeedInfo.title}</title>`);
    expect(result).toContain(`<description><![CDATA[${mockFeedInfo.description}]]></description>`);
    
    expect(result).toContain(`<title><![CDATA[${mockContentItems[0].title}]]></title>`);
    expect(result).toContain(`<itunes:author><![CDATA[${mockContentItems[0].source?.name}]]></itunes:author>`);
    
    expect(result).toContain(`<enclosure`);
    expect(result).toContain(`url="${mockContentItems[0].audio?.[0].file_url}"`);
    
    expect(result).toContain(`<itunes:duration>00:05:00</itunes:duration>`);
  });

  it('should handle content items without audio', async () => {
    const contentWithoutAudio = [{
      ...mockContentItems[0],
      audio: undefined
    }];
    
    const result = await generateRssFeedAsync(contentWithoutAudio, mockFeedInfo);
    
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<rss version="2.0"');
    expect(result).not.toContain('<item>');
  });

  it('should handle malformed content gracefully', async () => {
    const malformedContent = [{
      ...mockContentItems[0],
      title: 'Test with <script>alert("XSS")</script>',
      summary: 'Summary with <b>HTML</b>'
    }];
    
    const result = await generateRssFeedAsync(malformedContent, mockFeedInfo);
    
    expect(result).toContain('<![CDATA[Test with <script>alert("XSS")</script>]]>');
    expect(result).toContain('<![CDATA[Summary with <b>HTML</b>]]>');
  });
});
