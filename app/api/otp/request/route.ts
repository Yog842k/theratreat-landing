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
      const status = (res as any).error === 'RATE_LIMITED' ? 429 : 400;
      return ResponseUtils.errorCode(res.error || 'OTP_ERROR', res.detail || 'Failed to send verification code', status, res);
    }
  return ResponseUtils.success({ otpSent: true, phone: res.phone, ttlMinutes: (res as any).ttlMinutes, purpose, channel: (res as any).channel, nextSendSeconds: Number(process.env.OTP_RESEND_INTERVAL_SEC || 60) }, 'OTP sent', 202);
  } catch (err: any) {
    return ResponseUtils.error(`Failed to request OTP. ${err?.message || ''}`, 500);
  }
}
