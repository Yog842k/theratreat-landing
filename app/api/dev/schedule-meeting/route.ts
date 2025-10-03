import { NextRequest, NextResponse } from 'next/server';
import { scheduleMeeting } from '@/lib/meeting-scheduler';

// POST /api/dev/schedule-meeting  { bookingId }
// Dev-only helper to test meeting creation without a real booking record.
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success:false, message:'Disabled in production' }, { status:403 });
  }
  try {
    const body = await request.json();
    const bookingId = body.bookingId || 'dev_' + Date.now();
    const meeting = await scheduleMeeting({ bookingId });
    return NextResponse.json({ success:true, meeting });
  } catch (e: any) {
    console.error('dev schedule meeting error', e);
    return NextResponse.json({ success:false, message:'Failed to schedule meeting', error: e?.message }, { status:500 });
  }
}
