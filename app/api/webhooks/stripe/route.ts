import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { logError } from '@/lib/error-logger';

// Initialize Supabase client directly
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Stripe webhook handler
export async function POST(request: Request) {
  const body = await request.text();
  const signatureHeader = request.headers.get('stripe-signature');
  
  if (!signatureHeader) {
    return NextResponse.json(
      { error: 'No stripe-signature header found' },
      { status: 400 }
    );
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signatureHeader,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    logError(
      'stripe-webhook',
      `Webhook signature verification failed: ${error.message}`,
      error,
      'error'
    );
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdated(subscription);
      break;
    default:
      logError('stripe-webhook', `Unhandled event type: ${event.type}`, { eventType: event.type }, 'info');
  }

  return NextResponse.json({ received: true });
}

// Handle completed checkout sessions
async function handleCheckoutSessionCompleted(session: any) {
  try {
    const { customer_email } = session;
    
    if (customer_email) {
      // Save user to Supabase or update existing user
      const { data, error } = await supabase
        .from('users')
        .upsert(
          { 
            email: customer_email,
            stripe_customer_id: session.customer,
            subscription_status: 'active'
          },
          { onConflict: 'email' }
        );

      if (error) {
        logError(
          'stripe-webhook',
          'Error saving user to Supabase',
          error,
          'error'
        );
        return;
      }

      // Send invite email to the user using admin client
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(customer_email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}dashboard`
      });

      if (inviteError) {
        logError(
          'stripe-webhook',
          'Error sending invite email',
          inviteError,
          'error'
        );
      }
    }
  } catch (error) {
    logError(
      'stripe-webhook',
      'Error handling checkout session',
      error,
      'error'
    );
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer;
    const status = subscription.status;

    // Get customer details to get email
    const customer = await stripe.customers.retrieve(customerId);
    
    if ('email' in customer) {
      // Update subscription status in Supabase
      const { error } = await supabase
        .from('users')
        .update({ subscription_status: status })
        .eq('stripe_customer_id', customerId);

      if (error) {
        logError(
          'stripe-webhook',
          'Error updating subscription status',
          error,
          'error'
        );
      }
    }
  } catch (error) {
    logError(
      'stripe-webhook',
      'Error handling subscription update',
      error,
      'error'
    );
  }
}                  