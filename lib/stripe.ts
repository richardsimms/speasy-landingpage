import { Stripe as StripeClient, loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { isTestEnvironment, isBuildTime } from '@/utils/environment';

// Loading Stripe on the client side
let stripePromise: Promise<StripeClient | null>;
export const getStripe = () => {
  if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// For server-side operations with build-time safety
const createStripeClient = () => {
  // During build time or if no API key is available, return a mock
  if (isBuildTime() || 
      !process.env.STRIPE_SECRET_KEY || 
      isTestEnvironment()) {
    console.log('Using mock Stripe client (build mode, missing API key, or test environment)');
    return {
      webhooks: {
        constructEvent: () => ({
          type: 'checkout.session.completed',
          data: { object: {} }
        }),
      },
      customers: {
        retrieve: () => Promise.resolve({ email: 'build-time@example.com' }),
        create: () => Promise.resolve({ id: 'cus_mock' }),
        update: () => Promise.resolve({}),
      },
      subscriptions: {
        create: () => Promise.resolve({ id: 'sub_mock' }),
        update: () => Promise.resolve({}),
        cancel: () => Promise.resolve({}),
      },
      checkout: {
        sessions: {
          create: () => Promise.resolve({ id: 'cs_mock', url: '#' }),
        }
      },
      // Add other Stripe methods you use as needed
    } as unknown as Stripe;
  }

  // For runtime with API key, return the real Stripe instance
  try {
    return new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil', // Use the version that matches the type definition
    });
  } catch (error) {
    console.error('Error initializing Stripe client:', error);
    // Return a safe fallback in case of initialization error
    return {
      webhooks: { constructEvent: () => ({}) },
      customers: { retrieve: () => Promise.resolve({}) },
    } as unknown as Stripe;
  }
};

export const stripe = createStripeClient(); 