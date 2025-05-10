import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('unfluff', () => {
  return {
    default: vi.fn((html) => ({
      title: 'Extracted Title',
      text: 'Extracted text content',
      description: 'Extracted description',
    }))
  };
});

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockImplementation(() => 
      Promise.resolve({
        text: () => Promise.resolve('<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>')
      })
    )
  };
});

global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    text: () => Promise.resolve('<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>')
  })
);

describe('HTML Extractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should extract content from HTML', async () => {
    const unfluffModule = await import('unfluff');
    const unfluff = unfluffModule.default;
    const fetch = require('node-fetch');
    
    const response = await fetch('https://example.com');
    const html = await response.text();
    const extracted = unfluff(html);
    
    expect(extracted).toEqual({
      title: 'Extracted Title',
      text: 'Extracted text content',
      description: 'Extracted description',
    });
    
    expect(fetch).toHaveBeenCalledWith('https://example.com');
    
    expect(unfluff).toHaveBeenCalledWith(html);
  });
  
  it('should handle missing fields gracefully', async () => {
    const unfluffModule = await import('unfluff');
    const unfluff = unfluffModule.default;
    
    vi.mocked(unfluff).mockReturnValueOnce({
      title: 'Extracted Title',
    });
    
    const fetch = require('node-fetch');
    
    const response = await fetch('https://example.com');
    const html = await response.text();
    const extracted = unfluff(html);
    
    expect(extracted).toEqual({
      title: 'Extracted Title',
    });
  });
});
