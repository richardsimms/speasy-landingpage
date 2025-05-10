import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

global.fetch = vi.fn();

process.env.NEXT_PUBLIC_URL = 'https://speasy.app';
process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
