export const metadata = {
  title: 'Compliance | TheraTreat',
  description: 'Our regulatory and ethical compliance program: DPDP, clinical verification, operational controls, and audits.'
};

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Scale, Stethoscope, FileCheck2, UserCheck, ClipboardList, SearchCheck, Lock } from 'lucide-react';

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-indigo-50 py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 px-4 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> Ethics • Safety • Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Compliance at TheraTreat</h1>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">We operate with patient safety, clinician standards, and regulatory compliance at the core. Below is how we maintain trust across policy, process, and product.</p>
        </section>

        {/* Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-emerald-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-600" /> DPDP Principles</CardTitle>
              <CardDescription>Consent & rights</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Lawful processing, purpose limitation, deletion on request.</CardContent>
          </Card>
          <Card className="border-indigo-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Stethoscope className="w-4 h-4 text-indigo-600" /> Clinical Verification</CardTitle>
              <CardDescription>Quality first</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Credential checks, disciplinary screening, reliability scoring.</CardContent>
          </Card>
          <Card className="border-blue-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4 text-blue-600" /> Security Controls</CardTitle>
              <CardDescription>Defense in depth</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Encryption, RBAC, logs, environment isolation.</CardContent>
          </Card>
          <Card className="border-amber-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4 text-amber-600" /> Audits</CardTitle>
              <CardDescription>Continuous review</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Internal audits, external assessments, corrective actions.</CardContent>
          </Card>
        </section>

        {/* Sections */}
        <section className="space-y-8">
          {/* DPDP & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Scale className="w-5 h-5 text-emerald-600" /> DPDP & Privacy</CardTitle>
              <CardDescription>Digital Personal Data Protection Act, 2023 alignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Consent‑based processing with clear lawful purposes.</li>
                <li>Purpose limitation, minimisation, and defined retention schedules.</li>
                <li>User rights: access, rectification, portability, erasure on request.</li>
                <li>Dedicated DPO for requests and oversight.</li>
              </ul>
              <p className="text-xs text-slate-500">See our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and <Link href="/hipaa" className="text-blue-600 hover:underline">HIPAA / Data Security</Link> for implementation details.</p>
            </CardContent>
          </Card>

          {/* Clinical Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Stethoscope className="w-5 h-5 text-indigo-600" /> Clinical Standards</CardTitle>
              <CardDescription>Therapist verification and practice quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Identity & credential verification prior to listing.</li>
                <li>Background and disciplinary screening; periodic re‑checks.</li>
                <li>Reliability metrics from attendance and patient feedback.</li>
                <li>Clear escalation paths for complaints and grievances.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Operational Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><FileCheck2 className="w-5 h-5 text-blue-600" /> Operational Compliance</CardTitle>
              <CardDescription>Controls across people, process, and technology</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>RBAC, MFA, session controls, and activity logging.</li>
                <li>Change management with reviews and approvals.</li>
                <li>Vendor due diligence and data processing agreements.</li>
                <li>Incident response runbooks and simulated drills.</li>
              </ul>
              <p className="text-xs text-slate-500">Technical controls are summarised on <Link href="/hipaa" className="text-blue-600 hover:underline">HIPAA / Data Security</Link>.</p>
            </CardContent>
          </Card>

          {/* Audits & Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><SearchCheck className="w-5 h-5 text-amber-600" /> Audits & Monitoring</CardTitle>
              <CardDescription>Continuous assurance and corrective actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Internal audits on privacy, security, and clinical operations.</li>
                <li>External assessments as needed for certifications and partners.</li>
                <li>Tracking of findings to closure with accountable owners.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact & References */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><UserCheck className="w-5 h-5 text-slate-700" /> Contact & References</CardTitle>
              <CardDescription>Where to learn more and who to reach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
              <p>For compliance queries or reports, please contact our DPO at <a className="text-blue-600 hover:underline" href="mailto:dpo@theratreat.com">dpo@theratreat.com</a>.</p>
              <p className="text-xs text-slate-500">Related: <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> • <Link href="/hipaa" className="text-blue-600 hover:underline">HIPAA / Data Security</Link> • <Link href="/policies#accessibility" className="text-blue-600 hover:underline">Accessibility</Link> • <Link href="/refund" className="text-blue-600 hover:underline">Refund & Cancellation</Link></p>
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
