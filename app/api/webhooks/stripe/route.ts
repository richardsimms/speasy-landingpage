import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/server-only';
import { headers } from 'next/headers';

// Stripe webhook handler
export async function POST(request: Request) {
  const body = await request.text();
  const signatureHeader = request.headers.get('stripe-signature');
  const supabase = createAdminClient();
  
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
      await handleCheckoutSessionCompleted(session, supabase);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdated(subscription, supabase);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Handle completed checkout sessions
async function handleCheckoutSessionCompleted(session: any, supabase: any) {
  try {
    const { customer_email } = session;
    
    if (customer_email) {
      // First ensure user exists in Supabase Auth
      await ensureUserInAuth(customer_email, supabase);
      
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
      }
    }
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

// Ensure user exists in Supabase Auth
async function ensureUserInAuth(email: string, supabase: any) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists in auth system
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000, 
    });
    
    if (authError) {
      console.error('Error checking user auth:', authError);
      return;
    }
    
    // Check if user with this email exists
    const userExists = authUsers?.users.some((user: { email?: string }) => 
      user.email?.toLowerCase() === normalizedEmail
    );
    
    if (!userExists) {
      // Create user in Supabase Auth
      const { error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true, // Auto-confirm the email since it was verified by Stripe
        user_metadata: {
          is_subscriber: true,
        }
      });
      
      if (createError) {
        console.error('Error creating user in auth:', createError);
      } else {
        console.log(`Created new subscriber account for ${normalizedEmail} via webhook`);
      }
    }
  } catch (error) {
    console.error('Error ensuring user in auth:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  try {
    const customerId = subscription.customer;
    const status = subscription.status;

    // Get customer details to get email
    const customer = await stripe.customers.retrieve(customerId);
    
    if ('email' in customer) {
      const customerEmail = customer.email;
      
      // Ensure user exists in auth
      await ensureUserInAuth(customerEmail, supabase);
      
      // Update subscription status in Supabase
      const { error } = await supabase
        .from('users')
        .update({ subscription_status: status })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Error updating subscription status:', error);
      }
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}  