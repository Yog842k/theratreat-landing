import type { NextRequest } from 'next/server';
const { ResponseUtils } = require('@/lib/utils');

// SECURITY: Inline hard-coded Razorpay keys removed. This endpoint now only reports that inline mode is disabled.
// If you truly need inline test keys for a local spike, create a local untracked file or rely on environment vars.
const USE_INLINE_KEYS = false; // always false to prevent accidental re-introduction

export async function GET(_req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return ResponseUtils.forbidden('Disabled outside development');
  }
  return ResponseUtils.success({
    inlineEnabled: USE_INLINE_KEYS,
    message: 'Inline Razorpay credentials have been removed. Use environment variables instead.',
    timestamp: new Date().toISOString()
  });
}
