import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import path from 'path';
import fs from 'fs';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

global.fetch = vi.fn();

beforeAll(() => {
  try {
    const envPath = path.resolve(process.cwd(), '.env.test');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n').filter(Boolean);
      
      envVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (error) {
    console.error('Error loading .env.test file:', error);
  }
});

process.env.NEXT_PUBLIC_URL = 'https://speasy.app';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'test_webhook_secret';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test-supabase-url.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'test_key';
