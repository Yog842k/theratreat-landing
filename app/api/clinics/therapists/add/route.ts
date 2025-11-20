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
 * Creates a therapist profile bound to clinicId (no user account needed).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    if (user.userType !== 'clinic-owner') return ResponseUtils.forbidden('Only clinic owners can add therapists');
    const body = await request.json();
    const required = ['fullName','clinicId'];
    const missing = required.filter(f => !body[f]);
    if (missing.length) return ResponseUtils.badRequest('Missing: ' + missing.join(', '));
    if (!ValidationUtils.validateObjectId(body.clinicId)) return ResponseUtils.badRequest('Invalid clinicId');
    const clinic = await database.findOne('clinics', { _id: new ObjectId(body.clinicId) });
    if (!clinic) return ResponseUtils.notFound('Clinic not found');
    if (String(clinic.owner?.email).toLowerCase() !== String(user.email).toLowerCase()) return ResponseUtils.forbidden('Not owner of clinic');

    const now = new Date();

    // Create therapist profile without user account
    const therapist = {
      clinicId: new ObjectId(body.clinicId),
      userId: null, // No user account - just a clinic therapist record
      displayName: ValidationUtils.sanitizeString(body.fullName),
      fullName: ValidationUtils.sanitizeString(body.fullName),
      email: body.email ? ValidationUtils.sanitizeString(body.email.toLowerCase()) : '',
      phone: body.phone ? ValidationUtils.sanitizeString(body.phone) : '',
      title: ValidationUtils.sanitizeString(body.title || 'Therapist'),
      specializations: body.specializations || [],
      therapyTypes: body.therapyTypes || [],
      primaryFilters: body.primaryFilters || [],
      conditions: body.conditions || [],
      primaryConditions: body.conditions || [], // Alias for backward compatibility
      experience: Number(body.experience || 0),
      education: body.education || [],
      certifications: body.certifications || [],
      consultationFee: Number(body.consultationFee || 0),
      sessionTypes: body.sessionTypes || ['video'],
      languages: body.languages || [],
      location: ValidationUtils.sanitizeString(body.location || ''),
      bio: ValidationUtils.sanitizeString(body.bio || ''),
      // Cloudinary URLs for uploaded documents
      image: body.image ? ValidationUtils.sanitizeString(body.image) : '',
      licenseDocument: body.licenseDocument ? ValidationUtils.sanitizeString(body.licenseDocument) : '',
      degreeDocument: body.degreeDocument ? ValidationUtils.sanitizeString(body.degreeDocument) : '',
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

    // Log uploaded document URLs for debugging
    if (body.image) console.log('Therapist photo URL:', body.image);
    if (body.licenseDocument) console.log('License document URL:', body.licenseDocument);
    if (body.degreeDocument) console.log('Degree document URL:', body.degreeDocument);
    const therapistsColl = await database.getCollection('therapists');
    const tRes = await therapistsColl.insertOne(therapist);

    await database.updateOne('clinics',{ _id: clinic._id }, { $addToSet: { therapists: tRes.insertedId }, $set: { updatedAt: new Date() } });

    return ResponseUtils.success({ therapistId: tRes.insertedId }, 'Therapist added to clinic');
  } catch (e: any) {
    console.error('clinic add therapist error', e);
    return ResponseUtils.error('Failed to add therapist', 500, e?.message || 'error');
  }
}
