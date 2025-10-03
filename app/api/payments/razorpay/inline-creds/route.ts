import type { NextRequest } from 'next/server';
const { ResponseUtils } = require('@/lib/utils');

// This mirrors logic in order route (keep minimal duplication for safety)
const USE_INLINE_KEYS = true; // must match order route to be meaningful
const INLINE_MODE: 'test' | 'live' = 'live';
const INLINE_TEST_KEY_ID = '';
const INLINE_TEST_KEY_SECRET = '';
const INLINE_LIVE_KEY_ID = 'rzp_live_RLVx97bhX0VW58';
const INLINE_LIVE_KEY_SECRET = 'RT6zyn65MnWWrrt73lZvkL';

function mask(v: string) { return v ? `${v.slice(0,6)}…${v.slice(-4)}` : ''; }

export async function GET(_req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return ResponseUtils.forbidden('Disabled outside development');
  }
  const active = USE_INLINE_KEYS ? INLINE_MODE : 'env';
  const keyId = INLINE_MODE === 'test' ? INLINE_TEST_KEY_ID : INLINE_LIVE_KEY_ID;
  const secret = INLINE_MODE === 'test' ? INLINE_TEST_KEY_SECRET : INLINE_LIVE_KEY_SECRET;
  return ResponseUtils.success({
    inlineEnabled: USE_INLINE_KEYS,
    mode: active,
    keyIdMasked: mask(keyId),
    keyIdPrefix: keyId.slice(0,10),
    secretLength: secret.length,
    secretLooksShort: secret.length > 0 && secret.length < 25,
    warning: secret.length > 0 && secret.length < 25 ? 'Secret length unusually short – likely truncated' : undefined,
    timestamp: new Date().toISOString()
  });
}
