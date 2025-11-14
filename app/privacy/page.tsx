export const metadata = {
  title: 'Privacy & Security Policy | TheraTreat',
  description: 'Comprehensive TheraTreat Privacy & Security Policy covering collection, usage, sharing, security, DPDP compliance, HIPAA‑like safeguards, rights, cookies, retention, and grievance process.'
};

// Navigation is already included in root layout
// Table of contents (mirrors enumerated sections below)
const sections = [
  { id: 'information-we-collect', title: '1. Information We Collect' },
  { id: 'how-we-use', title: '2. How We Use Your Data' },
  { id: 'sharing-disclosure', title: '3. Data Sharing & Disclosure' },
  { id: 'security-storage', title: '4. Data Security & Storage' },
  { id: 'hipaa-like', title: '5. HIPAA-like Safeguards' },
  { id: 'dpdp-compliance', title: '6. India’s DPDP Compliance' },
  { id: 'user-rights', title: '7. User Rights' },
  { id: 'cookies-tracking', title: '8. Cookies & Tracking' },
  { id: 'data-retention', title: '9. Data Retention' },
  { id: 'international-transfers', title: '10. International Transfers' },
  { id: 'children-privacy', title: '11. Children’s Privacy' },
  { id: 'third-party-services', title: '12. Third-Party Services' },
  { id: 'your-responsibilities', title: '13. Your Responsibilities' },
  { id: 'grievance-dpo', title: '14. Grievance & DPO' },
  { id: 'policy-updates', title: '15. Policy Updates' },
  { id: 'privacy-promise', title: 'Privacy Promise' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-1 bg-white">
        {/* Decorative top band */}
        <div className="max-w-7xl mt-10 mx-auto px-5 lg:px-8 pb-24">
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">TheraTreat Privacy & Security Policy</h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  TheraTreat Health Pvt. Ltd. ("TheraTreat", "we", "our", "us") values the privacy and security of all users—clients, therapists, and partners.
                  By using our website, mobile app, or services you agree to the practices described in this policy.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="px-2 py-1 rounded bg-white/70 border border-slate-200 shadow-sm">Last Updated: 05 Oct 2025</span>
                  <span className="px-2 py-1 rounded bg-white/70 border border-slate-200 shadow-sm">Jurisdiction: India (DPDP)</span>
                  <span className="px-2 py-1 rounded bg-white/70 border border-slate-200 shadow-sm">HIPAA Aware</span>
                </div>
              </header>

              <Section id="information-we-collect" title="1. Information We Collect">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Personal Information:</strong> Name, age, gender, email, phone, address, IDs (where legally required).</li>
                  <li><strong>Health & Therapy Information:</strong> Medical history, therapy goals, assessments, consultation details, prescriptions, uploaded reports.</li>
                  <li><strong>Payment Information:</strong> Card / UPI / bank details processed via secure PCI-DSS compliant gateways (we do not store raw card numbers).</li>
                  <li><strong>Technical Information:</strong> Device type, IP address, browser, cookies, usage patterns, performance telemetry for reliability.</li>
                  <li><strong>Communications:</strong> Messages, calls or session notes (sessions are not recorded unless you explicitly consent).</li>
                </ul>
              </Section>

              <Section id="how-we-use" title="2. How We Use Your Data">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Enable booking, consultations, and client–therapist communication.</li>
                  <li>Personalize recommendations & enhance user experience.</li>
                  <li>Process secure payments and generate invoices / receipts.</li>
                  <li>Send reminders, notifications, and occasional offers (opt‑out available).</li>
                  <li>Meet legal, ethical, and regulatory obligations.</li>
                </ul>
              </Section>

              <Section id="sharing-disclosure" title="3. Data Sharing & Disclosure">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>With Therapists:</strong> Only relevant information required for therapy delivery.</li>
                  <li><strong>With Payment Partners:</strong> For secure transaction processing.</li>
                  <li><strong>With Regulators / Authorities:</strong> Where required by applicable law or court order.</li>
                </ul>
                <p className="mt-4"><span className="font-semibold text-slate-800">We never sell or rent your data</span> to advertisers or unrelated third parties.</p>
              </Section>

              <Section id="security-storage" title="4. Data Security & Storage">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Encryption in transit (TLS) & at rest (provider‑managed storage).</li>
                  <li>Role-based & least‑privilege access controls.</li>
                  <li>Firewalls, periodic audits, security testing & dependency patching.</li>
                  <li>Secure backups with restricted access.</li>
                </ul>
              </Section>

              <Section id="hipaa-like" title="5. HIPAA-like Safeguards (Global Standard)">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Confidentiality:</strong> No disclosure without consent except emergencies / legal duty.</li>
                  <li><strong>Integrity:</strong> Controls to prevent unauthorized changes.</li>
                  <li><strong>Access Controls:</strong> Strong authentication & session management.</li>
                  <li><strong>Audit Trails:</strong> Logged access & critical actions for compliance review.</li>
                  <li><strong>Breach Notification:</strong> Users notified within 72 hours of a confirmed material breach.</li>
                </ul>
              </Section>

              <Section id="dpdp-compliance" title="6. India’s DPDP Act Compliance">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Consent First:</strong> Explicit consent for collection & use.</li>
                  <li><strong>User Rights:</strong> Access, correction, withdrawal & deletion supported.</li>
                  <li><strong>Data Fiduciary Responsibility:</strong> TheraTreat assumes accountability for lawful use.</li>
                  <li><strong>Grievance Redressal:</strong> Dedicated Data Protection Officer (DPO) contact channel.</li>
                </ul>
              </Section>

              <Section id="user-rights" title="7. User Rights">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Request a copy / export of your data.</li>
                  <li>Correct inaccuracies and update profile information.</li>
                  <li>Request deletion (subject to clinical / legal retention requirements).</li>
                  <li>Withdraw consent for non‑essential processing.</li>
                  <li>File a complaint with us or escalate to the Data Protection Board of India.</li>
                </ul>
              </Section>

              <Section id="cookies-tracking" title="8. Cookies & Tracking">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Essential:</strong> Core session & security functions.</li>
                  <li><strong>Analytics:</strong> Performance & feature improvement.</li>
                  <li><strong>Marketing (Optional):</strong> Only set with consent.</li>
                </ul>
                <p className="mt-4">You can manage or clear cookies in your browser settings. Blocking some may impact functionality.</p>
              </Section>

              <Section id="data-retention" title="9. Data Retention">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Health Records:</strong> Retained for at least 3 years (per Indian telemedicine / medical guidelines) unless longer retention is mandated.</li>
                  <li><strong>Other Data:</strong> Kept only as long as necessary for service or compliance.</li>
                  <li><strong>Deleted Data:</strong> Purged from active systems and removed from backups on lifecycle expiry.</li>
                </ul>
              </Section>

              <Section id="international-transfers" title="10. International Data Transfers">
                Data may be processed on secure servers located in India. For cross‑border therapist collaboration or infrastructure providers,
                we apply equivalent contractual and technical safeguards.
              </Section>

              <Section id="children-privacy" title="11. Children’s Privacy">
                We do not knowingly collect data from children under 18 without verified parental / guardian consent. Pediatric therapy
                accounts require guardian oversight.
              </Section>

              <Section id="third-party-services" title="12. Third-Party Services">
                We integrate vetted third parties (e.g., payment gateways, communications, analytics). Each provider operates under its own
                privacy terms; we enforce contractual safeguards and minimum necessary data sharing.
              </Section>

              <Section id="your-responsibilities" title="13. Your Responsibilities">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Maintain confidentiality of your login credentials.</li>
                  <li>Avoid sharing exported session notes with unauthorized persons.</li>
                  <li>Report suspicious or unauthorized account activity immediately.</li>
                </ul>
              </Section>

              <Section id="grievance-dpo" title="14. Grievance Redressal & Data Protection Officer (DPO)">
                <div className="space-y-4">
                  <p>For any concern about your personal / health data, perceived misuse, breach notification queries, or to exercise a data right, please reach out using the channels below. We aim to acknowledge all legitimate grievances within <strong>48 hours</strong> and to provide a substantive response within <strong>15 working days</strong>.</p>
                  <address className="not-italic text-sm leading-relaxed space-y-1">
                    <div className="font-semibold text-slate-800">Primary Contact (Support / Rights Requests)</div>
                    <div>📧 <a href="mailto:support@theratreat.in" className="text-blue-600 hover:underline">support@theratreat.in</a></div>
                    <div>📞 +91-XXXXXXXXXX (Mon–Fri 9:30 AM – 6:30 PM IST)</div>
                    <div className="pt-3 font-semibold text-slate-800">Data Protection & Escalations</div>
                    <div>📧 DPO: <a href="mailto:dpo@theratreat.in" className="text-blue-600 hover:underline">dpo@theratreat.in</a></div>
                    <div>📧 Grievance Officer: <a href="mailto:grievance@theratreat.in" className="text-blue-600 hover:underline">grievance@theratreat.in</a></div>
                    <div className="pt-3 font-semibold text-slate-800">Registered Office (for written correspondence)</div>
                    <div>TheraTreat Health Pvt. Ltd.</div>
                    <div>3rd Floor, (Building Name / Tech Park)</div>
                    <div>Plot / Street Line, Business District</div>
                    <div>Pune, Maharashtra 4110XX, India</div>
                    <div className="text-xs text-slate-500">(Replace placeholder address lines with final ROC registered address before production).</div>
                  </address>
                  <div className="text-xs text-slate-500 space-y-2">
                    <p>If you remain unsatisfied after our final response, you may escalate to the <strong>Data Protection Board of India</strong> under the Digital Personal Data Protection Act, 2023.</p>
                    <p>For security incidents, please include: a brief description, suspected date/time, any indicators (logs / headers), and impact scope if known.</p>
                  </div>
                </div>
              </Section>

              <Section id="policy-updates" title="15. Policy Updates">
                We may update this Policy periodically. Revised versions will show a new “Last Updated” date. Material changes will be
                communicated via in‑app notification or email. Continued use indicates acceptance.
              </Section>

              <Section id="privacy-promise" title="Privacy Promise">
                Your trust matters most. We keep sessions private, data safeguarded, and user rights respected. If you believe any aspect of
                this policy is unclear or incomplete, reach out so we can improve transparency.
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
