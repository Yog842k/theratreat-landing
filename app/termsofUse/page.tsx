export const metadata = {
  title: 'Terms of Use | TheraTreat',
  description: 'TheraTreat platform terms of use and user obligations.'
};

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-slate-900">Terms of Use</h1>
        <p className="text-slate-600 leading-relaxed text-lg">These terms govern access to and use of the TheraTreat platform and services.</p>
        <ol className="list-decimal pl-6 space-y-4 text-sm leading-relaxed text-slate-700">
          <li><strong>Acceptance.</strong> By creating an account or booking services you agree to these terms.</li>
          <li><strong>Eligibility.</strong> You represent you have legal capacity and accurate information.</li>
          <li><strong>Appropriate Use.</strong> No misuse, harassment, data scraping, or unlawful conduct.</li>
          <li><strong>Clinical Boundaries.</strong> Therapists provide professional guidance; emergencies must route to local authorities.</li>
          <li><strong>Termination.</strong> We may suspend accounts violating policies or legal requirements.</li>
        </ol>
      </div>
    </main>
  );
}
