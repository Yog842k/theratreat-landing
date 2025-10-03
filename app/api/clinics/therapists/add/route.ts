import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

/**
 * POST /api/clinics/therapists/add
 * Clinic-owned therapist creation. Auth user must be clinic-owner.
 * Creates a user (userType=therapist) and therapist profile bound to clinicId.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    if (user.userType !== 'clinic-owner') return ResponseUtils.forbidden('Only clinic owners can add therapists');
    const body = await request.json();
    const required = ['fullName','email','phone','clinicId'];
    const missing = required.filter(f => !body[f]);
    if (missing.length) return ResponseUtils.badRequest('Missing: ' + missing.join(', '));
    if (!ValidationUtils.validateObjectId(body.clinicId)) return ResponseUtils.badRequest('Invalid clinicId');
    const clinic = await database.findOne('clinics', { _id: new ObjectId(body.clinicId) });
    if (!clinic) return ResponseUtils.notFound('Clinic not found');
    if (String(clinic.owner?.email).toLowerCase() !== String(user.email).toLowerCase()) return ResponseUtils.forbidden('Not owner of clinic');

    const existingUser = await database.findOne('users', { email: body.email.toLowerCase() });
    if (existingUser) return ResponseUtils.badRequest('User already exists with this email');

    const now = new Date();
    const password = body.password && body.password.length >= 8 ? body.password : (Math.random().toString(36).slice(2) + 'Aa1!');
    const hashed = await AuthUtils.hashPassword(password);
    const userDoc = {
      name: ValidationUtils.sanitizeString(body.fullName),
      email: body.email.toLowerCase(),
      password: hashed,
      userType: 'therapist',
      phone: ValidationUtils.sanitizeString(body.phone),
      isActive: true,
      isVerified: false,
      onboardingCompleted: !!body.onboardingCompleted,
      createdAt: now,
      updatedAt: now
    };
    const userRes = await database.insertOne('users', userDoc);
    const userId = userRes.insertedId;

    const therapist = {
      clinicId: new ObjectId(body.clinicId),
      userId: new ObjectId(userId),
      displayName: ValidationUtils.sanitizeString(body.fullName),
      title: ValidationUtils.sanitizeString(body.title || 'Therapist'),
      specializations: body.specializations || [],
      experience: Number(body.experience || 0),
      education: body.education || [],
      certifications: body.certifications || [],
      consultationFee: Number(body.consultationFee || 0),
      sessionTypes: body.sessionTypes || ['video'],
      languages: body.languages || [],
      location: ValidationUtils.sanitizeString(body.location || ''),
      bio: ValidationUtils.sanitizeString(body.bio || ''),
      image: body.image || '',
      availability: body.availability || [],
      rating: 0,
      totalReviews: 0,
      verified: false,
      active: true,
      licenseNumber: ValidationUtils.sanitizeString(body.licenseNumber || ''),
      clinicAddress: ValidationUtils.sanitizeString(body.clinicAddress || ''),
      emergencyContact: ValidationUtils.sanitizeString(body.emergencyContact || ''),
      createdAt: now,
      updatedAt: now
    };
    const therapistsColl = await database.getCollection('therapists');
    const tRes = await therapistsColl.insertOne(therapist);

    await database.updateOne('clinics',{ _id: clinic._id }, { $addToSet: { therapists: tRes.insertedId }, $set: { updatedAt: new Date() } });

    return ResponseUtils.success({ therapistId: tRes.insertedId, userId, tempPassword: password }, 'Therapist added to clinic');
  } catch (e: any) {
    console.error('clinic add therapist error', e);
    return ResponseUtils.error('Failed to add therapist', 500, e?.message || 'error');
  }
}
