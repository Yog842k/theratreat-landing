export const metadata = {
  title: 'Compliance | TheraTreat',
  description: 'Regulatory and ethical compliance overview for TheraTreat.'
};

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-slate-900">Compliance</h1>
        <p className="text-slate-600 leading-relaxed text-lg">Overview of our evolving compliance posture and safeguards.</p>
        <div className="space-y-5 text-sm leading-relaxed text-slate-700">
          <p><strong>Data Protection:</strong> Alignment with Indian DPDP principles for consent, minimization, retention and purpose limitation.</p>
          <p><strong>Clinical Standards:</strong> Verification of therapist credentials and disciplinary screening before listing.</p>
          <p><strong>Security Controls:</strong> Encryption, access logging, least privilege, environment separation.</p>
        </div>
      </div>
    </main>
  );
}
