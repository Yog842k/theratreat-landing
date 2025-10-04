const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');


export async function POST(request) {
  // Direct therapist self-registration ENABLED (previously disabled). Proceed with creation logic below.
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      password, 
      phoneNumber,
      isCompletingRegistration = true,
      ...profileData 
    } = body;

 
    if (!fullName || !email || !password || !phoneNumber) {
      return ResponseUtils.badRequest('Missing required account fields: fullName, email, password, phoneNumber');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ResponseUtils.badRequest('Invalid email format');
    }

    if (password.length < 8) {
      return ResponseUtils.badRequest('Password must be at least 8 characters long');
    }

    
    if (isCompletingRegistration) {
      const agreements = body.agreements || {};
      const requiredAgreements = ['accuracy', 'verification', 'guidelines', 'confidentiality', 'independent', 'norms', 'conduct', 'terms', 'digitalConsent', 'secureDelivery', 'declaration', 'serviceAgreement'];
      const unacceptedAgreements = requiredAgreements.filter(key => !agreements[key]);
      if (unacceptedAgreements.length > 0) {
        return ResponseUtils.badRequest('All agreements must be accepted to complete registration', { unacceptedAgreements });
      }
    }


    const existingUser = await database.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      return ResponseUtils.badRequest('User already exists with this email');
    }


    const hashedPassword = await AuthUtils.hashPassword(password);

    const now = new Date();


    const user = {
      name: ValidationUtils.sanitizeString(fullName),
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: 'therapist',
      phone: ValidationUtils.sanitizeString(phoneNumber),
      isActive: true,
      isVerified: false,
      onboardingCompleted: isCompletingRegistration,
      createdAt: now,
      updatedAt: now
    };


    const userResult = await database.insertOne('users', user);
    const userId = userResult.insertedId;

    const therapistsColl = await database.getCollection('therapists');
    
    const therapistDoc = {
      userId: new ObjectId(userId),
      

      fullName: ValidationUtils.sanitizeString(fullName),
      gender: ValidationUtils.sanitizeString(body.gender || ''),
      dateOfBirth: body.dateOfBirth || null,
      phoneNumber: ValidationUtils.sanitizeString(phoneNumber),
      email: email.toLowerCase(),
      residentialAddress: ValidationUtils.sanitizeString(body.residentialAddress || ''),
      currentCity: ValidationUtils.sanitizeString(body.currentCity || ''),
      preferredLanguages: body.preferredLanguages || [],
      panCard: ValidationUtils.sanitizeString(body.panCard || ''),
      aadhaar: ValidationUtils.sanitizeString(body.aadhaar || ''),
      
      
      qualification: ValidationUtils.sanitizeString(body.qualification || ''),
      university: ValidationUtils.sanitizeString(body.university || ''),
      graduationYear: ValidationUtils.sanitizeString(body.graduationYear || ''),
      licenseNumber: ValidationUtils.sanitizeString(body.licenseNumber || ''),
      
   
      designations: body.designations || [],
      primaryConditions: body.primaryConditions || [],
      experience: ValidationUtils.sanitizeString(body.experience || ''),
      workplaces: ValidationUtils.sanitizeString(body.workplaces || ''),
      onlineExperience: Boolean(body.onlineExperience),
      

      preferredDays: body.preferredDays || [],
      preferredTimeSlots: body.preferredTimeSlots || [],
      weeklySessions: ValidationUtils.sanitizeString(body.weeklySessions || ''),
      sessionDurations: body.sessionDurations || [],
      

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
      
 
      hasClinic: Boolean(body.hasClinic),

      bio: ValidationUtils.sanitizeString(body.bio || ''),
      linkedIn: ValidationUtils.sanitizeString(body.linkedIn || ''),
      website: ValidationUtils.sanitizeString(body.website || ''),
      instagram: ValidationUtils.sanitizeString(body.instagram || ''),
      therapyLanguages: body.therapyLanguages || [],

      agreements: body.agreements || {},
      
 
      displayName: ValidationUtils.sanitizeString(fullName),
      title: ValidationUtils.sanitizeString(body.designations?.[0] || ''),
      specializations: body.designations || [],
      languages: body.preferredLanguages || [],
      sessionTypes: ['Online'], // Default to online
      availability: [],
      consultationFee: body.sessionFee ? Number(body.sessionFee) : 0,
      currency: 'INR',
      
 
      isApproved: false,
      registrationCompleted: isCompletingRegistration,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now
    };


    await therapistsColl.insertOne(therapistDoc);


  // JWT payload must be a plain serializable object; previously passed raw ObjectId caused error
  const token = AuthUtils.generateToken({ userId: userId.toString(), userType: 'therapist' });


    const { password: _, ...userResponse } = user;
    userResponse._id = userId;

    return ResponseUtils.success({
      message: isCompletingRegistration ? 'Therapist registration completed successfully!' : 'Therapist account created successfully!',
      user: userResponse,
      token,
      therapist: therapistDoc,
      registrationCompleted: isCompletingRegistration
    }, 'Registration successful');

  } catch (err) {
    console.error('Therapist registration error:', err?.message, err?.stack);
    
    // Handle specific errors
    if (err?.message?.includes('duplicate key') || err?.code === 11000) {
      return ResponseUtils.badRequest('User already exists with this email');
    }
    
  // Return the original error message for easier debugging
  return ResponseUtils.error(`Registration failed. ${err?.message || ''}`, 500, err?.stack || err?.message);
  }
}
