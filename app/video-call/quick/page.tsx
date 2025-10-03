"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lightweight, fast demo page: enter name + (optional) booking ID, get a token, join prebuilt.
// Uses backend /api/100ms-token endpoint with booking-based deterministic room naming if booking_id provided.

const HMSPrebuilt = dynamic(async () => (await import('@100mslive/roomkit-react')).HMSPrebuilt, {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading video SDK…</div>
});

export default function QuickVideoPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('guest');
  const [bookingId, setBookingId] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diag, setDiag] = useState<any>(null);

  useEffect(() => {
    // Fetch diagnostics once (non-blocking)
    fetch('/api/100ms-token')
      .then(r => r.json())
      .then(d => setDiag(d.diagnostics))
      .catch(() => {});
  }, []);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Name required');
    setLoading(true); setError(null);
    try {
      const user_id = `${role}_${name.replace(/\s+/g,'_')}_${Date.now()}`;
      const body: any = { user_id, role };
      if (bookingId.trim()) body.booking_id = bookingId.trim();
      const res = await fetch('/api/100ms-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Token request failed');
      if (!data.token) throw new Error('No token in response');
      setToken(data.token);
      setRoomId(data.room_id || null);
    } catch (err: any) {
      setError(err.message || 'Join failed');
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <div className="h-screen w-screen">
        <HMSPrebuilt authToken={token} options={{ userName: name || 'Guest' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center py-14 px-4">
      <h1 className="text-2xl font-semibold mb-2">Quick 100ms Join</h1>
      <p className="text-sm text-slate-600 mb-8 text-center max-w-md">Enter a name and optional booking ID. A room will be auto-created or reused, and you will join using the prebuilt UI.</p>
      <form onSubmit={handleJoin} className="w-full max-w-md bg-white border shadow-sm rounded p-6 flex flex-col gap-4">
        {error && <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{error}</div>}
        <div>
          <label className="block text-xs font-medium mb-1">Display Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Jane" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
              <option value="host">host</option>
              <option value="guest">guest</option>
              <option value="viewer">viewer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Booking ID (optional)</label>
            <input value={bookingId} onChange={e=>setBookingId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="65fa..." />
          </div>
        </div>
        <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium">
          {loading ? 'Joining…' : 'Join Session'}
        </button>
        {diag && (
          <div className="mt-2 text-[11px] text-slate-500 grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Mode:</span><span>{diag.mode}</span>
            <span>Template:</span><span>{diag.hasTemplate ? 'yes' : 'no'}</span>
            <span>Mgmt Token:</span><span>{diag.hasManagementToken ? 'yes' : 'no'}</span>
            <span>Access Key:</span><span>{diag.hasAccessKey ? 'yes' : 'no'}</span>
          </div>
        )}
        <div className="text-[11px] text-slate-400 mt-3 leading-relaxed">Uses backend token endpoint with authentication & rate limiting. Booking ID forms deterministic room name <code>booking-&lt;id&gt;</code>.</div>
        <div className="text-[11px] text-slate-400">Need advanced controls? Try <a className="underline" href="/video-call/core">Core Demo</a> or <a className="underline" href="/video-call/roomkit">RoomKit</a>.</div>
      </form>
      {roomId && <div className="mt-6 text-xs text-slate-500">Room: {roomId}</div>}
    </div>
  );
}
