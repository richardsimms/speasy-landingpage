#!/bin/bash

# This script is used for CI builds to ensure they complete successfully
# It sets mock environment variables for build time

echo "Building application for CI environment..."

# Set build mode for static build-time safety - make this extremely explicit
export NEXT_PUBLIC_BUILD_MODE="true"
# Force these environment variables to be visible to Next.js
echo "NEXT_PUBLIC_BUILD_MODE=true" >> .env.local

# Set mock Supabase credentials for CI
echo "Using mock Supabase credentials for build"
export NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="mock-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="mock-service-role-key"
# Force these environment variables to be visible to Next.js
echo "NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key" >> .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=mock-service-role-key" >> .env.local

# Set mock Stripe credentials for CI
export STRIPE_SECRET_KEY="sk_test_mock"
export STRIPE_WEBHOOK_SECRET="whsec_mock"
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_mock"
# Force these environment variables to be visible to Next.js
echo "STRIPE_SECRET_KEY=sk_test_mock" >> .env.local
echo "STRIPE_WEBHOOK_SECRET=whsec_mock" >> .env.local
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_mock" >> .env.local

echo "Build mode: $NEXT_PUBLIC_BUILD_MODE"
echo "Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "Supabase Anon Key: $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Run the build using pnpm with env variables explicitly passed
NEXT_PUBLIC_BUILD_MODE=true NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key pnpm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build completed successfully."
  exit 0
else
  echo "Build failed."
  exit 1
fi 