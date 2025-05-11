import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ContentItem, FeedInfo } from '../../lib/feed-generator';

const generateFeed = (items: ContentItem[], feedInfo: FeedInfo) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${feedInfo.title}</title>
    <description>${feedInfo.description}</description>
    ${items.map(item => `
      <item>
        <title>${item.title}</title>
        <description>${item.summary || ''}</description>
      </item>
    `).join('')}
  </channel>
</rss>`;
};

describe('Sample Feed Generator', () => {
  let mockItems: ContentItem[];
  let mockFeedInfo: FeedInfo;

  beforeEach(() => {
    mockItems = [
      {
        id: 'test-id-1',
        title: 'Test Article 1',
        summary: 'This is a test summary'
      }
    ];

    mockFeedInfo = {
      title: 'Test Feed',
      description: 'This is a test feed',
      userId: 'test-user',
      feedId: 'test-feed'
    };
  });

  it('should generate a valid RSS feed', () => {
    const result = generateFeed(mockItems, mockFeedInfo);
    
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<rss version="2.0">');
    
    expect(result).toContain(`<title>${mockFeedInfo.title}</title>`);
    expect(result).toContain(`<description>${mockFeedInfo.description}</description>`);
    
    expect(result).toContain(`<title>${mockItems[0].title}</title>`);
    expect(result).toContain(`<description>${mockItems[0].summary}</description>`);
  });

  it('should handle empty items array', () => {
    const result = generateFeed([], mockFeedInfo);
    
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<rss version="2.0">');
    expect(result).not.toContain('<item>');
  });
});
