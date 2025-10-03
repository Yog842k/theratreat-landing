import type { NextRequest } from 'next/server';
// @ts-ignore
import Razorpay from 'razorpay';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

function mode(): 'test'|'live' {
  const explicit = (process.env.RAZORPAY_MODE || '').trim().toLowerCase();
  if (explicit === 'live') return 'live';
  if (explicit === 'test') return 'test';
  const single = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (single.startsWith('rzp_live_')) return 'live';
  return 'test';
}

function gather() {
  const active = mode();
  const testIdRaw = (process.env.RAZORPAY_TEST_KEY_ID || '').trim();
  const testSecretRaw = (process.env.RAZORPAY_TEST_KEY_SECRET || '').trim();
  const liveIdRaw = (process.env.RAZORPAY_LIVE_KEY_ID || '').trim();
  const liveSecretRaw = (process.env.RAZORPAY_LIVE_KEY_SECRET || '').trim();
  const legacyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const legacySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  // Effective test creds (prefer dedicated, fallback legacy only if legacy is test prefix)
  const testId = testIdRaw || (legacyId.startsWith('rzp_test_') ? legacyId : '');
  const testSecret = testSecretRaw || (legacyId.startsWith('rzp_test_') ? legacySecret : '');

  // Effective live creds (prefer dedicated, fallback legacy only if legacy is live prefix)
  const liveId = liveIdRaw || (legacyId.startsWith('rzp_live_') ? legacyId : '');
  const liveSecret = liveSecretRaw || (legacyId.startsWith('rzp_live_') ? legacySecret : '');

  return { active, testId, testSecret, liveId, liveSecret, legacyId, legacySecret };
}

async function probe(keyId: string, keySecret: string) {
  if (!keyId || !keySecret) return { attempted: false };
  try {
    const rzp: any = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({ amount: 100, currency: 'INR', receipt: 'probe_diag', payment_capture: 1 });
    if (order && order.id) return { attempted: true, success: true, orderId: order.id };
    return { attempted: true, success: false, reason: 'Unknown response' };
  } catch (e: any) {
    const desc = e?.error?.description || e?.message || 'Unknown';
    const auth = /auth/i.test(desc) || e?.status === 401;
    return { attempted: true, success: false, reason: desc, authFailure: auth };
  }
}

export async function GET(_req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return ResponseUtils.forbidden('Disabled in production');
    }
    const { active, testId, testSecret, liveId, liveSecret, legacyId, legacySecret } = gather();
    const testConfigured = !!(testId && testSecret);
    const liveConfigured = !!(liveId && liveSecret);
    const legacySingle = !!(legacyId && legacySecret);
    const result: any = {
      activeMode: active,
      testConfigured,
      liveConfigured,
      legacySingle,
      keys: {
        activePrefix: (active === 'live' ? (liveId||legacyId||'') : (testId||legacyId||'')).slice(0, 12),
        testMasked: testId ? `${testId.slice(0,8)}…${testId.slice(-4)}` : null,
        liveMasked: liveId ? `${liveId.slice(0,8)}…${liveId.slice(-4)}` : null,
        testSecretLen: testSecret ? testSecret.length : 0,
        liveSecretLen: liveSecret ? liveSecret.length : 0,
        legacyMasked: legacyId ? `${legacyId.slice(0,8)}…${legacyId.slice(-4)}` : null,
        legacySecretLen: legacySecret ? legacySecret.length : 0
      },
      issues: [] as string[]
    };

    if (testConfigured && !testId.startsWith('rzp_test_')) result.issues.push('Test credentials use non-test prefix');
    if (liveConfigured && !liveId.startsWith('rzp_live_')) result.issues.push('Live credentials use non-live prefix');
    if (active === 'live' && !liveConfigured && legacyId.startsWith('rzp_live_') && legacySecret && legacySecret.length < 25) {
      result.issues.push('Legacy live secret length appears too short (possible truncation)');
    }
    if (active === 'live' && !liveConfigured && testConfigured) {
      result.issues.push('Active mode = live but only testConfigured=true (legacy fallback mismatch)');
    }
    if (legacySingle && !legacyId.startsWith('rzp_test_') && !legacyId.startsWith('rzp_live_')) {
      result.issues.push('Legacy key id has unexpected prefix');
    }

    // Auth probes (safe: creates tiny test order)
    if (testId && testSecret) {
      result.testProbe = await probe(testId, testSecret);
    }
    if (liveId && liveSecret) {
      result.liveProbe = await probe(liveId, liveSecret);
    }
    // Legacy single pair probe if neither dedicated pair provided
    if (!result.testConfigured && !result.liveConfigured && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      result.legacyProbe = await probe(process.env.RAZORPAY_KEY_ID.trim(), process.env.RAZORPAY_KEY_SECRET.trim());
    }

    return ResponseUtils.success(result);
  } catch (e) {
    return ResponseUtils.error('Diagnostic failed');
  }
}