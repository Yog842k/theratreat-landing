"use client";
import React, { useState } from 'react';

/*
  Minimal demo using the simple room-code-only backend endpoint.
  1. Create a Room + Room Code in 100ms dashboard.
  2. Open this page, enter the code + your name.
  3. Click Get Token – you will receive a token (shown partially) you can use with the 100ms SDK.

  NOTE: This page does NOT join the room automatically (to keep dependencies small).
  Integrate with your existing Room Kit page or 100ms React SDK after verifying token issuance.
*/

export default function RoomCodeDemo() {
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('host');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenPreview, setTokenPreview] = useState<string | null>(null);
  const [raw, setRaw] = useState<any>(null);

  async function handleFetch() {
    setLoading(true); setError(null); setTokenPreview(null); setRaw(null);
    try {
      const res = await fetch('/api/room-code-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, userName: name, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setRaw(data);
      setTokenPreview(data.token ? data.token.slice(0, 18) + '…' : null);
    } catch (e: any) {
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Room Code Token Demo</h1>
      <p className="text-sm text-gray-600 leading-relaxed">
        This page uses <code>/api/room-code-token</code> which only needs a room code and user name.<br />
        No management token or access/secret required. Great for verifying network works locally.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1">Room Code</label>
          <input value={roomCode} onChange={e=>setRoomCode(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="e.g. abc-defg-hij" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Your Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="Your display name" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Role (optional)</label>
          <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border rounded px-2 py-1 text-sm">
            <option value="host">host</option>
            <option value="guest">guest</option>
          </select>
        </div>
        <button disabled={!roomCode || !name || loading} onClick={handleFetch} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50">
          {loading ? 'Requesting…' : 'Get Token'}
        </button>
        {error && <div className="text-red-600 text-sm">Error: {error}</div>}
        {tokenPreview && (
          <div className="text-green-700 text-sm">
            Token acquired: <span className="font-mono">{tokenPreview}</span><br />
            (Copy the full token from network response if you need to join manually.)
          </div>
        )}
        {raw && (
          <details className="text-xs">
            <summary className="cursor-pointer select-none text-indigo-700">Raw Response</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto text-[10px] leading-tight">{JSON.stringify(raw, null, 2)}</pre>
          </details>
        )}
        <div className="pt-4 border-t text-[11px] text-gray-500 space-y-2">
          <p>
            If you receive ROOM_CODE_JOIN_FAILED with 404 statuses for multiple clusters, the code may belong to another region. Set <code>HMS_ROOM_CODE_JOIN_DOMAIN</code> or <code>HMS_ROOM_CODE_FALLBACK_CLUSTERS</code> in <code>.env.local</code> then restart dev server.
          </p>
          <p>
            To migrate to server-managed rooms later, switch your integration to <code>/api/100ms-token</code> and configure credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
