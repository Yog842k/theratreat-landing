import type { NextRequest } from 'next/server';
const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

/**
 * POST /api/clinics/login
 * Allows a clinic owner (userType=clinic-owner) to login using ownerEmail + password.
 * Body: { email: string, password: string }
 * Response: { token, user }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = ValidationUtils.sanitizeString(body.email || '').toLowerCase();
    const password = body.password || '';

    if (!email || !password) return ResponseUtils.badRequest('Email and password required');
    if (!ValidationUtils.validateEmail(email)) return ResponseUtils.badRequest('Invalid email');

    const user = await database.findOne('users', { email });
    if (!user) return ResponseUtils.badRequest('Invalid credentials');
    if (user.userType !== 'clinic-owner') return ResponseUtils.forbidden('Not a clinic owner account');

    const ok = await AuthUtils.comparePassword(password, user.password);
    if (!ok) return ResponseUtils.badRequest('Invalid credentials');

    const token = AuthUtils.generateToken({ userId: user._id.toString(), userType: user.userType });
    const { password: _pw, ...safe } = user;
    return ResponseUtils.success({ token, user: safe }, 'Login successful');
  } catch (e: any) {
    console.error('clinic owner login error', e);
    return ResponseUtils.error('Login failed', 500, e?.message || 'error');
  }
}
