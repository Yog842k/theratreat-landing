import type { NextRequest } from 'next/server';
import { OtpUtils } from '@/lib/otp';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// POST /api/debug/otp/verify
// Body: { phone: string, code: string, purpose?: string }
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ROUTES !== '1') {
      return ResponseUtils.forbidden('Debug routes are disabled in production');
    }
    const body = await request.json();
    const phone = body?.phone;
    const code = String(body?.code || '').trim();
    const purpose = body?.purpose || 'debug_verify';
    if (!phone || !code) return ResponseUtils.badRequest('phone and code are required');

    const res = await OtpUtils.verifyOtp({ phone, purpose, code });
    if (!res.ok) {
      return ResponseUtils.errorCode(res.error || 'OTP_VERIFY_FAILED', res.detail || 'Verification failed', 400, res);
    }
    return ResponseUtils.success({ verified: true, purpose }, 'OTP verified');
  } catch (err: any) {
    return ResponseUtils.error(`Failed to verify OTP. ${err?.message || ''}`, 500);
  }
}
