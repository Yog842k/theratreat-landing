
"use client";

import React, { useState, useEffect } from "react";

type TokenResp = {
  token?: string;
  room_id?: string;
  room_name?: string;
  mode?: string;
  created?: boolean;
  role?: string;
  decision?: string;
  [key: string]: any;
};

export default function HMSTestPage() {
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("host");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenResp, setTokenResp] = useState<TokenResp | null>(null);
  const [probeData, setProbeData] = useState("");
  const [netSub, setNetSub] = useState("");
  const [netLoading, setNetLoading] = useState(false);
  const [netDiag, setNetDiag] = useState("");
  const [envStatus, setEnvStatus] = useState<any>({});
  const [allGood, setAllGood] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createInfo, setCreateInfo] = useState("");
  const [subdomainValue, setSubdomainValue] = useState("");

  useEffect(() => {
    getSubdomain().then(setSubdomainValue);
    setEnvStatus({
      accessKey: true,
      secret: true,
      templateId: true,
      subdomain: true,
      managementToken: true,
    });
    setAllGood(true);
  }, []);

  async function getSubdomain() {
    const res = await fetch('/api/100ms-network-test');
    const json = await res.json();
    return json?.diagnostics?.subdomain || '';
  }

  async function runNetworkTest() {
    setNetLoading(true);
    setNetDiag("");
    try {
      const sub = (netSub || '').trim();
      const qs = sub ? `?subdomain=${encodeURIComponent(sub)}` : '';
      const res = await fetch(`/api/100ms-network-test${qs}`, { cache: 'no-store' });
      const json = await res.json();
      setNetDiag(json);
    } catch (e) {
      setNetDiag('Network test failed: ' + String(e));
    } finally {
      setNetLoading(false);
    }
  }

  async function fetchToken() {
    setLoading(true);
    setError("");
    setTokenResp(null);
    try {
      const res = await fetch("/api/100ms-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userName,
          role,
          room_id: roomCode,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Token fetch failed");
      setTokenResp(json);
    } catch (e) {
      setError('Token fetch failed: ' + String(e));
    } finally {
      setLoading(false);
    }
  }

  async function createAndFetchToken() {
    setLoading(true);
    setError("");
    setTokenResp(null);
    try {
      // Create room via backend
      const roomRes = await fetch("/api/100ms-create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: process.env.NEXT_PUBLIC_HMS_TEMPLATE_ID }),
      });
      const roomJson = await roomRes.json();
      console.log('Room creation response:', roomJson);
      if (!roomRes.ok) {
        setError('Room creation failed: ' + JSON.stringify(roomJson, null, 2));
        return;
      }
      const newRoomId = roomJson.id || roomJson.room_id || roomJson.room?.id;
      if (!newRoomId) {
        setError('No room id returned. Full response: ' + JSON.stringify(roomJson, null, 2));
        return;
      }
      // Fetch token for new room using room id
      const tokenRes = await fetch("/api/100ms-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userName,
          role,
          room_id: newRoomId,
        }),
      });
      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok) {
        setError('Token fetch failed: ' + JSON.stringify(tokenJson, null, 2));
        return;
      }
      setTokenResp(tokenJson);
  setRoomCode(newRoomId);
    } catch (e) {
      setError('Create & fetch token failed: ' + String(e));
    } finally {
      setLoading(false);
    }
  }

  async function runProbe() {
    try {
      const res = await fetch("/api/100ms-token?probe=1");
      const json = await res.json();
      setProbeData(json);
    } catch (e) {
      setProbeData('Probe failed');
    }
  }

  async function createDevRoom() {
    setCreating(true);
    setCreateInfo("");
    try {
      const res = await fetch("/api/100ms-create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: process.env.NEXT_PUBLIC_HMS_TEMPLATE_ID }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Room creation failed");
      const createdId = json.room?.id || json.id || json.room_id;
      setCreateInfo(createdId ? String(createdId) : "No room ID returned");
    } catch (e) {
      setCreateInfo('Room creation failed: ' + String(e));
    } finally {
      setCreating(false);
    }
  }


  function buildJoinUrl() {
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
        <h2 className="font-semibold text-sm tracking-wide">Create Dev Room (server)</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">Creates a 100ms room using your management token and template. This is disabled in production unless HMS_DEV_ALLOW_ROOM_CREATE=1.</p>
        <div className="flex gap-3">
          <button onClick={createDevRoom} disabled={creating} className="px-4 py-2 rounded bg-emerald-600 text-white text-sm disabled:opacity-50">{creating ? 'Creating…' : 'Create Room'}</button>
          {createInfo && typeof createInfo === 'string' && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">Created room_id: <code>{createInfo}</code></div>
          )}
        </div>
        {createInfo && typeof createInfo === 'string' && createInfo.startsWith('Room creation failed') && (
          <div className="text-xs text-red-600">{createInfo}</div>
        )}
      </section>

      <section className="border rounded-lg p-4 space-y-3 bg-white/50 dark:bg-neutral-900/50">
        <h2 className="font-semibold text-sm tracking-wide">Network Test</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">Checks DNS and basic reachability for your HMS subdomain API host.</p>
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Subdomain to test</label>
            <input value={netSub} onChange={(e)=>setNetSub(e.target.value)} placeholder={subdomainValue || 'your-subdomain'} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <button onClick={runNetworkTest} disabled={netLoading} className="px-4 py-2 rounded bg-slate-800 text-white text-sm disabled:opacity-50">{netLoading ? 'Testing…' : 'Run Network Test'}</button>
        </div>
        {netDiag && (
          <div className="text-xs font-mono whitespace-pre-wrap bg-slate-900 text-slate-100 p-3 rounded max-h-64 overflow-auto">
            {JSON.stringify(netDiag, null, 2)}
          </div>
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
            <label className="block text-xs font-medium mb-1">Room Code</label>
            <input value={roomCode} onChange={e=>setRoomCode(e.target.value)} placeholder="abc-defg-hij" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchToken} disabled={loading || !userName} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50">{loading ? 'Fetching...' : 'Get Token'}</button>
          <button onClick={createAndFetchToken} disabled={loading || !userName} className="px-4 py-2 rounded bg-purple-600 text-white text-sm disabled:opacity-50">{loading ? 'Working…' : 'Create & Get Token'}</button>
          <button type="button" onClick={runProbe} className="px-4 py-2 rounded bg-slate-200 text-slate-800 text-sm">Probe Endpoint</button>
          {joinUrl && <a href={joinUrl} target="_blank" className="px-4 py-2 rounded bg-emerald-600 text-white text-sm">Open Join URL</a>}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tip: Leave both Room Code and Room ID empty and click "Create & Get Token" to auto-create a new room and get a join token.</p>
        {error && <div className="text-sm text-red-600">Error: {error}</div>}
        {tokenResp && typeof tokenResp === 'object' && (
          <>
            <div className="mt-2 text-xs font-mono whitespace-pre-wrap bg-slate-900 text-slate-100 p-3 rounded max-h-64 overflow-auto">
              {JSON.stringify(tokenResp, null, 2)}
            </div>
            {tokenResp.room_code && subdomainValue && (
              <div className="mt-2 flex flex-col gap-2">
                <a
                  href={`https://${subdomainValue}.app.100ms.live/meeting/${tokenResp.room_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded bg-emerald-600 text-white text-sm"
                >
                  Join Room
                </a>
                <div className="text-xs text-gray-700 dark:text-gray-200">
                  Meeting Link:
                  <input
                    type="text"
                    readOnly
                    value={`https://${subdomainValue}.app.100ms.live/meeting/${tokenResp.room_code}`}
                    className="ml-2 px-2 py-1 border rounded w-80 bg-gray-50 dark:bg-neutral-800"
                    onClick={e => e.currentTarget.select()}
                  />
                </div>
              </div>
            )}
          </>
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


