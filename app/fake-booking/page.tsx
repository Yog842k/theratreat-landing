"use client";
import React, { useState, useEffect } from 'react';

interface ResultState { loading: boolean; data?: any; error?: string; }

export default function FakeBookingPage() {
  const [form, setForm] = useState({
    therapistId: '',
    sessionType: 'video',
    date: new Date(Date.now() + 3600_000).toISOString().slice(0,16), // local ISO minutes
    timeSlot: '10:00-10:30',
    notes: '',
    overrideEmail: '',
    overridePhone: '',
    overrideName: ''
  });
  const [result, setResult] = useState<ResultState>({ loading: false });
  const [therapists, setTherapists] = useState<any[]>([]);
  const [therapistsLoading, setTherapistsLoading] = useState(false);
  const [therapistsError, setTherapistsError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setTherapistsLoading(true); setTherapistsError(null);
        const res = await fetch('/api/therapists?limit=50', { cache: 'no-store' });
        const text = await res.text();
        let json: any = {};
        try { json = JSON.parse(text); } catch {}
        if (!res.ok) throw new Error(json.message || json.error || 'Failed to load therapists');
        const list = Array.isArray(json.therapists)
          ? json.therapists
          : (json.data && Array.isArray(json.data.therapists))
            ? json.data.therapists
            : Array.isArray(json.items)
              ? json.items
              : [];
        if (mounted) setTherapists(list);
      } catch (e: any) {
        if (mounted) setTherapistsError(e.message);
      } finally {
        if (mounted) setTherapistsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target; setForm(f => ({ ...f, [name]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setResult({ loading: true });
    try {
      const payload: any = { ...form, date: new Date(form.date).toISOString() };
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });
      const res = await fetch('/api/bookings/fake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Request failed');
      setResult({ loading: false, data: json });
    } catch (e: any) { setResult({ loading: false, error: e.message }); }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Fake Booking Flow (No Payment)</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Create a confirmed, paid booking instantly for development. Meeting link is auto-generated for video/audio. Requires you to be logged in as a user/patient. Do NOT deploy in production.</p>
      </header>
      <form onSubmit={submit} className="space-y-6 border rounded-lg p-5 bg-white/50 dark:bg-neutral-900/50">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium">Therapist</label>
            <div className="space-y-1">
              {therapistsLoading && <div className="text-[11px] text-gray-500">Loading therapists...</div>}
              {therapistsError && <div className="text-[11px] text-red-600">{therapistsError}</div>}
              {!therapistsLoading && !therapistsError && (
                <>
                  <input
                    placeholder="Filter by name or specialization"
                    value={filter}
                    onChange={e=>setFilter(e.target.value)}
                    className="w-full border rounded px-3 py-1 text-xs mb-1"
                    type="text"
                  />
                  <select
                    name="therapistId"
                    value={form.therapistId}
                    onChange={update}
                    required
                    className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                  >
                    <option value="" disabled>Select therapist...</option>
                    {(Array.isArray(therapists) ? therapists : [])
                      .filter(t => {
                        if (!filter) return true;
                        const f = filter.toLowerCase();
                        return (t.name && t.name.toLowerCase().includes(f)) || (t.therapistProfile?.displayName && t.therapistProfile.displayName.toLowerCase().includes(f)) || (t.specializations && t.specializations.join(' ').toLowerCase().includes(f));
                      })
                      .map(t => {
                        const id = t._id || t.id;
                        const name = t.therapistProfile?.displayName || t.name || 'Therapist';
                        const specs = (t.specializations || t.therapistProfile?.specializations || []).slice(0,3).join(', ');
                        const fee = t.consultationFee || t.therapistProfile?.consultationFee;
                        const label = `${name}${specs ? ' • ' + specs : ''}${fee ? ' • ₹'+fee : ''}`;
                        return <option key={id} value={id}>{label}</option>;
                      })}
                  </select>
                  <p className="text-[10px] text-gray-500">Pulled from /api/therapists (limit 50). Use filter to narrow.</p>
                  <details className="text-[10px] text-gray-500">
                    <summary className="cursor-pointer">Need manual ID?</summary>
                    <input name="therapistId" placeholder="Manual therapist ID" onChange={update} className="mt-1 w-full border rounded px-2 py-1 text-[10px]" />
                  </details>
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Session Type</label>
            <select name="sessionType" value={form.sessionType} onChange={update} className="w-full border rounded px-3 py-2 text-sm">
              <option value="video">video</option>
              <option value="audio">audio</option>
              <option value="in-clinic">in-clinic</option>
              <option value="home-visit">home-visit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Date/Time (local)</label>
            <input type="datetime-local" name="date" value={form.date} onChange={update} className="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Time Slot</label>
            <input name="timeSlot" value={form.timeSlot} onChange={update} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Notes (optional)</label>
          <textarea name="notes" value={form.notes} onChange={update} rows={3} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <fieldset className="border rounded p-3 space-y-3">
          <legend className="px-1 text-xs font-semibold">Notification Overrides (optional)</legend>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Override Email</label>
              <input name="overrideEmail" value={form.overrideEmail} onChange={update} type="email" placeholder="test@example.com" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Override Phone (E.164)</label>
              <input name="overridePhone" value={form.overridePhone} onChange={update} placeholder="+15551234567" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Override Name</label>
              <input name="overrideName" value={form.overrideName} onChange={update} placeholder="Alt Name" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <p className="text-[10px] text-gray-500">Overrides are used only for notification dispatch; booking still ties to your logged in account.</p>
        </fieldset>
        <button type="submit" disabled={result.loading || !form.therapistId} className="px-5 py-2 rounded bg-indigo-600 text-white text-sm font-medium disabled:opacity-50">{result.loading ? 'Creating...' : 'Create Fake Booking'}</button>
      </form>
      {result.error && <div className="p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">Error: {result.error}</div>}
      {result.data && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Result</h2>
          <div className="p-3 rounded bg-green-50 border border-green-200 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-96">{JSON.stringify(result.data, null, 2)}</div>
          {result.data.booking?.meetingUrl && <a href={result.data.booking.meetingUrl} target="_blank" className="inline-block px-4 py-2 rounded bg-emerald-600 text-white text-xs">Open Meeting URL</a>}
        </div>
      )}
    </div>
  );
}
