import { NextResponse } from 'next/server';

/**
 * GET /api/paynet/env-check
 * Returns which Paynet env vars the runtime sees as set (value not revealed).
 * Use this on the deployed URL to debug PAYNET_CONFIG_MISSING.
 */
const PAYNET_KEYS = [
  'PAYNET_ENV',
  'PAYNET_USERNAME',
  'PAYNET_PASSWORD',
  'PAYNET_MERCHANT_CODE',
  'PAYNET_SALE_AREA_CODE',
  'PAYNET_CALLBACK_URL',
  'PAYNET_API_HOST_TEST',
  'PAYNET_PORTAL_HOST_TEST',
  'PAYNET_NOTIFY_SECRET_KEY_TEST',
] as const;

export async function GET() {
  const env: Record<string, boolean> = {};
  for (const key of PAYNET_KEYS) {
    const val = process.env[key];
    env[key] = typeof val === 'string' && val.trim().length > 0;
  }
  return NextResponse.json({
    message: 'Set = true means the var is present and non-empty.',
    env,
    allSet: PAYNET_KEYS.every((k) => env[k]),
  });
}
