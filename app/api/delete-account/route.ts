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
    const userEmail = user.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

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
        // Delete the Stripe customer
        await stripe.customers.del(userData.stripe_customer_id);
        console.log(`Deleted Stripe customer ${userData.stripe_customer_id} for user ${userId}`);
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription or deleting customer:', stripeError);
        // Continue with account deletion even if Stripe deletion fails
      }
    }

    // Delete from database BEFORE deleting auth user
    try {
      await adminClient
        .from('users')
        .delete()
        .eq('id', userId);
    } catch (dbError) {
      console.error('Error deleting user from database:', dbError);
      // Continue anyway to ensure auth user gets deleted
    }
    
    // Delete all related data
    try {
      // Delete user category subscriptions
      await adminClient
        .from('user_category_subscriptions')
        .delete()
        .eq('user_id', userId);
      
      // Add any other tables that contain user data here
    } catch (dataError) {
      console.error('Error deleting related user data:', dataError);
    }
    
    // Delete user from Supabase Auth using both ID and email to ensure complete removal
    try {
      // First try by ID
      const { error: deleteByIdError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteByIdError) {
        console.warn('Error deleting auth user by ID:', deleteByIdError);
        
        // Then try by email (as a backup method)
        const { data: usersByEmail, error: getUsersError } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 100
        });
        
        if (!getUsersError && usersByEmail?.users) {
          // Find and delete users with matching email
          const matchingUsers = usersByEmail.users.filter(u => u.email === userEmail);
          for (const foundUser of matchingUsers) {
            await adminClient.auth.admin.deleteUser(foundUser.id);
            console.log(`Deleted auth user with email ${userEmail} and ID ${foundUser.id}`);
          }
        }
      } else {
        console.log(`Successfully deleted auth user ${userId}`);
      }
    } catch (authError) {
      console.error('Error deleting auth user:', authError);
      return NextResponse.json({ error: 'Error deleting user authentication' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
  }
}  