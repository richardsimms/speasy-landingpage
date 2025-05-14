import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server-only';

export async function POST(request: Request) {
  try {
    // Get email from request
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      console.log('Invalid email input:', email);
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
      console.log(`Login attempt on success page with non-existent email: ${normalizedEmail}`);
      return NextResponse.json({ 
        error: 'This email is not registered in our system. Please contact support if you believe this is an error.',
        userExists: false
      }, { status: 403 });
    }
    
    // User exists, send magic link
    console.log(`Attempting to send magic link to: ${normalizedEmail}`);
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
    
    console.log(`Magic link sent to: ${normalizedEmail}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Register subscriber error:', error);
    return NextResponse.json(
      { error: 'An error occurred during subscriber registration' },
      { status: 500 }
    );
  }
} 