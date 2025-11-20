import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
const database = require('@/lib/database');
let AuthMiddleware = require('@/lib/middleware');
if (AuthMiddleware && AuthMiddleware.default && !AuthMiddleware.requireRole) {
  AuthMiddleware = AuthMiddleware.default;
}
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

/**
 * Check if a user has already joined a booking session
 * POST /api/bookings/[id]/check-join
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    const { id } = await context.params;
    const body = await request.json();
    const { userId } = body;

    if (!ValidationUtils.validateObjectId(id)) {
      return ResponseUtils.badRequest('Invalid booking ID');
    }

    const booking = await database.findOne('bookings', {
      _id: new ObjectId(id)
    });

    if (!booking) {
      return ResponseUtils.notFound('Booking not found');
    }

    // Check if user has permission to access this booking
    const isBookingOwner = booking.userId && booking.userId.toString() === user._id.toString();
    const isTherapist = user.userType === 'therapist' && booking.therapistId && booking.therapistId.toString() === user._id.toString();
    
    if (!isBookingOwner && !isTherapist) {
      return ResponseUtils.forbidden('You do not have access to this booking');
    }

    // Check if user has already joined
    const joinedUsers = booking.joinedUsers || [];
    const userToCheck = userId || user._id.toString();
    const alreadyJoined = joinedUsers.some((ju: any) => {
      const juId = typeof ju === 'string' ? ju : (ju.userId || ju);
      return juId.toString() === userToCheck.toString();
    });

    return ResponseUtils.success({ 
      alreadyJoined,
      joinedUsers: joinedUsers.length,
      bookingStatus: booking.status
    });
  } catch (error: any) {
    console.error('[Check Join] Error:', error);
    return ResponseUtils.errorCode('CHECK_JOIN_ERROR', 'Failed to check join status', 500);
  }
}

