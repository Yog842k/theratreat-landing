import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuthMiddleware from '@/lib/middleware';
import VideoSession from '@/lib/models/VideoSession';
import { createRoom } from '@/lib/hms';

function json(status: number, body: any) { return NextResponse.json(body, { status }); }

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Optional filters
    const { searchParams } = new URL(req.url);
    const therapistId = searchParams.get('therapistId');
    const clientId = searchParams.get('clientId');
    const upcomingOnly = searchParams.get('upcoming') === '1';
    const q: any = {};
    if (therapistId) q.therapistId = therapistId;
    if (clientId) q.clientId = clientId;
    if (upcomingOnly) q.scheduledStart = { $gte: new Date() };
    const sessions = await VideoSession.find(q).sort({ scheduledStart: 1 }).limit(200).lean();
    return json(200, { sessions });
  } catch (e: any) {
    return json(500, { error: 'Failed to list sessions', detail: e.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    // Allow both therapist and client roles, but require authentication
    const user = await AuthMiddleware.authenticate(req as any);
    const body = await req.json();
    const { clientId, scheduledStart, durationMinutes = 50, bookingId, notes } = body;
    
    // If bookingId is provided, try to reuse existing session
    if (bookingId) {
      const existing = await VideoSession.findOne({ bookingId });
      if (existing) return json(200, { session: existing, reused: true });
      
      // If no existing session, try to get roomId from booking
      // This allows clients to create sessions for their bookings
      if (user.userType === 'user' || user.userType === 'client') {
        // For clients, we need to verify they own the booking
        const database = require('@/lib/database');
        const { ObjectId } = require('mongodb');
        const booking = await database.findOne('bookings', { 
          _id: new ObjectId(bookingId),
          userId: new ObjectId(user._id)
        });
        
        if (!booking) {
          return json(403, { error: 'Booking not found or access denied' });
        }
        
        // Use roomId from booking if available
        const roomId = booking.callRoomId || booking.roomId;
        if (roomId && booking.therapistId && booking.clientId) {
          const sessionStart = new Date(booking.appointmentDate || scheduledStart || new Date());
          const [hh, mm] = String(booking.appointmentTime || '00:00').split(':').map(s => parseInt(s, 10));
          if (!Number.isNaN(hh)) sessionStart.setHours(hh);
          if (!Number.isNaN(mm)) sessionStart.setMinutes(mm);
          sessionStart.setSeconds(0, 0);
          
          const end = new Date(sessionStart.getTime() + (booking.durationMinutes || durationMinutes || 50) * 60000);
          
          const sessionDoc = await VideoSession.create({
            therapistId: booking.therapistId,
            clientId: booking.clientId,
            bookingId: booking._id,
            roomId: roomId,
            roomName: booking.roomName || `session-${booking._id}`,
            templateId: process.env.HMS_TEMPLATE_ID,
            scheduledStart: sessionStart,
            scheduledEnd: end,
            status: 'scheduled',
            notes: notes || null,
            createdBy: String(user._id)
          });
          return json(201, { session: sessionDoc });
        }
      }
    }
    
    // For therapists creating new sessions (original flow)
    if (user.userType !== 'therapist') {
      return json(403, { error: 'Only therapists can create new sessions without bookingId' });
    }
    
    if (!clientId || !scheduledStart) return json(400, { error: 'clientId and scheduledStart required' });
    const start = new Date(scheduledStart);
    if (isNaN(start.getTime())) return json(400, { error: 'scheduledStart invalid date' });
    const end = new Date(start.getTime() + durationMinutes * 60000);
    
    const templateId = process.env.HMS_TEMPLATE_ID;
    if (!templateId) return json(500, { error: 'HMS_TEMPLATE_ID missing (required for server room creation)' });
    // Room name strategy: therabook-<therapist>-<timestamp>
    const safeTherapist = String(user._id).slice(-6);
    const roomName = `session-${safeTherapist}-${Date.now().toString(36)}`;
    const room = await createRoom({ therapistId: safeTherapist, patientId: clientId, templateId });
    const sessionDoc = await VideoSession.create({
      therapistId: user._id,
      clientId,
      bookingId: bookingId || undefined,
      roomId: room.id,
      roomName: room.name,
      templateId,
      scheduledStart: start,
      scheduledEnd: end,
      status: 'scheduled',
      notes: notes || null,
      createdBy: String(user._id)
    });
    return json(201, { session: sessionDoc });
  } catch (e: any) {
    let code = 500; let err = e.message || 'Failed to create session';
    if (/ENV_MISSING/.test(err)) code = 500;
    if (/ROOM_CREATE_FAILED/.test(err)) code = 502;
    if (/403|forbidden|access denied/i.test(err)) code = 403;
    return json(code, { error: err });
  }
}
