import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuthMiddleware from '@/lib/middleware';
import VideoSession from '@/lib/models/VideoSession';
import { createHmsRoom } from '@/lib/hms';

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
    const user = await AuthMiddleware.requireRole(req as any, ['therapist']);
    const body = await req.json();
    const { clientId, scheduledStart, durationMinutes = 50, bookingId, notes } = body;
    if (!clientId || !scheduledStart) return json(400, { error: 'clientId and scheduledStart required' });
    const start = new Date(scheduledStart);
    if (isNaN(start.getTime())) return json(400, { error: 'scheduledStart invalid date' });
    const end = new Date(start.getTime() + durationMinutes * 60000);
    // Idempotent by bookingId: reuse existing session if booking provided
    let existing = null;
    if (bookingId) existing = await VideoSession.findOne({ bookingId });
    if (existing) return json(200, { session: existing, reused: true });
    const templateId = process.env.HMS_TEMPLATE_ID;
    if (!templateId) return json(500, { error: 'HMS_TEMPLATE_ID missing (required for server room creation)' });
    // Room name strategy: therabook-<therapist>-<timestamp>
    const safeTherapist = String(user._id).slice(-6);
    const roomName = `session-${safeTherapist}-${Date.now().toString(36)}`;
    const room = await createHmsRoom(roomName, 'Therapy session');
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
    return json(code, { error: err });
  }
}
