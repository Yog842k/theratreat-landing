import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuthMiddleware from '@/lib/middleware';
import VideoSession from '@/lib/models/VideoSession';
import { generateRoomToken } from '@/lib/hms';

function json(status: number, body: any) { return NextResponse.json(body, { status }); }

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await AuthMiddleware.requireRole(req as any, ['therapist','client']);
    const session = await VideoSession.findById(params.id);
    if (!session) return json(404, { error: 'Session not found' });
    const isTherapist = String(user._id) === String(session.therapistId);
    const isClient = String(user._id) === String(session.clientId);
    if (!isTherapist && !isClient) return json(403, { error: 'Not a participant' });
    const role = isTherapist ? 'host' : 'guest';
    const userName = (user.name || 'user').replace(/\s+/g,'_');
    const hmsUserId = `${userName}_${Date.now()}`;
    const token = await generateRoomToken(session.roomId, hmsUserId, role);
    session.lastTokenIssuedAt = new Date();
    await session.save();
    return json(200, { token, role, roomId: session.roomId, sessionId: session.id });
  } catch (e: any) {
    let code = 500; let msg = e.message || 'Failed to generate token';
    if (/ENV_MISSING/.test(msg)) code = 500; else if (/TOKEN_FAILED/.test(msg)) code = 502;
    return json(code, { error: msg });
  }
}
