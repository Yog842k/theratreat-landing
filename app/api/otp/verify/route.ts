import type { NextRequest } from 'next/server';
import { OtpUtils } from '@/lib/otp';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// POST /api/otp/verify
// Body: { phone: string, code: string, purpose?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body?.phone;
    const code = String(body?.code || '').trim();
    const purpose = body?.purpose || 'signup:user';
    if (!phone || !code) return ResponseUtils.badRequest('phone and code are required');

    const res = await OtpUtils.verifyOtp({ phone, purpose, code });
    if (!res.ok) {
      const map: Record<string, number> = { NOT_FOUND: 404, EXPIRED: 410, TOO_MANY_ATTEMPTS: 429, INVALID_PHONE: 400, INVALID_CODE: 400 };
      const status = map[(res as any).error] || 400;
      return ResponseUtils.errorCode(res.error || 'OTP_VERIFY_FAILED', res.detail || 'Verification failed', status, res);
    }
    return ResponseUtils.success({ verified: true, purpose }, 'OTP verified');
  } catch (err: any) {
    return ResponseUtils.error(`Failed to verify OTP. ${err?.message || ''}`, 500);
  }
}
