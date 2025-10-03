import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

function selectMode(): 'test'|'live' {
  const explicit = (process.env.RAZORPAY_MODE || '').trim().toLowerCase();
  if (explicit === 'live') return 'live';
  if (explicit === 'test') return 'test';
  const hasTest = !!(process.env.RAZORPAY_TEST_KEY_ID && process.env.RAZORPAY_TEST_KEY_SECRET);
  const hasLive = !!(process.env.RAZORPAY_LIVE_KEY_ID && process.env.RAZORPAY_LIVE_KEY_SECRET);
  if (hasTest) return 'test';
  if (hasLive) return 'live';
  const single = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (single.startsWith('rzp_live_')) return 'live';
  return 'test';
}

function resolvePair(mode: 'test'|'live') {
  if (mode === 'test') {
    return {
      keyId: (process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim(),
      keySecret: (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim(),
      publicKey: (process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim()
    };
  }
  return {
    keyId: (process.env.RAZORPAY_LIVE_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim(),
    keySecret: (process.env.RAZORPAY_LIVE_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim(),
    publicKey: (process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim()
  };
}

export async function GET(_req: NextRequest) {
  const mode = selectMode();
  const pair = resolvePair(mode);
  const mask = (v: string) => v ? `${v.slice(0,6)}…${v.slice(-4)}` : '';
  const payload: any = {
    mode,
    configured: !!(pair.keyId && pair.keySecret),
    keyIdMasked: mask(pair.keyId),
    publicKeyMasked: mask(pair.publicKey || pair.keyId),
    secretLength: pair.keySecret ? pair.keySecret.length : 0,
    timestamp: new Date().toISOString()
  };
  // Lightweight auth probe (only if configured & not too frequent) could be added later.
  return ResponseUtils.success(payload);
}
