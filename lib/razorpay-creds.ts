// Centralized Razorpay credential & mode resolution utilities
// Ensures order and verify endpoints stay consistent.

export type RazorpayMode = 'test' | 'live';
export interface RazorpayCreds { keyId: string; keySecret: string; mode: RazorpayMode; publicKey: string; }

export function selectMode(): RazorpayMode {
  const explicit = (process.env.RAZORPAY_MODE || '').trim().toLowerCase();
  if (explicit === 'live') return 'live';
  if (explicit === 'test') return 'test';
  const hasLive = !!(process.env.RAZORPAY_LIVE_KEY_ID && process.env.RAZORPAY_LIVE_KEY_SECRET);
  const hasTest = !!(process.env.RAZORPAY_TEST_KEY_ID && process.env.RAZORPAY_TEST_KEY_SECRET);
  if (hasTest) return 'test';
  if (hasLive) return 'live';
  const single = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (single.startsWith('rzp_live_')) return 'live';
  return 'test';
}

export function getCredentials(): RazorpayCreds | null {
  const mode = selectMode();
  let keyId = '';
  let keySecret = '';
  let publicKey = '';
  if (mode === 'test') {
    keyId = (process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim();
    keySecret = (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();
    publicKey = (process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId).trim();
  } else {
    keyId = (process.env.RAZORPAY_LIVE_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim();
    keySecret = (process.env.RAZORPAY_LIVE_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();
    publicKey = (process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId).trim();
  }
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret, mode, publicKey };
}

export function validatePrefix(keyId: string, mode: RazorpayMode) {
  if (mode === 'test' && !keyId.startsWith('rzp_test_')) return 'Test mode expects key id starting with rzp_test_';
  if (mode === 'live' && !keyId.startsWith('rzp_live_')) return 'Live mode expects key id starting with rzp_live_';
  return null;
}

export function resolveSecret(mode: RazorpayMode) {
  if (mode === 'test') {
    return (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();
  }
  return (process.env.RAZORPAY_LIVE_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();
}

export function isWeakSecret(secret: string) {
  return (secret || '').length < 25; // heuristic threshold
}

export const isSimulationEnabled = () => process.env.RAZORPAY_SIMULATED === '1';
