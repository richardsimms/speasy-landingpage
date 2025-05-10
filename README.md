# Speasy Landing Page

This is the landing page for Speasy, a service that transforms popular newsletters into podcast-style summaries.

## Features

- Modern, responsive design
- Subscription payments via Stripe
- User authentication via Supabase
- Next.js App Router for routing

## Stripe Integration

The application integrates with Stripe for payment processing:

1. **Subscription Button**: The "Start listening" button on the landing page redirects users to a Stripe checkout page.
2. **Success Page**: After payment, users are redirected to a success page that sends a magic link for account access.
3. **Webhook Handler**: A webhook handler updates the Supabase database when payments are processed.

### Setup Stripe

1. Create a Stripe account and get your API keys
2. Set up a subscription product in Stripe
3. Update the `.env.local` file with your Stripe API keys:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. For local development, use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Supabase Setup

The application uses Supabase for authentication and data storage:

1. Create a Supabase project
2. Run the migration in `supabase/migrations/20250428_users_stripe.sql` to set up the users table
3. Update the `.env.local` file with your Supabase credentials

## Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

## Testing

The project uses Vitest for unit and integration testing. The tests are located in the `tests` directory.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure

- `tests/unit/`: Unit tests for individual functions and components
  - `feed-generator.test.ts`: Tests for RSS feed generation
  - `html-extractor.test.ts`: Tests for HTML content extraction
- `tests/integration/`: Integration tests for API routes and server actions
  - `stripe-webhook.test.ts`: Tests for Stripe webhook handler
  - `actions.test.ts`: Tests for server actions like saveContentItem
- `tests/setup.ts`: Test setup and global mocks

### Environment Setup for Tests

Create a `.env.test` file with test environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key
STRIPE_SECRET_KEY=test_key
STRIPE_WEBHOOK_SECRET=test_webhook_secret
```

### CI Pipeline

The project uses GitHub Actions for continuous integration. The CI pipeline runs:
- Linting
- Type checking
- Tests

The CI configuration is located in `.github/workflows/ci.yml`.

### Vercel Deployment

For Vercel deployments, add the following environment variables in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

You can also update the build command in Vercel project settings to include tests:
```
npm run lint && npm run typecheck && npm run test && next build
```    