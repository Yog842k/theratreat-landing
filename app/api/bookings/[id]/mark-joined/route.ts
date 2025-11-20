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
 * Mark a user as having joined a booking session
 * POST /api/bookings/[id]/mark-joined
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

    // Get or initialize joinedUsers array
    const joinedUsers = booking.joinedUsers || [];
    const userToAdd = userId || user._id.toString();
    
    // Check if user is already in the list
    const alreadyJoined = joinedUsers.some((ju: any) => {
      const juId = typeof ju === 'string' ? ju : (ju.userId || ju);
      return juId.toString() === userToAdd.toString();
    });

    if (!alreadyJoined) {
      // Add user to joined list with timestamp
      joinedUsers.push({
        userId: userToAdd,
        joinedAt: new Date(),
        userType: user.userType
      });

      // Update booking
      await database.updateOne('bookings', { _id: new ObjectId(id) }, {
        $set: {
          joinedUsers,
          updatedAt: new Date()
        }
      });
    }

    return ResponseUtils.success({ 
      joined: !alreadyJoined,
      message: alreadyJoined ? 'User already marked as joined' : 'User marked as joined successfully'
    });
  } catch (error: any) {
    console.error('[Mark Joined] Error:', error);
    return ResponseUtils.errorCode('MARK_JOINED_ERROR', 'Failed to mark user as joined', 500);
  }
}

