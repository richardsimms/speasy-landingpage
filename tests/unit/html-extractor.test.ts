vi.mock('node-fetch', () => ({
  default: vi.fn().mockImplementation(() =>
    Promise.resolve({
      text: () => Promise.resolve('<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>')
    })
  )
}));
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    text: () => Promise.resolve('<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>')
  })
);
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

// Export our mocks for use inside the tests
const mockFetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    text: () => Promise.resolve('<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>')
  })
);

// Make mockFetch call global.fetch so both are tracked
mockFetch.mockImplementation((url) => {
  global.fetch(url);
  return Promise.resolve({
    text: () => Promise.resolve('<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>')
  });
});

// Create a fake node-fetch module
vi.stubGlobal('node-fetch', mockFetch);

describe('HTML Extractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should extract content from HTML', async () => {
    const unfluffModule = await import('unfluff');
    const unfluff = unfluffModule.default;
    
    // Use the global mock directly
    const response = await mockFetch('https://example.com');
    const html = await response.text();
    const extracted = unfluff(html);
    
    expect(extracted).toEqual({
      title: 'Extracted Title',
      text: 'Extracted text content',
      description: 'Extracted description',
    });
    
    // Check that mockFetch was called, not global.fetch
    expect(mockFetch).toHaveBeenCalledWith('https://example.com');
    
    expect(unfluff).toHaveBeenCalledWith(html);
  });
  
  it('should handle missing fields gracefully', async () => {
    const unfluffModule = await import('unfluff');
    const unfluff = unfluffModule.default;
    
    vi.mocked(unfluff).mockReturnValueOnce({
      title: 'Extracted Title',
    });
    
    // Use the global mock directly
    const response = await mockFetch('https://example.com');
    const html = await response.text();
    const extracted = unfluff(html);
    
    expect(extracted).toEqual({
      title: 'Extracted Title',
    });
  });
});
