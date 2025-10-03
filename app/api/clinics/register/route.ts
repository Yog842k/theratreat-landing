import type { NextRequest } from 'next/server';
const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

/**
 * Registers a clinic and creates an owner (or coordinator) user account.
 * Flow:
 *  - Validate required clinic + owner fields
 *  - Ensure clinic email & owner email not already used
 *  - Create owner user (userType=clinic-owner)
 *  - Create clinic document referencing owner
 *  - Return auth token for owner
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
  const required = ['clinicName','clinicAddress','city','state','pincode','contactNumber','email','yearsInOperation','ownerName','designation','ownerMobile','ownerEmail'];
    const missing = required.filter(f => !body[f]);
    if (missing.length) return ResponseUtils.badRequest('Missing required fields: ' + missing.join(', '));

    if (!Array.isArray(body.clinicType) || body.clinicType.length === 0) {
      return ResponseUtils.badRequest('At least one clinicType required');
    }
    if (!Array.isArray(body.therapiesOffered) || body.therapiesOffered.length === 0) {
      return ResponseUtils.badRequest('At least one therapy in therapiesOffered required');
    }
    if (!body.declarationAccepted || !body.termsAccepted) {
      return ResponseUtils.badRequest('Agreements must be accepted');
    }

    const password = body.ownerPassword || ValidationUtils.generateRandomString?.(12) || Math.random().toString(36).slice(2);
    if (password.length < 8) return ResponseUtils.badRequest('Owner password must be >= 8 chars');

    const emailLower = String(body.ownerEmail).toLowerCase();
    const existingUser = await database.findOne('users', { email: emailLower });
    if (existingUser) return ResponseUtils.badRequest('User already exists with ownerEmail');

    const clinicEmailLower = String(body.email).toLowerCase();
    const existingClinic = await database.findOne('clinics', { email: clinicEmailLower });
    if (existingClinic) return ResponseUtils.badRequest('Clinic already registered with this email');

    const now = new Date();
    const hashed = await AuthUtils.hashPassword(password);
    const ownerUser = {
      name: ValidationUtils.sanitizeString(body.ownerName),
      email: emailLower,
      password: hashed,
      userType: 'clinic-owner',
      phone: ValidationUtils.sanitizeString(body.ownerMobile || ''),
      isActive: true,
      isVerified: false,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now
    };
    const userRes = await database.insertOne('users', ownerUser);
    // Razorpay customer for clinic owner
    try {
      const { createRazorpayCustomer } = await import('@/lib/razorpay-customer');
      const rzpCustomer = await createRazorpayCustomer({ name: ownerUser.name, email: ownerUser.email, contact: ownerUser.phone, notes: { userType: 'clinic-owner' } });
      if (rzpCustomer) {
        await database.updateOne('users', { _id: userRes.insertedId }, { $set: { razorpay: { customerId: rzpCustomer.id, mode: rzpCustomer.mode, linkedAt: new Date() } } });
      }
    } catch (e: any) {
      console.warn('Razorpay link failed (clinic owner)', e?.message);
    }
    const ownerUserId = userRes.insertedId;

    const clinicDoc = {
      name: ValidationUtils.sanitizeString(body.clinicName),
      types: body.clinicType || [],
      address: ValidationUtils.sanitizeString(body.clinicAddress),
      city: ValidationUtils.sanitizeString(body.city),
      state: ValidationUtils.sanitizeString(body.state),
      pincode: ValidationUtils.sanitizeString(body.pincode),
      contactNumber: ValidationUtils.sanitizeString(body.contactNumber),
      email: clinicEmailLower,
      website: ValidationUtils.sanitizeString(body.website || ''),
      yearsInOperation: ValidationUtils.sanitizeString(body.yearsInOperation || ''),
      owner: {
        name: ValidationUtils.sanitizeString(body.ownerName),
        designation: ValidationUtils.sanitizeString(body.designation || ''),
        mobile: ValidationUtils.sanitizeString(body.ownerMobile || ''),
        email: emailLower
      },
      services: {
        therapiesOffered: body.therapiesOffered || [],
        inHouseTherapists: Number(body.inHouseTherapists || 0),
        externalTherapists: Number(body.externalTherapists || 0),
        onlineSessions: !!body.onlineSessions,
        sessionDuration: body.sessionDuration || '',
        sessionCharges: body.sessionCharges || '',
        assessmentReports: !!body.assessmentReports,
        homeVisits: !!body.homeVisits
      },
      bank: {
        accountHolderName: ValidationUtils.sanitizeString(body.accountHolderName || ''),
        bankName: ValidationUtils.sanitizeString(body.bankName || ''),
        accountNumber: ValidationUtils.sanitizeString(body.accountNumber || ''),
        ifscCode: ValidationUtils.sanitizeString(body.ifscCode || ''),
        upiId: ValidationUtils.sanitizeString(body.upiId || '')
      },
      agreements: {
        declarationAccepted: !!body.declarationAccepted,
        termsAccepted: !!body.termsAccepted
      },
      signatureDate: body.signatureDate || new Date().toISOString().split('T')[0],
      therapists: [],
      therapistRegistrationMode: 'managed',
      createdAt: now,
      updatedAt: now
    };
    const clinicRes = await database.insertOne('clinics', clinicDoc);
  // Assign generated _id back (cast to any to satisfy structural typing for inline object)
  (clinicDoc as any)._id = clinicRes.insertedId;

  // Token payload should be an object with userId & userType for consistency with auth endpoints
  const token = AuthUtils.generateToken({ userId: ownerUserId.toString(), userType: 'clinic-owner' });
  const { password: _pw, ...ownerResp } = ownerUser as any; (ownerResp as any)._id = ownerUserId;
  return ResponseUtils.success({ clinic: clinicDoc, owner: ownerResp, token }, 'Clinic registered');
  } catch (e: any) {
    console.error('clinic register error', { message: e?.message, stack: e?.stack, raw: e });
    return ResponseUtils.error('Clinic registration failed', 500, e?.message || 'error');
  }
}
