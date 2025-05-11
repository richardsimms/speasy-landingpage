// Mock the Stripe module with a factory function
// IMPORTANT: Don't reference external variables in vi.mock factories!
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

// Create a mock admin client for consistent testing
const mockAdminClient = {
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
};

// Mock the lib/stripe module with same mock pattern
vi.mock('@/lib/stripe', () => {
  return {
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
  };
});

// Mock the server-only module
vi.mock('@/lib/server-only', () => {
  return {
    createAdminClient: vi.fn().mockReturnValue(mockAdminClient)
  };
});

vi.mock('next/headers', () => ({
  headers: vi.fn()
}));

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';
import { NextResponse } from 'next/server';
// Import the mocked modules
import { stripe as mockStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/server-only';

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
    // Create a fresh spy for this specific test
    const constructEventSpy = vi.spyOn(mockStripe.webhooks, 'constructEvent');
    
    const response = await POST(mockRequest);
    
    expect(response).toBeInstanceOf(NextResponse);
    expect(await response.json()).toEqual({ received: true });
    
    // Verify our spy was called
    expect(constructEventSpy).toHaveBeenCalled();
    
    // Just verify the function was called - don't try to call it ourselves
    expect(createAdminClient).toHaveBeenCalled();
    
    // And directly check our mockAdminClient was accessed correctly
    expect(mockAdminClient.from).toHaveBeenCalledWith('users');
    expect(mockAdminClient.from().upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        stripe_customer_id: 'cus_test123',
        subscription_status: 'active'
      }),
      expect.anything()
    );
    
    expect(mockAdminClient.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
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
