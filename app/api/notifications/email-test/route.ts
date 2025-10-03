import type { NextRequest } from 'next/server';
import { sendBookingConfirmation } from '@/lib/notifications';

export const runtime = 'nodejs';

/**
 * Dev/Test endpoint to trigger ONLY email notification (SendGrid) for a fake booking.
 * Requires SENDGRID_API_KEY and SENDGRID_FROM_EMAIL and a userEmail in the request body.
 * Do NOT deploy to production (or gate behind an auth / environment flag).
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new Response(JSON.stringify({ success: false, message: 'Disabled in production' }), { status: 403 });
  }

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    return new Response(JSON.stringify({ success: false, message: 'SendGrid not configured (missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL)' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      bookingId = 'EMAILTEST-' + Date.now(),
      userEmail,
      userName = 'Email Test User',
      therapistName = 'Demo Therapist',
      sessionType = 'video',
      date = new Date().toISOString(),
      timeSlot = '10:00-10:30',
      roomCode,
      meetingUrl
    } = body || {};

    if (!userEmail) {
      return new Response(JSON.stringify({ success: false, message: 'userEmail required' }), { status: 400 });
    }

    const result = await sendBookingConfirmation({
      bookingId,
      userEmail,
      userName,
      therapistName,
      sessionType,
      date,
      timeSlot,
      roomCode,
      meetingUrl
    });

    return new Response(JSON.stringify({ success: true, bookingId, result }), { status: 200 });
  } catch (e: any) {
    console.error('email notification test error', e);
    return new Response(JSON.stringify({ success: false, message: e?.message || 'Uncaught error' }), { status: 500 });
  }
}
