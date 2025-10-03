import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
import { sendBookingConfirmation, notificationsEnabled } from '@/lib/notifications';

/**
 * PATCH /api/bookings/:id/cancel
 * Allows the booking owner (patient/user) to cancel a future booking.
 * - Updates status to 'cancelled' and records cancellationReason if provided.
 * - Prevents cancelling already completed or cancelled bookings.
 * - (Optional TODO) Could trigger cancellation notifications.
 */
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await AuthMiddleware.requireRole(request, ['user','patient']);
    const { id } = await ctx.params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success:false, message:'Invalid booking id' }, { status:400 });
    }

    const body = await request.json().catch(()=>({}));
    const reason = typeof body.reason === 'string' ? body.reason.slice(0,300) : undefined;

    const booking = await database.findOne('bookings', { _id: new ObjectId(id) });
    if (!booking) return NextResponse.json({ success:false, message:'Booking not found' }, { status:404 });
    if (String(booking.userId) !== String(user._id)) {
      return NextResponse.json({ success:false, message:'Not authorized to cancel this booking' }, { status:403 });
    }
    if (['completed','cancelled'].includes(booking.status)) {
      return NextResponse.json({ success:false, message:`Cannot cancel a ${booking.status} booking` }, { status:400 });
    }

    await database.updateOne('bookings', { _id: new ObjectId(id) }, { $set: { status:'cancelled', cancellationReason: reason || 'user_cancelled', updatedAt: new Date() } });

    // Fire & forget cancellation notification (reuse confirmation template lightly)
    if (notificationsEnabled()) {
      queueMicrotask(async () => {
        try {
          await sendBookingConfirmation({
            bookingId: id,
            userEmail: undefined,
            userName: undefined,
            userPhone: undefined,
            therapistName: undefined,
            sessionType: booking.sessionType,
            date: booking.date?.toISOString?.(),
            timeSlot: booking.timeSlot,
            roomCode: booking.roomCode,
            meetingUrl: booking.meetingUrl
          });
        } catch (e) { console.error('cancel notification error', e); }
      });
    }

    return NextResponse.json({ success:true, cancelled:true });
  } catch (e) {
    console.error('cancel booking error', e);
    return NextResponse.json({ success:false, message:'Failed to cancel booking' }, { status:500 });
  }
}
