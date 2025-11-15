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
    const { name, gender, experience, languages, clinicAddress, bio } = body;
    
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
    
    // Build update object
    const updateData: any = { updatedAt: new Date() };
    
    if (name !== undefined) {
      updateData.displayName = name;
      updateData.name = name;
    }
    
    if (gender !== undefined) {
      updateData.gender = gender;
    }
    
    if (experience !== undefined) {
      updateData.experience = experience;
    }
    
    if (languages !== undefined && Array.isArray(languages)) {
      updateData.languages = languages;
    }
    
    if (clinicAddress !== undefined) {
      updateData.clinicAddress = clinicAddress;
      updateData.location = clinicAddress;
    }
    
    if (bio !== undefined) {
      updateData.bio = bio;
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
    const errMsg = error instanceof Error ? error.message : String(error);
    
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
