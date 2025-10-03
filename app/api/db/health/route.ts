import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import net from 'node:net';

export const runtime = 'nodejs';

function parseHosts(uri?: string) {
  if (!uri) return [];
  if (/^mongodb\+srv:/.test(uri)) {
    // Return the base host; SRV records will expand it
    const m = uri.replace('mongodb+srv://','').split('/')[0];
    return [m];
  }
  if (/^mongodb:\/\//.test(uri)) {
    const hostPart = uri.replace('mongodb://','').split('@').pop()?.split('/')[0] || '';
    return hostPart.split(',').map(h => h.trim()).filter(Boolean);
  }
  return [];
}

async function resolveSrvRecords(base: string) {
  try {
    const records = await dns.resolveSrv(`_mongodb._tcp.${base}`);
    return { ok: true, records: records.map(r => ({ name: r.name, port: r.port, priority: r.priority, weight: r.weight })) };
  } catch (e: any) {
    return { ok: false, error: e.code || e.message };
  }
}

async function tcpProbe(host: string, port: number, timeoutMs = 2500) {
  return await new Promise(resolve => {
    const start = Date.now();
    const socket = net.createConnection({ host, port, timeout: timeoutMs });
    let finished = false;
    const done = (result: any) => { if (!finished) { finished = true; try { socket.destroy(); } catch {}; resolve(result); } };
    socket.on('connect', () => done({ ok: true, durationMs: Date.now()-start }));
    socket.on('timeout', () => done({ ok: false, error: 'timeout', durationMs: Date.now()-start }));
  socket.on('error', (err: any) => done({ ok: false, error: err?.code || err?.message, durationMs: Date.now()-start }));
  });
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 });
  }
  const uri = process.env.MONGODB_URI;
  const alt = process.env.MONGODB_URI_ALT;
  const hosts = parseHosts(uri);
  const altHosts = parseHosts(alt);

  const srvDetails = [] as any[];
  for (const h of hosts) {
    if (h.includes('.')) {
      const srv = await resolveSrvRecords(h);
      srvDetails.push({ base: h, ...srv });
    }
  }

  // If we resolved SRV, probe each target; else probe the raw hosts list (standard URI case)
  const probes: Record<string, any> = {};
  const toProbe: { host: string; port: number }[] = [];
  for (const srv of srvDetails) {
    if (srv.ok) {
      for (const r of srv.records) toProbe.push({ host: r.name, port: r.port });
    }
  }
  if (toProbe.length === 0) {
    // fallback: attempt 27017 on parsed hosts
    for (const h of hosts) toProbe.push({ host: h, port: 27017 });
  }
  for (const item of toProbe.slice(0, 6)) { // limit
    probes[`${item.host}:${item.port}`] = await tcpProbe(item.host, item.port);
  }

  return NextResponse.json({
    ok: true,
    env: {
      REQUIRE_DB: process.env.REQUIRE_DB || null,
      MONGODB_URI_present: !!uri,
      MONGODB_URI_ALT_present: !!alt
    },
    primaryHosts: hosts,
    altHosts,
    srv: srvDetails,
    probes,
    hints: [
      'If SRV resolution fails: allow DNS to _mongodb._tcp.* (firewall/VPN)',
      'Add your IP in Atlas Network Access or temporarily 0.0.0.0/0 for testing',
      'Try setting MONGODB_URI_ALT with a standard (non-srv) multi-host connection string',
      'Ensure local network allows outbound TCP 27017'
    ]
  });
}
