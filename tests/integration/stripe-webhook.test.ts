import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';
import { NextResponse } from 'next/server';

vi.mock('stripe', () => {
  return function() {
    return {
      webhooks: {
        constructEvent: vi.fn().mockImplementation((body, signature, secret) => ({
          type: 'checkout.session.completed',
          data: {
            object: {
              customer_email: 'test@example.com',
              customer: 'cus_test123'
            }
          }
        }))
      },
      customers: {
        retrieve: vi.fn().mockResolvedValue({
          email: 'test@example.com'
        })
      }
    };
  };
});

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn().mockImplementation((body, signature, secret) => ({
        type: 'checkout.session.completed',
        data: {
          object: {
            customer_email: 'test@example.com',
            customer: 'cus_test123'
          }
        }
      }))
    },
    customers: {
      retrieve: vi.fn().mockResolvedValue({
        email: 'test@example.com'
      })
    }
  }
}));

vi.mock('@/lib/server-only', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({
        data: { id: 'test-user-id' },
        error: null
      }),
      update: vi.fn().mockResolvedValue({
        data: { id: 'test-user-id' },
        error: null
      })
    }),
    auth: {
      admin: {
        inviteUserByEmail: vi.fn().mockResolvedValue({
          data: {},
          error: null
        })
      }
    }
  })
}));

vi.mock('next/headers', () => ({
  headers: vi.fn()
}));

describe('Stripe Webhook Handler', () => {
  let mockRequest: Request;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRequest = new Request('https://speasy.app/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            customer_email: 'test@example.com',
            customer: 'cus_test123'
          }
        }
      })
    });
    
    process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
  });
  
  it('should handle checkout.session.completed event', async () => {
    const response = await POST(mockRequest);
    
    expect(response).toBeInstanceOf(NextResponse);
    expect(await response.json()).toEqual({ received: true });
    
    expect(vi.mocked(require('stripe')().webhooks.constructEvent)).toHaveBeenCalled();
    
    const adminClient = require('@/lib/server-only').createAdminClient();
    expect(adminClient.from).toHaveBeenCalledWith('users');
    expect(adminClient.from().upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        stripe_customer_id: 'cus_test123',
        subscription_status: 'active'
      }),
      expect.anything()
    );
    
    expect(adminClient.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.anything()
    );
  });
  
  it('should handle missing signature header', async () => {
    const requestWithoutSignature = new Request('https://speasy.app/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    const response = await POST(requestWithoutSignature);
    
    expect(response).toBeInstanceOf(NextResponse);
    expect(await response.json()).toEqual({ 
      error: 'No stripe-signature header found' 
    });
    expect(response.status).toBe(400);
  });
});
