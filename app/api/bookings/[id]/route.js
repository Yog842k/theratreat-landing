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
    const bookingQuery = { _id: new ObjectId(id) };
    if (user.userType === 'user') {
      bookingQuery.userId = new ObjectId(user._id);
    } else if (user.userType === 'therapist') {
      bookingQuery.therapistId = new ObjectId(user._id);
    }

    const booking = await database.findOne('bookings', bookingQuery);

    if (!booking) {
      return ResponseUtils.notFound('Booking not found');
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
    const isUser = user.userType === 'user' && booking.userId.toString() === user._id.toString();
    const isTherapist = user.userType === 'therapist' && booking.therapistId.toString() === user._id.toString();
    const isAdmin = user.userType === 'admin';

    if (!isUser && !isTherapist && !isAdmin) {
      return ResponseUtils.forbidden('Not authorized to update this booking');
    }

  const { status, notes, paymentStatus } = body;
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
      if (!isUser) {
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
