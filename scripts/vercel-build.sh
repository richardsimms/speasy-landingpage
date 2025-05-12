#!/bin/bash

# This script is used to build the application for Vercel deployment.
# It sets mock credentials for build time to ensure builds succeed even without real credentials.

echo "Building application for Vercel deployment..."

# Set build mode for static build-time safety
export NEXT_PUBLIC_BUILD_MODE="${NEXT_PUBLIC_BUILD_MODE:-true}"

# Set mock Supabase credentials if they're not already set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Using mock Supabase credentials for build"
  export NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="mock-anon-key"
fi

# Set mock Stripe credentials if they're not already set
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-mock-service-role-key}"
export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_mock}"
export STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-whsec_mock}"
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-pk_test_mock}"

echo "Build mode: $NEXT_PUBLIC_BUILD_MODE"

# Run the build using pnpm
pnpm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build completed successfully."
  exit 0
else
  echo "Build failed."
  exit 1
fi 