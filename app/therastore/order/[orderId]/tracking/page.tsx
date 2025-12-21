"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';

export default function TrackingPage() {
  const params = useParams();
  const search = useSearchParams();
  const orderId = params?.orderId as string;
  const awb = search?.get('awb') || '';
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = awb ? `/api/shiprocket/track?awb=${encodeURIComponent(awb)}` : `/api/shiprocket/track?orderId=${encodeURIComponent(orderId)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'Tracking failed');
        setData(json.result);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [awb, orderId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Order Tracking</h1>
      <p className="text-sm text-slate-600 mb-6">Order: {orderId} {awb && `• AWB: ${awb}`}</p>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
      <pre className="bg-slate-50 border rounded p-4 overflow-auto text-xs">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
