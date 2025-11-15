import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { selectMode, resolveSecret, isSimulationEnabled } from '@/lib/razorpay-creds';
import { sendBookingConfirmation, notificationsEnabled } from '@/lib/notifications';
// Lazy import to avoid type resolution issues in certain build modes
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sendTenMinuteReminder } = require('@/lib/ten-minute-reminder');
import { scheduleMeeting } from '@/lib/meeting-scheduler';
const database = require('@/lib/database');
let AuthMiddleware = require('@/lib/middleware');
// If middleware exported as default (CommonJS interop), unwrap so requireRole is accessible
if (AuthMiddleware && AuthMiddleware.default && !AuthMiddleware.requireRole) {
  AuthMiddleware = AuthMiddleware.default;
}
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// Mode & secret resolution now centralized in lib/razorpay-creds.ts

export async function POST(request: NextRequest) {
  try {
    let user: any;
    try {
      user = await AuthMiddleware.requireRole(request, ['user','patient']);
    } catch (e: any) {
      const msg = e?.message || 'Authentication failed';
      if (msg === 'Insufficient permissions') {
        return ResponseUtils.errorCode('FORBIDDEN', 'Insufficient permissions', 403);
      }
      return ResponseUtils.errorCode('AUTH_REQUIRED', 'Authentication required', 401);
    }
    const body = await request.json();
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body || {};

    if (!bookingId || !ValidationUtils.validateObjectId(bookingId)) {
      return ResponseUtils.badRequest('Valid bookingId is required');
    }
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return ResponseUtils.badRequest('Missing Razorpay verification fields');
    }

    const booking = await database.findOne('bookings', { _id: new ObjectId(bookingId), userId: new ObjectId(user._id) });
    if (!booking) return ResponseUtils.notFound('Booking not found');

    const mode = selectMode();

    // Simulation acceptance (if RAZORPAY_SIMULATED=1 and values look fabricated)
    if (isSimulationEnabled() && razorpay_payment_id.startsWith('pay_FAKE')) {
      // Schedule meeting if session is real-time (video/audio)
      let scheduled: any = null;
      if (['video','audio'].includes(booking.sessionType)) {
        scheduled = await scheduleMeeting({ 
          bookingId, 
          existingRoomCode: booking.roomCode, 
          existingMeetingUrl: booking.meetingUrl,
          sessionType: booking.sessionType as 'video' | 'audio'
        });
      }
      await database.updateOne('bookings', { _id: new ObjectId(bookingId) }, {
        $set: {
          paymentStatus: 'paid',
            status: booking.status === 'pending' ? 'confirmed' : booking.status,
          paymentInfo: {
            provider: `razorpay-${mode}`,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            verifiedAt: new Date(),
            mode,
            simulated: true
          },
          ...(scheduled ? { roomCode: scheduled.roomCode, meetingUrl: scheduled.meetingUrl } : {}),
          updatedAt: new Date()
        }
      });

      // Fire and forget notification (don't block response)
      if (notificationsEnabled()) {
        queueMicrotask(async () => {
          try {
            // fetch related info (user + therapist names/emails)
            const fresh = await database.findOne('bookings', { _id: new ObjectId(bookingId) });
            const userDoc = fresh?.userId ? await database.findOne('users', { _id: fresh.userId }) : null;
            const therapistDoc = fresh?.therapistId ? await database.findOne('therapists', { _id: fresh.therapistId }) : null;
            await sendBookingConfirmation({
              bookingId,
              userEmail: userDoc?.email,
              userName: userDoc?.name,
              userPhone: userDoc?.phone,
              therapistName: therapistDoc?.displayName,
              sessionType: fresh?.sessionType,
              date: fresh?.appointmentDate?.toISOString?.() || fresh?.date?.toString?.(),
              timeSlot: fresh?.appointmentTime || fresh?.timeSlot,
              meetingUrl: fresh?.meetingUrl || null,
              roomCode: fresh?.roomCode || null
            });
            // Optional in-process 10-minute reminder (best-effort; enable with NOTIFICATIONS_IN_PROCESS_SCHEDULER=1)
            try {
              if (process.env.NOTIFICATIONS_IN_PROCESS_SCHEDULER === '1') {
                const start = new Date(fresh?.appointmentDate || fresh?.date || new Date());
                try {
                  const [hh, mm] = String(fresh?.appointmentTime || fresh?.timeSlot || '00:00').split(':').map((s: string) => parseInt(s, 10));
                  if (!Number.isNaN(hh)) start.setHours(hh);
                  if (!Number.isNaN(mm)) start.setMinutes(mm);
                } catch {}
                start.setSeconds(0, 0);
                const fireAt = start.getTime() - 10 * 60 * 1000; // T-10m
                const delay = fireAt - Date.now();
                if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
                  setTimeout(async () => {
                    try {
                      await sendTenMinuteReminder({
                        bookingId,
                        userEmail: userDoc?.email,
                        userName: userDoc?.name,
                        userPhone: userDoc?.phone,
                        therapistName: therapistDoc?.displayName,
                        sessionType: fresh?.sessionType,
                        date: fresh?.appointmentDate?.toString?.() || fresh?.date?.toString?.(),
                        timeSlot: fresh?.appointmentTime || fresh?.timeSlot,
                        roomCode: fresh?.roomCode,
                        meetingUrl: fresh?.meetingUrl
                      });
                    } catch (e) { console.error('10-min reminder dispatch failed', e); }
                  }, delay);
                }
              }
            } catch (e) { console.warn('10-min reminder scheduling skipped', (e as any)?.message); }
          } catch (e) { console.error('notify(simulated) failed', e); }
        });
      }
      return ResponseUtils.success({ verified: true, mode, simulated: true, notification: notificationsEnabled() ? 'queued' : 'disabled' });
    }

    const keySecret = resolveSecret(mode);
    if (!keySecret) return ResponseUtils.errorCode('RAZORPAY_SECRET_MISSING', 'Razorpay secret not configured', 500);

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expected = hmac.digest('hex');
    if (expected !== razorpay_signature) {
      return ResponseUtils.errorCode('RAZORPAY_SIGNATURE_MISMATCH', 'Signature verification failed', 400);
    }

    let scheduled: any = null;
    if (['video','audio'].includes(booking.sessionType)) {
      // Only reuse room if it already exists and is valid
      // Otherwise create a new room (pass null to force new creation)
      scheduled = await scheduleMeeting({ 
        bookingId: `${bookingId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, 
        existingRoomCode: booking.roomCode || null, 
        existingMeetingUrl: booking.meetingUrl || null,
        sessionType: booking.sessionType as 'video' | 'audio'
      });
    }
    await database.updateOne('bookings', { _id: new ObjectId(bookingId) }, {
      $set: {
        paymentStatus: 'paid',
        status: booking.status === 'pending' ? 'confirmed' : booking.status,
        paymentInfo: {
          provider: `razorpay-${mode}`,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          verifiedAt: new Date(),
          mode
        },
        ...(scheduled ? { roomCode: scheduled.roomCode, meetingUrl: scheduled.meetingUrl } : {}),
        updatedAt: new Date()
      }
    });

    // Fire & forget notification dispatch
    if (notificationsEnabled()) {
      queueMicrotask(async () => {
        try {
          const fresh = await database.findOne('bookings', { _id: new ObjectId(bookingId) });
          const userDoc = fresh?.userId ? await database.findOne('users', { _id: fresh.userId }) : null;
          const therapistDoc = fresh?.therapistId ? await database.findOne('therapists', { _id: fresh.therapistId }) : null;
          await sendBookingConfirmation({
            bookingId,
            userEmail: userDoc?.email,
            userName: userDoc?.name,
            userPhone: userDoc?.phone,
            therapistName: therapistDoc?.displayName,
            sessionType: fresh?.sessionType,
            date: fresh?.appointmentDate?.toISOString?.() || fresh?.date?.toString?.(),
            timeSlot: fresh?.appointmentTime || fresh?.timeSlot,
            meetingUrl: fresh?.meetingUrl || null,
            roomCode: fresh?.roomCode || null
          });
          // Optional in-process 10-minute reminder
          try {
            if (process.env.NOTIFICATIONS_IN_PROCESS_SCHEDULER === '1') {
              const start = new Date(fresh?.appointmentDate || fresh?.date || new Date());
              try {
                const [hh, mm] = String(fresh?.appointmentTime || fresh?.timeSlot || '00:00').split(':').map((s: string) => parseInt(s, 10));
                if (!Number.isNaN(hh)) start.setHours(hh);
                if (!Number.isNaN(mm)) start.setMinutes(mm);
              } catch {}
              start.setSeconds(0, 0);
              const fireAt = start.getTime() - 10 * 60 * 1000; // T-10m
              const delay = fireAt - Date.now();
              if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
                setTimeout(async () => {
                  try {
                    await sendTenMinuteReminder({
                      bookingId,
                      userEmail: userDoc?.email,
                      userName: userDoc?.name,
                      userPhone: userDoc?.phone,
                      therapistName: therapistDoc?.displayName,
                      sessionType: fresh?.sessionType,
                      date: fresh?.appointmentDate?.toString?.() || fresh?.date?.toString?.(),
                      timeSlot: fresh?.appointmentTime || fresh?.timeSlot,
                      roomCode: fresh?.roomCode,
                      meetingUrl: fresh?.meetingUrl
                    });
                  } catch (e) { console.error('10-min reminder dispatch failed', e); }
                }, delay);
              }
            }
          } catch (e) { console.warn('10-min reminder scheduling skipped', (e as any)?.message); }
        } catch (e) { console.error('notify(real) failed', e); }
      });
    }

    return ResponseUtils.success({ verified: true, mode, notification: notificationsEnabled() ? 'queued' : 'disabled' });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return ResponseUtils.errorCode('RAZORPAY_VERIFY_UNCAUGHT', 'Failed to verify payment');
  }
}
