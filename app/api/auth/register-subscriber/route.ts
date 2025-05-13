import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server-only';

export async function POST(request: Request) {
  try {
    // Get email from request
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createAdminClient();
    
    // Check if user exists in auth system using admin privileges
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000, 
    });
    
    if (authError) {
      console.error('Error checking user auth:', authError);
      return NextResponse.json({ error: 'Authentication system error' }, { status: 500 });
    }
    
    // Check if user with this email exists
    const userExists = authUsers?.users.some(user => 
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
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      
      console.log(`Created new subscriber account for ${normalizedEmail}`);
    }
    
    // Generate and send a magic link
    const { error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/callback`,
      }
    });
    
    if (error) {
      console.error('Error sending magic link:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Register subscriber error:', error);
    return NextResponse.json(
      { error: 'An error occurred during subscriber registration' },
      { status: 500 }
    );
  }
} 