"use client";
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, TestTube, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/NewAuthContext';

// Lightweight test payment page using the simulated test endpoints.
export default function TestPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const { token } = useAuth();

  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestOrder = async () => {
    if (!bookingId) return setError('Missing bookingId');
    setCreating(true); setError(null); setMessage(null);
    try {
      const res = await fetch('/api/payments/razorpay/test/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ bookingId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create test order');
      setOrder(json.data.order);
      setMessage('Test order created');
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally { setCreating(false); }
  };

  const verifyTestPayment = async () => {
    if (!bookingId) return setError('Missing bookingId');
    if (!order) return setError('Create an order first');
    setVerifying(true); setError(null); setMessage(null);
    try {
      const res = await fetch('/api/payments/razorpay/test/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ bookingId, razorpay_order_id: order.id })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to verify test payment');
      setMessage('Test payment verified & booking marked paid');
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally { setVerifying(false); }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4 space-y-6">
      <Link href={"/therabook"} className="inline-flex items-center text-sm text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TestTube className="w-5 h-5 text-purple-600" /> Razorpay Test / Simulated Payment</CardTitle>
          <CardDescription>Use this page when real Razorpay keys aren\'t available. It will simulate order creation and payment success so you can continue building downstream flows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!bookingId && <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">Provide a bookingId as a query param (?bookingId=...).</div>}
          {message && <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {message}</div>}
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

          <div className="space-y-2 text-sm">
            <p><strong>Status:</strong> {order ? 'Order Created (simulated)' : 'No order yet'}</p>
            {order && (
              <div className="pl-2 text-xs text-gray-600 space-y-1">
                <div>Order ID: {order.id}</div>
                <div>Amount: ₹{(order.amount/100).toFixed(2)} {order.currency}</div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={createTestOrder} disabled={!bookingId || creating} variant="secondary">
              {creating ? 'Creating…' : 'Create Test Order'}
            </Button>
            <Button onClick={verifyTestPayment} disabled={!bookingId || !order || verifying}>
              {verifying ? 'Verifying…' : 'Verify Test Payment'}
            </Button>
          </div>

          <Separator />

          <div className="text-xs text-gray-500 space-y-2">
            <p>This does NOT contact Razorpay. It updates the booking directly to mimic a successful payment. Use only in development/testing.</p>
            <p>Switch to the real payment page once you have valid keys configured.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
