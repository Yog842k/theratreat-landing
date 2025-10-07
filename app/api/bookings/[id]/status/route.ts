import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Therapist from '@/lib/models/Therapist';
import TherapistEarning from '@/lib/models/TherapistEarning';
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

    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Auto-create earning when a session is marked completed AND payment is paid.
    // Conditions:
    // - Transition to 'completed' (was not previously completed)
    // - booking.paymentStatus === 'paid'
    // - No existing TherapistEarning for this booking (idempotent)
    if (status === 'completed' && previousStatus !== 'completed' && booking.paymentStatus === 'paid') {
      try {
        const existing = await TherapistEarning.findOne({ bookingId: booking._id });
        if (!existing) {
          // Optional platform fee calculation (placeholder: 10%)
          const platformFeePct = parseFloat(process.env.PLATFORM_FEE_PCT || '10');
            const rawAmount = booking.amount || 0;
            const platformFee = Math.round(rawAmount * (platformFeePct / 100));
            const therapistAmount = rawAmount - platformFee;

          await TherapistEarning.create({
            therapistId: booking.therapistId,
            bookingId: booking._id,
            amount: therapistAmount < 0 ? 0 : therapistAmount,
            currency: 'INR',
            status: 'available',
            meta: {
              platformFee,
              notes: `Auto release after session completion. Gross: ${rawAmount}`
            },
            releasedAt: new Date()
          });
        }
      } catch (e) {
        console.warn('Earning creation warning:', (e as any)?.message);
      }
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
