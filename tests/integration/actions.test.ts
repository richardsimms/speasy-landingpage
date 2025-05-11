(globalThis as any)['cookies'] = () => ({ get: vi.fn(() => undefined) });
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { saveContentItem, markContentAsRead } from '@/app/actions';

// Mock the entire auth module
const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'test-user-id'
          }
        }
      }
    })
  },
  from: vi.fn()
};

// Create a complete Supabase client mock
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerActionClient: vi.fn(() => mockSupabase)
}));

// Mock the server-only module
vi.mock('@/lib/server-only', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn()
  }))
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => undefined),
  })),
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid')
}));

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveContentItem', () => {
    it('should save a new content item', async () => {
      // Setup mock for a new item
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        insert: vi.fn().mockResolvedValue({
          data: { id: 'new-record-id' },
          error: null
        })
      });

      const result = await saveContentItem('test-content-id');
      
      expect(result).toEqual({ success: true });
    });

    it('should handle existing content items', async () => {
      // Setup mock for an existing item
      const updateEqMock = vi.fn().mockReturnThis();
      const updateMock = vi.fn().mockReturnValue({
        eq: updateEqMock
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'existing-id', is_favorite: false },
          error: null
        }),
        update: updateMock
      });
      
      const result = await saveContentItem('test-content-id');
      
      expect(result).toEqual({ success: true });
      expect(updateMock).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Setup mock for an error
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      });
      
      const result = await saveContentItem('test-content-id');
      
      expect(result).toEqual({ success: false, error: 'Database error' });
    });
  });

  describe('markContentAsRead', () => {
    it('should mark content as read', async () => {
      // Setup mock for a new item
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        insert: vi.fn().mockResolvedValue({
          data: { id: 'new-record-id' },
          error: null
        })
      });

      const result = await markContentAsRead('test-content-id');
      
      expect(result).toEqual({ success: true });
    });

    it('should handle existing content items', async () => {
      // Setup mock for an existing item
      const updateEqMock = vi.fn().mockReturnThis();
      const updateMock = vi.fn().mockReturnValue({
        eq: updateEqMock
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'existing-id', is_read: false },
          error: null
        }),
        update: updateMock
      });
      
      const result = await markContentAsRead('test-content-id');
      
      expect(result).toEqual({ success: true });
      expect(updateMock).toHaveBeenCalled();
    });
  });
});
