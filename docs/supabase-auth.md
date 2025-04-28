# Supabase Authentication Guide

This document provides detailed instructions for setting up and configuring Supabase authentication for Speasy.

## Overview

Speasy uses Supabase for user authentication and database storage. The application implements a passwordless authentication flow using magic links. After a user completes payment with Stripe, they receive a magic link to access their account.

## Prerequisites

Before you begin, make sure you have:

1. A Supabase account and project
2. Access to your hosting environment's environment variables
3. Your Stripe integration set up (see the [Stripe Integration Guide](./stripe-integration.md))

## Setup Instructions

### 1. Supabase Project Setup

1. **Create a Supabase Project**:
   - Sign up at [supabase.com](https://supabase.com) if you haven't already.
   - Create a new project.
   - Note your project's URL and API keys.

2. **Configure Authentication Settings**:
   - Go to **Authentication > Settings** in your Supabase dashboard.
   - Under **Email Auth**, enable "Email Confirmation" for passwordless sign-ins.
   - Set up your site URL and redirect URLs:
     - Site URL: `https://your-domain.com`
     - Redirect URLs: 
       - `https://your-domain.com/dashboard`
       - `http://localhost:3000/dashboard` (for local development)

3. **Set Up Email Provider** (Optional):
   - By default, Supabase uses a built-in email service, but for production, you should set up a custom email provider.
   - Go to **Authentication > Email Templates**.
   - Customize the "Magic Link" email template.

### 2. Environment Variables Configuration

Add the following variables to your `.env.local` file (if not already present):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Schema Setup

1. Run the migration script to create the necessary tables:

```sql
-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  stripe_customer_id TEXT,
  subscription_status TEXT,
  subscription_end_date TIMESTAMP WITH TIME ZONE
);

-- Create or modify auth user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (email) 
  DO UPDATE SET
    id = EXCLUDED.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

This script:
- Creates a `users` table to store additional user data
- Creates a trigger to automatically add new authenticated users to your custom users table

### 4. Authentication Implementation

The success page already implements the magic link flow:

```typescript
// app/success/page.tsx
async function sendLoginLink() {
  if (!email) {
    setStatus('error')
    setMessage('No email provided. Please contact support.')
    return
  }

  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      throw error
    }

    setStatus('success')
    setMessage('Check your email for a login link.')
  } catch (error) {
    console.error('Error sending magic link:', error)
    setStatus('error')
    setMessage('Error sending login link. Please try again or contact support.')
  }
}
```

### 5. Protected Routes Setup

1. Create a middleware file to protect routes (if not already present):

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

### 6. Creating a Login Page

If you need a dedicated login page:

```tsx
// app/auth/login/page.tsx
"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        throw error
      }

      setMessage('Check your email for a login link.')
    } catch (error) {
      console.error('Error sending magic link:', error)
      setMessage('Error sending login link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email to receive a magic link
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="your@email.com"
            />
          </div>

          {message && (
            <div className="rounded-md bg-primary/10 p-4 text-primary">
              <p>{message}</p>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 7. User Profile Component

Create a user profile component for the dashboard:

```tsx
// components/user-profile.tsx
"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function UserProfile() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      setIsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Get additional user data from database
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
            
          setUser({ ...user, ...data })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Not logged in</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Profile</h2>
      <div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Subscription Status:</strong> {user.subscription_status || 'Not subscribed'}</p>
      </div>
      <Button onClick={handleSignOut} variant="outline">
        Sign Out
      </Button>
    </div>
  )
}
```

## Auth Flow Diagram

```
User completes Stripe payment
    ↓
Redirects to success page
    ↓
Success page sends magic link
    ↓
User receives email
    ↓
User clicks magic link
    ↓
Redirects to dashboard
    ↓
User is authenticated
```

## Troubleshooting

### Magic Link Issues

- Check the Supabase logs for authentication errors.
- Verify email delivery by checking spam folders.
- Ensure redirect URLs are correctly configured in Supabase.

### Authentication State Issues

- Clear browser local storage if you encounter persistent auth state issues.
- Check that the middleware is correctly configured.
- Ensure the Supabase client is initialized correctly.

### Database Issues

- Verify the trigger is correctly set up to create user records.
- Check for errors in the database logs.
- Ensure the database schema matches the expected structure.

## Security Considerations

1. Regularly rotate your Supabase API keys.
2. Use Row Level Security (RLS) policies to protect your data.
3. Implement proper error handling to avoid leaking sensitive information.
4. Consider adding additional authentication factors for sensitive actions.

## Further Resources

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Magic Link Authentication Guide](https://supabase.com/docs/guides/auth/passwordless-login/auth-magic-link)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Authentication Documentation](https://nextjs.org/docs/authentication) 