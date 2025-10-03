"use client";
import React, { useState } from 'react';

interface ResultState {
  loading: boolean;
  data?: any;
  error?: string;
}

export default function EmailNotificationsTestPage() {
  const [form, setForm] = useState({
    userEmail: '',
    roomCode: '',
    meetingUrl: '',
    userName: 'Email Test User',
    therapistName: 'Demo Therapist',
    sessionType: 'video',
    timeSlot: '10:00-10:30'
  });
  const [result, setResult] = useState<ResultState>({ loading: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult({ loading: true });
    try {
      const res = await fetch('/api/notifications/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: form.userEmail.trim(),
          roomCode: form.roomCode.trim() || undefined,
          meetingUrl: form.meetingUrl.trim() || undefined,
          userName: form.userName,
          therapistName: form.therapistName,
          sessionType: form.sessionType,
          timeSlot: form.timeSlot
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setResult({ loading: false, error: json.message || 'Request failed' });
      } else {
        setResult({ loading: false, data: json });
      }
    } catch (err: any) {
      setResult({ loading: false, error: err?.message || 'Unexpected error' });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Email Notification Test</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">Dev-only page. Sends a booking confirmation email using the /api/notifications/email-test endpoint. Requires SendGrid env vars. Do not deploy to production.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white/50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium mb-1">User Email</label>
          <input name="userEmail" type="email" value={form.userEmail} onChange={handleChange} placeholder="user@example.com" className="w-full border rounded px-3 py-2 text-sm" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Room Code</label>
            <input name="roomCode" value={form.roomCode} onChange={handleChange} placeholder="abc-defg-hij" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meeting URL (override)</label>
            <input name="meetingUrl" value={form.meetingUrl} onChange={handleChange} placeholder="https://example.com/join/xyz" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">User Name</label>
            <input name="userName" value={form.userName} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Therapist Name</label>
            <input name="therapistName" value={form.therapistName} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Session Type</label>
            <input name="sessionType" value={form.sessionType} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Slot</label>
            <input name="timeSlot" value={form.timeSlot} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" disabled={result.loading} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium disabled:opacity-50">
          {result.loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>

      {result.error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-sm text-red-800">
          Error: {result.error}
        </div>
      )}
      {result.data && (
        <div className="p-3 rounded bg-green-50 border border-green-200 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
          {JSON.stringify(result.data, null, 2)}
        </div>
      )}
    </div>
  );
}
