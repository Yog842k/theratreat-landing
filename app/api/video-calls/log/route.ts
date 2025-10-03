import { NextRequest, NextResponse } from 'next/server';

// Mock database for call logs - In production, replace with actual database
const callLogs: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, action, userRole, timestamp, metadata } = body;

    if (!bookingId || !action || !userRole || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const logEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookingId,
      action, // 'call_started', 'call_ended', 'call_joined', 'call_left'
      userRole,
      timestamp,
      metadata: metadata || {},
      createdAt: new Date().toISOString()
    };

    callLogs.push(logEntry);

    // Log to console for debugging (remove in production)
    console.log('Video call log:', logEntry);

    return NextResponse.json({
      success: true,
      logId: logEntry.id
    });

  } catch (error) {
    console.error('Error logging video call event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const bookingId = url.searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const logs = callLogs.filter(log => log.bookingId === bookingId);

    return NextResponse.json({
      logs: logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    });

  } catch (error) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
