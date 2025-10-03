import type { NextRequest } from 'next/server';
const { ResponseUtils } = require('@/lib/utils');

function selectMode(): 'test'|'live' {
  const explicit = (process.env.RAZORPAY_MODE || '').trim().toLowerCase();
  if (explicit === 'live') return 'live';
  if (explicit === 'test') return 'test';
  const single = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (single.startsWith('rzp_live_')) return 'live';
  return 'test';
}

function resolvePublic(mode: 'test'|'live'): string {
  if (mode === 'test') {
    return (process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim();
  }
  return (process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_LIVE_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim();
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const debug = url.searchParams.get('debug');
    const mode = selectMode();
    const keyId = resolvePublic(mode);
    if (!keyId) return ResponseUtils.error('Razorpay key not configured', 500);

    const payload: any = { keyId, mode };
    if (debug && process.env.NODE_ENV !== 'production') {
      const livePresent = !!(process.env.RAZORPAY_LIVE_KEY_ID && process.env.RAZORPAY_LIVE_KEY_SECRET);
      const testPresent = !!(process.env.RAZORPAY_TEST_KEY_ID && process.env.RAZORPAY_TEST_KEY_SECRET);
      payload.debug = {
        testPresent,
        livePresent,
        hasLegacy: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        maskedActive: keyId.length > 12 ? `${keyId.slice(0,8)}…${keyId.slice(-4)}` : keyId
      };
    }
    return ResponseUtils.success(payload);
  } catch (e) {
    return ResponseUtils.error('Failed to load payment config');
  }
}
