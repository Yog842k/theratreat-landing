const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

/**
 * POST /api/therapist-onboarding
 * Creates or updates a comprehensive therapist profile in separate `therapists` collection.
 * Handles all registration steps from the comprehensive form.
 * Marks user.onboardingCompleted = true.
 */
export async function POST(request) {
  try {
    const user = await AuthMiddleware.requireRole(request, ['therapist']);
    const body = await request.json();

    // For comprehensive registration, allow step-by-step data collection
    // Required fields only for final submission (step 8)
    const isFinalStep = body.isCompletingRegistration || body.agreements;
    
    if (isFinalStep) {
      // Validate required fields for final submission
      const required = ['fullName', 'email', 'phoneNumber', 'qualification', 'licenseNumber'];
      const missing = ValidationUtils.validateRequiredFields(body, required);
      if (missing.length) {
        return ResponseUtils.badRequest('Missing required fields for registration completion', missing);
      }

      // Validate agreements are all accepted
      const agreements = body.agreements || {};
      const requiredAgreements = ['accuracy', 'verification', 'guidelines', 'confidentiality', 'independent', 'norms', 'conduct', 'terms', 'digitalConsent', 'secureDelivery', 'declaration', 'serviceAgreement'];
      const unacceptedAgreements = requiredAgreements.filter(key => !agreements[key]);
      if (unacceptedAgreements.length > 0) {
        return ResponseUtils.badRequest('All agreements must be accepted', { unacceptedAgreements });
      }
    }

    // Basic numeric validations for session fee and experience
    if (body.sessionFee !== undefined && body.sessionFee !== null && body.sessionFee !== '') {
      if (isNaN(body.sessionFee) || Number(body.sessionFee) < 0) {
        return ResponseUtils.badRequest('Invalid session fee');
      }
    }

    const therapistsColl = await database.getCollection('therapists');
    const now = new Date();

    // Comprehensive therapist profile data
    const doc = {
      userId: new ObjectId(user._id),
      
      // Personal & Contact Information
      fullName: ValidationUtils.sanitizeString(body.fullName) || user.name,
      gender: ValidationUtils.sanitizeString(body.gender || ''),
      dateOfBirth: body.dateOfBirth || null,
      phoneNumber: ValidationUtils.sanitizeString(body.phoneNumber) || user.phone,
      email: body.email || user.email,
      residentialAddress: ValidationUtils.sanitizeString(body.residentialAddress || ''),
      currentCity: ValidationUtils.sanitizeString(body.currentCity || ''),
      preferredLanguages: body.preferredLanguages || [],
      panCard: ValidationUtils.sanitizeString(body.panCard || ''),
      aadhaar: ValidationUtils.sanitizeString(body.aadhaar || ''),
      
      // Education & Credentials
      qualification: ValidationUtils.sanitizeString(body.qualification || ''),
      university: ValidationUtils.sanitizeString(body.university || ''),
      graduationYear: ValidationUtils.sanitizeString(body.graduationYear || ''),
      licenseNumber: ValidationUtils.sanitizeString(body.licenseNumber || ''),
      
      // Specialization & Experience
      designations: body.designations || [],
      primaryConditions: body.primaryConditions || [],
      experience: ValidationUtils.sanitizeString(body.experience || ''),
      workplaces: ValidationUtils.sanitizeString(body.workplaces || ''),
      onlineExperience: Boolean(body.onlineExperience),
      
      // Availability & Scheduling
      preferredDays: body.preferredDays || [],
      preferredTimeSlots: body.preferredTimeSlots || [],
      weeklySessions: ValidationUtils.sanitizeString(body.weeklySessions || ''),
      sessionDurations: body.sessionDurations || [],
      
      // Session Charges & Payment
      sessionFee: body.sessionFee ? Number(body.sessionFee) : null,
      dynamicPricing: Boolean(body.dynamicPricing),
      freeFirstSession: Boolean(body.freeFirstSession),
      paymentMode: ValidationUtils.sanitizeString(body.paymentMode || ''),
      bankDetails: {
        accountHolder: ValidationUtils.sanitizeString(body.bankDetails?.accountHolder || ''),
        bankName: ValidationUtils.sanitizeString(body.bankDetails?.bankName || ''),
        accountNumber: ValidationUtils.sanitizeString(body.bankDetails?.accountNumber || ''),
        ifscCode: ValidationUtils.sanitizeString(body.bankDetails?.ifscCode || ''),
        upiId: ValidationUtils.sanitizeString(body.bankDetails?.upiId || '')
      },
      
      // Clinic Setup
      hasClinic: Boolean(body.hasClinic),
      
      // Profile Details
      bio: ValidationUtils.sanitizeString(body.bio || ''),
      linkedIn: ValidationUtils.sanitizeString(body.linkedIn || ''),
      website: ValidationUtils.sanitizeString(body.website || ''),
      instagram: ValidationUtils.sanitizeString(body.instagram || ''),
      therapyLanguages: body.therapyLanguages || [],
      
      // Agreements & Consents
      agreements: body.agreements || {},
      
      // Legacy fields for compatibility
      displayName: ValidationUtils.sanitizeString(body.fullName || body.displayName) || user.name,
      title: ValidationUtils.sanitizeString(body.designations?.[0] || body.title || ''),
      specializations: body.designations || body.specializations || [],
      languages: body.preferredLanguages || body.languages || [],
      sessionTypes: ['Online'], // Default to online, can be updated later
      availability: body.availability || [],
      consultationFee: body.sessionFee ? Number(body.sessionFee) : (body.consultationFee ? Number(body.consultationFee) : 0),
      currency: body.currency || 'INR',
      
      // Status fields
      isApproved: false,
      registrationCompleted: isFinalStep,
      rating: 0,
      reviewCount: 0,
      updatedAt: now
    };
    // Upsert therapist profile (exclude createdAt from $set to avoid conflict)
    await therapistsColl.updateOne(
      { userId: new ObjectId(user._id) },
      { $set: doc, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );

    const saved = await therapistsColl.findOne({ userId: new ObjectId(user._id) });

    // Create Razorpay sub-account for split payments when bank details are provided (non-blocking)
    if (isFinalStep && body.bankDetails?.accountNumber && body.bankDetails?.ifscCode && body.bankDetails?.accountHolder) {
      (async () => {
        try {
          const { createRazorpaySubAccount } = await import('@/lib/razorpay-subaccount');
          const subAccount = await createRazorpaySubAccount({
            name: saved?.displayName || user.name,
            email: user.email,
            contact: user.phone,
            bankDetails: {
              accountHolderName: body.bankDetails.accountHolder,
              accountNumber: body.bankDetails.accountNumber,
              ifscCode: body.bankDetails.ifscCode,
              bankName: body.bankDetails.bankName,
              upiId: body.bankDetails.upiId
            },
            type: 'therapist',
            entityId: saved?._id?.toString() || ''
          });
          
          if (subAccount) {
            await therapistsColl.updateOne(
              { userId: new ObjectId(user._id) },
              {
                $set: {
                  razorpayAccountId: subAccount.id,
                  razorpayAccountMode: subAccount.mode,
                  razorpayAccountLinkedAt: new Date()
                }
              }
            );
            console.log('[THERAPIST ONBOARDING] Razorpay sub-account created:', subAccount.id);
          }
        } catch (e) {
          console.warn('[THERAPIST ONBOARDING] Razorpay sub-account creation failed (non-blocking):', e?.message);
          // Don't block registration - sub-account can be created later
        }
      })();
    }

    // Mark user onboarding completed only if final step
    if (isFinalStep) {
      await database.updateOne('users', { _id: new ObjectId(user._id) }, { 
        $set: { 
          onboardingCompleted: true, 
          updatedAt: now 
        } 
      });
    }

    return ResponseUtils.success({ 
      therapist: saved, 
      registrationCompleted: isFinalStep 
    }, isFinalStep ? 'Therapist registration completed successfully' : 'Therapist profile updated');
  } catch (err) {
    // Differentiate auth vs validation vs other errors for easier frontend debugging
    const msg = err?.message || 'Unknown error';
    if (/auth/i.test(msg) || /token/i.test(msg)) {
      return ResponseUtils.unauthorized('Authentication failed');
    }
    console.error('Therapist onboarding error:', msg, err?.stack);
    return ResponseUtils.error('Failed to save onboarding data', 500, msg);
  }
}

/**
 * GET /api/therapist-onboarding
 * Returns existing therapist profile (if any) for authenticated therapist.
 */
export async function GET(request) {
  try {
    const user = await AuthMiddleware.requireRole(request, ['therapist']);
    const therapist = await database.findOne('therapists', { userId: new ObjectId(user._id) });
    return ResponseUtils.success({ therapist });
  } catch (err) {
    return ResponseUtils.error('Failed to load onboarding data');
  }
}
