import type { NextRequest } from 'next/server';
import { OtpUtils } from '@/lib/otp';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// POST /api/debug/otp/status
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

    const verified = await OtpUtils.isPhoneVerified({ phone, purpose });
    return ResponseUtils.success({ verified, phone, purpose });
  } catch (err: any) {
    return ResponseUtils.error(`Failed to check OTP status. ${err?.message || ''}`, 500);
  }
}
