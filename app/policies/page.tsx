export const metadata = {
  title: 'Policies & Compliance | TheraTreat',
  description: 'Our privacy, security, cancellation, conduct, liability, misuse, accessibility and disclaimer policies.'
};

import Link from 'next/link';

export default function PoliciesPage() {
  const toc = [
    { id: 'privacy', label: 'Privacy' },
    { id: 'data-security', label: 'Data Security' },
    { id: 'cancellation', label: 'Cancellation & Rescheduling' },
    { id: 'conduct', label: 'Code of Conduct' },
    { id: 'liability', label: 'Liability' },
    { id: 'misuse', label: 'Misuse & Abuse' },
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'disclaimer', label: 'Disclaimer' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-indigo-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 px-4 py-1 text-xs font-medium">Trust & Transparency</div>
          <h1 className="text-4xl font-bold text-slate-900">Policies & Compliance</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">How we protect your data, keep the platform safe, and set clear expectations for everyone who uses TheraTreat.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-8">
          {/* Sidebar TOC */}
          <aside className="md:sticky md:top-24 h-fit">
            <nav className="rounded-xl border bg-white/80 backdrop-blur p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">On this page</div>
              <ul className="space-y-2 text-sm">
                {toc.map(item => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-slate-700 hover:text-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <section className="space-y-10">
            {/* Privacy */}
            <article id="privacy" className="scroll-mt-24 rounded-xl bg-white shadow border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Privacy</h2>
              <p className="text-slate-600 leading-relaxed">We collect and process only the data necessary to deliver safe, high‑quality healthcare services. Access is role‑based, minimised, and logged. For complete details, read our dedicated <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
              <ul className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-slate-700">
                <li className="bg-blue-50 rounded-lg p-3 border border-blue-100">Consent‑driven processing (DPDP aligned)</li>
                <li className="bg-blue-50 rounded-lg p-3 border border-blue-100">Purpose limitation and data minimisation</li>
                <li className="bg-blue-50 rounded-lg p-3 border border-blue-100">Clear retention and deletion schedules</li>
                <li className="bg-blue-50 rounded-lg p-3 border border-blue-100">You can access, rectify, or erase your data</li>
              </ul>
            </article>

            {/* Data Security */}
            <article id="data-security" className="scroll-mt-24 rounded-xl bg-white shadow border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Data Security</h2>
              <p className="text-slate-600 leading-relaxed">Security is layered across people, process, and technology. We apply industry best practices to safeguard PHI and personal data.</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="rounded-lg p-3 border bg-slate-50">TLS in transit • AES‑256 at rest • Key rotation</div>
                <div className="rounded-lg p-3 border bg-slate-50">RBAC • Least privilege • Access reviews</div>
                <div className="rounded-lg p-3 border bg-slate-50">Audit logs • Alerting • Incident response</div>
                <div className="rounded-lg p-3 border bg-slate-50">Segregated environments • Backups</div>
              </div>
              <p className="mt-3 text-xs text-slate-500">See also: <Link href="/hipaa" className="text-blue-600 hover:underline">HIPAA / Data Handling</Link> and <Link href="/compliance" className="text-blue-600 hover:underline">Compliance overview</Link>.</p>
            </article>

            {/* Cancellation */}
            <article id="cancellation" className="scroll-mt-24 rounded-xl bg-white shadow border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Cancellation & Rescheduling</h2>
              <p className="text-slate-600 leading-relaxed">We aim to balance patient flexibility with provider time. Windows vary by service and timing. For specifics, visit <Link href="/refund" className="text-blue-600 hover:underline">Refund & Cancellation</Link>.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>Cancel ≥ 24h → full refund/credit</li>
                <li>Short‑notice cancellations may be partially refundable</li>
                <li>Provider no‑show → full refund or free reschedule</li>
              </ul>
            </article>

            {/* Code of Conduct */}
            <article id="conduct" className="scroll-mt-24 rounded-xl bg-white shadow border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Code of Conduct</h2>
              <p className="text-slate-600 leading-relaxed">We expect respectful, lawful, and safe behaviour from all participants. Violations may lead to warnings, suspension, or account termination.</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="rounded-lg p-3 border bg-slate-50">Provide accurate information • Keep credentials secure</div>
                <div className="rounded-lg p-3 border bg-slate-50">No harassment, hate, or abuse</div>
                <div className="rounded-lg p-3 border bg-slate-50">No off‑platform payments to bypass safety</div>
                <div className="rounded-lg p-3 border bg-slate-50">Respect session time and house rules</div>
              </div>
            </article>

            {/* Liability */}
            <article id="liability" className="scroll-mt-24 rounded-xl bg-white shadow border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Liability</h2>
              <p className="text-slate-600 leading-relaxed">TheraTreat is a technology platform; healthcare decisions rest with independent professionals. To the extent permitted by law, indirect damages are excluded and direct liability is limited.</p>
              <p className="mt-3 text-sm text-slate-700">See the detailed terms in our <Link href="/termsofUse" className="text-blue-600 hover:underline">Terms of Use</Link>.</p>
            </article>

            {/* Misuse */}
            <article id="misuse" className="scroll-mt-24 rounded-xl bg-white shadow border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Misuse & Abuse</h2>
              <p className="text-slate-600 leading-relaxed">We actively monitor and act on malicious, fraudulent, or harmful behaviour. Accounts involved in abuse may be limited or terminated and relevant authorities may be notified where required.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>Impersonation, spam, illegal content or activity</li>
                <li>Circumventing safety systems or exploiting bugs</li>
                <li>Repeat late cancellations and no‑shows</li>
              </ul>
            </article>

            {/* Accessibility */}
            <article id="accessibility" className="scroll-mt-24 rounded-xl bg-white shadow border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Accessibility</h2>
              <p className="text-slate-600 leading-relaxed">We strive to make our services usable by everyone. We continuously improve colour contrast, keyboard navigation, and compatible screen‑reader labels in line with WCAG guidance.</p>
              <p className="mt-3 text-xs text-slate-500">If you face accessibility barriers, email <a className="text-blue-600 hover:underline" href="mailto:support@theratreat.in">support@theratreat.in</a> with subject “Accessibility”.</p>
            </article>

            {/* Disclaimer */}
            <article id="disclaimer" className="scroll-mt-24 rounded-xl bg-white shadow border border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Disclaimer</h2>
              <p className="text-slate-600 leading-relaxed">Information on TheraTreat is for educational and coordination purposes and should not replace professional clinical judgment. In emergencies, contact local emergency services immediately.</p>
              <p className="mt-3 text-xs text-slate-500">Last updated {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
