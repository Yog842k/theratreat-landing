import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Only include valid params in payload
    const payload: Record<string, any> = {};
    if (body.name) payload.name = body.name;
    else payload.name = `room-${Date.now()}`;
    if (body.description) payload.description = body.description;
    if (body.template_id) payload.template_id = body.template_id;
    else if (process.env.HMS_TEMPLATE_ID) payload.template_id = process.env.HMS_TEMPLATE_ID;
    let region = body.region || process.env.HMS_REGION;
    if (region) region = region.toLowerCase();
    else region = 'auto';
    payload.region = region;
    // Optional fields
    if (body.recording_info !== undefined) payload.recording_info = body.recording_info;
    if (body.large_room !== undefined) payload.large_room = body.large_room;
    if (body.size !== undefined) payload.size = body.size;
    if (body.max_duration_seconds !== undefined) payload.max_duration_seconds = body.max_duration_seconds;
    if (body.webhook !== undefined) payload.webhook = body.webhook;
    const managementToken = process.env.HMS_MANAGEMENT_TOKEN;
    if (!managementToken) {
      return NextResponse.json({ error: 'Missing HMS_MANAGEMENT_TOKEN' }, { status: 400 });
    }
    // Remove any undefined fields
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key];
    });
    const res = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    // Log the full response for debugging
    if (!res.ok) {
      return NextResponse.json({ error: json.error || json.message || 'Room creation failed', details: json, payload }, { status: res.status });
    }
    // Return all room fields for frontend, including both id and name for compatibility
    return NextResponse.json({
      id: json.id,
      room_id: json.id,
      name: json.name,
      ...json,
      debug: { payload, raw: json }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
