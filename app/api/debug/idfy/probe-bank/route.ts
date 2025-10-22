import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ProbeResult = {
  endpoint: string;
  status: number;
  exists: boolean; // true if not 404
  detail?: string;
};

function uuid() {
  try { return (globalThis as any).crypto?.randomUUID?.() || require('crypto').randomUUID(); } catch {}
  return `00000000-0000-4000-8000-${Date.now().toString().padStart(12,'0').slice(-12)}`;
}

async function getAuthHeaders(base: string) {
  const cid = process.env.IDFY_CLIENT_ID;
  const secret = process.env.IDFY_CLIENT_SECRET;
  const apiKey = process.env.IDFY_API_KEY;
  const accountId = process.env.IDFY_ACCOUNT_ID;
  const hasBasic = !!(cid && secret);
  const hasHeader = !!apiKey;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accountId) headers['account-id'] = accountId;

  let authStyle: 'bearer' | 'api-key' | 'basic' | 'none' = 'none';

  // Try Bearer token first if basic creds available
  if (hasBasic) {
    try {
      const authUrl = `${base.replace(/\/$/, '')}/auth/token`;
      const r = await fetch(authUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: cid, client_secret: secret }) });
      const j: any = await r.json().catch(() => ({}));
      if (r.ok && j?.access_token) {
        headers['Authorization'] = `Bearer ${j.access_token}`;
        authStyle = 'bearer';
        return { headers, authStyle };
      }
    } catch {}
  }

  if (hasHeader) {
    headers['api-key'] = apiKey as string;
    authStyle = 'api-key';
    return { headers, authStyle };
  }

  if (hasBasic) {
    const basic = Buffer.from(`${cid}:${secret}`).toString('base64');
    headers['Authorization'] = `Basic ${basic}`;
    authStyle = 'basic';
  }

  return { headers, authStyle };
}

export async function GET() {
  try {
    const base = process.env.IDFY_BASE_URL || 'https://eve.idfy.com/v3';
    const forced = process.env.IDFY_BANK_ENDPOINT;
    const candidates = forced ? [forced] : [
      '/tasks/async/verify_with_source/ind_bank_account',
      '/tasks/async/verify_with_source/ind_bank_account_name',
      '/tasks/async/verify_with_source/ind_bank_account_v2',
      '/tasks/async/ind_bank_account',
      '/tasks/verify_with_source/ind_bank_account'
    ];

    const hasCreds = Boolean((process.env.IDFY_CLIENT_ID && process.env.IDFY_CLIENT_SECRET) || process.env.IDFY_API_KEY);
    if (!hasCreds) {
      return NextResponse.json({ success: false, message: 'IDfy not configured', error: 'IDFY_NOT_CONFIGURED' }, { status: 400 });
    }

    const { headers, authStyle } = await getAuthHeaders(base);

    const payload = {
      task_id: uuid(),
      group_id: uuid(),
      data: { account_number: '123456789', ifsc: 'HDFC0000001' }
    };

    const tried: ProbeResult[] = [];
    const working: ProbeResult[] = [];

    for (const ep of candidates) {
      const url = `${base.replace(/\/$/, '')}${ep}`;
      try {
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
        const status = res.status;
        let detail = '';
        try { const j: any = await res.json(); detail = String(j?.message || j?.error || res.statusText || ''); } catch {}
        const exists = status !== 404;
        const entry = { endpoint: ep, status, exists, detail };
        tried.push(entry);
        if (exists) working.push(entry);
        // If forced endpoint was provided, stop after first try
        if (forced) break;
      } catch (e: any) {
        const entry = { endpoint: ep, status: 0, exists: false, detail: e?.message || 'request_failed' };
        tried.push(entry);
      }
    }

    const suggestion = working.length > 0 ? `IDFY_BANK_ENDPOINT=${working[0].endpoint}` : null;
    return NextResponse.json({ success: true, data: { base, authStyle, forced, candidates, tried, working, suggestion } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Probe failed' }, { status: 500 });
  }
}
