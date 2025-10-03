import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

/*
 Full therapist registration endpoint (extended form). Creates user (userType=therapist), stores extended profile snapshot, and links a Razorpay customer.
*/
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, phoneNumber, sessionModesOffered, sessionModePrices } = body;
    if (!fullName || !email || !password) return ResponseUtils.badRequest('fullName, email, password required');
    if (String(password).length < 8) return ResponseUtils.badRequest('Password must be at least 8 characters');
    const emailLower = String(email).toLowerCase();
    const existing = await database.findOne('users', { email: emailLower });
    if (existing) return ResponseUtils.badRequest('User already exists with this email');

    const hashed = await AuthUtils.hashPassword(password);
    const now = new Date();
    const userDoc = {
      name: ValidationUtils.sanitizeString(fullName),
      email: emailLower,
      password: hashed,
      userType: 'therapist',
      phone: ValidationUtils.sanitizeString(phoneNumber || ''),
      isActive: true,
      isVerified: false,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now
    };
    const userRes = await database.insertOne('users', userDoc);
    const userId = userRes.insertedId;

    // Therapist profile document (separate collection for richer queries later)
    const commissionPercent = typeof body.defaultCommissionPercent === 'number' ? Math.min(Math.max(body.defaultCommissionPercent, 0), 1) : 0.15;
    const therapistProfile = {
      userId,
      designations: body.designations || [],
      primaryConditions: body.primaryConditions || [],
      experience: body.experience || '',
      workplaces: body.workplaces || '',
      availability: {
        preferredDays: body.preferredDays || [],
        preferredTimeSlots: body.preferredTimeSlots || [],
        weeklySessions: body.weeklySessions || '',
        sessionDurations: body.sessionDurations || []
      },
      pricing: {
        sessionFee: body.sessionFee || '',
        dynamicPricing: !!body.dynamicPricing,
        freeFirstSession: !!body.freeFirstSession,
        paymentMode: body.paymentMode || '',
        modes: sessionModesOffered || [],
        modePrices: sessionModePrices || {}
      },
      bank: body.bankDetails || {},
      bio: body.bio || '',
      links: { linkedIn: body.linkedIn || '', website: body.website || '', instagram: body.instagram || '' },
      languages: body.therapyLanguages || [],
      hasClinic: !!body.hasClinic,
      state: body.state || '',
      city: body.currentCity || '',
      defaultCommissionPercent: commissionPercent,
      razorpayAccountId: body.razorpayAccountId || '',
      createdAt: now,
      updatedAt: now
    };
    await database.insertOne('therapists', therapistProfile);

    // Razorpay customer link
    try {
      const { createRazorpayCustomer } = await import('@/lib/razorpay-customer');
      const rzpCustomer = await createRazorpayCustomer({ name: userDoc.name, email: userDoc.email, contact: userDoc.phone, notes: { userType: 'therapist' } });
      if (rzpCustomer) {
        await database.updateOne('users', { _id: userId }, { $set: { razorpay: { customerId: rzpCustomer.id, mode: rzpCustomer.mode, linkedAt: new Date() } } });
      }
    } catch (e:any) { console.warn('Razorpay link failed (therapist)', e?.message); }

    const token = AuthUtils.generateToken({ userId: userId.toString(), userType: 'therapist' });
    const { password: _pw, ...safeUser } = userDoc as any; (safeUser as any)._id = userId;
    return ResponseUtils.success({ user: safeUser, therapistProfile, token }, 'Therapist registered');
  } catch (e:any) {
    console.error('therapist-registration error', e?.message, e);
    return ResponseUtils.error('Therapist registration failed', 500, e?.message || 'error');
  }
}
