"use client";
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/*
  Sample Payment Page (Demo)
  - Lightweight stand-in flow to simulate a payment step quickly.
  - Use query ?bookingId=... so confirmation can still load booking context.
*/
export default function SamplePaymentPage() {
  const search = useSearchParams();
  const bookingId = search?.get('bookingId');
  const params = useParams();
  const therapistId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const disabled = !bookingId;

  const handlePay = async () => {
    setProcessing(true);
    // Simulate latency
    setTimeout(() => {
      router.push(`/therabook/therapists/${therapistId}/book/confirmation?bookingId=${bookingId}`);
    }, 900);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Sample Payment</CardTitle>
          <CardDescription>Demo screen – simulate a successful payment before confirming your booking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded bg-gray-50 text-sm text-gray-600">
            <p className="mb-1">Booking ID: <span className="font-mono">{bookingId || '—'}</span></p>
            <p>This page does not contact a real gateway. It just advances the flow.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/therabook/therapists/${therapistId}/book${bookingId ? `?bookingId=${bookingId}` : ''}`}>Back</Link>
            </Button>
            <Button disabled={processing || disabled} onClick={handlePay} className="flex-1">
              {processing ? 'Processing…' : 'Pay & Continue'}
            </Button>
          </div>
          <p className="text-xs text-gray-400">On confirmation page you will see a Join Now link pointing to the 100ms RoomKit meeting.</p>
        </CardContent>
      </Card>
    </div>
  );
}
