import type { NextRequest } from 'next/server';
import { OtpUtils } from '@/lib/otp';
const database = require('@/lib/database');
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

function normalizePhoneForLookup(raw: string): string {
  if (!raw) return raw;
  let p = raw.trim();
  if (/^0\d{10}$/.test(p)) p = p.substring(1);
  if (!p.startsWith('+') && /^\d{10}$/.test(p)) {
    const cc = process.env.OTP_DEFAULT_COUNTRY_CODE || '+91';
    p = cc + p;
  }
  if (!p.startsWith('+') && /^\d{8,15}$/.test(p)) p = '+' + p;
  return p;
}

// POST /api/auth/forgot-password/start
// Body: { email: string, phone: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').toLowerCase();
    const rawPhone = String(body?.phone || '');
    if (!email || !rawPhone) return ResponseUtils.badRequest('email and phone are required');
    if (!ValidationUtils.validateEmail(email)) return ResponseUtils.badRequest('Invalid email format');

    // Optional: try to find the user to avoid sending OTP to unknown numbers.
    // Do not leak user existence in response.
    let userExists = true;
    let phoneMatches = false;
    const normalized = normalizePhoneForLookup(rawPhone);
    try {
      const user = await database.findOne('users', { email });
      userExists = !!user;
      if (user) {
        const stored = String(user.phone || '');
        phoneMatches = stored === normalized || stored === rawPhone;
      }
    } catch {}

    if (!userExists || !phoneMatches) {
      // Dev override: allow sending even if user isn't found (useful with mock DB)
      const devBypass = process.env.OTP_DEV_ALLOW_NO_MATCH === '1' && process.env.NODE_ENV !== 'production';
      if (devBypass) {
        try {
          const res = await OtpUtils.requestOtp({ phone: normalized, purpose: 'forgot_password' });
          if (!res.ok) {
            const status = (res as any).error === 'RATE_LIMITED' ? 429 : (res as any).error?.includes('TWILIO') ? 503 : 400;
            return ResponseUtils.errorCode(res.error || 'OTP_ERROR', res.detail || 'Failed to send verification code', status, res);
          }
        } catch {}
      }
      // Respond 202 generically to avoid user enumeration.
      return ResponseUtils.success({ otpSent: true, phone: rawPhone, purpose: 'forgot_password' }, 'If the email and phone match an account, an OTP has been sent', 202);
    }

    const res = await OtpUtils.requestOtp({ phone: normalized, purpose: 'forgot_password' });
    if (!res.ok) {
      const status = (res as any).error === 'RATE_LIMITED' ? 429 : (res as any).error?.includes('TWILIO') ? 503 : 400;
      return ResponseUtils.errorCode(res.error || 'OTP_ERROR', res.detail || 'Failed to send verification code', status, res);
    }
    return ResponseUtils.success({ otpSent: true, phone: res.phone, ttlMinutes: (res as any).ttlMinutes, purpose: 'forgot_password', channel: (res as any).channel, nextSendSeconds: Number(process.env.OTP_RESEND_INTERVAL_SEC || 60) }, 'OTP sent', 202);
  } catch (err: any) {
    return ResponseUtils.error(`Failed to start forgot password. ${err?.message || ''}`, 500);
  }
}
