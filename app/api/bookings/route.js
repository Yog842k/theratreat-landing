const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export async function GET(request) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    // Build query based on user type
    let query = {};
    if (user.userType === 'user' || user.userType === 'patient') {
      query.userId = new ObjectId(user._id);
    } else if (user.userType === 'therapist') {
      query.therapistId = new ObjectId(user._id);
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Aggregation pipeline for bookings with user and therapist details
    // Using preserveNullAndEmptyArrays so bookings still show even if lookups fail
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            { $project: { name: 1, email: 1, phone: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'therapistId',
          foreignField: '_id',
          as: 'therapist',
          pipeline: [
            { $project: { name: 1, email: 1, therapistProfile: 1 } }
          ]
        }
      },
      // Make unwinds optional so bookings still appear even if user/therapist not found
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$therapist', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const bookings = await database.aggregate('bookings', pipeline);
    
    console.log('[GET /api/bookings] Query result:', {
      userType: user.userType,
      userId: user._id,
      query: JSON.stringify(query),
      bookingsCount: bookings.length,
      sampleBooking: bookings[0] ? {
        _id: bookings[0]._id?.toString(),
        userId: bookings[0].userId?.toString(),
        therapistId: bookings[0].therapistId?.toString(),
        status: bookings[0].status,
        hasUser: !!bookings[0].user,
        hasTherapist: !!bookings[0].therapist
      } : null
    });

    // Get total count
    const totalCount = await database.aggregate('bookings', [
      { $match: query },
      { $count: 'total' }
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return ResponseUtils.success({
      bookings,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return ResponseUtils.error('Failed to fetch bookings');
  }
}

export async function POST(request) {
  try {
    let user;
    try {
      // Accept both legacy 'user' and explicit 'patient' roles as end-users
      user = await AuthMiddleware.requireRole(request, ['user', 'patient']);
    } catch (e) {
      // If auth ok but wrong role, surface a 403 with clear message instead of generic 500
      const msg = e?.message || '';
      if (/Insufficient permissions/i.test(msg)) {
        // Try to get user info to provide specific message
        try {
          const user = await AuthMiddleware.authenticate(request);
          if (user?.userType === 'clinic-owner') {
            return ResponseUtils.forbidden('Clinic accounts cannot book therapy sessions. Please use a patient account.');
          }
        } catch {}
        return ResponseUtils.forbidden('Only end users (patients) can create bookings. Therapists, admins, and clinic owners cannot book sessions.');
      }
      if (/Authentication failed/i.test(msg)) {
        return ResponseUtils.unauthorized('Authentication failed');
      }
      return ResponseUtils.error('Authorization error', 500, msg);
    }
    const body = await request.json();
    
    const {
      therapistId,
      appointmentDate,
      appointmentTime,
      sessionType,
      notes
    } = body;

    // Validate required fields
    const required = ['therapistId', 'appointmentDate', 'appointmentTime', 'sessionType'];
    const missing = ValidationUtils.validateRequiredFields(body, required);
    
    if (missing.length > 0) {
      return ResponseUtils.badRequest(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!ValidationUtils.validateObjectId(therapistId)) {
      return ResponseUtils.badRequest('Invalid therapist ID');
    }

    // Parse date (accept YYYY-MM-DD or full ISO)
    let apptDate;
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
        apptDate = new Date(`${appointmentDate}T00:00:00.000Z`);
      } else {
        apptDate = new Date(appointmentDate);
      }
      if (isNaN(apptDate.getTime())) throw new Error('Invalid date');
    } catch {
      return ResponseUtils.badRequest('Invalid appointment date format');
    }

    // Resolve therapist: support legacy (users collection) and new separate therapists collection ID
    let therapistUser = await database.findOne('users', {
      _id: new ObjectId(therapistId),
      userType: 'therapist',
      isActive: true
    });
    let therapistProfile = null;
    let therapistProfileId = null;

    if (!therapistUser) {
      // Treat provided ID as therapists collection document (allow even if not yet approved)
      therapistProfile = await database.findOne('therapists', { _id: new ObjectId(therapistId) });
      if (therapistProfile) {
        therapistProfileId = therapistProfile._id;
        // Load owning user
        therapistUser = await database.findOne('users', { _id: therapistProfile.userId, userType: 'therapist', isActive: true });
      }
    } else {
      // Legacy embedded profile scenario
      therapistProfile = therapistUser.therapistProfile || null;
    }

    if (!therapistUser) {
      return ResponseUtils.notFound('Therapist not found or not available');
    }

    // Consultation fee precedence: separate profile -> embedded -> 0
    const consultationFee = (therapistProfile && therapistProfile.consultationFee) || (therapistUser.therapistProfile && therapistUser.therapistProfile.consultationFee) || 0;

    // Determine base price using session type (server-side dynamic pricing)
    // Matches UI defaults: video=999, audio=499, clinic=699, home=1299
    let baseAmount = Number(consultationFee || 0);
    try {
      const { getSessionBasePrice } = require('@/lib/pricing');
      baseAmount = getSessionBasePrice(sessionType, consultationFee);
    } catch (e) {
      // If pricing module missing for any reason, keep consultationFee
      console.warn('pricing module unavailable, using consultationFee', e?.message || e);
    }

    // Check for existing booking at the same time
    // Only block if there's an actual conflict with another booking
    // IMPORTANT: Also check userId to prevent same user from booking same slot twice
    const existingBooking = await database.findOne('bookings', {
      $or: [
        { therapistId: therapistUser._id },
        { therapistProfileId: therapistProfileId || therapistUser._id }
      ],
      appointmentDate: apptDate,
      appointmentTime,
      status: { $in: ['pending', 'confirmed', 'active'] }, // Include 'active' status
      _id: { $ne: null } // Exclude current booking if updating
    });

    if (existingBooking) {
      // Check if it's the same user trying to book the same slot again
      const existingUserId = existingBooking.userId ? String(existingBooking.userId) : null;
      const currentUserId = String(user._id);
      
      if (existingUserId === currentUserId) {
        // Same user, same slot - this might be a duplicate request
        // Check if booking was just created (within last 5 seconds)
        const bookingAge = existingBooking.createdAt 
          ? (Date.now() - new Date(existingBooking.createdAt).getTime()) 
          : Infinity;
        
        if (bookingAge < 5000) {
          // Very recent booking - likely a duplicate request, return the existing booking
          console.log('[bookings/route] Duplicate booking request detected, returning existing booking:', {
            existingBookingId: existingBooking._id,
            bookingAge: bookingAge + 'ms'
          });
          return ResponseUtils.success({ booking: existingBooking, isDuplicate: true }, 'Booking already exists');
        }
      }
      
      console.log('[bookings/route] Time slot conflict detected:', {
        existingBookingId: existingBooking._id,
        therapistId: therapistUser._id,
        date: apptDate,
        time: appointmentTime,
        existingUserId,
        currentUserId
      });
      return ResponseUtils.badRequest('Time slot is already booked');
    }

    // Additional check: Verify therapist is available at this time (if schedule exists)
    // This is a soft check - we don't block, just log if outside schedule
    if (therapistProfile && therapistProfile.availability) {
      const dayOfWeek = apptDate.getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];
      const daySchedule = therapistProfile.availability.find((avail) => 
        avail.day && avail.day.toLowerCase() === dayName
      );
      
      if (daySchedule && daySchedule.slots) {
        const slotAvailable = daySchedule.slots.some((slot) => 
          slot.startTime === appointmentTime && slot.isAvailable !== false
        );
        
        if (!slotAvailable && daySchedule.slots.length > 0) {
          console.warn('[bookings/route] ⚠️ Booking outside therapist schedule:', {
            dayName,
            appointmentTime,
            availableSlots: daySchedule.slots.map((s) => s.startTime)
          });
          // Note: We allow this but log it - therapist can override their schedule
        }
      }
    }

    // Create booking first to get unique ID
    const booking = {
      userId: new ObjectId(user._id),
      therapistId: therapistProfileId || therapistUser._id, // always prefer therapistProfileId for therapistId
      therapistProfileId: therapistProfileId, // may be null for legacy
      appointmentDate: apptDate,
      appointmentTime,
      sessionType,
      notes: ValidationUtils.sanitizeString(notes || ''),
      status: 'pending',
      totalAmount: baseAmount,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      meetingUrl: null,
      roomCode: null
    };

    const result = await database.insertOne('bookings', booking);
    // attach _id for client convenience
    booking._id = result.insertedId;
    
    // Create meeting room based on session type
    // Video consultation → 100ms video room
    // Audio consultation → 100ms audio-only call room
    // In-clinic/Home-visit → No room needed
    let meetingUrl = null;
    let roomCode = null;
    let callRoomId = null;
    
    if (sessionType === 'video' || sessionType === 'audio') {
      try {
        // Use the same logic as /100ms-room-test - create room directly using SDK
        const { createRoom } = require('@/lib/hms');
        const templateId = process.env.HMS_TEMPLATE_ID;
        
        // Check if HMS credentials are configured
        const hasAccessKey = !!process.env.HMS_ACCESS_KEY;
        const hasSecret = !!process.env.HMS_SECRET;
        const hasManagementToken = !!process.env.HMS_MANAGEMENT_TOKEN;
        
        if (!templateId) {
          console.warn('[bookings/route] HMS_TEMPLATE_ID not set, room will be created on-demand when user joins');
        } else if (!hasAccessKey || !hasSecret) {
          console.warn('[bookings/route] HMS_ACCESS_KEY or HMS_SECRET not configured, room will be created on-demand when user joins');
        } else {
          const therapistIdStr = String(booking.therapistId || booking.therapistProfileId || 'therapist').slice(-6);
          const patientIdStr = String(booking.userId || booking.clientId || 'patient').slice(-6);
          
          console.log(`[bookings/route] Creating ${sessionType} room for booking:`, {
            bookingId: booking._id.toString(),
            therapistId: therapistIdStr,
            patientId: patientIdStr,
            sessionType: booking.sessionType,
            hasAccessKey,
            hasSecret,
            hasManagementToken
          });
          
          try {
            // Try using SDK first
            const room = await createRoom({
              therapistId: therapistIdStr,
              patientId: patientIdStr,
              templateId: templateId
            });
            
            if (room && room.id) {
              callRoomId = room.id;
              
              console.log(`[bookings/route] ✅ Successfully created ${sessionType} room via SDK:`, {
                roomId: callRoomId,
                roomName: room.name,
                sessionType: sessionType
              });
              
              // Update booking with room ID
              await database.updateOne('bookings', { _id: booking._id }, {
                $set: {
                  callRoomId: callRoomId,
                  updatedAt: new Date()
                }
              });
              booking.callRoomId = callRoomId;
            } else {
              console.warn(`[bookings/route] ⚠️ Room creation via SDK returned invalid response:`, room);
              // Fallback to API route if SDK fails
              throw new Error('SDK returned invalid response');
            }
          } catch (sdkError) {
            const sdkErrorMsg = sdkError?.message || String(sdkError);
            const sdkErrorStack = sdkError?.stack;
            const sdkErrorDetails = {
              message: sdkErrorMsg,
              name: sdkError?.name,
              code: sdkError?.code,
              ...(sdkErrorStack && { stack: sdkErrorStack })
            };
            
            console.warn(`[bookings/route] ⚠️ SDK room creation failed, trying API route:`, sdkErrorDetails);
            
            // Fallback to API route if SDK fails and management token is available
            if (hasManagementToken) {
              try {
                const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/100ms-room/create`;
                const apiPayload = {
                  name: `therabook-${booking._id.toString()}-${Date.now()}`,
                  description: `Therapy session for booking ${booking._id.toString()}`,
                  template_id: templateId,
                  region: 'auto'
                };
                
                console.log(`[bookings/route] 🔄 Calling API fallback:`, { apiUrl, payload: apiPayload });
                
                const apiResponse = await fetch(apiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(apiPayload)
                });
                
                const apiData = await apiResponse.json();
                
                console.log(`[bookings/route] 📥 API fallback response:`, {
                  status: apiResponse.status,
                  ok: apiResponse.ok,
                  success: apiData.success,
                  hasRoom: !!(apiData.room && apiData.room.id),
                  error: apiData.error,
                  message: apiData.message
                });
                
                if (apiData.success && apiData.room && apiData.room.id) {
                  callRoomId = apiData.room.id;
                  
                  console.log(`[bookings/route] ✅ Successfully created ${sessionType} room via API:`, {
                    roomId: callRoomId,
                    sessionType: sessionType
                  });
                  
                  // Update booking with room ID
                  await database.updateOne('bookings', { _id: booking._id }, {
                    $set: {
                      callRoomId: callRoomId,
                      updatedAt: new Date()
                    }
                  });
                  booking.callRoomId = callRoomId;
                } else {
                  console.warn(`[bookings/route] ⚠️ API route returned unsuccessful response:`, {
                    status: apiResponse.status,
                    data: apiData
                  });
                  // Don't throw - room will be created on-demand
                }
              } catch (apiError) {
                console.error(`[bookings/route] ❌ API route fallback failed with exception:`, {
                  error: apiError?.message || String(apiError),
                  stack: apiError?.stack,
                  name: apiError?.name
                });
                // Don't throw - room will be created on-demand
              }
            } else {
              console.warn(`[bookings/route] ⚠️ HMS_MANAGEMENT_TOKEN not configured, cannot use API fallback`);
              // Don't throw - room will be created on-demand
            }
          }
        }
      } catch (e) {
        console.error(`[bookings/route] ❌ Failed to create ${sessionType} meeting room:`, {
          error: e.message,
          stack: e.stack,
          bookingId: booking._id.toString(),
          sessionType: sessionType
        });
        // Don't fail the booking - room can be created on-demand when joining
        // The booking will be created without a room, which will be created when user joins
      }
    } else {
      console.log('[bookings/route] Skipping room creation for in-person session:', {
        bookingId: booking._id.toString(),
        sessionType: sessionType
      });
    }

    // Fire & forget immediate receipt notification (email/SMS) if configured
    try {
      const { notificationsEnabled, sendBookingReceipt, sendBookingConfirmation } = require('@/lib/notifications');
      if (notificationsEnabled && notificationsEnabled()) {
        queueMicrotask(async () => {
          try {
            const fullUser = await database.findOne('users', { _id: new ObjectId(user._id) });
            const therapistDoc = therapistProfile || (therapistProfileId ? await database.findOne('therapists', { _id: therapistProfileId }) : null);
            // Notify patient
            await sendBookingReceipt({
              bookingId: booking._id.toString(),
              userEmail: fullUser?.email,
              userName: fullUser?.name,
              userPhone: fullUser?.phone,
              therapistName: therapistDoc?.displayName || therapistUser?.name,
              sessionType: booking.sessionType,
              date: booking.appointmentDate?.toISOString?.(),
              timeSlot: booking.appointmentTime,
              meetingUrl: booking.meetingUrl || null,
              roomCode: booking.roomCode || null
            });
            // Notify therapist
            await sendBookingConfirmation({
              bookingId: booking._id.toString(),
              userEmail: therapistUser?.email,
              userName: therapistUser?.name,
              userPhone: therapistUser?.phone,
              therapistName: therapistDoc?.displayName || therapistUser?.name,
              sessionType: booking.sessionType,
              date: booking.appointmentDate?.toISOString?.(),
              timeSlot: booking.appointmentTime,
              meetingUrl: booking.meetingUrl || null,
              roomCode: booking.roomCode || null
            });
          } catch (e) { console.error('sendBookingReceipt/Confirmation failed', e); }
        });
      }
    } catch (e) { /* ignore */ }

    return ResponseUtils.success({
      bookingId: result.insertedId,
      booking
    }, 'Booking created successfully', 201);

  } catch (error) {
    console.error('Create booking error (detailed):', error);
    const msg = error?.message || 'Failed to create booking';
    // If this was thrown earlier intentionally we may still have a generic message
    return ResponseUtils.error('Failed to create booking', 500, msg);
  }
}
