"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

/*
  Razorpay Test Page
  - Fetches public key/mode from /api/payments/razorpay/config
  - Lets authenticated user create an order via /api/payments/razorpay/order
  - Provides amount override and optional therapistId (for direct payment)
  - Opens Razorpay Checkout (if available) or prints order JSON fallback

  Pre-req:
    Ensure one of the following env combos is set:
      TEST: RAZORPAY_TEST_KEY_ID + RAZORPAY_TEST_KEY_SECRET + NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID
      LIVE: RAZORPAY_LIVE_KEY_ID + RAZORPAY_LIVE_KEY_SECRET + NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID
    or legacy pair RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / NEXT_PUBLIC_RAZORPAY_KEY_ID
*/

interface RazorpayConfigResp { keyId: string; mode: string; }
interface OrderResponse { order: { id: string; amount: number; currency: string; status: string; }; keyId: string; mode: string; simulated?: boolean; split?: any; }

// Use a runtime-safe accessor to avoid TS redeclaration conflicts if a global Razorpay type is already present.
// We'll treat window.Razorpay as any at runtime without augmenting the global type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RazorpayCtor = any;

export default function RazorpayTestPage() {
  const { isAuthenticated, token, user } = useAuth();
  const [config, setConfig] = useState<RazorpayConfigResp | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [amount, setAmount] = useState('500');
  const [therapistId, setTherapistId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoadingConfig(true); setError(null);
    try {
      const res = await fetch('/api/payments/razorpay/config', { headers: { 'Accept': 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      let json: any;
      if (ct.includes('application/json')) {
        try { json = await res.json(); } catch (e) {
          throw new Error('Failed to parse JSON config response');
        }
      } else {
        const text = await res.text();
        throw new Error(`Unexpected non-JSON response (${res.status}) snippet: ${text.slice(0,120)}`);
      }
      if (!res.ok || !json?.success) throw new Error(json?.message || `Config load failed (${res.status})`);
      if (!json.data?.keyId) {
        throw new Error('Config loaded but public key empty (check NEXT_PUBLIC_RAZORPAY_* env vars)');
      }
      setConfig({ keyId: json.data.keyId, mode: json.data.mode });
    } catch (e: any) {
      setError(e.message || 'Config error');
    } finally { setLoadingConfig(false); }
  };

  const createOrder = async () => {
    if (!isAuthenticated) { setError('Login required'); return; }
    setCreatingOrder(true); setError(null); setResult(null);
    try {
      const payload: any = {};
      if (bookingId.trim()) payload.bookingId = bookingId.trim();
      else {
        payload.therapistId = therapistId.trim();
        payload.amount = Number(amount) || 0;
      }
      const res = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const ct = res.headers.get('content-type') || '';
      let json: any;
      if (ct.includes('application/json')) {
        try { json = await res.json(); } catch { throw new Error(`Failed to parse order JSON (status ${res.status})`); }
      } else {
        const text = await res.text();
        throw new Error(`Order endpoint returned non-JSON (${res.status}). Snippet: ${text.slice(0,150)}`);
      }
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Order creation failed (HTTP ${res.status})`);
      }
      setResult(json.data);
      // Attempt to open Razorpay checkout if available
      if (window.Razorpay && json.data?.order?.id) {
        const options: any = {
          key: json.data.keyId,
          amount: json.data.order.amount,
          currency: json.data.order.currency,
          name: 'TheraTreat Demo',
          description: 'Test Transaction',
          order_id: json.data.order.id,
          prefill: { name: user?.name, email: user?.email },
          notes: { demo: 'true' },
          handler: function (resp: any) {
            setResult((r: any) => ({ ...r, paymentHandlerResponse: resp }));
          },
          theme: { color: '#2563eb' }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setError(response.error?.description || 'Payment failed');
        });
        rzp.open();
      }
    } catch (e: any) {
      setError(e.message || 'Order error');
    } finally { setCreatingOrder(false); }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Razorpay Test</h1>
      <p className="text-sm text-muted-foreground">Use this page to validate environment configuration, create test orders, and launch Razorpay Checkout.</p>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Configuration</span>
            <Button variant="outline" onClick={loadConfig} disabled={loadingConfig}>
              {loadingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {config ? 'Refresh' : 'Load'}
              <RefreshCw className="w-4 h-4 ml-2" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {config ? (
            <div className="space-y-1">
              <div><span className="font-semibold">Mode:</span> {config.mode}</div>
              <div><span className="font-semibold">Public Key:</span> <code>{config.keyId}</code></div>
              <div className="text-xs text-muted-foreground">If key is blank, ensure NEXT_PUBLIC_RAZORPAY_* env vars are present at build time.</div>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">Config not loaded yet.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Booking ID (optional)</label>
              <Input placeholder="Existing bookingId" value={bookingId} onChange={e => setBookingId(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">If provided, amount & therapistId are ignored.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Therapist ID (for direct)</label>
              <Input placeholder="Therapist ObjectId" value={therapistId} onChange={e => setTherapistId(e.target.value)} disabled={!!bookingId.trim()} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount (INR)</label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} disabled={!!bookingId.trim()} />
            </div>
          </div>
          <Button onClick={createOrder} disabled={creatingOrder || !isAuthenticated} className="bg-blue-600 text-white">
            {creatingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isAuthenticated ? 'Create Order' : 'Login Required'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground pt-4 border-t">
        Note: Ensure you have loaded the Razorpay checkout script globally (e.g. in root layout) for popup to appear. Otherwise the JSON response above is still valid for backend verification.
      </div>
    </div>
  );
}
