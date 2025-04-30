import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';

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
    console.error(`Webhook signature verification failed: ${error.message}`);
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
      console.log(`Unhandled event type: ${event.type}`);
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
        console.error('Error saving user to Supabase:', error);
        return;
      }

      // Send invite email to the user using admin client
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(customer_email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}dashboard`
      });

      if (inviteError) {
        console.error('Error sending invite email:', inviteError);
      }
    }
  } catch (error) {
    console.error('Error handling checkout session:', error);
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
        console.error('Error updating subscription status in Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
} 