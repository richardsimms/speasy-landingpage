# Repository Structure

This document provides an overview of the speasy-landingpage repository structure and organization.

## Directory Structure

```
speasy-landingpage/
├── app/                    # Next.js App Router pages and API routes
│   ├── (app)/              # Protected application routes
│   │   ├── dashboard/      # User dashboard
│   │   ├── player/         # Audio player
│   │   ├── saved/          # Saved content
│   │   ├── settings/       # User settings
│   │   └── layout.tsx      # Layout for authenticated routes
│   ├── (pages)/            # Public routes
│   │   ├── about/          # About page
│   │   ├── pricing/        # Pricing page
│   │   └── layout.tsx      # Layout for public routes
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication APIs
│   │   ├── feeds/          # Podcast feed APIs
│   │   └── webhooks/       # Webhook handlers
│   └── auth/               # Authentication pages
│       ├── callback/       # Auth callback handler
│       ├── error/          # Auth error page
│       └── login/          # Login page
├── components/             # React components
│   ├── sections/           # Page section components
│   ├── ui/                 # UI components (buttons, inputs, etc.)
│   ├── app-header.tsx      # Application header
│   └── app-sidebar.tsx     # Application sidebar
├── docs/                   # Documentation
├── lib/                    # Shared utility libraries
│   ├── feed-generator.ts   # Podcast feed generation
│   ├── server-only.ts      # Server-only utilities
│   ├── stripe.ts           # Stripe integration
│   └── supabase.ts         # Supabase client initialization
├── public/                 # Static assets
├── scripts/                # Build and deployment scripts
├── supabase/               # Supabase configuration
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
├── tests/                  # Test files
│   ├── integration/        # Integration tests
│   └── unit/               # Unit tests
├── utils/                  # Client-side utilities
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Git ignore file
├── middleware.ts           # Next.js middleware for auth protection
├── next.config.js          # Next.js configuration
├── package.json            # Package configuration
├── README.md               # Project overview
└── tsconfig.json           # TypeScript configuration
```

## Key Files

### Configuration Files

- **next.config.js**: Next.js framework configuration
- **tsconfig.json**: TypeScript configuration
- **.eslintrc.js**: ESLint rules and plugins
- **.env.example**: Example environment variables (copy to .env.local for local development)

### Application Entrypoints

- **middleware.ts**: Handles authentication and route protection
- **app/(app)/layout.tsx**: Main layout for authenticated routes
- **app/(pages)/layout.tsx**: Main layout for public routes

### Core Components

- **components/app-sidebar.tsx**: Navigation sidebar for authenticated users
- **components/app-header.tsx**: Application header with user menu
- **components/audio-player.tsx**: Audio playback component

### Utility Libraries

- **lib/feed-generator.ts**: Generates RSS feeds for podcast apps
- **lib/server-only.ts**: Server-side utilities including Supabase admin client
- **lib/stripe.ts**: Stripe payment integration
- **lib/supabase.ts**: Supabase client initialization

### API Routes

- **app/api/auth/**: Authentication-related endpoints
- **app/api/webhooks/stripe/**: Stripe webhook handler
- **app/api/feeds/[userId]/[feedId]/**: Podcast feed generator

## Build and Deployment

### CI/CD Workflows

The repository uses GitHub Actions for CI/CD:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_BUILD_MODE: 'true'
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co'
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key'
      SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key'
      STRIPE_SECRET_KEY: 'sk_test_mock'
      STRIPE_WEBHOOK_SECRET: 'whsec_mock'
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock'
```

The workflow includes:
- Linting, type checking, and testing
- Building the application
- Deploying to Vercel (production and preview environments)

### Build Process

```yaml
- name: Build
  run: |
    chmod +x ./scripts/build-ci.sh
    ./scripts/build-ci.sh
```

The build process:
1. Installs dependencies with pnpm
2. Runs linting and type checking
3. Runs tests
4. Builds the Next.js application
5. Deploys to Vercel

### Deployment

```yaml
- name: Deploy Project Artifacts to Vercel
  run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

The application is deployed to Vercel:
- Production deployments happen automatically on merges to main
- Preview deployments are created for pull requests
