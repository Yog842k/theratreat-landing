import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import database from '@/lib/database';
import AuthMiddleware from '@/lib/middleware';
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

const sanitizeArray = (arr: any) =>
  Array.isArray(arr) ? arr.map((v) => (typeof v === 'string' ? v.trim() : v)).filter(Boolean) : [];

export async function GET(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    if (user?.userType !== 'therapist') {
      return ResponseUtils.forbidden('Only therapists can access onboarding');
    }

    const userId = user._id ? new ObjectId(String(user._id)) : null;
    if (!userId) return ResponseUtils.badRequest('Invalid user id');

    const therapist = await database.findOne('therapists', { userId });
    return ResponseUtils.success({ therapist }, 'Therapist onboarding data');
  } catch (err: any) {
    console.error('[therapist-onboarding][GET] error', err?.message || err);
    if (Array.isArray(err?.reasons) && err.reasons.includes('db_error')) {
      return ResponseUtils.error('Database unavailable. Please try again shortly.', 503, err?.message || err);
    }
    if (String(err?.message || '').toLowerCase().includes('auth')) {
      return ResponseUtils.unauthorized('Authentication required');
    }
    return ResponseUtils.error('Failed to load onboarding data', 500, err?.message || err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    if (user?.userType !== 'therapist') {
      return ResponseUtils.forbidden('Only therapists can update onboarding');
    }

    const body = await request.json();
    const now = new Date();
    const userId = user._id ? new ObjectId(String(user._id)) : null;
    if (!userId) return ResponseUtils.badRequest('Invalid user id');

    const displayName = ValidationUtils.sanitizeString(body?.displayName || user?.name || '');
    const title = ValidationUtils.sanitizeString(body?.title || '');
    const bio = ValidationUtils.sanitizeString(body?.bio || '');
    const specializations = sanitizeArray(body?.specializations);
    const experience = body?.experience === null || body?.experience === undefined || body?.experience === ''
      ? null
      : Number(body?.experience);
    const consultationFee = body?.consultationFee === null || body?.consultationFee === undefined || body?.consultationFee === ''
      ? null
      : Number(body?.consultationFee);
    const languages = sanitizeArray(body?.languages);
    const sessionTypes = sanitizeArray(body?.sessionTypes);
    const availability = Array.isArray(body?.availability) ? body.availability : [];

    const updateData: any = {
      displayName,
      fullName: displayName || user?.name || '',
      name: displayName || user?.name || '',
      title,
      bio,
      specializations,
      experience,
      consultationFee,
      languages,
      sessionTypes,
      availability,
      updatedAt: now,
      registrationCompleted: true,
      onboardingCompleted: true,
    };

    const existing = await database.findOne('therapists', { userId });
    if (existing) {
      await database.updateOne('therapists', { _id: existing._id }, { $set: updateData });
    } else {
      const therapistDoc = {
        userId,
        email: user?.email || '',
        phoneNumber: user?.phone || '',
        isApproved: false,
        rating: 0,
        reviewCount: 0,
        createdAt: now,
        ...updateData
      };
      await database.insertOne('therapists', therapistDoc);
    }

    await database.updateOne('users', { _id: userId }, { $set: { onboardingCompleted: true, updatedAt: now } });
    const therapist = await database.findOne('therapists', { userId });

    return ResponseUtils.success({ therapist }, 'Onboarding saved');
  } catch (err: any) {
    console.error('[therapist-onboarding][POST] error', err?.message || err);
    if (Array.isArray(err?.reasons) && err.reasons.includes('db_error')) {
      return ResponseUtils.error('Database unavailable. Please try again shortly.', 503, err?.message || err);
    }
    if (String(err?.message || '').toLowerCase().includes('auth')) {
      return ResponseUtils.unauthorized('Authentication required');
    }
    return ResponseUtils.error('Failed to save onboarding data', 500, err?.message || err);
  }
}
