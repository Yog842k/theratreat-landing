import type { NextRequest } from 'next/server';
const { ResponseUtils } = require('@/lib/utils');
import { selectMode as coreSelectMode, getCredentials, validatePrefix, isWeakSecret, isSimulationEnabled } from '@/lib/razorpay-creds';

export const runtime = 'nodejs';

// Backwards compatibility helpers not strictly needed now; using centralized creds util.

function mask(val: string) {
  return val ? (val.length > 12 ? `${val.slice(0,6)}…${val.slice(-4)}` : val) : '';
}

export async function GET(_req: NextRequest) {
  try {
    const mode = coreSelectMode();
    const creds = getCredentials();
    const simulation = isSimulationEnabled();
    const keyId = creds?.keyId || '';
    const keySecret = creds?.keySecret || '';
    const publicKey = creds?.publicKey || '';
    const prefixIssue = keyId ? validatePrefix(keyId, mode) : null;
    let sdkInstalled = false;
    try { require.resolve('razorpay'); sdkInstalled = true; } catch {}
    const payload: any = {
      mode,
      simulationEnabled: simulation,
      configured: !!(keyId && keySecret),
      keyIdMasked: mask(keyId),
      publicKeyMasked: mask(publicKey || keyId),
      secretLength: keySecret ? keySecret.length : 0,
      prefixValid: !prefixIssue,
      prefixIssue: prefixIssue || undefined,
      weakSecret: keySecret ? isWeakSecret(keySecret) : undefined,
      sdkInstalled,
      timestamp: new Date().toISOString()
    };
    if (process.env.NODE_ENV !== 'production') {
      payload.dev = {
        hasTestPair: !!(process.env.RAZORPAY_TEST_KEY_ID && process.env.RAZORPAY_TEST_KEY_SECRET),
        hasLivePair: !!(process.env.RAZORPAY_LIVE_KEY_ID && process.env.RAZORPAY_LIVE_KEY_SECRET),
        hasLegacyPair: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        simulatedVar: process.env.RAZORPAY_SIMULATED
      };
    }
    return ResponseUtils.success(payload);
  } catch (e: any) {
    return ResponseUtils.error(`Ping failed: ${e?.message || 'unknown'}`);
  }
}
