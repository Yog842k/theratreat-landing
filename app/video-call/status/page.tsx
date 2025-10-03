"use client";
import React, { useEffect, useState } from 'react';

interface Diagnostics {
  hasAccessKey: boolean;
  hasSecret: boolean;
  hasManagementToken: boolean;
  hasTemplate: boolean;
  roomPrefix?: string | null;
  mode: string;
  managementTokenMeta?: any;
  sample?: any;
  probe?: any;
}

export default function VideoEnvStatusPage() {
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load(probe = true) {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/100ms-token?${probe ? 'probe=1' : ''}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setDiag(json.diagnostics);
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  useEffect(() => { load(true); }, []);

  function hintList() {
    if (!diag) return null;
    const hints: string[] = [];
    if (!diag.hasAccessKey && !diag.hasManagementToken) hints.push('Add HMS_ACCESS_KEY and HMS_SECRET or a valid HMS_MANAGEMENT_TOKEN.');
    if (diag.hasAccessKey && !diag.hasSecret) hints.push('HMS_SECRET missing.');
    if (!diag.hasTemplate) hints.push('Set HMS_TEMPLATE_ID to auto-create rooms or pass room_id manually when joining.');
    if (diag.managementTokenMeta?.expired) hints.push('Management token expired – generate a new one or temporarily remove it to fallback to basic credentials.');
    if (diag.probe && diag.probe.ok === false) {
      if (/COMPROMISED_KEY_IN_USE/.test(diag.probe.error || '')) {
        hints.push('You are still using the blocked (compromised) key pair. Replace HMS_ACCESS_KEY/HMS_SECRET with fresh values from dashboard.');
      } else if (/404/.test(diag.probe.error || '')) {
        hints.push('404 from auth endpoint – often caused by insufficient scope or incorrect auth method. Try forcing basic: set HMS_FORCE_BASIC=1 while testing.');
      }
    }
    return hints;
  }

  const hints = hintList();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 flex flex-col items-center">
      <h1 className="text-2xl font-semibold mb-2">100ms Environment Status</h1>
      <p className="text-sm text-slate-600 mb-6 text-center max-w-2xl">Live diagnostics of your server token endpoint. Replace compromised keys, verify template, and ensure token issuance works before joining from RoomKit or Quick pages.</p>
      <div className="w-full max-w-3xl bg-white border rounded shadow-sm p-5 space-y-5">
        {loading && <div className="text-sm text-slate-500">Loading diagnostics…</div>}
        {error && <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{error}</div>}
        {diag && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <StatusCard label="Access Key" ok={diag.hasAccessKey} />
              <StatusCard label="Secret" ok={diag.hasSecret} />
              <StatusCard label="Mgmt Token" ok={diag.hasManagementToken && !diag.managementTokenMeta?.expired} warn={diag.managementTokenMeta?.expired} warnText="Expired" />
              <StatusCard label="Template" ok={diag.hasTemplate} />
              <StatusCard label="Mode" value={diag.mode} ok={diag.mode !== 'unconfigured'} />
              <StatusCard label="Probe" value={diag.probe ? (diag.probe.ok ? 'OK' : 'Fail') : '—'} ok={diag.probe?.ok} warn={diag.probe && !diag.probe.ok} />
            </section>
            {diag.managementTokenMeta && (
              <details className="text-xs text-slate-600 bg-slate-100/60 rounded p-3">
                <summary className="cursor-pointer font-medium mb-1">Management Token Meta</summary>
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(diag.managementTokenMeta, null, 2)}</pre>
              </details>
            )}
            {diag.probe && diag.probe.ok === false && (
              <details className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3">
                <summary className="cursor-pointer font-medium mb-1">Probe Failure</summary>
                <pre className="whitespace-pre-wrap break-all">{diag.probe.error}
{diag.probe.debug ? '\nDEBUG: ' + JSON.stringify(diag.probe.debug) : ''}</pre>
              </details>
            )}
            {hints && hints.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs text-amber-800 space-y-1">
                <div className="font-semibold text-amber-900">Action Hints</div>
                {hints.map(h => <div key={h}>• {h}</div>)}
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-xs">
              <button onClick={() => load(true)} disabled={refreshing} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded">{refreshing ? 'Refreshing…' : 'Refresh (probe)'} </button>
              <button onClick={() => load(false)} disabled={refreshing} className="bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white px-3 py-1.5 rounded">Refresh (no probe)</button>
              <a href="/video-call/roomkit" className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white">Go RoomKit</a>
              <a href="/video-call/quick" className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white">Go Quick Join</a>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              If you just replaced keys: restart dev server. To force basic auth while debugging set HMS_FORCE_BASIC=1. To see extra error context set HMS_DEBUG=1. Never commit real secrets to git.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusCard({ label, ok, warn, value, warnText }: { label: string; ok?: boolean; warn?: boolean; value?: string; warnText?: string }) {
  let color = 'text-slate-600 border-slate-200';
  if (ok) color = 'text-green-700 border-green-300';
  if (warn) color = 'text-amber-700 border-amber-300';
  if (warn && !ok) value = warnText || value;
  return (
    <div className={`border rounded p-2 flex flex-col ${color} bg-white text-xs`}>
      <span className="font-medium mb-1">{label}</span>
      <span className="truncate" title={value}>{value || (ok ? 'Yes' : 'No')}</span>
    </div>
  );
}
