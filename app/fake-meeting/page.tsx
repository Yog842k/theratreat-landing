"use client";
import React, { useState } from 'react';
import { scheduleMeeting } from '@/lib/meeting-scheduler';

interface Result { loading: boolean; data?: any; error?: string; }

export default function FakeMeetingSchedulerPage() {
  const [bookingId, setBookingId] = useState('test_' + Date.now());
  const [result, setResult] = useState<Result>({ loading: false });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setResult({ loading: true });
    try {
      // Call scheduleMeeting locally (client) only for test when env allows.
      const res = await fetch('/api/dev/schedule-meeting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Failed');
      setResult({ loading: false, data: json });
    } catch (e: any) { setResult({ loading: false, error: e.message }); }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Fake Meeting Scheduler</h1>
        <p className="text-sm text-muted-foreground">Create a 100ms (or fallback) meeting room & code without a real booking. Dev only.</p>
      </header>
      <form onSubmit={create} className="space-y-4 border rounded p-4 bg-background/50">
        <div>
          <label className="block text-xs font-medium mb-1">Booking ID Seed</label>
          <input value={bookingId} onChange={e=>setBookingId(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm" />
          <p className="text-[10px] text-muted-foreground mt-1">Used to derive or store the room. Make it unique for each test.</p>
        </div>
        <button disabled={result.loading || !bookingId} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50">{result.loading ? 'Scheduling...' : 'Create Meeting'}</button>
      </form>
      {result.error && <div className="p-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded">Error: {result.error}</div>}
      {result.data && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Result</h2>
            <div className="p-3 text-xs font-mono bg-muted rounded overflow-x-auto">{JSON.stringify(result.data, null, 2)}</div>
            {result.data.meeting?.meetingUrl && <a href={result.data.meeting.meetingUrl} target="_blank" className="inline-block px-4 py-2 rounded bg-emerald-600 text-white text-xs">Open Meeting URL</a>}
        </div>
      )}
    </div>
  );
}
