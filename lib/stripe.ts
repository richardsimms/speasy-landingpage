import { Stripe, loadStripe } from '@stripe/stripe-js';

// Loading Stripe on the client side
let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// For server-side operations
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
export { stripe }; 