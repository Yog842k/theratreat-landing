import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, role, room_id } = body;
    if (!user_id || !role || !room_id) {
      return NextResponse.json({ error: 'Missing user_id, role, or room_id' }, { status: 400 });
    }
    const managementToken = process.env.HMS_MANAGEMENT_TOKEN;
    if (!managementToken) {
      return NextResponse.json({ error: 'Missing HMS_MANAGEMENT_TOKEN' }, { status: 400 });
    }
    // Call 100ms API to generate a token using the recommended endpoint
    const res = await fetch(`https://api.100ms.live/v2/rooms/${room_id}/auth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id, role }),
    });
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.error || json.message || 'Token fetch failed', details: json }, { status: res.status });
    }
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
