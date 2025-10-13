import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { sendBookingReminder, notificationsEnabled } from '@/lib/notifications';
const database = require('@/lib/database');

export const runtime = 'nodejs';

/**
 * POST /api/cron/send-reminders
 * Scans for bookings about 24 hours from now (±30m window) with status confirmed/pending
 * and sends one-time reminder via email/SMS. Marks booking.reminder24hSent=true on success.
 *
 * Protect this route by requiring a CRON_SECRET header/token or restricting to server-side calls only.
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth: expect header X-CRON-KEY to match process.env.CRON_SECRET
    const provided = request.headers.get('x-cron-key') || request.headers.get('x-cron-secret');
    const expected = process.env.CRON_SECRET;
    if (!expected || provided !== expected) {
      return new Response(JSON.stringify({ success: false, message: 'Forbidden' }), { status: 403 });
    }

    if (!notificationsEnabled()) {
      return new Response(JSON.stringify({ success: false, message: 'Notifications not configured' }), { status: 400 });
    }

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const windowStart = new Date(in24h.getTime() - 30 * 60 * 1000); // 24h - 30m
    const windowEnd = new Date(in24h.getTime() + 30 * 60 * 1000);   // 24h + 30m

    // Helper: parse appointment start by combining date + time label
    const computeStart = (dateValue: any, timeLabel?: string): Date | null => {
      try {
        if (!dateValue) return null;
        const base = new Date(dateValue);
        if (isNaN(base.getTime())) return null;
        if (!timeLabel || typeof timeLabel !== 'string' || !timeLabel.trim()) return base;
  const label = timeLabel.trim();
        // Try HH:MM (24h)
        let m = label.match(/\b(\d{1,2}):(\d{2})\b/);
        if (m) {
          const h = parseInt(m[1], 10);
          const min = parseInt(m[2], 10);
          if (!isNaN(h) && !isNaN(min)) { base.setHours(h, min, 0, 0); return base; }
        }
        // Try HH:MM AM/PM patterns (first occurrence)
        m = label.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
        if (m) {
          let h = parseInt(m[1], 10);
          const min = parseInt(m[2], 10);
          const mer = (m[3] || '').toUpperCase();
          if (mer === 'PM' && h !== 12) h += 12;
          if (mer === 'AM' && h === 12) h = 0;
          base.setHours(h, min, 0, 0); return base;
        }
        // Try range "10:00-10:30" -> take first
        m = label.match(/(\d{1,2}):(\d{2})\s?-\s?(\d{1,2}):(\d{2})/);
        if (m) {
          const h = parseInt(m[1], 10);
          const min = parseInt(m[2], 10);
          base.setHours(h, min, 0, 0); return base;
        }
        return base; // fallback
      } catch { return null; }
    };

    const matchStatuses = ['confirmed'];

    // Fetch recent+upcoming candidates within ~2 days to narrow scan
    const approxStart = new Date(now.getTime() + 22 * 60 * 60 * 1000);
    const approxEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000);
    const pipeline = [
      { $match: { status: { $in: matchStatuses }, reminder24hSent: { $ne: true }, appointmentDate: { $gte: new Date(approxStart.toDateString()), $lte: new Date(approxEnd.toDateString()) } } },
      { $limit: 2000 },
    ];
    const candidates = await database.aggregate('bookings', pipeline);

    let processed = 0; let sent = 0; const errors: any[] = [];

    for (const b of candidates) {
      processed++;
      try {
        // Load user + therapist for contact details
        const user = b.userId ? await database.findOne('users', { _id: b.userId }) : null;
        const therapist = b.therapistId ? await database.findOne('therapists', { _id: b.therapistId }) : null;
        // Compute exact start and filter by window
        const start = computeStart(b.appointmentDate, b.appointmentTime);
        if (!start || start < windowStart || start > windowEnd) {
          continue;
        }

        const payload = {
          bookingId: b._id.toString(),
          userEmail: user?.email,
          userName: user?.name,
          userPhone: user?.phone,
          therapistName: therapist?.displayName || therapist?.name,
          sessionType: b.sessionType,
          date: b.appointmentDate?.toISOString?.(),
          timeSlot: b.appointmentTime,
          roomCode: b.roomCode,
          meetingUrl: b.meetingUrl
        };
  const res = await sendBookingReminder(payload);
        if (res.emailSent || res.smsSent || res.whatsappSent) {
          await database.updateOne('bookings', { _id: new ObjectId(b._id) }, { $set: { reminder24hSent: true, reminderSent: true, updatedAt: new Date() } });
          sent++;
        } else {
          errors.push({ id: b._id.toString(), errors: res.errors || ['no channels sent'] });
        }
      } catch (e: any) {
        errors.push({ id: b?._id?.toString?.(), error: e?.message || 'failed' });
      }
    }

    return new Response(JSON.stringify({ success: true, processed, sent, errorsCount: errors.length, errors }), { status: 200 });
  } catch (e: any) {
    console.error('send-reminders cron failed', e);
    return new Response(JSON.stringify({ success: false, message: e?.message || 'Uncaught error' }), { status: 500 });
  }
}
