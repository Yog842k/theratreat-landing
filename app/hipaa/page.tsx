export const metadata = {
  title: 'HIPAA / Data Handling | TheraTreat',
  description: 'Information about HIPAA awareness and data handling approach at TheraTreat.'
};

export default function HipaaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-slate-900">HIPAA / Data Handling</h1>
        <p className="text-slate-600 leading-relaxed text-lg">While operating primarily in India, we incorporate HIPAA aligned safeguards for confidentiality, integrity and availability of protected health information.</p>
        <section className="space-y-4 text-sm leading-relaxed text-slate-700">
          <p><strong>Administrative:</strong> Access reviews, role-based controls, incident response procedures.</p>
          <p><strong>Technical:</strong> Encryption in transit, least privilege database roles, environment isolation.</p>
          <p><strong>Physical:</strong> Cloud provider managed data center security; no on-prem PHI storage.</p>
        </section>
      </div>
    </main>
  );
}
