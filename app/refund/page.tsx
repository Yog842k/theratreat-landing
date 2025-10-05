export const metadata = {
  title: 'Refund & Cancellation | TheraTreat',
  description: 'Refund and cancellation policy for TheraTreat bookings and purchases.'
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-slate-900">Refund & Cancellation</h1>
        <p className="text-slate-600 leading-relaxed text-lg">Guidelines for cancelling sessions and requesting refunds.</p>
        <ul className="list-disc pl-6 space-y-3 text-sm leading-relaxed text-slate-700">
          <li>Patient cancellations ≥ 24h before session: full refund or credit.</li>
          <li>Cancellations &lt; 24h: partial or no refund depending on therapist policy.</li>
          <li>Provider no‑show: full refund or free reschedule.</li>
          <li>Equipment orders: return window & condition requirements apply (see product page).</li>
        </ul>
      </div>
    </main>
  );
}
