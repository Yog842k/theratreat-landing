import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuthMiddleware from '@/lib/middleware';
import VideoSession from '@/lib/models/VideoSession';

function json(status: number, body: any) { return NextResponse.json(body, { status }); }

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const session = await VideoSession.findById(params.id).lean();
    if (!session) return json(404, { error: 'Not found' });
    return json(200, { session });
  } catch (e: any) {
    return json(500, { error: 'Failed to fetch session', detail: e.message });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await AuthMiddleware.requireRole(req as any, ['therapist','client']);
    const session = await VideoSession.findById(params.id);
    if (!session) return json(404, { error: 'Not found' });
    // Only therapist can modify status except marking completed after end time by client for feedback flow
    const body = await req.json();
    const { status } = body;
    if (!status) return json(400, { error: 'status required' });
    const allowed = ['scheduled','active','completed','cancelled'];
    if (!allowed.includes(status)) return json(400, { error: 'invalid status' });
    const isTherapist = String(user._id) === String(session.therapistId);
    if (!isTherapist && status !== 'completed') return json(403, { error: 'Only therapist can change status (except marking completed)' });
    if (status === 'active' && !session.startedAt) session.startedAt = new Date();
    if (status === 'completed' && !session.endedAt) session.endedAt = new Date();
    session.status = status;
    await session.save();
    return json(200, { session });
  } catch (e: any) {
    return json(500, { error: 'Failed to update session', detail: e.message });
  }
}
