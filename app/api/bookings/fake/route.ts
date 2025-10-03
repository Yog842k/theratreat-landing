import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { scheduleMeeting } from '@/lib/meeting-scheduler';
import { sendBookingConfirmation, notificationsEnabled } from '@/lib/notifications';
const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

/**
 * POST /api/bookings/fake
 * Dev-only flow to create a booking already marked as paid & confirmed (bypassing payment gateway).
 * - Requires authentication as user/patient.
 * - Automatically schedules a meeting (video/audio) and sends notifications (if configured).
 * Disabled in production for safety.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return ResponseUtils.forbidden('Disabled in production');
  }
  let user: any;
  try {
    user = await AuthMiddleware.requireRole(request, ['user','patient']);
  } catch (e: any) {
    const msg = e?.message || 'Authentication failed';
    if (/Insufficient permissions/i.test(msg)) return ResponseUtils.forbidden('Only end users can create fake bookings');
    return ResponseUtils.unauthorized('Authentication required');
  }

  try {
    const body = await request.json();
    const { therapistId, sessionType = 'video', date, timeSlot, notes, overrideEmail, overridePhone, overrideName } = body || {};
    const required = ['therapistId','sessionType','date','timeSlot'];
    const missing = ValidationUtils.validateRequiredFields(body, required);
    if (missing.length) return ResponseUtils.badRequest('Missing: ' + missing.join(', '));
    if (!ValidationUtils.validateObjectId(therapistId)) return ResponseUtils.badRequest('Invalid therapistId');

    let dateObj: Date;
    try { dateObj = new Date(date); if (isNaN(dateObj.getTime())) throw new Error(); } catch { return ResponseUtils.badRequest('Invalid date'); }

    // Normalize therapist reference (users collection id expected) fallback to therapists collection
    const therapistUser = await database.findOne('users', { _id: new ObjectId(therapistId), userType: 'therapist' });
    const therapistProfile = therapistUser?.therapistProfile || (await database.findOne('therapists', { _id: new ObjectId(therapistId) }));
    const therapistDisplay = therapistProfile?.displayName || therapistUser?.name || 'Therapist';

    // Initial booking insert (no meeting yet)
    const bookingDoc: any = {
      userId: new ObjectId(user._id),
      therapistId: therapistUser?._id || new ObjectId(therapistId),
      sessionType,
      date: dateObj,
      timeSlot,
      notes: ValidationUtils.sanitizeString(notes || ''),
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentInfo: {
        provider: 'fake',
        simulated: true,
        verifiedAt: new Date(),
        mode: 'dev'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const inserted = await database.insertOne('bookings', bookingDoc);
    bookingDoc._id = inserted.insertedId;

    // Meeting scheduling (video/audio only)
    if (['video','audio'].includes(sessionType)) {
      try {
        const sched = await scheduleMeeting({ bookingId: bookingDoc._id.toString() });
        await database.updateOne('bookings', { _id: bookingDoc._id }, { $set: { roomCode: sched.roomCode, meetingUrl: sched.meetingUrl, updatedAt: new Date() } });
        bookingDoc.roomCode = sched.roomCode; bookingDoc.meetingUrl = sched.meetingUrl;
      } catch (e) { console.error('scheduleMeeting(fake) failed', e); }
    }

    // Fire & forget notifications
    let notification: any = { skipped: true };
    if (notificationsEnabled()) {
      notification = { queued: true };
      queueMicrotask(async () => {
        try {
          const userDoc = await database.findOne('users', { _id: new ObjectId(user._id) });
          await sendBookingConfirmation({
            bookingId: bookingDoc._id.toString(),
            userEmail: overrideEmail || userDoc?.email,
            userName: overrideName || userDoc?.name,
            userPhone: overridePhone || userDoc?.phone,
            therapistName: therapistDisplay,
            sessionType: bookingDoc.sessionType,
            date: bookingDoc.date?.toISOString?.(),
            timeSlot: bookingDoc.timeSlot,
            roomCode: bookingDoc.roomCode,
            meetingUrl: bookingDoc.meetingUrl
          });
        } catch (e) { console.error('fake booking notification failed', e); }
      });
    }

    return ResponseUtils.success({ bookingId: bookingDoc._id, booking: bookingDoc, notification });
  } catch (e: any) {
    console.error('fake booking error', e);
    return ResponseUtils.error('Failed to create fake booking', 500, e?.message || 'error');
  }
}
