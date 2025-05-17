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

// For server-side operations
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Missing environment variable: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-04-30.basil',  // Latest API version
});
export { stripe }; 