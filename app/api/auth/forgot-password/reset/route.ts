import type { NextRequest } from 'next/server';
import { OtpUtils } from '@/lib/otp';
const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
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

// POST /api/auth/forgot-password/reset
// Body: { email: string, phone: string, code: string, newPassword: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').toLowerCase();
    const rawPhone = String(body?.phone || '');
    const code = String(body?.code || '').trim();
    const newPassword = String(body?.newPassword || '');

    if (!email || !rawPhone || !code || !newPassword) {
      return ResponseUtils.badRequest('email, phone, code and newPassword are required');
    }

    if (!ValidationUtils.validatePassword(newPassword)) {
      return ResponseUtils.badRequest('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    // Verify OTP with Twilio Verify using the same purpose
    const verifyRes = await OtpUtils.verifyOtp({ phone: rawPhone, purpose: 'forgot_password', code });
    if (!verifyRes.ok) {
      const map: Record<string, number> = { NOT_FOUND: 404, EXPIRED: 410, TOO_MANY_ATTEMPTS: 429, INVALID_PHONE: 400, INVALID_CODE: 400 };
      const status = map[(verifyRes as any).error] || 400;
      return ResponseUtils.errorCode(verifyRes.error || 'OTP_VERIFY_FAILED', verifyRes.detail || 'Verification failed', status, verifyRes);
    }

    const normalized = normalizePhoneForLookup(rawPhone);

    // Find the user by email and ensure phone matches
    const user = await database.findOne('users', { email });
    if (!user) {
      return ResponseUtils.errorCode('USER_NOT_FOUND', 'No user associated with this email', 404);
    }
    const stored = String(user.phone || '');
    const phoneMatches = stored === normalized || stored === rawPhone;
    if (!phoneMatches) {
      return ResponseUtils.errorCode('MISMATCH', 'Provided phone does not match the account', 400);
    }

    const hashed = await AuthUtils.hashPassword(newPassword);
    const updateRes = await database.updateOne('users', { _id: user._id }, { $set: { password: hashed, updatedAt: new Date() } });
    if (!updateRes?.matchedCount) {
      return ResponseUtils.error('Failed to update password', 500);
    }

    return ResponseUtils.success({ reset: true }, 'Password has been reset');
  } catch (err: any) {
    return ResponseUtils.error(`Failed to reset password. ${err?.message || ''}`, 500);
  }
}
