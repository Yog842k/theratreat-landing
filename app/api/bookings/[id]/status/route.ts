import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Therapist from '@/lib/models/Therapist';
const AuthMiddleware = require('@/lib/middleware');

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await AuthMiddleware.authenticate(request);

    const body = await request.json();
    const { status } = body || {};

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      );
    }

  await connectDB();

    // Ensure the booking exists and belongs to this therapist (if therapist)
  const { id } = await context.params;
  const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // If the user is a therapist, verify ownership
    if (user.userType === 'therapist') {
      const therapist = await Therapist.findOne({ userId: user._id });
      if (!therapist || String(booking.therapistId) !== String(therapist._id)) {
        return NextResponse.json(
          { success: false, message: 'Not authorized to update this booking' },
          { status: 403 }
        );
      }
    }

    // Update allowed statuses only
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    booking.status = status;
    await booking.save();

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
