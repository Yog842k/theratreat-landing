import type { NextRequest } from 'next/server';
import { OtpUtils } from '@/lib/otp';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// POST /api/debug/otp/request
// Body: { phone: string, purpose?: string }
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ROUTES !== '1') {
      return ResponseUtils.forbidden('Debug routes are disabled in production');
    }
    const body = await request.json();
    const phone = body?.phone;
    const purpose = body?.purpose || 'debug_verify';
    if (!phone) return ResponseUtils.badRequest('phone is required');

    const res = await OtpUtils.requestOtp({ phone, purpose });
    if (!res.ok) {
      return ResponseUtils.errorCode(res.error || 'OTP_ERROR', res.detail || 'Failed to send verification code', 400, res);
    }
    return ResponseUtils.success({
      otpSent: true,
      phone: res.phone,
      ttlMinutes: res.ttlMinutes,
      purpose
    }, 'OTP sent', 202);
  } catch (err: any) {
    return ResponseUtils.error(`Failed to request OTP. ${err?.message || ''}`, 500);
  }
}
