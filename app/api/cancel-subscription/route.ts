import { NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/server-only';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Ensure we have the required environment variables for Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Ensure we have the required environment variable for Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing required Stripe environment variable');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createAdminClient();
    const stripe = getServerStripe();
    const cookieStore = await cookies();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = user.id;
    // Get user's Stripe customer and subscription info
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();
    
    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!userData.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 });
    }
    
    // Find the active subscription for this customer
    const subscriptions = await stripe.subscriptions.list({ customer: userData.stripe_customer_id, status: 'active', limit: 1 });
    
    if (!subscriptions.data.length) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }
    
    const subscriptionId = subscriptions.data[0].id;
    
    // Cancel the subscription
    await stripe.subscriptions.cancel(subscriptionId);
    
    // Update user's subscription status in DB
    await supabase
      .from('users')
      .update({ subscription_status: 'canceled' })
      .eq('id', userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: 'Error canceling subscription' }, { status: 500 });
  }
}  