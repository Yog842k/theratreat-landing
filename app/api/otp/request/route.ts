import type { NextRequest } from 'next/server';
import { OtpUtils } from '@/lib/otp';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// POST /api/otp/request
// Body: { phone: string, purpose?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body?.phone;
    const purpose = body?.purpose || 'signup:user';
    if (!phone) return ResponseUtils.badRequest('phone is required');

    const res = await OtpUtils.requestOtp({ phone, purpose });
    if (!res.ok) {
      return ResponseUtils.errorCode(res.error || 'OTP_ERROR', res.detail || 'Failed to send verification code', 400, res);
    }
    return ResponseUtils.success({ otpSent: true, phone: res.phone, ttlMinutes: res.ttlMinutes, purpose }, 'OTP sent', 202);
  } catch (err: any) {
    return ResponseUtils.error(`Failed to request OTP. ${err?.message || ''}`, 500);
  }
}
