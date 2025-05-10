import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { saveContentItem, markContentAsRead } from '@/app/actions';

vi.mock('@/lib/server-only', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      insert: vi.fn().mockResolvedValue({
        data: { id: 'new-record-id' },
        error: null
      }),
      update: vi.fn().mockResolvedValue({
        data: { id: 'updated-record-id' },
        error: null
      })
    })
  })
}));

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerActionClient: vi.fn(() => ({
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
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      insert: vi.fn().mockResolvedValue({
        data: { id: 'new-record-id' },
        error: null
      }),
      update: vi.fn().mockResolvedValue({
        data: { id: 'updated-record-id' },
        error: null
      })
    })
  }))
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn()
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
      const result = await saveContentItem('test-content-id');
      
      expect(result).toEqual({ success: true });
    });

    it('should handle existing content items', async () => {
      const mockSupabase = require('@supabase/auth-helpers-nextjs').createServerActionClient();
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { id: 'existing-id', is_favorite: false },
        error: null
      });
      
      const result = await saveContentItem('test-content-id');
      
      expect(result).toEqual({ success: true });
      expect(mockSupabase.from().update).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockSupabase = require('@supabase/auth-helpers-nextjs').createServerActionClient();
      mockSupabase.from().insert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });
      
      const result = await saveContentItem('test-content-id');
      
      expect(result).toEqual({ success: false, error: 'Database error' });
    });
  });

  describe('markContentAsRead', () => {
    it('should mark content as read', async () => {
      const result = await markContentAsRead('test-content-id');
      
      expect(result).toEqual({ success: true });
    });

    it('should handle existing content items', async () => {
      const mockSupabase = require('@supabase/auth-helpers-nextjs').createServerActionClient();
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { id: 'existing-id', is_read: false },
        error: null
      });
      
      const result = await markContentAsRead('test-content-id');
      
      expect(result).toEqual({ success: true });
      expect(mockSupabase.from().update).toHaveBeenCalled();
    });
  });
});
