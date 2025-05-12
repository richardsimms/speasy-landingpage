import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
// Import but don't initialize client at module scope
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // IMPORTANT: Only initialize the client inside the function
    // This ensures it's not evaluated during build time
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Parse Authorization header
    const authHeader = request.headers.get('Authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Use the token to get the user
    let userId;
    
    if (token) {
      // Try to use the token if available
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        userId = data.user.id;
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
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
    await stripe.subscriptions.del(subscriptionId);
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