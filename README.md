# Speasy Landing Page

This is the landing page and web application for Speasy, a service that helps you listen to articles and manage content overload.

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build Process

To build the app for production:

```bash
pnpm run build
```

### Build-Time Safety

The application uses a build-time safety approach to ensure that:

1. The app builds successfully in CI/CD environments without credentials
2. Pages are still generated properly during static site generation
3. No runtime errors occur due to unavailable services or credentials

#### Build Mode Environment Variable

The `NEXT_PUBLIC_BUILD_MODE` environment variable controls whether the app is in build mode. When set to 'true', the app uses mock data and clients instead of trying to connect to real services.

```
NEXT_PUBLIC_BUILD_MODE=true pnpm run build
```

#### Safe Client Initialization

We use safe client initialization for third-party services:

1. **Supabase**: Both standard and server component clients are wrapped with build-safe mechanisms:
   - `utils/supabase.ts` - Standard client for client components
   - `lib/supabase-server.ts` - Server component client

2. **Stripe**: Uses a similar pattern in `lib/stripe.ts`

#### Mock Data for Build

Each server component that needs data during the build has mock data defined:

```typescript
// Sample mock data for build time
const MOCK_CONTENT_ITEMS = [
  {
    id: "1",
    title: "Getting Started with Speasy",
    // ... other props
  }
];
```

#### Pattern for Adding New Pages

When adding new server components that use third-party services:

1. Use `createServerSafeClient()` from `@/lib/supabase-server` for Supabase
2. Define mock data at the top of the file
3. Add a build-time check and early return:

```typescript
// Build-time safety check
if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
  return <YourComponent mockData={MOCK_DATA} />;
}
```

## Project Structure

- `app/` - Next.js App Router routes and API endpoints
- `components/` - Reusable UI components
- `lib/` - Utility functions and shared code
- `public/` - Static assets
- `styles/` - Global CSS
- `utils/` - Helper functions

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

For local development, create a `.env.local` file with these values.

For production builds without environment variables, use:

```
NEXT_PUBLIC_BUILD_MODE=true
```

## APIs and Server Components

The app uses Next.js App Router with both client and server components:

- Server Components: Data fetching, initial rendering
- Client Components: Interactivity, user input
- API Routes: Backend processing, webhooks

## Deployment

The app is deployed on Vercel. Settings:

- Node.js version: 18.x
- Build command: `pnpm run build` 
- Output directory: `.next`
- Environment variables: Add all required env vars plus `NEXT_PUBLIC_BUILD_MODE=true` as a fallback

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

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

#### CI Pipeline
- Linting
- Type checking
- Tests
- Build verification

#### CD Pipeline
- Automatic deployment to Vercel on merge to main
- Preview deployments for pull requests

The CI/CD configuration is located in `.github/workflows/ci-cd.yml`.

### Vercel Deployment

For Vercel deployments, add the following environment variables in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
VERCEL_TOKEN=your_vercel_token
ERROR_NOTIFICATION_WEBHOOK_URL=your_slack_webhook_url
```

You can also update the build command in Vercel project settings to include tests:
```
npm run lint && npm run typecheck && npm run test && next build
```

## Error Observability

The application includes comprehensive error logging and observability:

### Error Logging

- Enhanced error logging in critical components:
  - Stripe webhook handler
  - RSS feed fetch (Deno edge function)
  - LLM summarization job (Deno edge function)

- Error levels:
  - `info`: Informational messages
  - `warning`: Potential issues that don't affect functionality
  - `error`: Issues that affect functionality
  - `critical`: Severe issues requiring immediate attention

### Notification Channels

Errors are automatically sent to configured notification channels:

1. **Slack Integration**:
   - Set `ERROR_NOTIFICATION_WEBHOOK_URL` environment variable to your Slack webhook URL
   - Errors are formatted with details and sent to the configured Slack channel
   - Different error levels are color-coded for visibility

2. **Console Logging**:
   - All errors are logged to the console with appropriate log levels
   - Includes detailed error information for debugging

### Configuration

To enable error notifications, add the following environment variable:

```
ERROR_NOTIFICATION_WEBHOOK_URL=your_slack_webhook_url
```

This will send all warnings, errors, and critical issues to the configured Slack channel.       