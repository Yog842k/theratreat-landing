const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, userType, phone, patientData, profileImageUrl, profile } = body;

    const otpBypassEnabled = process.env.OTP_TEMP_BYPASS === '1';

    // Debug logging
    console.log('[register] Incoming registration request:', JSON.stringify(body));

    // Validate input
    const validationErrors = ValidationUtils.validateUserRegistration(body);
    if (validationErrors.length > 0) {
      console.log('[register] Validation errors:', validationErrors);
      return ResponseUtils.badRequest('Validation failed', validationErrors);
    }

    // Check if user already exists
    try {
      const existingUser = await database.findOne('users', { email });
      if (existingUser) {
        console.log('[register] User already exists:', email, existingUser);

        // If the existing user is an instructor, ensure instructor doc exists and return success with token
        if (existingUser.userType === 'instructor') {
          try {
            const existingInstructor = await database.findOne('instructors', {
              $or: [{ userId: existingUser._id }, { email: existingUser.email }]
            });
            if (!existingInstructor) {
              await database.insertOne('instructors', {
                userId: existingUser._id,
                email: existingUser.email,
                phone: existingUser.phone,
                name: existingUser.name,
                profile: profile || {},
                courseDraft: body.courseDraft || null,
                webinarDraft: body.webinarDraft || null,
                marketingConsent: Boolean(body.marketingConsent),
                createdAt: new Date(),
                updatedAt: new Date()
              });
              console.log('[register] Backfilled instructor doc for existing user');
            }
          } catch (e) {
            console.warn('[register] Instructor backfill failed', e?.message || e);
          }

          const { password: _pw, ...userWithoutPassword } = existingUser;
          const token = AuthUtils.generateToken({ userId: existingUser._id.toString(), userType: existingUser.userType });
          return ResponseUtils.success({ user: userWithoutPassword, token }, 'Instructor already exists. Returning existing account.', 200);
        }

        return ResponseUtils.badRequest('User already exists with this email');
      }
    } catch (findErr) {
      console.error('[register] Error checking for existing user:', findErr);
      return ResponseUtils.error('Database error during user existence check');
    }

    // Enforce phone OTP verification if phone provided
    try {
      if (phone) {
        const purpose = userType === 'therapist'
          ? 'signup:therapist'
          : userType === 'clinic'
            ? 'signup:clinic'
            : userType === 'instructor'
              ? 'signup:instructor'
              : 'signup:user';

        if (otpBypassEnabled) {
          console.warn('[register] OTP bypass enabled, skipping verification for', { phone, purpose });
        } else {
          const { isPhoneVerified } = require('@/lib/otp');
          const verified = await isPhoneVerified({ phone, purpose });
          console.log('[register] OTP check:', { phone, purpose, verified });
          if (!verified) {
            console.warn('[register] OTP not verified for', { phone, purpose });
            return ResponseUtils.errorCode('OTP_REQUIRED', 'Phone not verified. Please complete OTP verification.', 409, { phone, purpose });
          }
        }
      }
    } catch (e) {
      console.warn('[register] OTP check error', e?.message);
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await AuthUtils.hashPassword(password);
    } catch (hashErr) {
      console.error('[register] Password hash error:', hashErr);
      return ResponseUtils.error('Password hashing failed');
    }

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
        // Save city/state under address for Mongoose compatibility
        user.address = {
          city: profile?.city || '',
          state: profile?.state || '',
          country: 'India'
        };
      }
    }

    // Insert user
    let result;
    try {
      console.log('[register] Attempting to insert user:', JSON.stringify(user));
      result = await database.insertOne('users', user);
      console.log('[register] Insert result:', JSON.stringify(result));
    } catch (e) {
      console.error('[register] User insert failed:', e?.message, e, JSON.stringify(user));
      return ResponseUtils.error('Registration failed: could not save user');
    }
    if (!result || !result.insertedId) {
      console.error('[register] User insert did not return insertedId', JSON.stringify(result));
      return ResponseUtils.error('Registration failed: user not saved');
    }

    // Persist instructor record in dedicated collection when relevant
    if (userType === 'instructor') {
      try {
        const instructorDoc = {
          userId: result.insertedId,
          email: user.email,
          phone: user.phone,
          name: user.name,
          profile: profile || {},
          courseDraft: body.courseDraft || null,
          webinarDraft: body.webinarDraft || null,
          marketingConsent: Boolean(body.marketingConsent),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await database.insertOne('instructors', instructorDoc);
      } catch (e) {
        console.warn('[register] Instructor collection insert failed', e?.message || e);
        // do not block user creation; just log
      }
    }

    // Attempt Razorpay customer creation (non-blocking, never blocks user save)
    (async () => {
      try {
        const { createRazorpayCustomer } = await import('@/lib/razorpay-customer');
        const rzpCustomer = await createRazorpayCustomer({ name: user.name, email: user.email, contact: user.phone || undefined, notes: { userType: user.userType } });
        if (rzpCustomer) {
          const updateRes = await database.updateOne('users', { _id: result.insertedId }, { $set: { razorpay: { customerId: rzpCustomer.id, mode: rzpCustomer.mode, linkedAt: new Date() } } });
          if (!updateRes || updateRes.modifiedCount !== 1) {
            console.warn('[register] Razorpay info not saved to user', { userId: result.insertedId, rzpCustomer });
          }
        }
      } catch (e) {
        console.warn('Razorpay link failed (auth register)', (e)?.message);
      }
    })();
    
    // Generate token
    const token = AuthUtils.generateToken({ 
      userId: result.insertedId.toString(),
      userType 
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword._id = result.insertedId;

    // Fire-and-forget welcome notification (do not block response)
    // Attempt to send welcome email/SMS quickly and log result for debugging.
    // This uses a short timeout so registration response isn't delayed if notification services are slow.
    (async () => {
      try {
        const NOTIF_TIMEOUT_MS = Number(process.env.NOTIFICATIONS_TIMEOUT_MS || 2000);
        const mod = await import('@/lib/notifications');
        if (mod?.sendAccountWelcome) {
          const p = mod.sendAccountWelcome({ email: user.email, name: user.name, phone: user.phone, userType: user.userType });
          const result = await Promise.race([p, new Promise(res => setTimeout(() => res(null), NOTIF_TIMEOUT_MS))]);
          if (result) {
            console.log('[auth/register] welcome notification result', result);
            if (result.errors) {
              console.error('[auth/register] welcome notification errors:', result.errors);
            }
            if (!result.emailSent) {
              console.error('[auth/register] welcome email NOT sent for', user.email);
            }
            if (!result.smsSent) {
              console.error('[auth/register] welcome SMS NOT sent for', user.phone);
            }
          } else {
            console.warn('[auth/register] welcome notification timed out');
          }
        } else {
          console.error('[auth/register] sendAccountWelcome not found in notifications module');
        }
      } catch (e) {
        console.error('[auth/register] welcome notification setup failed', e?.message);
      }
    })();

    return ResponseUtils.success({
      user: userWithoutPassword,
      token
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    return ResponseUtils.error('Registration failed');
  }
}
