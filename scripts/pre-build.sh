#!/bin/bash

# Clean build cache
echo "Cleaning Next.js build cache..."
rm -rf .next

# Clear node_modules cache if needed
if [ "$CLEAR_NODE_MODULES" = "true" ]; then
  echo "Cleaning node_modules..."
  rm -rf node_modules
  pnpm install
fi

echo "Pre-build cleanup completed successfully." 