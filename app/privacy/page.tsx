"use client";
import { Shield, Lock, Mail, Database, Server, UserCheck, Globe2, Bell, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 1, 2025";

  return (
    <div className="mt-15 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero */}
      <section className="border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-blue-700 border-blue-200">
            <Shield className="w-4 h-4" />
            Your privacy is our priority
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">Privacy Policy</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            How TheraTreat collects, uses, protects, and shares your information across our platform.
          </p>
          <div className="mt-4 flex justify-center gap-2 text-sm">
            <Badge variant="outline" className="bg-white">
              Last updated: {lastUpdated}
            </Badge>
            <Badge variant="outline" className="bg-white">Complies with DPDP 2023</Badge>
            <Badge variant="outline" className="bg-white">GDPR-ready</Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10 grid gap-6">
        {/* Overview */}
        <Card className="border-blue-200 bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-5 h-5" /> 1. Overview
            </CardTitle>
            <CardDescription>
              TheraTreat Technologies Private Limited ("TheraTreat") is committed to protecting your privacy.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-gray-700">
            This policy explains what data we collect, how we use it, and your choices.
          </CardContent>
        </Card>

        {/* Data We Collect */}
        <Card className="border-slate-200 bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-700" /> 2. Data We Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Account and contact information</li>
              <li>Health and assessment data (TheraSelf) and consultation details (TheraBook)</li>
              <li>Purchase information for TheraStore orders</li>
              <li>Learning progress for TheraLearn</li>
              <li>Device and usage data (logs, analytics)</li>
            </ul>
          </CardContent>
        </Card>

        {/* How We Use Data & Security */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-green-700" /> 3. How We Use Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Provide and improve our services</li>
                <li>Process payments and orders</li>
                <li>Prevent fraud and secure our platform</li>
                <li>Personalize content and communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-700" /> 4. Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              We implement 256-bit SSL, encryption at rest, access controls, audits, and follow DPDP 2023, GDPR (as applicable),
              and HIPAA-level safeguards for health data.
            </CardContent>
          </Card>
        </div>

        {/* Sharing & Rights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-teal-700" /> 5. Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              We may share data with service providers (payments, hosting, communications) under strict contracts. We do not sell your personal information.
            </CardContent>
          </Card>

          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-700" /> 6. Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Access, correction, deletion, and portability where applicable</li>
                <li>Withdraw consent to marketing</li>
                <li>Contact us for data requests: privacy@theratreat.in</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="bg-white/80 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-700" /> 7. Contact
            </CardTitle>
            <CardDescription>We’re here to help.</CardDescription>
          </CardHeader>
          <CardContent className="text-gray-700">
            privacy@theratreat.in • support@theratreat.in • +91 8446602680
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
