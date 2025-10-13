const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export async function POST(request) {
  try {
    const body = await request.json();
  const { email, password, name, userType, phone, patientData, profileImageUrl } = body;

    // Debug logging
    console.log('Registration request:', { email, name, userType, phone, hasPatientData: !!patientData });

    // Validate input
    const validationErrors = ValidationUtils.validateUserRegistration(body);
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return ResponseUtils.badRequest('Validation failed', validationErrors);
    }

    // Check if user already exists
    const existingUser = await database.findOne('users', { email });
    if (existingUser) {
      return ResponseUtils.badRequest('User already exists with this email');
    }

    // Enforce phone OTP verification if phone provided
    try {
      if (phone) {
        const { isPhoneVerified } = require('@/lib/otp');
        const purpose = userType === 'therapist' ? 'signup:therapist' : userType === 'clinic' ? 'signup:clinic' : 'signup:user';
        const verified = await isPhoneVerified({ phone, purpose });
        if (!verified) {
          return ResponseUtils.errorCode('OTP_REQUIRED', 'Phone not verified. Please complete OTP verification.', 409, { phone, purpose });
        }
      }
    } catch (e) { /* non-blocking if OTP utils unavailable */ }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Create user object
    const user = {
      name: ValidationUtils.sanitizeString(name),
      email: email.toLowerCase(),
      password: hashedPassword,
      userType,
      phone: phone || null,
      profileImage: profileImageUrl || null,
      isActive: true,
  isVerified: !!phone, // if phone verified via OTP flow we mark as verified; email verification can be separate
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add user-specific fields based on userType
    if (userType === 'therapist') {
      // Therapist detailed profile will live in separate `therapists` collection after onboarding
      user.onboardingCompleted = false;
    } else if (userType === 'instructor') {
      // Instructor profile setup
      user.onboardingCompleted = false;
      user.instructorProfile = {
        specializations: [],
        courses: [],
        certifications: []
      };
    } else if (userType === 'student') {
      // Student profile setup
      user.studentProfile = {
        enrolledCourses: [],
        completedCourses: [],
        preferences: {}
      };
    } else if (userType === 'clinic') {
      // Clinic profile setup
      user.onboardingCompleted = false;
      user.clinicProfile = {
        clinicName: '',
        address: {},
        services: [],
        staff: []
      };
    } else if (userType === 'user' || userType === 'patient') {
      // Patient/User profile setup
      if (patientData) {
        // If detailed patient data is provided (from onboarding), store it
        user.userProfile = {
          ...patientData,
          onboardingCompleted: true
        };
      } else {
        // Default patient profile for basic signup
        user.userProfile = {
          dateOfBirth: null,
          gender: '',
          emergencyContact: {},
          medicalHistory: [],
          preferences: {},
          onboardingCompleted: false
        };
      }
    }

    // Insert user
    const result = await database.insertOne('users', user);

    // Attempt Razorpay customer creation (non-blocking if fails)
    try {
      const { createRazorpayCustomer } = await import('@/lib/razorpay-customer');
      const rzpCustomer = await createRazorpayCustomer({ name: user.name, email: user.email, contact: user.phone || undefined, notes: { userType: user.userType } });
      if (rzpCustomer) {
        await database.updateOne('users', { _id: result.insertedId }, { $set: { razorpay: { customerId: rzpCustomer.id, mode: rzpCustomer.mode, linkedAt: new Date() } } });
      }
    } catch (e) {
      console.warn('Razorpay link failed (auth register)', (e)?.message);
    }
    
    // Generate token
    const token = AuthUtils.generateToken({ 
      userId: result.insertedId.toString(),
      userType 
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword._id = result.insertedId;

    // Fire-and-forget welcome notification (do not block response)
    import('@/lib/notifications').then(mod => {
      if (mod?.sendAccountWelcome) {
        mod.sendAccountWelcome({ email: user.email, name: user.name, phone: user.phone, userType: user.userType })
          .catch(e => console.warn('welcome notification failed', e?.message));
      }
    }).catch(() => {});

    return ResponseUtils.success({
      user: userWithoutPassword,
      token
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    return ResponseUtils.error('Registration failed');
  }
}
