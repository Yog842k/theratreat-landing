import type { NextRequest } from 'next/server';
import { sendBookingConfirmation, notificationsEnabled } from '@/lib/notifications';

export const runtime = 'nodejs';

/**
 * Dev/Test endpoint to trigger booking notification manually (Twilio / SendGrid).
 * DO NOT expose in production (gate behind env check).
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new Response(JSON.stringify({ success: false, message: 'Disabled in production' }), { status: 403 });
  }
  if (!notificationsEnabled()) {
    return new Response(JSON.stringify({ success: false, message: 'Notifications not enabled (missing Twilio or SendGrid credentials)' }), { status: 400 });
  }
  try {
    const body = await request.json();
    const {
      bookingId = 'TEST-' + Date.now(),
      userPhone,
      userName = 'Test User',
      therapistName = 'Test Therapist',
      sessionType = 'video',
      date = new Date().toISOString(),
      timeSlot = '10:00-10:30',
      roomCode,
      meetingUrl
    } = body || {};

    if (!userPhone) {
      return new Response(JSON.stringify({ success: false, message: 'userPhone required' }), { status: 400 });
    }

    const result = await sendBookingConfirmation({
      bookingId,
      userPhone,
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
    console.error('notification test error', e);
    return new Response(JSON.stringify({ success: false, message: e?.message || 'Uncaught error' }), { status: 500 });
  }
}
