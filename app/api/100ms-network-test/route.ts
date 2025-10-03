import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';

/*
  GET /api/100ms-network-test
  Optional query params:
    room_id=<roomId> (to attempt a token URL HEAD/POST without auth to just see reachability)
    subdomain=<overrideSubdomain>

  Returns structured diagnostics for DNS + basic reachability so you can see why ROOM_ID_NETWORK_FAIL occurs.
*/

export const runtime = 'nodejs';

async function tryDNS(host: string) {
  try {
    const a = await dns.lookup(host); return { ok: true, address: a.address, family: a.family };
  } catch (e: any) { return { ok: false, error: e.code || e.message }; }
}

async function tryFetch(url: string, method: string = 'GET', body?: any) {
  const started = Date.now();
  try {
    const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const dur = Date.now() - started;
    let text = '';
    try { text = await resp.text(); } catch {}
    return { ok: true, status: resp.status, durationMs: dur, preview: text.slice(0, 160) };
  } catch (e: any) {
    return { ok: false, error: e.message || 'fetch failed', durationMs: Date.now() - started };
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sub = (url.searchParams.get('subdomain') || process.env.HMS_SUBDOMAIN || '').trim();
  const roomId = (url.searchParams.get('room_id') || '').trim();
  const diagnostics: any = { subdomain: sub || null };
  const hosts: string[] = [];
  hosts.push('api.100ms.live');
  if (sub) hosts.push(`${sub}.api.100ms.live`);

  diagnostics.dns = {} as Record<string, any>;
  for (const h of hosts) diagnostics.dns[h] = await tryDNS(h);

  // Basic reachability (expect 401/404 etc. is STILL success for connectivity)
  diagnostics.http = {} as Record<string, any>;
  diagnostics.http['https://api.100ms.live/v2/rooms'] = await tryFetch('https://api.100ms.live/v2/rooms', 'GET');
  if (sub) {
    diagnostics.http[`https://${sub}.api.100ms.live/v2/rooms`] = await tryFetch(`https://${sub}.api.100ms.live/v2/rooms`, 'GET');
    if (roomId) {
      // We expect 401 if credentials not supplied, which is good enough to show reachability.
      diagnostics.http[`https://${sub}.api.100ms.live/v2/rooms/${roomId}/tokens`] = await tryFetch(`https://${sub}.api.100ms.live/v2/rooms/${roomId}/tokens`, 'POST', { user_id: 'diag_user', role: 'host' });
    }
  }

  diagnostics.env = {
    HMS_SUBDOMAIN: !!process.env.HMS_SUBDOMAIN,
    HMS_MANAGEMENT_TOKEN: !!process.env.HMS_MANAGEMENT_TOKEN,
    HMS_ACCESS_KEY: !!process.env.HMS_ACCESS_KEY,
    HMS_SECRET: !!process.env.HMS_SECRET
  };

  return NextResponse.json({ ok: true, diagnostics });
}
