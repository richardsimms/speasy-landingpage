import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import path from 'path';
import fs from 'fs';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock fetch globally for tests
global.fetch = vi.fn();

// Only load test environment variables when running tests
// This won't affect the actual build process
beforeAll(() => {
  // Store original env variables
  const originalEnv = { ...process.env };
  
  try {
    const envPath = path.resolve(process.cwd(), '.env.test');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n').filter(Boolean);
      
      envVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          // Only set in the test environment
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (error) {
    console.error('Error loading .env.test file:', error);
  }
  
  // Set test-specific variables that won't affect production
  if (!process.env.NEXT_PUBLIC_URL) {
    process.env.NEXT_PUBLIC_URL = 'https://speasy.app';
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase-url.supabase.co';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    process.env.STRIPE_SECRET_KEY = 'test_key';
  }

  // Add cleanup after tests to restore original env if needed
  // This ensures tests don't leak env vars to other processes
  vi.stubEnv('TEST_MODE', 'true');
});

(globalThis as any)['cookies'] = () => ({ get: vi.fn(() => undefined) });
