import { NextRequest } from 'next/server';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

function mode() {
  const explicit = (process.env.RAZORPAY_MODE || '').trim().toLowerCase();
  if (explicit === 'live') return 'live';
  if (explicit === 'test') return 'test';
  const single = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (single.startsWith('rzp_live_')) return 'live';
  return 'test';
}

export async function GET(_req: NextRequest) {
  try {
    const m = mode();
    const testOk = !!(process.env.RAZORPAY_TEST_KEY_ID && process.env.RAZORPAY_TEST_KEY_SECRET);
    const liveOk = !!(process.env.RAZORPAY_LIVE_KEY_ID && process.env.RAZORPAY_LIVE_KEY_SECRET);
    const legacy = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    return ResponseUtils.success({
      activeMode: m,
      testConfigured: testOk,
      liveConfigured: liveOk,
      legacyConfigured: legacy
    });
  } catch (e) {
    return ResponseUtils.error('Unable to read status');
  }
}
