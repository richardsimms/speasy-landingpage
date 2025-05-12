import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    // Get email from request body if provided
    const body = await request.json().catch(() => ({}));
    const { email } = body;

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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success${email ? `?email=${email}` : ''}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
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