"use client";
import React, { useState, useEffect } from 'react';

interface TokenResponse {
  token?: string;
  error?: string;
  [k: string]: any;
}

export default function HMSDiagnosticsPage() {
  const [userName, setUserName] = useState('Test User');
  const [role, setRole] = useState('guest');
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenResp, setTokenResp] = useState<TokenResponse | null>(null);
  const [probeData, setProbeData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<Record<string, boolean> | null>(null);
  const [subdomainValue, setSubdomainValue] = useState<string | null>(null);

  // Fetch env flags from server to avoid hydration mismatch & leaking secrets
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/100ms-env', { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled) {
          const { accessKey, secret, templateId, subdomain, managementToken, subdomainValue } = json;
            setEnvStatus({ accessKey, secret, templateId, subdomain, managementToken });
            setSubdomainValue(subdomainValue || null);
        }
      } catch (e) {
        if (!cancelled) setEnvStatus({ accessKey: false, secret: false, templateId: false, subdomain: false, managementToken: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const allGood = envStatus ? (envStatus.accessKey && envStatus.secret && (envStatus.templateId || envStatus.managementToken)) : false;

  async function fetchToken() {
    setLoading(true); setError(null); setTokenResp(null);
    try {
      const body: any = { user_id: userName.replace(/\s+/g,'_') + '_' + Date.now(), role };
      if (roomCode) body.roomCode = roomCode.trim();
      if (roomId) body.room_id = roomId.trim();
      const res = await fetch('/api/100ms-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch token');
      setTokenResp(json);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  async function runProbe() {
    setProbeData(null); setError(null);
    try {
      const res = await fetch('/api/100ms-token?probe=1', { cache: 'no-store' });
      const json = await res.json();
      setProbeData(json);
      if (!res.ok) setError('Probe returned non-200');
    } catch (e: any) { setError(e.message); }
  }

  function buildJoinUrl(): string | null {
    if (roomCode && subdomainValue) {
      return `https://${subdomainValue}.app.100ms.live/meeting/${roomCode}`;
    }
    if (roomCode) {
      return `${process.env.NEXT_PUBLIC_BASE_URL || ''}/video-call/room?roomCode=${roomCode}`;
    }
    return null;
  }

  const joinUrl = buildJoinUrl();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">100ms Test & Diagnostics</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Check environment configuration, probe the token endpoint, and fetch a test auth token. This page is dev-only; do not expose in production.</p>
      </header>

      <section className="border rounded-lg p-4 space-y-3 bg-white/50 dark:bg-neutral-900/50">
        <h2 className="font-semibold text-sm tracking-wide">Environment Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {envStatus ? (
            Object.entries(envStatus).map(([k,v]) => (
              <div key={k} className={`px-2 py-1 rounded border ${v ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'}`}>{k}: {v ? 'OK' : 'MISSING'}</div>
            ))
          ) : (
            ['accessKey','secret','templateId','subdomain','managementToken'].map(k => (
              <div key={k} className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-400 animate-pulse">{k}: ...</div>
            ))
          )}
        </div>
        {!!envStatus && !allGood && (
          <p className="text-xs text-amber-600 mt-2">Provide at minimum HMS_ACCESS_KEY, HMS_SECRET and either HMS_TEMPLATE_ID (for auto room) or HMS_MANAGEMENT_TOKEN for advanced flows.</p>
        )}
      </section>

      <section className="border rounded-lg p-4 space-y-4 bg-white/50 dark:bg-neutral-900/50">
        <h2 className="font-semibold text-sm tracking-wide">Fetch Token</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">User Name</label>
            <input value={userName} onChange={e=>setUserName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
              <option value="host">host (therapist)</option>
              <option value="guest">guest (patient)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Room Code (optional)</label>
            <input value={roomCode} onChange={e=>setRoomCode(e.target.value)} placeholder="abc-defg-hij" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Room ID (optional)</label>
            <input value={roomId} onChange={e=>setRoomId(e.target.value)} placeholder="room_123" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchToken} disabled={loading || !userName} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50">{loading ? 'Fetching...' : 'Get Token'}</button>
          <button type="button" onClick={runProbe} className="px-4 py-2 rounded bg-slate-200 text-slate-800 text-sm">Probe Endpoint</button>
          {joinUrl && <a href={joinUrl} target="_blank" className="px-4 py-2 rounded bg-emerald-600 text-white text-sm">Open Join URL</a>}
        </div>
        {error && <div className="text-sm text-red-600">Error: {error}</div>}
        {tokenResp && (
          <div className="mt-2 text-xs font-mono whitespace-pre-wrap bg-slate-900 text-slate-100 p-3 rounded max-h-64 overflow-auto">
            {JSON.stringify(tokenResp, null, 2)}
          </div>
        )}
      </section>

      {probeData && (
        <section className="border rounded-lg p-4 space-y-2 bg-white/50 dark:bg-neutral-900/50">
          <h2 className="font-semibold text-sm tracking-wide">Probe Result</h2>
          <div className="text-xs font-mono whitespace-pre-wrap bg-slate-900 text-slate-100 p-3 rounded max-h-64 overflow-auto">
            {JSON.stringify(probeData, null, 2)}
          </div>
        </section>
      )}

      <section className="border rounded-lg p-4 space-y-2 bg-white/50 dark:bg-neutral-900/50">
        <h2 className="font-semibold text-sm tracking-wide">Next Steps</h2>
        <ul className="list-disc ml-5 text-xs space-y-1 text-gray-700 dark:text-gray-300">
          <li>Use existing integration pages under <code>/video-call</code> for full UI joins.</li>
          <li>If tokens fail, verify env vars then open <code>/api/100ms-token?probe=1</code> directly.</li>
          <li>Add HMS_MANAGEMENT_TOKEN to enable server-side room creation flows.</li>
          <li>Integrate booking-based deterministic room codes by passing <code>roomCode</code> from stored booking.</li>
        </ul>
      </section>
    </div>
  );
}
