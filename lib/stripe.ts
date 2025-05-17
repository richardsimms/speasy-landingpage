import { loadStripe } from '@stripe/stripe-js';
import type { Stripe as StripeClient } from '@stripe/stripe-js';
import { Stripe } from 'stripe';

// Loading Stripe on the client side
let stripePromise: Promise<StripeClient | null>;
export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Missing environment variable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Lazy initialization for server-side Stripe
let stripeInstance: Stripe | null = null;

export function getServerStripe(): Stripe {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('Missing environment variable: STRIPE_SECRET_KEY');
    }
    
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',  // Latest API version
    });
  }
  
  return stripeInstance;
}

// For backward compatibility - proxy that lazily initializes Stripe
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    // This will lazily initialize Stripe only when a property is accessed
    const stripe = getServerStripe();
    return (stripe as any)[prop];
  }
}); 