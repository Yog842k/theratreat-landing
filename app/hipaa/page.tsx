export const metadata = {
  title: 'HIPAA & Data Security | TheraTreat',
  description: 'TheraTreat Data Security Policy: HIPAA‑aligned safeguards and DPDP compliance for protecting your personal and health data.'
};

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, KeyRound, Database, Scale, Users, Fingerprint, Server, AlertTriangle, FileWarning, Clock, Mail, PhoneCall } from 'lucide-react';

export default function HipaaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-indigo-50 py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 px-4 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> HIPAA‑Aligned • DPDP Compliant
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">TheraTreat Data Security Policy</h1>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">Your trust is our highest priority. We protect your personal, health, and financial data with state‑of‑the‑art security measures aligned with the Digital Personal Data Protection Act, 2023 (DPDP) and HIPAA safeguards.</p>
        </section>

        {/* Quick Facts */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4 text-blue-600" /> AES‑256 at Rest</CardTitle>
              <CardDescription>Best‑practice encryption</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Data encrypted at rest and via TLS 1.3 in transit.</CardContent>
          </Card>
          <Card className="border-indigo-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><KeyRound className="w-4 h-4 text-indigo-600" /> RBAC + MFA</CardTitle>
              <CardDescription>Least privilege</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Role‑based access; MFA for therapists and clinics.</CardContent>
          </Card>
          <Card className="border-emerald-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-600" /> DPDP Aligned</CardTitle>
              <CardDescription>Consent & rights</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Consent, purpose limitation, access/erase rights.</CardContent>
          </Card>
          <Card className="border-amber-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Server className="w-4 h-4 text-amber-600" /> ISO 27001 Infra</CardTitle>
              <CardDescription>Hardened hosting</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Audited environments with monitoring and alerts.</CardContent>
          </Card>
        </section>

        {/* Sections */}
        <section className="space-y-8">
          {/* 1. Strong Encryption Standards */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Lock className="w-5 h-5 text-blue-600" /> 1. Strong Encryption Standards</CardTitle>
              <CardDescription>Protecting PHI and payments end‑to‑end</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>All sensitive data (health records, therapy notes, payment info) is encrypted using <strong>AES‑256</strong>.</li>
                <li>Data is encrypted <strong>in transit</strong> via <strong>HTTPS/TLS 1.3</strong> and <strong>at rest</strong> in secure storage.</li>
                <li>Payment transactions are processed by <strong>PCI‑DSS</strong> compliant gateways (e.g., Razorpay).</li>
              </ul>
            </CardContent>
          </Card>

          {/* 2. DPDP Compliance */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Scale className="w-5 h-5 text-emerald-600" /> 2. Compliance with DPDP Act, 2023</CardTitle>
              <CardDescription>Lawful basis, consent, and user rights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>We process personal data only for clear, lawful purposes related to therapy and operations.</li>
                <li><strong>Consent</strong> is obtained before collecting personal or health information.</li>
                <li>You may <strong>access</strong>, <strong>correct</strong>, <strong>update</strong>, or <strong>request deletion</strong> of your data.</li>
                <li>A Data Protection Officer (DPO) oversees compliance and responds to requests.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Role-Based Access Controls */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Users className="w-5 h-5 text-indigo-600" /> 3. Role‑Based Access Controls</CardTitle>
              <CardDescription>Least‑privilege access with identity assurance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Only authorised personnel (therapists, clinics, and you) can access relevant data.</li>
                <li><strong>MFA</strong> is required for therapists and clinics; session controls and activity logging enforced.</li>
                <li>Periodic access reviews keep privileges current and minimal.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. Secure Infrastructure */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Database className="w-5 h-5 text-green-600" /> 4. Secure Infrastructure</CardTitle>
              <CardDescription>Hardened cloud, monitoring, and testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Hosted on <strong>ISO 27001</strong> certified providers with regular vulnerability scans.</li>
                <li>Firewalls, intrusion detection, and real‑time monitoring safeguard systems.</li>
                <li>Regular security audits and penetration testing ensure ongoing protection.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Data Retention & Deletion */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><FileWarning className="w-5 h-5 text-amber-600" /> 5. Data Retention & Deletion</CardTitle>
              <CardDescription>Retention limits and verifiable deletion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Health and therapy data is stored only for required durations and service continuity.</li>
                <li>You may request deletion at any time, subject to legal requirements.</li>
                <li>Deleted data is irreversibly removed from live and backup systems per schedule.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Breach Notification */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><AlertTriangle className="w-5 h-5 text-red-600" /> 6. Breach Notification</CardTitle>
              <CardDescription>Transparent, timely communication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <p>In the unlikely event of a data breach:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Users will be informed promptly.</li>
                <li>Corrective measures will be taken immediately.</li>
                <li>Authorities will be notified as required by the DPDP Act.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 7. Your Responsibilities */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Fingerprint className="w-5 h-5 text-slate-700" /> 7. Your Responsibilities</CardTitle>
              <CardDescription>Simple steps to keep your account safe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Use strong passwords and don’t share your credentials.</li>
                <li>Log out after using shared devices.</li>
                <li>Report suspicious activity immediately at <a className="text-blue-600 hover:underline" href="mailto:security@theratreat.com">security@theratreat.com</a>.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 8. Contact Our Data Protection Officer */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><ShieldCheck className="w-5 h-5 text-blue-600" /> 8. Contact Our Data Protection Officer</CardTitle>
              <CardDescription>Reach out for privacy or security concerns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-slate-700">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /><a className="text-blue-600 hover:underline" href="mailto:dpo@theratreat.com">dpo@theratreat.com</a></div>
                <div className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-blue-600" /><a className="text-blue-600 hover:underline" href="tel:+918446602680">+91 8446602680</a></div>
              </div>
              <p className="text-xs text-slate-500">For details on personal data handling, see our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. For platform‑wide policies (accessibility, cancellation, etc.), visit <Link href="/policies" className="text-blue-600 hover:underline">Policies</Link>.</p>
            </CardContent>
          </Card>
        </section>

        {/* Footer note */}
        <div className="text-center text-xs text-slate-500">
          Last updated {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </main>
  );
}
