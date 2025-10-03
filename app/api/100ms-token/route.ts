import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';

/* Hybrid 100ms token route
   Supports BOTH:
   A) Room Code join (no credentials) -> provide roomCode
   B) Room ID token (requires HMS_SUBDOMAIN + HMS_MANAGEMENT_TOKEN OR basic creds)

   POST body accepted keys:
     userName | user_id | name  (string, required)
     roomCode | room_code | code (string, optional)
     room_id | roomId (string, optional) if using Room ID flow
     role (optional, default 'host')

   Auto-detection:
     - If roomCode present => room code flow
     - Else if room_id present => room id flow
     - Else error (unless you later add auto-create logic)
*/

export const runtime = 'nodejs';

// --- Helpers ---
function json(status: number, data: any) { return NextResponse.json(data, { status }); }

function parseMgmtMeta(raw: string | undefined) {
  if (!raw) return null;
  const parts = raw.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    const now = Math.floor(Date.now()/1000);
    return { exp: payload.exp, expired: payload.exp ? now >= payload.exp : null };
  } catch { return null; }
}

async function fetchViaRoomCode(roomCode: string, userName: string, role: string) {
  const cluster = (process.env.HMS_ROOM_CODE_JOIN_DOMAIN || 'prod-in2').trim();
  const url = `https://${cluster}.100ms.live/api/v2/room-codes/${roomCode}/join`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userName, role })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const is404 = resp.status === 404;
    const hint = is404 && /^[a-f0-9]{24,32}$/i.test(roomCode)
      ? 'Looks like a Room ID used as a Room Code. Use room_id flow instead.'
      : undefined;
    throw Object.assign(new Error('ROOM_CODE_JOIN_FAILED'), { status: resp.status, data, url, hint });
  }
  if (!data.token) throw new Error('NO_TOKEN_IN_RESPONSE');
  return { token: data.token, cluster, room_code: roomCode, mode: 'room-code' };
}

function buildAuthHeader() {
  const mgmt = (process.env.HMS_MANAGEMENT_TOKEN || '').trim();
  if (mgmt) return { header: `Bearer ${mgmt}`, mode: 'management-token' } as const;
  const access = (process.env.HMS_ACCESS_KEY || '').trim();
  const secret = (process.env.HMS_SECRET || '').trim();
  if (!access || !secret) throw new Error('CREDENTIALS_MISSING');
  return { header: 'Basic ' + Buffer.from(`${access}:${secret}`).toString('base64'), mode: 'basic' } as const;
}

