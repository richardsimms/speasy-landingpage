# Speasy Setup Guide

Welcome to the Speasy setup guide! This document provides an overview of how to set up and configure your Speasy application.

## Overview

Speasy is a service that transforms popular newsletters into podcast-style summaries. The application consists of:

1. A landing page with subscription capability
2. Stripe integration for payments
3. Supabase integration for authentication and data storage
4. Audio player functionality for podcast playback

## Getting Started

To get started with Speasy, follow these steps:

1. Clone the repository
2. Set up your environment variables
3. Install dependencies
4. Run the development server

```bash
# Clone the repository (example)
git clone https://github.com/yourusername/speasy-landingpage.git
cd speasy-landingpage

# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env.local and edit)
cp .env.example .env.local

# Run the development server
npm run dev
```

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=speasy.app,gmail.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_price_id
```

## Configuration Guides

For detailed setup and configuration, refer to these guides:

1. [Stripe Integration Guide](./stripe-integration.md) - Setting up Stripe for subscription payments
2. [Supabase Authentication Guide](./supabase-auth.md) - Setting up Supabase for user authentication
3. [Podcast Feed Guide](./podcast-feed.md) - Setting up the podcast feed functionality
4. [Edge Functions Guide](./edge-functions.md) - Setting up Supabase Edge Functions

## Local Development

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Migrations

Run the migration scripts to set up your database:

```bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

Alternatively, you can run the SQL scripts directly in the Supabase SQL editor:

1. Navigate to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of the migration files:
   - `supabase/migrations/20250428_users_stripe.sql`
   - Other migration files

## Production Deployment

To deploy your application to production:

1. Configure your environment variables in your hosting provider
2. Build and deploy the application

```bash
# Build the application
npm run build

# Deploy to your hosting provider
# The specific command will depend on your hosting provider
```

## Post-Deployment Setup

After deploying your application:

1. Set up Stripe webhooks to point to your production URL
2. Configure Supabase authentication redirect URLs
3. Test the payment and authentication flow

## Troubleshooting

If you encounter issues, check the following:

1. Ensure all environment variables are correctly set
2. Check Stripe and Supabase dashboard logs
3. Verify webhook endpoints are correctly configured
4. Check browser console for client-side errors

For more detailed troubleshooting, refer to the specific guide for the component you're having issues with.

## Support

If you need additional help, please contact the Speasy team or file an issue in the repository.  