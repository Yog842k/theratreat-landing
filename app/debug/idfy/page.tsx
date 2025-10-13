"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function IdfyTestPage() {
  const [pan, setPan] = useState('ABCDE1234F');
  const [name, setName] = useState('Test Name');
  const [dob, setDob] = useState('1990-01-01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [cfg, setCfg] = useState<any>(null);
  const [cfgErr, setCfgErr] = useState<string>('');
  const [forceMock, setForceMock] = useState(false);

  const loadCfg = async () => {
    try {
      setCfgErr('');
      const r = await fetch('/api/debug/idfy/status');
      const j = await r.json();
      if (j?.success) {
        setCfg(j?.data);
        // Log config for quick inspection in browser console
        console.log('[IDFY][DEBUG] Config:', j?.data);
      }
      else setCfgErr(j?.message || 'Failed to load config');
    } catch (e: any) {
      setCfgErr(e?.message || 'Failed to load config');
    }
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    setErrorDetail(null);
    setResult(null);
    try {
      const res = await fetch('/api/kyc/verify-pan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan, name, dob: dob || undefined, forceMock })
      });
      const json = await res.json();
      // Always log the raw response for debugging
      console.log('[IDFY][DEBUG] Verify response:', json);
      if (!json?.success) {
        console.error('[IDFY][DEBUG] Verify error:', json);
        setErrorDetail(json?.errors || null);
        throw new Error(json?.message || 'Verification failed');
      }
      // Log parsed data specifically
      console.log('[IDFY][DEBUG] Verify data:', json?.data);
      setResult(json?.data);
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>IDfy PAN Verification Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div>Environment check</div>
              <Button variant="outline" size="sm" onClick={loadCfg}>Refresh</Button>
            </div>
            {cfg && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Mode:</strong> {cfg.mode}</div>
                <div><strong>Fallback:</strong> {cfg.allowMock ? 'enabled' : 'disabled'}</div>
                <div className="truncate"><strong>Base:</strong> {cfg.base}</div>
                <div className="truncate"><strong>Endpoint:</strong> {cfg.endpoint}</div>
                <div><strong>Credentials:</strong> {cfg.hasCreds ? 'present' : 'missing'}</div>
              </div>
            )}
            {cfgErr && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-amber-800">{cfgErr}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pan">PAN</Label>
                <Input id="pan" value={pan} onChange={(e) => setPan(e.target.value)} placeholder="ABCDE1234F" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">DOB (optional)</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} placeholder="YYYY-MM-DD" />
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={forceMock} onChange={(e) => setForceMock(e.target.checked)} />
                Force mock (if allowed)
              </label>
            </div>

            <Button onClick={submit} disabled={loading || !pan || !name} className="w-full">
              {loading ? 'Verifying…' : 'Verify PAN'}
            </Button>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {errorDetail && (
              <div className="text-xs text-slate-600 space-y-1">
                <div><strong>Code:</strong> {errorDetail?.code || errorDetail?.error || '-'}</div>
                <div><strong>HTTP:</strong> {errorDetail?.httpStatus || '-'}</div>
                <div className="truncate"><strong>Detail:</strong> {errorDetail?.detail || '-'}</div>
                {errorDetail?.raw && (
                  <pre className="overflow-auto max-h-40 bg-slate-50 p-2 border rounded text-[11px]">{JSON.stringify(errorDetail.raw, null, 2)}</pre>
                )}
              </div>
            )}

            {result && (
              <div className="text-sm space-y-2">
                <div><strong>Name on card:</strong> {result?.nameOnCard || '-'}</div>
                <div><strong>DOB on card:</strong> {result?.dobOnCard || '-'}</div>
                <div><strong>Name match:</strong> {String(result?.match?.nameMatch)}</div>
                <div><strong>DOB match:</strong> {String(result?.match?.dobMatch)}</div>
                <div><strong>Name score:</strong> {result?.match?.score ?? '-'}</div>
                <div><strong>Status:</strong> {result?.idfyStatus || '-'}</div>
                {result?.provider && (
                  <div className="mt-3 border rounded p-2 bg-slate-50">
                    <div className="font-medium mb-1">Provider details</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>PAN status:</strong> {result?.provider?.panStatus || '-'}</div>
                      <div><strong>Provider name match:</strong> {String(result?.provider?.nameMatch ?? '-')}</div>
                      <div><strong>Provider DOB match:</strong> {String(result?.provider?.dobMatch ?? '-')}</div>
                      <div><strong>Aadhaar seeding:</strong> {String(result?.provider?.aadhaarSeedingStatus ?? '-')}</div>
                      <div><strong>Request ID:</strong> {result?.provider?.requestId || '-'}</div>
                      <div><strong>Task ID:</strong> {result?.provider?.taskId || '-'}</div>
                      <div className="col-span-2"><strong>Input seen by IDfy:</strong> PAN={result?.provider?.input?.pan || '-'}, Name={result?.provider?.input?.name || '-'}, DOB={result?.provider?.input?.dob || '-'}</div>
                    </div>
                  </div>
                )}
                {result?.fallbackUsed && (
                  <div className="text-amber-700">Using mock fallback (insufficient credits)</div>
                )}
              </div>
            )}

            <div className="text-xs text-slate-500">
              - Real verification requires IDFY_CLIENT_ID and IDFY_CLIENT_SECRET. If credits are insufficient and IDFY_FALLBACK_TO_MOCK=1, this page will use a mock result.<br/>
              - DOB accepts YYYY-MM-DD (preferred) or DD/MM/YYYY.
              - If you see HTTP 422, check endpoint/payload expectations on your IDfy account; use Force mock to proceed while you configure.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
