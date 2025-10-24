import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const managementToken = process.env.HMS_MANAGEMENT_TOKEN;
    if (!managementToken) {
      return NextResponse.json({ error: 'Missing HMS_MANAGEMENT_TOKEN' }, { status: 400 });
    }
    // Use global 100ms API endpoint and include token
    const apiUrl = 'https://api.100ms.live/v2/rooms';
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json',
      },
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const text = await res.text();
      return NextResponse.json({ error: 'HTML response', preview: text.slice(0, 200) }, { status: 502 });
    }
    const json = await res.json();
    return NextResponse.json({ diagnostics: { reachable: true, response: json } });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
