const database = require('@/lib/database');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export async function GET(request, context) {
  try {
    // Next.js 15+ requires awaiting dynamic params
    const { id } = await context.params;

    if (!ValidationUtils.validateObjectId(id)) {
      return ResponseUtils.badRequest('Invalid therapist ID');
    }

    // Try by therapist document _id first, then by userId
    let therapist = await database.findOne('therapists', { _id: new ObjectId(id) });
    if (!therapist) {
      therapist = await database.findOne('therapists', { userId: new ObjectId(id) });
    }

    if (!therapist) {
      // Backward compatibility: look in users collection (legacy embedding)
      const legacy = await database.findOne('users', {
        _id: new ObjectId(id),
        userType: 'therapist',
        isActive: true
      }, { projection: { password: 0, userProfile: 0 } });
      if (legacy?.therapistProfile) {
        therapist = {
          _id: legacy._id,
          userId: legacy._id,
            displayName: legacy.name,
            ...legacy.therapistProfile
        };
      }
    }

    if (!therapist) {
      return ResponseUtils.notFound('Therapist not found');
    }

    // Build a normalized nested profile matching requested shape
    const safeStr = (v) => (typeof v === 'string' ? v : (v ?? '')).toString();
    const toBool = (v, def = false) => typeof v === 'boolean' ? v : (v == null ? def : Boolean(v));
    const splitName = (full) => {
      const str = safeStr(full).trim();
      if (!str) return { firstName: '', lastName: '' };
      const parts = str.split(/\s+/);
      return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
    };
    const idStr = (therapist._id || therapist.userId || id)?.toString?.() || id;
    const nameInfo = splitName(therapist.fullName || therapist.displayName || therapist.name);

    const fullProfile = {
      _id: idStr,
      personalInfo: {
        firstName: nameInfo.firstName,
        lastName: nameInfo.lastName,
        email: safeStr(therapist.email || therapist.contactEmail),
        phone: safeStr(therapist.phoneNumber || therapist.phone || therapist.contactPhone),
        dateOfBirth: safeStr(therapist.dateOfBirth),
        gender: safeStr(therapist.gender)
      },
      professionalInfo: {
        licenseNumber: safeStr(therapist.licenseNumber),
        licenseState: safeStr(therapist.licenseState),
        licenseExpiry: safeStr(therapist.licenseExpiry),
        primarySpecialty: safeStr(
          (Array.isArray(therapist.specializations) && therapist.specializations[0])
            || therapist.title
        ),
        yearsOfExperience: safeStr(therapist.experience), // could be range like '6-10'
        currentEmployment: safeStr(therapist.currentEmployment),
        workplaceName: safeStr(therapist.workplaceName),
        workplaceAddress: safeStr(therapist.workplaces || therapist.workplaceAddress)
      },
      education: {
        highestDegree: safeStr(therapist.qualification),
        institution: safeStr(therapist.university),
        graduationYear: safeStr(therapist.graduationYear),
        continuingEducation: safeStr(therapist.continuingEducation)
      },
      practiceDetails: {
        practiceType: safeStr(therapist.practiceType),
        serviceTypes: Array.isArray(therapist.serviceTypes) ? therapist.serviceTypes : [],
        sessionFormats: Array.isArray(therapist.sessionTypes) ? therapist.sessionTypes : [],
        languages: Array.isArray(therapist.therapyLanguages) ? therapist.therapyLanguages : (Array.isArray(therapist.languages) ? therapist.languages : []),
        ageGroups: Array.isArray(therapist.ageGroups) ? therapist.ageGroups : [],
        availability: {
          workingDays: Array.isArray(therapist.preferredDays) ? therapist.preferredDays : [],
          preferredHours: Array.isArray(therapist.preferredTimeSlots) ? therapist.preferredTimeSlots : [],
          timeZone: safeStr(therapist.timeZone || 'IST')
        }
      },
      consultationFees: {
        amount: typeof therapist.sessionFee === 'number' ? therapist.sessionFee : (Number(therapist.consultationFee) || 0),
        currency: safeStr(therapist.currency || 'INR')
      },
      emergencyAvailability: toBool(therapist.emergencyAvailability, false),
      location: {
        primaryAddress: safeStr(therapist.residentialAddress || therapist.primaryAddress),
        city: safeStr(therapist.currentCity || therapist.city || therapist.location),
        state: safeStr(therapist.state),
        pincode: safeStr(therapist.pincode),
        onlineOnly: toBool(therapist.onlineOnly, true),
        clinicVisits: toBool(therapist.clinicVisits, !!therapist.hasClinic),
        homeVisits: toBool(therapist.homeVisits, false)
      },
      documents: {
        profilePicture: safeStr(therapist.profilePhotoUrl || therapist.profilePhoto || therapist.image || therapist.profilePicture)
      },
      agreements: therapist.agreements || {},
      createdAt: therapist.createdAt || new Date(),
      status: therapist.isApproved ? 'approved' : 'pending-review'
    };

    // Get recent reviews (always use the therapist document _id)
    const therapistIdForReviews = therapist._id ? new ObjectId(therapist._id) : new ObjectId(id);
    const reviews = await database.findMany('reviews', { therapistId: therapistIdForReviews }, {
      sort: { createdAt: -1 },
      limit: 5,
      projection: {
        rating: 1,
        comment: 1,
        createdAt: 1,
        'user.name': 1
      }
    });

    // Prefer profilePhotoUrl as main image for compatibility with UI
    if (!therapist.image && therapist.profilePhotoUrl) {
      therapist.image = therapist.profilePhotoUrl;
    }

    return ResponseUtils.success({
      therapist,
      fullProfile,
      reviews
    });

  } catch (error) {
    console.error('Get therapist error:', error);
    return ResponseUtils.error('Failed to fetch therapist');
  }
}
