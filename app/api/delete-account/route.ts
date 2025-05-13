import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server-only';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    // Use both auth clients for different purposes
    const authClient = createRouteHandlerClient({ cookies });
    const adminClient = createAdminClient();
    
    // Fetch authenticated user
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = user.id;

    // Get user's Stripe customer info
    const { data: userData, error: userDataError } = await adminClient
      .from('users')
      .select('stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();

    if (userData?.stripe_customer_id) {
      try {
        // Find the active subscription for this customer
        const subscriptions = await stripe.subscriptions.list({ 
          customer: userData.stripe_customer_id, 
          status: 'active', 
          limit: 1 
        });
        
        // Cancel the subscription if found
        if (subscriptions.data.length > 0) {
          const subscriptionId = subscriptions.data[0].id;
          await stripe.subscriptions.del(subscriptionId);
          console.log(`Canceled subscription ${subscriptionId} for user ${userId}`);
        }
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError);
        // Continue with account deletion even if subscription cancellation fails
      }
    }

    // IMPORTANT: Delete from database BEFORE deleting auth user
    try {
      await adminClient
        .from('users')
        .delete()
        .eq('id', userId);
    } catch (dbError) {
      console.error('Error deleting user from database:', dbError);
      // Continue anyway to ensure auth user gets deleted
    }
    
    // Delete user from Supabase Auth (LAST step)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return NextResponse.json({ error: 'Error deleting user from auth' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
  }
}  