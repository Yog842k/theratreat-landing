import { NextRequest, NextResponse } from 'next/server';

// Extremely small, room-code only token issuer.
// POST /api/room-code-token  { roomCode: string; userName: string; role?: string }
// No 100ms credentials required. Uses public room-code join endpoint.
// Falls back across clusters if the code was created in a different region.

export const runtime = 'nodejs';

interface Body {
  roomCode?: string;
  userName?: string;
  role?: string;
}

function json(status: number, data: any) { return NextResponse.json(data, { status }); }

export async function POST(req: NextRequest) {
  let body: Body = {};
  try { body = await req.json(); } catch {}
  const roomCode = (body.roomCode || '').trim();
  const userName = (body.userName || '').trim();
  const role = (body.role || 'guest').trim() || 'guest';

  if (!roomCode) return json(400, { error: 'roomCode required' });
  if (!userName) return json(400, { error: 'userName required' });

  // Primary cluster + optional overrides
  const primaryCluster = (process.env.HMS_ROOM_CODE_JOIN_DOMAIN || 'prod-in2').trim();
  const fallbackEnv = (process.env.HMS_ROOM_CODE_FALLBACK_CLUSTERS || '').trim();
  const defaultFallbacks = ['prod-us2','prod-us1','prod-eu1'];
  const configured = fallbackEnv ? fallbackEnv.split(/[\s,]+/).filter(Boolean) : [];
  const clusters = [primaryCluster, ...configured, ...defaultFallbacks]
    .filter((c, i, arr) => arr.indexOf(c) === i);

  const payload = JSON.stringify({ user_id: userName.replace(/\s+/g,'_') + '_' + Date.now(), role });
  const attempts: { cluster: string; status: number; snippet: string }[] = [];
  for (const cluster of clusters) {
    const url = `https://${cluster}.100ms.live/api/v2/room-codes/${roomCode}/join`;
    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: payload });
    } catch (e: any) {
      return json(502, { error: 'NETWORK_FAIL', detail: e?.message || 'fetch failed', cluster });
    }
    if (res.ok) {
      const data = await res.json();
      if (!data.token) return json(502, { error: 'NO_TOKEN_IN_RESPONSE', cluster });
      return json(200, { token: data.token, room_code: roomCode, role, cluster, mode: 'room-code-only' });
    }
    const text = (await res.text()).slice(0, 140);
    attempts.push({ cluster, status: res.status, snippet: text });
    if (res.status !== 404) break; // only keep trying if 404 (wrong region)
  }
  return json(502, { error: 'ROOM_CODE_JOIN_FAILED', attempts });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: 'POST { roomCode, userName, role? } to obtain a 100ms auth token via room code. No server credentials required.',
    env: {
      HMS_ROOM_CODE_JOIN_DOMAIN: process.env.HMS_ROOM_CODE_JOIN_DOMAIN || 'prod-in2',
      HMS_ROOM_CODE_FALLBACK_CLUSTERS: process.env.HMS_ROOM_CODE_FALLBACK_CLUSTERS || null
    }
  });
}
