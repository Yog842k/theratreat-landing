export const metadata = { title: 'Policies | TheraTreat' };

export default function PoliciesPage() {
  const policies = [
    { h: 'Privacy Policy', b: 'We respect your privacy and process only data required for delivering safe and high quality healthcare services. We follow data minimisation and role-based access.' },
    { h: 'Data Protection (DPDP)', b: 'TheraTreat aligns with India\'s Digital Personal Data Protection (DPDP) principles: consent, purpose limitation, security safeguards and transparency.' },
    { h: 'Cancellation & Rescheduling', b: 'Sessions can be rescheduled or cancelled up to 2 hours before start time. Late cancellations may result in fee retention.' },
    { h: 'Security', b: 'Bank-grade encryption, layered access control, continuous monitoring, and secure audit logging protect your data.' },
  ];
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Policies & Compliance</h1>
          <p className="text-slate-600 max-w-3xl">Learn how we keep your information secure, compliant and how we operate with trust and transparency.</p>
        </header>
        <section className="space-y-6">
          {policies.map((p,i)=> (
            <div key={i} className="p-6 rounded-xl bg-white shadow border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-2">{p.h}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{p.b}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
