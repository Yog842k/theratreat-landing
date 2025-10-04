import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// Canonical therapist self-registration endpoint (TypeScript version)
// Handles: user creation, therapist profile document, agreement enforcement, basic validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      password,
      phoneNumber,
      isCompletingRegistration = true,
      ...rest
    } = body || {};

    if (!fullName || !email || !password || !phoneNumber) {
      return ResponseUtils.badRequest('Missing required account fields: fullName, email, password, phoneNumber');
    }

    const emailLower = String(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return ResponseUtils.badRequest('Invalid email format');
    }
    if (String(password).length < 8) {
      return ResponseUtils.badRequest('Password must be at least 8 characters long');
    }

    if (isCompletingRegistration) {
      const agreements = body.agreements || {};
      const required = [
        'accuracy','verification','guidelines','confidentiality','independent','norms','conduct',
        'terms','digitalConsent','secureDelivery','declaration','serviceAgreement'
      ];
      const missing = required.filter(k => !agreements[k]);
      if (missing.length) {
        return ResponseUtils.badRequest('All agreements must be accepted to complete registration', { unacceptedAgreements: missing });
      }
    }

    const existing = await database.findOne('users', { email: emailLower });
    if (existing) {
      return ResponseUtils.badRequest('User already exists with this email');
    }

    const hashedPassword = await AuthUtils.hashPassword(password);
    const now = new Date();

    const userDoc = {
      name: ValidationUtils.sanitizeString(fullName),
      email: emailLower,
      password: hashedPassword,
      userType: 'therapist',
      phone: ValidationUtils.sanitizeString(phoneNumber),
      isActive: true,
      isVerified: false,
      onboardingCompleted: isCompletingRegistration,
      createdAt: now,
      updatedAt: now
    };

    const userInsert = await database.insertOne('users', userDoc);
    const userId = userInsert.insertedId;

    const therapistDoc = {
      userId: new ObjectId(userId),
      fullName: ValidationUtils.sanitizeString(fullName),
      gender: ValidationUtils.sanitizeString(rest.gender || ''),
      dateOfBirth: rest.dateOfBirth || null,
      phoneNumber: ValidationUtils.sanitizeString(phoneNumber),
      email: emailLower,
      residentialAddress: ValidationUtils.sanitizeString(rest.residentialAddress || ''),
      currentCity: ValidationUtils.sanitizeString(rest.currentCity || ''),
      preferredLanguages: rest.preferredLanguages || [],
      panCard: ValidationUtils.sanitizeString(rest.panCard || ''),
      aadhaar: ValidationUtils.sanitizeString(rest.aadhaar || ''),
      qualification: ValidationUtils.sanitizeString(rest.qualification || ''),
      university: ValidationUtils.sanitizeString(rest.university || ''),
      graduationYear: ValidationUtils.sanitizeString(rest.graduationYear || ''),
      licenseNumber: ValidationUtils.sanitizeString(rest.licenseNumber || ''),
      designations: rest.designations || [],
      primaryConditions: rest.primaryConditions || [],
      experience: ValidationUtils.sanitizeString(rest.experience || ''),
      workplaces: ValidationUtils.sanitizeString(rest.workplaces || ''),
      onlineExperience: !!rest.onlineExperience,
      preferredDays: rest.preferredDays || [],
      preferredTimeSlots: rest.preferredTimeSlots || [],
      weeklySessions: ValidationUtils.sanitizeString(rest.weeklySessions || ''),
      sessionDurations: rest.sessionDurations || [],
      sessionFee: rest.sessionFee ? Number(rest.sessionFee) : null,
      dynamicPricing: !!rest.dynamicPricing,
      freeFirstSession: !!rest.freeFirstSession,
      paymentMode: ValidationUtils.sanitizeString(rest.paymentMode || ''),
      bankDetails: {
        accountHolder: ValidationUtils.sanitizeString(rest.bankDetails?.accountHolder || ''),
        bankName: ValidationUtils.sanitizeString(rest.bankDetails?.bankName || ''),
        accountNumber: ValidationUtils.sanitizeString(rest.bankDetails?.accountNumber || ''),
        ifscCode: ValidationUtils.sanitizeString(rest.bankDetails?.ifscCode || ''),
        upiId: ValidationUtils.sanitizeString(rest.bankDetails?.upiId || '')
      },
      hasClinic: !!rest.hasClinic,
      bio: ValidationUtils.sanitizeString(rest.bio || ''),
      linkedIn: ValidationUtils.sanitizeString(rest.linkedIn || ''),
      website: ValidationUtils.sanitizeString(rest.website || ''),
      instagram: ValidationUtils.sanitizeString(rest.instagram || ''),
      therapyLanguages: rest.therapyLanguages || [],
      agreements: body.agreements || {},
      displayName: ValidationUtils.sanitizeString(fullName),
      title: ValidationUtils.sanitizeString(rest.designations?.[0] || ''),
      specializations: rest.designations || [],
      languages: rest.preferredLanguages || [],
      sessionTypes: ['Online'],
      availability: [],
      consultationFee: rest.sessionFee ? Number(rest.sessionFee) : 0,
      currency: 'INR',
      isApproved: false,
      registrationCompleted: isCompletingRegistration,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now
    } as any;

    const therapistsColl = await database.getCollection('therapists');
    await therapistsColl.insertOne(therapistDoc);

    const token = AuthUtils.generateToken({ userId: userId.toString(), userType: 'therapist' });
    const { password: _pw, ...safeUser } = userDoc as any; (safeUser as any)._id = userId;

    return ResponseUtils.success({
      message: isCompletingRegistration ? 'Therapist registration completed successfully!' : 'Therapist account created successfully!',
      user: safeUser,
      token,
      therapist: therapistDoc,
      registrationCompleted: isCompletingRegistration
    }, 'Registration successful');
  } catch (err: any) {
    if (err?.message?.includes('duplicate key') || err?.code === 11000) {
      return ResponseUtils.badRequest('User already exists with this email');
    }
    return ResponseUtils.error(`Registration failed. ${err?.message || ''}`, 500, err?.stack || err?.message);
  }
}
