import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { ObjectId } from 'mongodb';
import AuthMiddleware from '@/lib/middleware';

export async function GET(request: NextRequest, context: any) {
  try {
    // Handle both Promise and direct params (for Next.js version compatibility)
    const params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
    const { id } = params;
    console.log('[API] Therapist GET called with id:', id);
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Therapist ID is required' }, { status: 400 });
    }
    
    // Use database helper which has better connection handling
    let db: any;
    try {
      db = await database.connect();
    } catch (dbError: any) {
      // Database helper will use mock DB if connection fails (unless REQUIRE_DB=1)
      console.warn('[API] Database connection issue, will try to use available database:', dbError?.message || dbError);
      db = await database.connect(); // Try again - it should return mock DB
    }
    
    // Seed sample therapist data if using mock DB and therapist not found
    const isMockDb = (database as any).mock === true;
    if (isMockDb) {
      // Check if therapist exists first
      let existingTherapist = null;
      try {
        const objectId = new ObjectId(id);
        existingTherapist = await database.findOne('therapists', { _id: objectId });
      } catch {
        existingTherapist = await database.findOne('therapists', { _id: id });
      }
      
      if (!existingTherapist) {
        console.log('[API] Seeding sample therapist data for ID:', id);
        // Seed a sample therapist that matches the requested ID
        const sampleTherapist = {
          _id: id, // Use the requested ID so it matches
          displayName: 'Dr. Sarah Johnson',
          name: 'Dr. Sarah Johnson',
          title: 'Licensed Clinical Psychologist',
          specializations: ['Anxiety Disorders', 'Depression', 'Trauma Recovery'],
          experience: 8,
          consultationFee: 1500,
          price: 1500,
          photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
          image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
          rating: 4.9,
          reviewsCount: 156,
          reviews: 156,
          location: 'Mumbai, Maharashtra',
          bio: 'Experienced clinical psychologist specializing in anxiety, depression, and trauma therapy with a focus on CBT and mindfulness-based approaches.',
          sessionTypes: ['video', 'audio', 'clinic'],
          languages: ['English', 'Hindi'],
          isVerified: true,
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        try {
          const coll = await database.getCollection('therapists');
          await coll.insertOne(sampleTherapist);
          console.log('[API] Sample therapist seeded successfully with ID:', id);
        } catch (seedError) {
          console.warn('[API] Could not seed therapist:', seedError);
        }
      }
    }
    
    // Try to find therapist using database helper (works with both real and mock DB)
    let therapist;
    try {
      // Convert string ID to ObjectId if it's a valid MongoDB ObjectId  
      let objectId: ObjectId | null = null;
      try {
        objectId = new ObjectId(id);
      } catch {
        // If not a valid ObjectId, try as string match
        therapist = await database.findOne('therapists', { _id: id });
        if (!therapist) {
          // Also try with _id as string in mock DB
          const allTherapists = await database.findMany('therapists', {});
          therapist = allTherapists.find((t: any) => String(t._id) === String(id));
        }
      }
      
      if (objectId && !therapist) {
        // Try with ObjectId
        therapist = await database.findOne('therapists', { _id: objectId });
      }
      
      // If still not found, try with string _id match (for mock DB compatibility)
      if (!therapist) {
        const allTherapists = await database.findMany('therapists', {});
        therapist = allTherapists.find((t: any) => {
          const tId = t._id?.toString?.() || String(t._id || '');
          return tId === id || tId === String(objectId || '');
        });
      }
    } catch (queryError) {
      console.error('[API] Error querying therapist:', queryError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error finding therapist',
        error: queryError instanceof Error ? queryError.message : String(queryError)
      }, { status: 500 });
    }

    if (!therapist) {
      console.error('[API] Therapist not found for id:', id);
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    // --- PATCH: Always include pricing object in response ---
    let pricing = therapist.pricing || {};
    if (Object.keys(pricing).length === 0) {
      const fallbackVal = therapist.consultationFee ?? therapist.sessionFee ?? therapist.price ?? 0;
      pricing = { video: fallbackVal, audio: fallbackVal, clinic: fallbackVal, home: fallbackVal };
    } else {
      pricing = {
        video: pricing.video ?? therapist.consultationFee ?? therapist.sessionFee ?? therapist.price ?? 0,
        audio: pricing.audio ?? therapist.consultationFee ?? therapist.sessionFee ?? therapist.price ?? 0,
        clinic: pricing.clinic ?? therapist.consultationFee ?? therapist.sessionFee ?? therapist.price ?? 0,
        home: pricing.home ?? therapist.consultationFee ?? therapist.sessionFee ?? therapist.price ?? 0
      };
    }
    therapist.pricing = pricing;

    // Fetch latest availability/weekly slots
    let availability = [];
    try {
      const origin = request.nextUrl.origin;
      const dateKey = new Date().toISOString().split('T')[0];
      const availRes = await fetch(`${origin}/api/therapists/${id}/availability?date=${dateKey}`);
      const availJson = await availRes.json();
      if (availJson?.success && Array.isArray(availJson.data?.availability)) {
        availability = availJson.data.availability;
      }
    } catch (e) {
      console.warn('[API] Could not fetch therapist availability:', e);
    }
    therapist.availability = availability;

    console.log('[API] Therapist found:', { id: therapist._id, name: therapist.displayName || therapist.name, source: (database as any).mock ? 'mock' : 'real' });
    return NextResponse.json({ success: true, therapist });
  } catch (error) {
    console.error('[API] Internal server error in therapist GET:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error', 
      error: errMsg
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {
    // Authenticate user
    const user = await AuthMiddleware.authenticate(request);

    // Handle both Promise and direct params (for Next.js version compatibility)
    const params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Therapist ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      fullName,
      displayName,
      title,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      residentialAddress,
      currentCity,
      preferredLanguages,
      panCard,
      aadhaar,
      profilePhotoUrl,
      image,
      qualification,
      university,
      graduationYear,
      licenseNumber,
      qualificationCertUrls,
      licenseDocumentUrl,
      resumeUrl,
      designations,
      primaryConditions,
      primaryFilters,
      experience,
      workplaces,
      onlineExperience,
      preferredDays,
      preferredTimeSlots,
      weeklySessions,
      sessionDurations,
      sessionFee,
      dynamicPricing,
      freeFirstSession,
      paymentMode,
      bankDetails,
      hasClinic,
      bio,
      linkedIn,
      website,
      instagram,
      therapyLanguages,
      agreements,
      specializations,
      languages,
      sessionTypes,
      availability,
      consultationFee,
      currency,
      status,
      verified,
      verifiedAt,
      clinicAddress,
      location,
      isApproved,
      registrationCompleted,
      sessionModes,
      pricing
    } = body || {};

    // Build update object
    const updateData: any = { updatedAt: new Date() };

    // --- PATCH: Save pricing object if provided ---
    if (pricing && typeof pricing === 'object') {
      // Ensure all keys are numbers (not strings)
      const cleanPricing: any = {};
      ['video','audio','clinic','home'].forEach(key => {
        let val = pricing[key];
        if (typeof val === 'string') val = parseFloat(val) || 0;
        if (typeof val !== 'number' || isNaN(val)) val = 0;
        cleanPricing[key] = val;
      });
      updateData.pricing = cleanPricing;
    }

    // Verify that the user is updating their own therapist profile
    let therapist;
    try {
      const objectId = new ObjectId(id);
      therapist = await database.findOne('therapists', { _id: objectId });
    } catch {
      therapist = await database.findOne('therapists', { _id: id });
    }

    if (!therapist) {
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    // Check if user owns this therapist profile (userId should match)
    const therapistUserId = therapist.userId?.toString() || therapist.userId;
    const currentUserId = user._id?.toString() || user._id;

    if (therapistUserId !== currentUserId && user.userType !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized to update this profile' }, { status: 403 });
    }

    // Basic identity & contact
    if (name !== undefined) {
      updateData.displayName = name;
      updateData.name = name;
    }
    if (fullName !== undefined) updateData.fullName = fullName;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (title !== undefined) updateData.title = title;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (email !== undefined) updateData.email = email;
    if (residentialAddress !== undefined) updateData.residentialAddress = residentialAddress;
    if (currentCity !== undefined) updateData.currentCity = currentCity;
    if (preferredLanguages !== undefined && Array.isArray(preferredLanguages)) updateData.preferredLanguages = preferredLanguages;
    if (panCard !== undefined) updateData.panCard = panCard;
    if (aadhaar !== undefined) updateData.aadhaar = aadhaar;
    if (profilePhotoUrl !== undefined) updateData.profilePhotoUrl = profilePhotoUrl;
    if (image !== undefined) updateData.image = image;

    // Professional details
    if (qualification !== undefined) updateData.qualification = qualification;
    if (university !== undefined) updateData.university = university;
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (qualificationCertUrls !== undefined && Array.isArray(qualificationCertUrls)) updateData.qualificationCertUrls = qualificationCertUrls;
    if (licenseDocumentUrl !== undefined) updateData.licenseDocumentUrl = licenseDocumentUrl;
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
    if (designations !== undefined && Array.isArray(designations)) updateData.designations = designations;
    if (primaryConditions !== undefined && Array.isArray(primaryConditions)) updateData.primaryConditions = primaryConditions;
    if (primaryFilters !== undefined && Array.isArray(primaryFilters)) updateData.primaryFilters = primaryFilters;
    if (experience !== undefined) updateData.experience = experience;
    if (workplaces !== undefined) updateData.workplaces = workplaces;
    if (onlineExperience !== undefined) updateData.onlineExperience = !!onlineExperience;

    // Preferences & sessions
    if (preferredDays !== undefined && Array.isArray(preferredDays)) updateData.preferredDays = preferredDays;
    if (preferredTimeSlots !== undefined && Array.isArray(preferredTimeSlots)) updateData.preferredTimeSlots = preferredTimeSlots;
    if (weeklySessions !== undefined) updateData.weeklySessions = weeklySessions;
    if (sessionDurations !== undefined && Array.isArray(sessionDurations)) updateData.sessionDurations = sessionDurations;
    if (sessionFee !== undefined) updateData.sessionFee = typeof sessionFee === 'string' ? parseFloat(sessionFee) || 0 : sessionFee;
    if (dynamicPricing !== undefined) updateData.dynamicPricing = !!dynamicPricing;
    if (freeFirstSession !== undefined) updateData.freeFirstSession = !!freeFirstSession;
    if (paymentMode !== undefined) updateData.paymentMode = paymentMode;
    if (bankDetails !== undefined && typeof bankDetails === 'object') updateData.bankDetails = bankDetails;
    if (hasClinic !== undefined) updateData.hasClinic = !!hasClinic;

    // Public profile
    if (bio !== undefined) updateData.bio = bio;
    if (linkedIn !== undefined) updateData.linkedIn = linkedIn;
    if (website !== undefined) updateData.website = website;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (therapyLanguages !== undefined && Array.isArray(therapyLanguages)) updateData.therapyLanguages = therapyLanguages;
    if (agreements !== undefined && typeof agreements === 'object') updateData.agreements = agreements;
    if (specializations !== undefined && Array.isArray(specializations)) updateData.specializations = specializations;
    if (languages !== undefined && Array.isArray(languages)) updateData.languages = languages;
    if (sessionTypes !== undefined && Array.isArray(sessionTypes)) updateData.sessionTypes = sessionTypes;
    if (sessionModes !== undefined && Array.isArray(sessionModes)) updateData.sessionTypes = sessionModes;
    if (availability !== undefined && Array.isArray(availability)) updateData.availability = availability;
    if (consultationFee !== undefined) updateData.consultationFee = typeof consultationFee === 'string' ? parseFloat(consultationFee) || 0 : consultationFee;
    if (currency !== undefined) updateData.currency = currency;
    if (status !== undefined) updateData.status = status;
    if (verified !== undefined) updateData.verified = !!verified;
    if (verifiedAt !== undefined) updateData.verifiedAt = verifiedAt;
    if (isApproved !== undefined) updateData.isApproved = !!isApproved;
    if (registrationCompleted !== undefined) updateData.registrationCompleted = !!registrationCompleted;

    // Address
    if (clinicAddress !== undefined) updateData.clinicAddress = clinicAddress;
    if (location !== undefined) updateData.location = location;

    // If verification status is being updated, set both fields for compatibility
    if (body.isVerified !== undefined) {
      updateData.isVerified = body.isVerified;
      updateData.verified = body.isVerified;
    }
    if (body.verified !== undefined) {
      updateData.isVerified = body.verified;
      updateData.verified = body.verified;
    }

    // Update therapist in database
    const coll = await database.getCollection('therapists');
    let objectId: ObjectId | null = null;
    try {
      objectId = new ObjectId(id);
    } catch {
      // If not a valid ObjectId, use string
    }

    const filter = objectId ? { _id: objectId } : { _id: id };
    const result = await coll.updateOne(filter, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    // Fetch updated therapist
    const updatedTherapist = await database.findOne('therapists', filter);

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      therapist: updatedTherapist
    });
  } catch (error) {
    console.error('[API] Error updating therapist profile:', error);
    const errAny = error as any;
    const errMsg = error instanceof Error ? error.message : String(error);

    // Surface DB outages clearly (avoid misleading auth errors)
    if (Array.isArray(errAny?.reasons) && errAny.reasons.includes('db_error')) {
      return NextResponse.json({
        success: false,
        message: 'Database unavailable. Please try again shortly.',
        error: errMsg
      }, { status: 503 });
    }

    // Handle authentication errors
    if (errMsg.includes('auth') || errMsg.includes('token') || errMsg.includes('Unauthorized')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: errMsg
    }, { status: 500 });
  }
}