async function fetchViaRoomId(roomId: string, userName: string, role: string) {
  const sub = (process.env.HMS_SUBDOMAIN || '').trim();
  if (!sub) throw new Error('SUBDOMAIN_MISSING');
  const { header, mode } = buildAuthHeader();
  const url = `https://${sub}.api.100ms.live/v2/rooms/${roomId}/tokens`;
  // Pre-flight DNS to distinguish DNS issues from generic fetch failures
  try {
    await dns.lookup(`${sub}.api.100ms.live`);
  } catch (e: any) {
    throw Object.assign(new Error('ROOM_ID_DNS_FAIL'), { detail: e?.code || e?.message || 'dns lookup failed', url });
  }
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': header },
      body: JSON.stringify({ user_id: userName, role })
    });
  } catch (e: any) {
    throw Object.assign(new Error('ROOM_ID_NETWORK_FAIL'), { detail: e?.message || 'fetch failed', url });
  }
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw Object.assign(new Error('UNAUTHORIZED'), { status: resp.status, data, mode, url });
    }
    if (resp.status === 404) {
      throw Object.assign(new Error('ROOM_ID_NOT_FOUND'), { status: resp.status, data, url });
    }
    throw Object.assign(new Error('ROOM_ID_TOKEN_FAILED'), { status: resp.status, data, url });
  }
  if (!data.token) throw new Error('NO_TOKEN_IN_RESPONSE');
  return { token: data.token, room_id: roomId, mode: 'room-id', authMode: mode };
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const rawUser = body.userName || body.user_id || body.name;
  const forcedMode = (body.mode || '').toString(); // 'room-code' | 'room-id'
  const debug = Boolean(body.debug);
  const rawRoomCode = body.roomCode || body.room_code || body.code;
  const rawRoomId = body.room_id || body.roomId;
  const role = (body.role || 'host').toString().trim() || 'host';
  const userName = (rawUser || '').toString().trim();
  const roomCode = (rawRoomCode || '').toString().trim();
  const roomId = (rawRoomId || '').toString().trim();

  if (!userName) {
    return json(400, { error: 'userName (or user_id) required', expected: { roomCode: 'abc-defg-hij OR room_id', userName: 'Alice' } });
  }
  if (!roomCode && !roomId) {
    return json(400, { error: 'Provide either roomCode or room_id', note: 'Room codes look like abc-defg-hij. Room IDs are long hex strings.' });
  }

  // Decision phase
  let decision = 'auto';
  let effectiveRoomCode = roomCode;
  let effectiveRoomId = roomId;
  if (forcedMode === 'room-code') {
    decision = 'forced-room-code';
    effectiveRoomId = '';
  } else if (forcedMode === 'room-id') {
    decision = 'forced-room-id';
    effectiveRoomCode = '';
  } else {
    // Auto-detect: If the caller mistakenly puts a Room ID in roomCode field, detect and move it.
    if (!roomId && roomCode && /^[a-f0-9]{24,32}$/i.test(roomCode) && !roomCode.includes('-')) {
      effectiveRoomId = roomCode; // treat as room id
      effectiveRoomCode = '';
      decision = 'auto-saw-hex-promoted-to-room-id';
    } else if (roomCode) {
      decision = 'auto-room-code';
    } else if (roomId) {
      decision = 'auto-room-id';
    }
  }

  try {
    if (effectiveRoomCode) {
      const result = await fetchViaRoomCode(effectiveRoomCode, userName, role);
      return json(200, { token: result.token, room_code: result.room_code, mode: result.mode, cluster: result.cluster, role, decision, debugInfo: debug ? { forcedMode, provided: { roomCode, roomId }, effectiveRoomCode, effectiveRoomId } : undefined });
    }
    // Room ID flow (requires env + credentials)
    const result = await fetchViaRoomId(effectiveRoomId, userName, role);
    return json(200, { token: result.token, room_id: result.room_id, mode: result.mode, authMode: result.authMode, role, decision, debugInfo: debug ? { forcedMode, provided: { roomCode, roomId }, effectiveRoomCode, effectiveRoomId } : undefined });
  } catch (e: any) {
    const msg = e?.message || 'FAILED';
  const base: any = { error: msg, role };
  if (e.detail) base.detail = e.detail;
    if (e.status) base.status = e.status;
    if (e.url) base.url = e.url;
    if (e.data) base.details = e.data;
    if (e.hint) base.hint = e.hint;
    if (debug) base.debugInfo = { forcedMode, decision, provided: { roomCode, roomId }, effectiveRoomCode, effectiveRoomId };
    switch (msg) {
      case 'ROOM_CODE_JOIN_FAILED':
        return json(e.status || 502, { ...base, mode: 'room-code', hints: [e.hint || 'Check if you used a Room ID instead of a code', 'Verify room code exists and not expired'] });
      case 'ROOM_ID_NETWORK_FAIL':
        return json(502, { ...base, mode: 'room-id', hints: ['Check DNS / firewall to *.api.100ms.live', 'Verify HMS_SUBDOMAIN correctness', 'Try curl the URL manually', 'Try Resolve-DnsName <subdomain>.api.100ms.live'] });
      case 'ROOM_ID_DNS_FAIL':
        return json(502, { ...base, mode: 'room-id', hints: ['DNS lookup failed for subdomain host', 'Run: Resolve-DnsName ' + (process.env.HMS_SUBDOMAIN ? process.env.HMS_SUBDOMAIN + '.api.100ms.live' : '<your-subdomain>.api.100ms.live'), 'Check local / corporate DNS or VPN', 'If on Windows try: nslookup ' + (process.env.HMS_SUBDOMAIN ? process.env.HMS_SUBDOMAIN + '.api.100ms.live' : 'subdomain.api.100ms.live')] });
      case 'UNAUTHORIZED':
        return json(e.status || 401, { ...base, mode: 'room-id', hints: ['Management token invalid or expired', 'If using basic credentials ensure HMS_ACCESS_KEY & HMS_SECRET are correct'] });
      case 'ROOM_ID_NOT_FOUND':
        return json(404, { ...base, mode: 'room-id', hints: ['Confirm the room exists in dashboard', 'Ensure the Room ID belongs to the same subdomain'] });
      case 'SUBDOMAIN_MISSING':
        return json(400, { ...base, mode: 'room-id', hint: 'Set HMS_SUBDOMAIN in .env.local (e.g. myapp if dashboard shows myapp.100ms.live)' });
      case 'CREDENTIALS_MISSING':
        return json(500, { ...base, mode: 'room-id', hint: 'Set HMS_MANAGEMENT_TOKEN or HMS_ACCESS_KEY + HMS_SECRET' });
      case 'NO_TOKEN_IN_RESPONSE':
        return json(502, { ...base, hint: '100ms responded without token. Inspect details for clues.' });
      default:
        return json(502, base);
    }
  }
}

export async function GET() {
  const mgmtMeta = parseMgmtMeta(process.env.HMS_MANAGEMENT_TOKEN);
  return NextResponse.json({
    ok: true,
    hybrid: true,
    usage: {
      roomCode: { body: { roomCode: 'ceu-ftar-xyj', userName: 'Sachin', role: 'host' } },
      roomId: { body: { room_id: '68da6e6ba5ba8326e6eb94da', userName: 'Sachin', role: 'host' }, env: ['HMS_SUBDOMAIN', 'HMS_MANAGEMENT_TOKEN OR HMS_ACCESS_KEY + HMS_SECRET'] }
    },
    env: {
      HMS_SUBDOMAIN: !!process.env.HMS_SUBDOMAIN,
      HMS_MANAGEMENT_TOKEN: !!process.env.HMS_MANAGEMENT_TOKEN,
      HMS_ACCESS_KEY: !!process.env.HMS_ACCESS_KEY,
      HMS_SECRET: !!process.env.HMS_SECRET,
      HMS_ROOM_CODE_JOIN_DOMAIN: process.env.HMS_ROOM_CODE_JOIN_DOMAIN || 'prod-in2'
    },
    managementToken: mgmtMeta ? { expired: mgmtMeta.expired, exp: mgmtMeta.exp } : null
  });
}
