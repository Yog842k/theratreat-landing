"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR evaluation of packages that touch window/document at module scope
const HMSPrebuilt: any = dynamic(async () => (await import('@100mslive/roomkit-react')).HMSPrebuilt as any, {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full text-sm text-gray-500">Loading video SDK…</div>
});

/*
  RoomKit React Demo
  ------------------
  This page uses the high-level HMSPrebuilt component from @100mslive/roomkit-react.
  Flow:
    1. User enters name & role.
    2. We POST to /api/100ms-token with user_id + optional room name (auto-create if template configured).
    3. On success we render <HMSPrebuilt roomCode|token>. RoomKit can accept a token directly (roomCode also possible).
*/

interface JoinState { name: string; role: string; room?: string; roomCode?: string; }

export default function RoomKitDemoPage() {
  const [form, setForm] = useState<JoinState>({ name: '', role: 'guest', room: '', roomCode: '' });
  const [token, setToken] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    setLoading(true); setError(null);
    try {
      const user_id = `${form.role}_${form.name.replace(/\s+/g,'_')}_${Date.now()}`;
      const body: any = { user_id, role: form.role };
      // Prefer room code if provided (fast path, no server creds needed)
      if (form.roomCode?.trim()) {
        body.roomCode = form.roomCode.trim();
        body.mode = 'room-code'; // force to avoid auto-detection surprises
      } else if (form.room?.trim()) {
        body.room_id = form.room.trim();
        body.mode = 'room-id';
      }
      const res = await fetch('/api/100ms-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get token');
      if (!data.token) throw new Error('Token missing in response');
      setToken(data.token);
      setRoomId(data.room_id || null);
    } catch (err: any) {
      let msg = err.message || 'Join failed';
      if (/401/.test(msg) || /AUTH_REQUIRED/i.test(msg)) {
        msg += ' – Not logged in. For quick local demo set HMS_DEV_AUTH_BYPASS=1 in .env.local and restart dev server.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (token) {
    // Ensure we only attempt to render RoomKit after mount (IntersectionObserver, ResizeObserver, document availability)
    return (
      <div className="h-screen w-screen">
        {mounted ? (
          <HMSPrebuilt authToken={token} options={{ userName: form.name || 'Guest User' }} />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-500 text-sm">Initializing client…</div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-16 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <h1 className="text-3xl font-bold mb-2">100ms RoomKit Demo</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">Join a video room using the high-level RoomKit UI. Provide a room ID to reuse an existing room or leave blank to auto-create (requires HMS_TEMPLATE_ID on server).</p>
      <form onSubmit={handleJoin} className="w-full max-w-md bg-white shadow rounded p-6 flex flex-col gap-4 border">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select className="w-full border rounded px-3 py-2" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
            <option value="host">Therapist (host)</option>
            <option value="guest">Patient (guest)</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Room Code (preferred fast path)</label>
          <input className="w-full border rounded px-3 py-2" value={form.roomCode} onChange={e=>setForm(f=>({...f,roomCode:e.target.value}))} placeholder="abc-defg-hij" />
          <p className="text-xs text-gray-500 mt-1">If you have a 100ms room code use it here (works even without server credentials).</p>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Room ID (fallback)</label>
            <input className="w-full border rounded px-3 py-2" value={form.room} onChange={e=>setForm(f=>({...f,room:e.target.value}))} placeholder="long-hex-room-id (needs env setup)" />
            <p className="text-xs text-gray-400 mt-1">Leave blank unless you specifically need the room-id token flow.</p>
        </div>
        <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium mt-2" type="submit">
          {loading ? 'Joining...' : 'Join Room'}
        </button>
        <div className="text-xs text-gray-500 mt-2 space-y-1">
          <p>Server endpoint: <code>/api/100ms-token</code></p>
          <p>Room Code mode: no server creds needed. Room ID mode: requires HMS_SUBDOMAIN + token/credentials.</p>
        </div>
      </form>
      <div className="mt-10 text-sm text-gray-500">
        <a href="/api/100ms-token" className="underline" target="_blank">View token diagnostics</a>
      </div>
    </div>
  );
}
