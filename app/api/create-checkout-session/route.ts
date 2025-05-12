import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get email from request body if provided
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    // Get the site URL or use a fallback based on the request
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (request.headers.get('origin') || request.headers.get('referer') || 'https://speasy.co');

    // Set up checkout session parameters
    const checkoutParams: any = {
      payment_method_types: ['card'],
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success${email ? `?email=${email}` : ''}`,
      cancel_url: `${siteUrl}`,
    };

    // Add customer email if provided
    if (email) {
      checkoutParams.customer_email = email;
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 