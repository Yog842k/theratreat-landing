"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TwilioVerifyDebugPage() {
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('debug_verify');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [err, setErr] = useState<string>('');
  const [ttl, setTtl] = useState<number | null>(null);

  const requestCode = async () => {
    setSending(true);
    setErr('');
    setMsg('');
    setTtl(null);
    try {
      const r = await fetch('/api/debug/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose })
      });
      const data = await r.json();
      if (data?.success) {
        setMsg(`OTP sent to ${data?.data?.phone}. Expires in ${data?.data?.ttlMinutes} minutes.`);
        setTtl(data?.data?.ttlMinutes ?? null);
      } else {
        setErr(data?.message || 'Failed to send OTP');
      }
    } catch (e: any) {
      setErr(e?.message || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    setVerifying(true);
    setErr('');
    setMsg('');
    try {
      const r = await fetch('/api/debug/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, purpose })
      });
      const data = await r.json();
      if (data?.success) {
        setMsg('OTP verified successfully!');
      } else {
        setErr(data?.message || 'Verification failed');
      }
    } catch (e: any) {
      setErr(e?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Twilio Verify Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="phone">Phone (E.164)</Label>
                <Input id="phone" placeholder="+91XXXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Input id="purpose" value={purpose} onChange={e => setPurpose(e.target.value)} />
              </div>
              <Button onClick={requestCode} disabled={!phone || sending} className="w-full">
                {sending ? 'Sending…' : 'Send OTP'}
              </Button>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input id="code" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} />
              </div>
              <Button onClick={verifyCode} disabled={!phone || !code || verifying} className="w-full" variant="outline">
                {verifying ? 'Verifying…' : 'Verify OTP'}
              </Button>
            </div>

            {msg && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{msg}</AlertDescription>
              </Alert>
            )}
            {err && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{err}</AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-slate-500">
              Notes: This page uses Twilio Verify if configured (TWILIO_VERIFY_SERVICE_SID). Otherwise it falls back to Programmable SMS with self-managed OTP storage.
              Make sure environment variables TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_SMS_FROM are configured for fallback. Default country code can be set via OTP_DEFAULT_COUNTRY_CODE.
              TTL default is controlled by OTP_EXP_MIN (default 10 minutes).
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
