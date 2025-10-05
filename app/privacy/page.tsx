export const metadata = {
  title: 'Privacy Policy | TheraTreat',
  description: 'How TheraTreat collects, processes, protects and governs personal & health information.'
};

import Navigation from '@/components/Navigation';

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'collection', title: 'Data We Collect' },
  { id: 'use', title: 'How We Use Data' },
  { id: 'legal-basis', title: 'Legal Basis' },
  { id: 'sharing', title: 'Sharing & Disclosures' },
  { id: 'security', title: 'Security Controls' },
  { id: 'retention', title: 'Retention' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'children', title: 'Children' },
  { id: 'changes', title: 'Changes' },
  { id: 'contact', title: 'Contact' }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gradient-to-b from-white via-blue-50/40 to-blue-100/30">
        {/* Decorative top band */}
        <div className="h-40 w-full bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 -mt-28 pb-24">
          <div className="grid lg:grid-cols-[230px_1fr] gap-10 lg:gap-16">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block pt-32">
              <nav aria-label="Privacy Policy Sections" className="sticky top-28 space-y-4 text-sm">
                <div className="font-semibold text-slate-700 uppercase tracking-wide text-xs">On this page</div>
                <ul className="space-y-2 border-l border-slate-200 pl-4">
                  {sections.map(s => (
                    <li key={s.id}>
                      <a href={`#${s.id}`}
                         className="group flex items-start gap-2 text-slate-500 hover:text-slate-900 transition-colors leading-snug">
                        <span className="w-1 h-5 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                        <span className="flex-1">{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
            {/* Main content */}
            <article className="pt-8 lg:pt-32 space-y-14">
              <header className="space-y-6 max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Privacy Policy</h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  Transparency, patient trust, and principled data minimization guide how we handle personal and health information.
                  This policy explains what we collect, why, how it's secured, and the rights you can exercise.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="px-2 py-1 rounded bg-white/70 border border-slate-200 shadow-sm">Last Updated: Oct 2025</span>
                  <span className="px-2 py-1 rounded bg-white/70 border border-slate-200 shadow-sm">Jurisdiction: India (DPDP)</span>
                  <span className="px-2 py-1 rounded bg-white/70 border border-slate-200 shadow-sm">HIPAA Aware</span>
                </div>
              </header>

              <Section id="overview" title="Overview">
                We collect only the data required to provide secure booking, communication, assessment workflows, educational access
                and platform safety. We avoid unnecessary sensitive fields and periodically review minimization opportunities.
              </Section>

              <Section id="collection" title="Data We Collect">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Account:</strong> Name, email, role, hashed credentials.</li>
                  <li><strong>Profile / Clinical Context:</strong> Age range, therapy preferences, optional history notes (only when explicitly entered).</li>
                  <li><strong>Operational:</strong> Booking metadata, session timing, notification preferences.</li>
                  <li><strong>Technical:</strong> Pseudonymous device & interaction telemetry for reliability and abuse prevention.</li>
                </ul>
              </Section>

              <Section id="use" title="How We Use Data">
                Deliver core platform features, personalize recommendations, protect safety & integrity, comply with applicable
                regulations, and improve service quality (QA & analytics with aggregated / de‑identified approaches where feasible).
              </Section>

              <Section id="legal-basis" title="Legal Basis (DPDP Principles)">
                Consent for user‑initiated actions (bookings, assessments), legitimate use for safety, fraud prevention, and contractual
                necessity for service delivery. We apply purpose limitation and retention discipline.
              </Section>

              <Section id="sharing" title="Sharing & Disclosures">
                Limited to: (i) treating therapists for session context, (ii) infrastructure / communication sub‑processors (email, video,
                payment) under agreements, (iii) lawful regulatory requests. We do not sell personal information.
              </Section>

              <Section id="security" title="Security Controls">
                Encryption in transit (TLS) and at rest (managed storage), role-based access control, audit trails, secret rotation,
                environment isolation, and least privilege principles. Periodic review of access & anomaly monitoring.
              </Section>

              <Section id="retention" title="Retention">
                Data retained for active account duration plus minimal operational / legal retention windows. Redundant backups follow
                scheduled expiry. We anonymize or delete when no longer required.
              </Section>

              <Section id="rights" title="Your Rights">
                Request access / export, correction, withdrawal of certain consents, and account deletion (subject to clinical or legal
                retention obligations). Contact us to initiate a rights request.
              </Section>

              <Section id="children" title="Children & Minors">
                Accounts for minors must be created/managed by a parent/guardian or authorized caregiver. We do not knowingly collect
                data directly from children without appropriate consent.
              </Section>

              <Section id="changes" title="Changes to this Policy">
                Material updates will be announced within the platform with a revision date. Continued use after changes indicates acceptance.
              </Section>

              <Section id="contact" title="Contact">
                Privacy queries or rights requests: <a href="mailto:privacy@theratreat.in" className="text-blue-600 hover:underline">privacy@theratreat.in</a>. General support: <a href="mailto:support@theratreat.in" className="text-blue-600 hover:underline">support@theratreat.in</a>.
              </Section>

              <div className="pt-4 text-xs text-slate-500">If translation differences occur, the English version prevails.</div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 group">
      <div className="space-y-4 relative bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm ring-1 ring-transparent hover:ring-blue-100 transition-shadow">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-800 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-colors" />
          {title}
        </h2>
        <div className="prose prose-slate max-w-none text-sm md:text-[15px] leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}
