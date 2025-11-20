const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export async function GET(request, context) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    const { id } = await context.params;

    if (!ValidationUtils.validateObjectId(id)) {
      return ResponseUtils.badRequest('Invalid booking ID');
    }

    // Build secure query (ownership enforcement)
    // Allow access if user is either the client OR the therapist
    const bookingQuery = { _id: new ObjectId(id) };
    
    // First, try to find the booking without role restriction
    let booking = await database.findOne('bookings', bookingQuery);
    
    if (!booking) {
      return ResponseUtils.notFound('Booking not found');
    }
    
    // Then verify the user has access (either as client or therapist)
    // Handle both ObjectId and string formats
    const userIdStr = String(user._id);
    const userIdObj = new ObjectId(user._id);
    
    // Normalize booking IDs to strings for comparison
    const bookingUserIdStr = booking.userId ? String(booking.userId) : null;
    const bookingTherapistIdStr = booking.therapistId ? String(booking.therapistId) : null;
    const bookingTherapistProfileIdStr = booking.therapistProfileId ? String(booking.therapistProfileId) : null;
    
    // Check if user is the client
    const isClient = bookingUserIdStr && (
      bookingUserIdStr === userIdStr || 
      bookingUserIdStr === userIdObj.toString() ||
      (booking.userId instanceof ObjectId && booking.userId.equals(userIdObj))
    );
    
    // Check if user is the therapist
    // Note: booking.therapistId might be the therapistProfileId (Therapist document _id), not the user's _id
    let isTherapist = false;
    
    // First check: direct match with user._id
    if (bookingTherapistIdStr) {
      isTherapist = (
        bookingTherapistIdStr === userIdStr || 
        bookingTherapistIdStr === userIdObj.toString() ||
        (booking.therapistId instanceof ObjectId && booking.therapistId.equals(userIdObj))
      );
    }
    
    // Second check: if booking.therapistId is actually a therapistProfileId, check if user owns that profile
    if (!isTherapist && user.userType === 'therapist') {
      try {
        // Check if booking.therapistId matches user's therapist profile _id
        const userTherapistProfile = await database.findOne('therapists', { userId: userIdObj });
        if (userTherapistProfile) {
          const userTherapistProfileIdStr = String(userTherapistProfile._id);
          // Check if booking.therapistId matches user's therapist profile
          if (bookingTherapistIdStr === userTherapistProfileIdStr) {
            isTherapist = true;
          }
          // Also check booking.therapistProfileId
          if (bookingTherapistProfileIdStr === userTherapistProfileIdStr) {
            isTherapist = true;
          }
        }
      } catch (e) {
        console.warn('[Booking Access] Error checking therapist profile:', e);
      }
    }
    
    // Debug logging
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Booking Access Check]', {
        userId: userIdStr,
        userType: user.userType,
        bookingUserId: bookingUserIdStr,
        bookingTherapistId: bookingTherapistIdStr,
        bookingTherapistProfileId: bookingTherapistProfileIdStr,
        isClient,
        isTherapist
      });
    }
    
    if (!isClient && !isTherapist) {
      return ResponseUtils.forbidden('You do not have access to this booking');
    }

    // Hydrate related entities
    const ownerUser = await database.findOne('users', { _id: booking.userId }, { projection: { name: 1, email: 1, phone: 1 } });
    const therapistUser = await database.findOne('users', { _id: booking.therapistId }, { projection: { name: 1, email: 1 } });
    let therapistProfile = null;
    if (booking.therapistProfileId) {
      therapistProfile = await database.findOne('therapists', { _id: booking.therapistProfileId });
    } else if (therapistUser) {
      // legacy embedded profile
      therapistProfile = therapistUser.therapistProfile || null;
    }

    const therapist = {
      name: (therapistProfile && (therapistProfile.displayName || therapistProfile.name)) || therapistUser?.name || 'Therapist',
      email: therapistUser?.email || null,
      consultationFee: therapistProfile?.consultationFee || 0,
      profile: therapistProfile || null
    };

    return ResponseUtils.success({ booking: { ...booking, user: ownerUser || null, therapist } });

  } catch (error) {
    console.error('Get booking error (simple path):', error);
    return ResponseUtils.error('Failed to fetch booking');
  }
}

export async function PATCH(request, context) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    const { id } = await context.params;
    const body = await request.json();

    if (!ValidationUtils.validateObjectId(id)) {
      return ResponseUtils.badRequest('Invalid booking ID');
    }

    // Get booking first
    const booking = await database.findOne('bookings', {
      _id: new ObjectId(id)
    });

    if (!booking) {
      return ResponseUtils.notFound('Booking not found');
    }

    // Check permissions
    const isBookingOwner = booking.userId && booking.userId.toString() === user._id.toString();
    const isUser = (user.userType === 'user' || user.userType === 'patient' || user.userType === 'client') && isBookingOwner;
    const isTherapist = user.userType === 'therapist' && booking.therapistId && booking.therapistId.toString() === user._id.toString();
    const isAdmin = user.userType === 'admin';

    if (!isUser && !isTherapist && !isAdmin) {
      return ResponseUtils.forbidden('Not authorized to update this booking');
    }

  const { status, notes, paymentStatus, meetingUrl, roomCode, callRoomId } = body;
  const updateData = { updatedAt: new Date() };

    // Status updates based on user role
    if (status) {
      if (user.userType === 'user' && ['cancelled'].includes(status)) {
        updateData.status = status;
      } else if (user.userType === 'therapist' && ['confirmed', 'completed', 'cancelled'].includes(status)) {
        updateData.status = status;
      } else if (user.userType === 'admin') {
        updateData.status = status;
      } else {
        return ResponseUtils.badRequest('Invalid status update for your role');
      }
    }

    if (notes !== undefined) {
      updateData.notes = ValidationUtils.sanitizeString(notes);
    }

    // Payment handling: only booking owner can mark paid
    if (paymentStatus) {
      if (!isBookingOwner && !isAdmin) {
        return ResponseUtils.forbidden('Only the booking owner can update payment status');
      }
      if (!['paid','pending','failed','refunded'].includes(paymentStatus)) {
        return ResponseUtils.badRequest('Invalid payment status');
      }
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && ['pending'].includes(booking.status)) {
        updateData.status = 'confirmed';
      }
    }

    // Meeting link updates: allowed for user, therapist, and admin
    if (meetingUrl !== undefined) {
      updateData.meetingUrl = meetingUrl || null;
    }
    if (roomCode !== undefined) {
      updateData.roomCode = roomCode || null;
    }
    if (callRoomId !== undefined) {
      updateData.callRoomId = callRoomId || null;
    }

    const result = await database.updateOne('bookings',
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return ResponseUtils.notFound('Booking not found');
    }

    return ResponseUtils.success(null, 'Booking updated successfully');

  } catch (error) {
    console.error('Update booking error:', error);
    return ResponseUtils.error('Failed to update booking');
  }
}
