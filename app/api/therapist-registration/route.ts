import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');
import { sendAccountWelcome } from '@/lib/notifications';
import { OtpUtils } from '@/lib/otp';
import { Idfy } from '@/lib/idfy';

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
      otpCode,              // Provided when verifying OTP & completing registration
      skipOtp,              // (internal/testing) bypass OTP if set & allowed
      resendOtp,            // if true, force sending a new OTP
      isCompletingRegistration = true,
      ...rest
    } = body || {};

    if (!fullName || !email || !password || !phoneNumber) {
      return ResponseUtils.badRequest('Missing required account fields: fullName, email, password, phoneNumber');
    }

    // OTP Gate: Require phone verification before creating account (unless skipOtp allowed)
    const otpPurpose = 'therapist_registration';
    const otpEnforced = process.env.ENABLE_PHONE_OTP !== '0' && process.env.ENABLE_PHONE_OTP !== 'false';

    if (otpEnforced && !skipOtp) {
      // If no otpCode provided OR resend flag set -> send OTP and short-circuit response
      if (!otpCode || resendOtp) {
        const otpRes = await OtpUtils.requestOtp({ phone: phoneNumber, purpose: otpPurpose });
        if (!otpRes.ok) {
          const map: Record<string, { msg: string; status?: number; }> = {
            INVALID_PHONE: { msg: 'Invalid phone number format', status: 400 },
            TWILIO_NOT_CONFIGURED: { msg: 'OTP service not configured', status: 503 },
            SMS_SEND_FAILED: { msg: 'Failed to send OTP SMS', status: 502 },
            RATE_LIMITED: { msg: (otpRes as any)?.detail || 'Please wait before requesting another OTP', status: 429 },
          };
          const meta = map[otpRes.error as string] || { msg: 'Failed to send verification code', status: 400 };
          return ResponseUtils.errorCode(otpRes.error || 'OTP_ERROR', meta.msg, meta.status || 400, { detail: (otpRes as any).detail, retryAfter: (otpRes as any).retryAfter });
        }
        return ResponseUtils.success({
          otpSent: true,
          phone: (otpRes as any).phone,
          ttlMinutes: (otpRes as any).ttlMinutes,
          channel: (otpRes as any).channel,
          message: 'OTP sent to phone. Submit again with otpCode to complete registration.'
        }, 'OTP Sent', 202);
      }

      // Verify provided otpCode
      const verifyRes = await OtpUtils.verifyOtp({ phone: phoneNumber, purpose: otpPurpose, code: String(otpCode) });
      if (!verifyRes.ok) {
        const map: Record<string, { msg: string; status?: number; }> = {
          NOT_FOUND: { msg: 'OTP not found. Please request a new code.' },
          EXPIRED: { msg: 'OTP expired. Please request a new code.' },
          TOO_MANY_ATTEMPTS: { msg: 'Too many invalid attempts. Request a new code.' },
          INVALID_CODE: { msg: 'Incorrect OTP code.' },
          INVALID_PHONE: { msg: 'Invalid phone number format.' }
        };
        const meta = map[verifyRes.error || ''] || { msg: 'OTP verification failed.' };
        return ResponseUtils.errorCode(verifyRes.error || 'OTP_VERIFY_FAILED', meta.msg, meta.status || 400, verifyRes);
      }
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

      // PAN verification gate using IDfy (Aadhaar optional)
      const pan = String(rest.panCard || '').toUpperCase();
      const aadhaar = String(rest.aadhaar || ''); // optional, not enforced here
      const dob = String(rest.dateOfBirth || body.dateOfBirth || '').trim();
      if (!pan) {
        return ResponseUtils.badRequest('PAN is required for verification');
      }
      const panFormat = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!panFormat.test(pan)) {
        return ResponseUtils.badRequest('Invalid PAN format');
      }

      // Invoke IDfy PAN verification and compare user-provided name/DOB
      const idfyRes = await Idfy.verifyPan({ pan, name: fullName, dob });
      if (!idfyRes.ok) {
        return ResponseUtils.errorCode(idfyRes.error || 'PAN_VERIFY_FAILED', idfyRes.detail || 'Failed to verify PAN');
      }
  const nameMatch = !!idfyRes.match?.nameMatch;
  const dobMatch = !!idfyRes.match?.dobMatch;
      if (!nameMatch || !dobMatch) {
        return ResponseUtils.error('Provided details do not match PAN records', 400, {
          nameOnCard: idfyRes.nameOnCard,
          dobOnCard: idfyRes.dobOnCard,
          nameMatch,
          dobMatch
        });
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
      profileImage: rest.profilePhotoUrl ? ValidationUtils.sanitizeString(rest.profilePhotoUrl) : undefined,
      isActive: true,
      // Keep global account verification for manual admin approval flow.
      // Phone OTP only gates creation; admin sets isVerified=true later in dashboard.
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
      // Persist profile image URLs and also map to generic `image` for existing UI
      profilePhotoUrl: rest.profilePhotoUrl ? ValidationUtils.sanitizeString(rest.profilePhotoUrl) : '',
      image: rest.profilePhotoUrl ? ValidationUtils.sanitizeString(rest.profilePhotoUrl) : '',
      qualification: ValidationUtils.sanitizeString(rest.qualification || ''),
      university: ValidationUtils.sanitizeString(rest.university || ''),
      graduationYear: ValidationUtils.sanitizeString(rest.graduationYear || ''),
      licenseNumber: ValidationUtils.sanitizeString(rest.licenseNumber || ''),
      qualificationCertUrls: Array.isArray(rest.qualificationCertUrls) ? rest.qualificationCertUrls : [],
      licenseDocumentUrl: rest.licenseDocumentUrl ? ValidationUtils.sanitizeString(rest.licenseDocumentUrl) : '',
      resumeUrl: rest.resumeUrl ? ValidationUtils.sanitizeString(rest.resumeUrl) : '',
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

    // Fire-and-forget welcome notification (email/SMS) – never block response
    let notification: any = null;
    try {
      if (process.env.NOTIFICATIONS_DISABLE === '1') {
        // Explicitly disabled via env; skip sending
      } else {
        // Kick off in background with a short timeout guard
        (async () => {
          try {
            const timeoutMs = Number(process.env.NOTIFICATIONS_TIMEOUT_MS || 2000);
            const race = await Promise.race([
              sendAccountWelcome({ email: emailLower, name: fullName, phone: phoneNumber, userType: 'therapist' }),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
            ]);
            if (race) notification = race;
          } catch (e: any) {
            console.warn('[therapist-registration] welcome notification failed (background)', e?.message);
          }
        })();
      }
    } catch (notifyErr) {
      console.warn('[therapist-registration] welcome notification setup failed', (notifyErr as any)?.message);
    }

    return ResponseUtils.success({
      message: isCompletingRegistration ? 'Therapist registration completed successfully!' : 'Therapist account created successfully!',
      user: safeUser,
      token,
      therapist: therapistDoc,
      registrationCompleted: isCompletingRegistration,
      notification
    }, 'Registration successful');
  } catch (err: any) {
    if (err?.message?.includes('duplicate key') || err?.code === 11000) {
      return ResponseUtils.badRequest('User already exists with this email');
    }
    return ResponseUtils.error(`Registration failed. ${err?.message || ''}`, 500, err?.stack || err?.message);
  }
}
