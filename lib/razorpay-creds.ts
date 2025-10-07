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
  // Bypass prefix validation if explicitly allowed (development / emergency only)
  if (process.env.RAZORPAY_ALLOW_PREFIX_MISMATCH === '1') return null;
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
  // Allow explicit bypass for local / emergency use
  if (process.env.RAZORPAY_ALLOW_WEAK === '1') return false; // explicit bypass
  const s = (secret || '').trim();
  // Optional override of minimum length (default 25) via env RAZORPAY_SECRET_MIN
  const configuredMinRaw = Number(process.env.RAZORPAY_SECRET_MIN || '');
  const min = Number.isFinite(configuredMinRaw) && configuredMinRaw > 0 ? configuredMinRaw : 25;
  if (!s) return true; // definitely weak / missing
  if (s.length < min) {
    // Soft acceptance: some real-world secrets may be 20-24 chars. If length >=20 and contains letters & digits, allow.
    if (s.length >= 20 && /[a-zA-Z]/.test(s) && /\d/.test(s)) return false;
    return true;
  }
  return false;
}

export const isSimulationEnabled = () => process.env.RAZORPAY_SIMULATED === '1';
