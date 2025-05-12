import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
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

// Store original environment variables to restore after tests
const originalEnv = { ...process.env };

// Only load test environment variables when running tests
// This won't affect the actual build process
beforeAll(() => {
  // Explicitly set NODE_ENV to test using vi.stubEnv
  vi.stubEnv('NODE_ENV', 'test');
  
  try {
    const envPath = path.resolve(process.cwd(), '.env.test');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n').filter(Boolean);
      
      envVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          // Only set in the test environment
          vi.stubEnv(key.trim(), value.trim());
        }
      });
    }
  } catch (error) {
    console.error('Error loading .env.test file:', error);
  }
  
  // Set test-specific variables that won't affect production
  if (!process.env.NEXT_PUBLIC_URL) {
    vi.stubEnv('NEXT_PUBLIC_URL', 'https://speasy.app');
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'test_webhook_secret');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test-supabase-url.supabase.co');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    vi.stubEnv('STRIPE_SECRET_KEY', 'test_key');
  }

  // Add flag to identify test mode
  vi.stubEnv('TEST_MODE', 'true');
});

// Restore original environment after all tests complete
afterAll(() => {
  // Reset via stubEnv to restore values
  Object.keys(process.env).forEach(key => {
    if (originalEnv[key]) {
      vi.stubEnv(key, originalEnv[key]);
    } else {
      // For keys not in original env, we revert by setting to empty string
      // This is the closest we can get to "unstubbing" with vi.stubEnv
      vi.stubEnv(key, '');
    }
  });
  
  // Reset NODE_ENV back to its original value
  if (originalEnv.NODE_ENV) {
    vi.stubEnv('NODE_ENV', originalEnv.NODE_ENV);
  }
  
  console.log('Test environment cleanup complete');
});

(globalThis as any)['cookies'] = () => ({ get: vi.fn(() => undefined) });
