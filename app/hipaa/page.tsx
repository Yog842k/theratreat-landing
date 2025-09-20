"use client";
import { ShieldCheck, Lock, FileWarning, Mail, ServerCog, KeySquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HIPAACompliancePage() {
  return (
    <div className="mt-15 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero */}
      <section className="border-b border-indigo-100">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-indigo-700 border-indigo-200">
            <ShieldCheck className="w-4 h-4" />
            HIPAA-aligned safeguards
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">HIPAA Compliance</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            We adopt HIPAA-level security practices, in addition to DPDP 2023 compliance in India, to protect health data.
          </p>
          <div className="mt-4 flex justify-center gap-2 text-sm">
            <Badge variant="outline" className="bg-white">Encryption in Transit & At Rest</Badge>
            <Badge variant="outline" className="bg-white">Access Controls</Badge>
            <Badge variant="outline" className="bg-white">Audit Logs</Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10 grid gap-6">
        {/* Technical Controls */}
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Lock className="w-5 h-5" /> Technical & Administrative Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Encryption (TLS in transit, AES at rest)</li>
              <li>Role-based access controls and MFA</li>
              <li>Audit logging and periodic reviews</li>
              <li>Secure hosting and network segmentation</li>
            </ul>
          </CardContent>
        </Card>

        {/* Breach Notification */}
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <FileWarning className="w-5 h-5" /> Breach Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            If a security incident occurs, we notify affected users and relevant authorities based on applicable laws and best practices.
          </CardContent>
        </Card>

        {/* Monitoring */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServerCog className="w-5 h-5 text-indigo-700" /> Continuous Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Regular audits, vulnerability assessments, and proactive threat monitoring to keep your data safe.
            </CardContent>
          </Card>

          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeySquare className="w-5 h-5 text-indigo-700" /> Access & Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Strict, least-privilege access; informed consent required for sessions; additional consent for recordings.
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="bg-white/80 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-700" /> Contact
            </CardTitle>
            <CardDescription>We’re here to help.</CardDescription>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-1">
            <p>compliance@theratreat.in • privacy@theratreat.in • +91 8446602680</p>
            <p className="text-sm text-gray-600">
              Registered Office: 1503/2, Jadhav Nagar, Shikrapur, Shirur, Pune 412208, Maharashtra
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
