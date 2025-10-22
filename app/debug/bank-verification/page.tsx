"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BankVerificationTestPage() {
  const [accountNumber, setAccountNumber] = useState('123456789012');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [name, setName] = useState('Test Name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [cfg, setCfg] = useState<any>(null);
  const [cfgErr, setCfgErr] = useState<string>('');
  const [probe, setProbe] = useState<any>(null);
  const [probeErr, setProbeErr] = useState<string>('');
  const [probing, setProbing] = useState(false);

  const loadCfg = async () => {
    try {
      setCfgErr('');
      const r = await fetch('/api/debug/idfy/status');
      const j = await r.json();
      if (j?.success) {
        setCfg(j?.data);
        console.log('[IDFY][DEBUG] Config:', j?.data);
      } else setCfgErr(j?.message || 'Failed to load config');
    } catch (e: any) {
      setCfgErr(e?.message || 'Failed to load config');
    }
  };

  const doProbe = async () => {
    try {
      setProbing(true);
      setProbe(null);
      setProbeErr('');
      const r = await fetch('/api/debug/idfy/probe-bank');
      const j = await r.json();
      if (!j?.success) throw new Error(j?.message || 'Probe failed');
      setProbe(j?.data);
    } catch (e: any) {
      setProbeErr(e?.message || 'Probe failed');
    } finally {
      setProbing(false);
    }
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    setErrorDetail(null);
    setResult(null);
    try {
      const res = await fetch('/api/idfy/verify-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, ifsc, name: name || undefined })
      });
      const json = await res.json();
      console.log('[IDFY][DEBUG] Bank verify response:', json);
      if (!res.ok || json?.ok === false) {
        setErrorDetail(json);
        throw new Error(json?.detail || json?.message || 'Verification failed');
      }
      setResult(json);
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
            <CardTitle>IDfy Bank Verification Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div>Environment check</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadCfg}>Refresh</Button>
                <Button variant="outline" size="sm" onClick={doProbe} disabled={probing}>{probing ? 'Probing…' : 'Probe endpoints'}</Button>
              </div>
            </div>
            {cfg && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Mode:</strong> {cfg.mode}</div>
                <div><strong>Fallback:</strong> {cfg.allowMock ? 'enabled' : 'disabled'}</div>
                <div className="truncate"><strong>Base:</strong> {cfg.base}</div>
                <div className="truncate"><strong>PAN Endpoint:</strong> {cfg.endpoint}</div>
                <div className="truncate"><strong>Bank Endpoint:</strong> {cfg.bankEndpoint}</div>
                <div><strong>Credentials:</strong> {cfg.hasCreds ? 'present' : 'missing'}</div>
                {Array.isArray(cfg.bankDefaultEndpoints) && (
                  <div className="col-span-2 truncate"><strong>Bank default endpoints:</strong> {cfg.bankDefaultEndpoints.join(', ')}</div>
                )}
              </div>
            )}
            {cfgErr && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-amber-800">{cfgErr}</AlertDescription>
              </Alert>
            )}
            {probe && (
              <div className="text-xs space-y-2">
                <div className="font-medium">Probe results</div>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Auth:</strong> {probe.authStyle}</div>
                  <div className="truncate"><strong>Base:</strong> {probe.base}</div>
                  {probe.forced && <div className="col-span-2"><strong>Forced endpoint:</strong> {probe.forced}</div>}
                </div>
                {Array.isArray(probe.tried) && probe.tried.length > 0 && (
                  <div className="border rounded p-2 bg-slate-50">
                    <div className="font-medium mb-1">Tried endpoints</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {probe.tried.map((t: any, i: number) => (
                        <li key={i} className="truncate">{t.endpoint} — {t.status} {t.exists ? '(exists)' : '(404)'} {t.detail ? `: ${t.detail}` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(probe.working) && probe.working.length > 0 ? (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      Found working endpoint: <code>{probe.working[0].endpoint}</code>
                      {probe.suggestion && (
                        <>
                          <br />Suggestion: set <code>{probe.suggestion}</code>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  probe && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">No working endpoint detected (non-404). Ask IDfy to enable bank verification or provide the correct endpoint for your tenant.</AlertDescription>
                    </Alert>
                  )
                )}
              </div>
            )}
            {probeErr && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{probeErr}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="accountNumber">Account number</Label>
                <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="9–18 digits" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc">IFSC</Label>
                <Input id="ifsc" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="ABCD0XXXXXX" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="name">Account holder name (optional but improves match)</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
              </div>
            </div>

            <Button onClick={submit} disabled={loading || !accountNumber || !ifsc} className="w-full">
              {loading ? 'Verifying…' : 'Verify bank account'}
            </Button>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {errorDetail && (
              <div className="text-xs text-slate-600 space-y-1">
                <div><strong>Code:</strong> {errorDetail?.error || '-'}</div>
                <div><strong>HTTP:</strong> {errorDetail?.httpStatus || '-'}</div>
                <div className="truncate"><strong>Detail:</strong> {errorDetail?.detail || errorDetail?.message || '-'}</div>
                {errorDetail?.raw && (
                  <pre className="overflow-auto max-h-40 bg-slate-50 p-2 border rounded text-[11px]">{JSON.stringify(errorDetail.raw, null, 2)}</pre>
                )}
              </div>
            )}

            {result && (
              <div className="text-sm space-y-2">
                <div><strong>Account status:</strong> {result?.accountStatus || '-'}</div>
                <div><strong>Name on account:</strong> {result?.nameOnAccount || '-'}</div>
                <div><strong>Name match:</strong> {String(result?.match?.nameMatch)}</div>
                <div><strong>Name score:</strong> {result?.match?.score ?? '-'}</div>
                {result?.provider && (
                  <div className="mt-3 border rounded p-2 bg-slate-50">
                    <div className="font-medium mb-1">Provider details</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>Bank:</strong> {result?.provider?.bankName || '-'}</div>
                      <div><strong>IFSC:</strong> {result?.provider?.ifsc || '-'}</div>
                      <div><strong>Name match result:</strong> {result?.provider?.nameMatchResult || '-'}</div>
                      <div><strong>Request ID:</strong> {result?.provider?.requestId || '-'}</div>
                      <div><strong>Task ID:</strong> {result?.provider?.taskId || '-'}</div>
                      {result?.provider?.input && (
                        <div className="col-span-2"><strong>Input seen by IDfy:</strong> AC={result?.provider?.input?.accountNumber || '-'}, IFSC={result?.provider?.input?.ifsc || '-'}, Name={result?.provider?.input?.name || '-'}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-slate-500">
              - Real verification requires IDFY_CLIENT_ID/IDFY_CLIENT_SECRET or IDFY_API_KEY. Optionally set IDFY_FALLBACK_TO_MOCK=1 to use mock when endpoints aren’t enabled yet.<br/>
              - IFSC format: 11 characters like ABCD0XXXXXX (5th character is zero). Account number: typically 9–18 digits.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
