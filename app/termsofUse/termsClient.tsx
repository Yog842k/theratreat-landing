"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  FileText, ChevronDown, ChevronUp, Shield, Scale, Users, CreditCard, AlertTriangle, Info, Calendar, Lock, Globe, BookOpen, Stethoscope, Brain,
  ShoppingCart, GraduationCap, Building2, UserCheck, Heart, Mail, Phone, MapPin, Clock, Download, Share2, CheckCircle, XCircle, Star, MessageCircle, Zap, Archive, RefreshCw, DollarSign, Eye
} from "lucide-react";

// Wrapper component used by page.tsx
export default function TermsOfUseClient({ setCurrentView }: { setCurrentView?: (v: string) => void }) {
  const [openSections, setOpenSections] = useState<string[]>(["overview"]);
  const toggleSection = (id: string) => setOpenSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">Please read these terms carefully before using TheraTreat platform and services</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Badge variant="outline" className="px-3 py-1"><Calendar className="w-3 h-3 mr-1" />Last Updated: {lastUpdated}</Badge>
            <Badge variant="outline" className="px-3 py-1"><Clock className="w-3 h-3 mr-1" />Effective: {effectiveDate}</Badge>
            <Badge variant="outline" className="px-3 py-1"><Globe className="w-3 h-3 mr-1" />Governed by Indian Law</Badge>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2"><Info className="w-5 h-5" />Important Notice</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 text-sm space-y-4">
            <p>By accessing or using TheraTreat platform and services, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureTile icon={<Users className="w-4 h-4" />} title="Multi-User Platform" desc="Patients, therapists, clinics, instructors, students & vendors" />
              <FeatureTile icon={<Shield className="w-4 h-4" />} title="Healthcare Focused" desc="Specialized health & wellness platform" />
              <FeatureTile icon={<Scale className="w-4 h-4" />} title="Compliance" desc="Aligned with Indian laws & global standards" />
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {TERMS_SECTIONS.map(section => (
            <Card key={section.id} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <Collapsible open={openSections.includes(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">{section.icon}<CardTitle className="text-lg">{section.title}</CardTitle></div>
                      {openSections.includes(section.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 text-sm space-y-4">{section.content}</CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setCurrentView ? setCurrentView('policies') : window.location.assign('/privacy')}><FileText className="w-4 h-4" />Privacy Policy</Button>
          <Button variant="outline" className="flex items-center gap-2"><MessageCircle className="w-4 h-4" />Help Center</Button>
          <Button variant="outline" className="flex items-center gap-2"><Download className="w-4 h-4" />Download PDF</Button>
          <Button variant="outline" className="flex items-center gap-2"><Share2 className="w-4 h-4" />Share Terms</Button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          <p>These terms constitute a legally binding agreement between you and TheraTreat Technologies Private Limited. For questions or concerns, contact <strong>legal@theratreat.com</strong></p>
        </div>
      </div>
    </div>
  );
}

/* --- Sub Components --- */
function FeatureTile({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return <div className="bg-white/60 p-3 rounded-lg"><div className="flex items-center gap-2 mb-1">{icon}<span className="font-semibold">{title}</span></div><p className="text-xs text-slate-600 leading-snug">{desc}</p></div>;
}

function ColoredBlock({ color, icon, title, children }: { color: 'blue'|'purple'|'green'|'orange'; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const map: Record<string,string> = { blue:'bg-blue-50 border-blue-500', purple:'bg-purple-50 border-purple-500', green:'bg-green-50 border-green-500', orange:'bg-orange-50 border-orange-500'};
  return <div className={`p-4 rounded-lg border-l-4 ${map[color]}`}><div className="flex items-center gap-2 mb-2">{icon}<h4 className="font-semibold text-sm">{title}</h4></div><div className="text-xs leading-relaxed text-slate-700 space-y-1">{children}</div></div>;
}

/* --- Section Data (direct transcription of provided spec) --- */
const TERMS_SECTIONS = [
  {
    id: 'overview',
    title: 'Platform Overview and Services',
    icon: <Info className="w-5 h-5" />,
    content: (
      <div className="space-y-4">
        <p>TheraTreat is a comprehensive healthcare technology platform operated by TheraTreat Technologies Private Limited, providing integrated healthcare services through core modules:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColoredBlock color="blue" icon={<Stethoscope className="w-4 h-4 text-blue-600" />} title="TheraBook">Therapy booking & consultations across 35+ specializations.</ColoredBlock>
          <ColoredBlock color="purple" icon={<Brain className="w-4 h-4 text-purple-600" />} title="TheraSelf">AI-driven assessments & self‑diagnostic screening tools.</ColoredBlock>
          <ColoredBlock color="green" icon={<ShoppingCart className="w-4 h-4 text-green-600" />} title="TheraStore">Marketplace for therapy equipment, wellness & medical products.</ColoredBlock>
          <ColoredBlock color="orange" icon={<GraduationCap className="w-4 h-4 text-orange-600" />} title="TheraLearn">Courses, workshops & continuing education (CEUs).</ColoredBlock>
        </div>
        <p>Additional modules: TheraBlog (content), Admin Panel (operations), role‑based dashboards.</p>
      </div>
    )
  },
  {
    id: 'user-types',
    title: 'User Categories and Account Types',
    icon: <Users className="w-5 h-5" />,
    content: (
      <div className="space-y-4 text-sm">
        <p>Platform user categories with tailored permissions:</p>
        <div className="space-y-4">
          <div className="border rounded-lg p-4"><h4 className="font-semibold mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" />Patients / Clients</h4><ul className="space-y-1 text-slate-600 text-xs"><li>• Book sessions & consultations</li><li>• Use AI / self‑assessments</li><li>• Purchase products</li><li>• Access learning & community content</li><li>• Join wellness programs</li></ul></div>
          <div className="border rounded-lg p-4"><h4 className="font-semibold mb-2 flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500" />Healthcare Professionals</h4><ul className="space-y-1 text-slate-600 text-xs"><li>• Provide therapy (video / audio / in‑clinic / home)</li><li>• Manage availability & notes</li><li>• Access patient management tools</li><li>• Participate in professional development</li><li>• Must pass verification</li></ul></div>
          <div className="border rounded-lg p-4"><h4 className="font-semibold mb-2 flex items-center gap-2"><Building2 className="w-4 h-4 text-green-600" />Clinics / Facilities</h4><ul className="space-y-1 text-slate-600 text-xs"><li>• Manage multiple practitioners</li><li>• Coordinate facility appointments</li><li>• Use reporting & admin tools</li><li>• Maintain regulatory compliance</li></ul></div>
          <div className="border rounded-lg p-4"><h4 className="font-semibold mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange-500" />Instructors & Students</h4><ul className="space-y-1 text-slate-600 text-xs"><li>• Create / consume educational content</li><li>• Access certification pathways</li><li>• Engage in peer learning</li></ul></div>
          <div className="border rounded-lg p-4"><h4 className="font-semibold mb-2 flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-purple-500" />Sellers / Vendors</h4><ul className="space-y-1 text-slate-600 text-xs"><li>• List products & manage inventory</li><li>• Fulfill orders & support customers</li><li>• Adhere to quality standards</li></ul></div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-xs text-yellow-800"><strong>Verification:</strong> Professional accounts undergo identity, credential & background checks (avg 5–7 business days).</div>
      </div>
    )
  },
  {
    id: 'service-terms',
    title: 'Service-Specific Terms and Conditions',
    icon: <Stethoscope className="w-5 h-5" />,
    content: (
      <div className="space-y-6 text-xs leading-relaxed">
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-2"><h4 className="font-semibold text-blue-800 flex items-center gap-2 text-sm"><Stethoscope className="w-4 h-4" />TheraBook</h4><p><strong>Session Types:</strong> Video, audio, in‑clinic, home visit.</p><p><strong>Minimum Duration:</strong> 45 minutes.</p><div><strong>Cancellation:</strong><ul className="ml-4 list-disc space-y-1"><li>Video/Audio/In‑Clinic: Free ≥2h prior</li><li>Home: Free ≥3h prior</li><li>50% refund if inside window</li><li>No refund for late / no‑show</li></ul></div><p><strong>Emergency:</strong> Not for emergencies—contact local services.</p></div>
        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 space-y-2"><h4 className="font-semibold text-purple-800 flex items-center gap-2 text-sm"><Brain className="w-4 h-4" />TheraSelf</h4><p>AI assessments are informational—not diagnosis. Data may be anonymized to improve models.</p></div>
        <div className="border border-green-200 rounded-lg p-4 bg-green-50 space-y-2"><h4 className="font-semibold text-green-800 flex items-center gap-2 text-sm"><ShoppingCart className="w-4 h-4" />TheraStore</h4><p><strong>Returns:</strong> 30-day most items; medical devices 7-day; supplements unopened only.</p><p><strong>Shipping:</strong> Standard 5–7d / Express 2–3d / Same-day select cities.</p></div>
        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 space-y-2"><h4 className="font-semibold text-orange-800 flex items-center gap-2 text-sm"><GraduationCap className="w-4 h-4" />TheraLearn</h4><p>Lifetime course access (unless stated). Refund within 7 days if &lt;25% completed. 70% instructor revenue share.</p></div>
      </div>
    )
  },
  {
    id: 'payments',
    title: 'Payment Terms and Billing',
    icon: <CreditCard className="w-5 h-5" />,
    content: (
      <div className="space-y-4 text-xs">
        <div><h4 className="font-semibold text-sm mb-1">Accepted Methods</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><span className="bg-gray-50 p-2 rounded text-center">UPI</span><span className="bg-gray-50 p-2 rounded text-center">Cards</span><span className="bg-gray-50 p-2 rounded text-center">Net Banking</span><span className="bg-gray-50 p-2 rounded text-center">Wallets</span></div></div>
        <div><h4 className="font-semibold text-sm mb-1">Commission</h4><ul className="space-y-1"><li>TheraBook: 15%</li><li>TheraStore: 5–15%</li><li>TheraLearn: 30% platform / 70% instructor</li></ul></div>
        <div><h4 className="font-semibold text-sm mb-1">Refunds</h4><ul className="space-y-1"><li>Processed 3–5 business days</li><li>Original payment method</li><li>Gateway fees may apply</li></ul></div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded"><h4 className="font-semibold text-blue-800 mb-1 text-sm">Security</h4><p className="text-[11px] text-blue-700">256‑bit TLS, PCI DSS; no full card storage.</p></div>
      </div>
    )
  },
  {
    id: 'privacy-security',
    title: 'Data Privacy and Security',
    icon: <Lock className="w-5 h-5" />,
    content: (
      <div className="space-y-4 text-xs">
        <div className="grid md:grid-cols-2 gap-4"><div className="bg-green-50 p-4 rounded"><h5 className="font-semibold mb-2 text-green-800">Technical</h5><ul className="space-y-1"><li>TLS in transit</li><li>AES-256 at rest</li><li>MFA & RBAC</li><li>Pen‑tests & audits</li></ul></div><div className="bg-blue-50 p-4 rounded"><h5 className="font-semibold mb-2 text-blue-800">Compliance</h5><ul className="space-y-1"><li>DPDP 2023</li><li>GDPR (intl)</li><li>HIPAA-like safeguards</li><li>IT Act 2000</li></ul></div></div>
        <div><h5 className="font-semibold mb-1">User Rights</h5><ul className="grid grid-cols-2 gap-2"><li className="bg-gray-50 p-2 rounded">Access</li><li className="bg-gray-50 p-2 rounded">Rectify</li><li className="bg-gray-50 p-2 rounded">Erase</li><li className="bg-gray-50 p-2 rounded">Portability</li></ul></div>
        <div className="bg-red-50 p-4 rounded border border-red-200"><h5 className="font-semibold text-red-800 mb-1">Breach Protocol</h5><p className="text-[11px] text-red-700">Notify affected users & authorities ≤72h of confirmed incident.</p></div>
      </div>
    )
  },
  {
    id: 'user-responsibilities',
    title: 'User Responsibilities & Code of Conduct',
    icon: <Shield className="w-5 h-5" />,
    content: (
      <div className="space-y-4 text-xs">
        <div className="grid md:grid-cols-2 gap-4"><div><h5 className="font-semibold text-green-600 mb-1">Required</h5><ul className="space-y-1"><li>Accurate info</li><li>Keep credentials safe</li><li>Legitimate use</li><li>Attend appointments</li></ul></div><div><h5 className="font-semibold text-red-600 mb-1">Prohibited</h5><ul className="space-y-1"><li>Abuse / harassment</li><li>Off‑platform payments</li><li>IP infringement</li><li>Security circumvention</li></ul></div></div>
        <div className="flex flex-col gap-2"><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /><span>Minor → warning</span></div><div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-orange-500" /><span>Serious → suspension</span></div><div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /><span>Severe → termination</span></div></div>
      </div>
    )
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property Rights',
    icon: <Archive className="w-5 h-5" />,
    content: (
      <div className="space-y-4 text-xs">
        <p>Platform IP includes code, algorithms, UI/UX, trademarks, proprietary assessments, databases & documentation.</p>
        <div className="border rounded p-3"><h5 className="font-semibold mb-1">User Content</h5><p>Original content remains yours; you grant a non‑exclusive, worldwide, royalty‑free license for platform operation & improvement.</p></div>
        <div className="bg-purple-50 border border-purple-200 p-4 rounded"><h5 className="font-semibold text-purple-800 mb-1">DMCA</h5><p className="text-[11px] text-purple-700">Report infringement: legal@theratreat.com</p></div>
      </div>
    )
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers & Limitations',
    icon: <AlertTriangle className="w-5 h-5" />,
    content: (
      <div className="space-y-4 text-xs">
        <div className="bg-red-50 p-4 rounded border border-red-200"><h5 className="font-semibold text-red-800 mb-1">Medical Disclaimer</h5><p>TheraTreat is a technology platform—not a medical provider. Professionals are solely responsible for clinical decisions. Not for emergencies.</p></div>
        <div><h5 className="font-semibold mb-1">Liability</h5><p>Direct liability capped to fees paid last 12 months (≤₹10,000). No liability for indirect or consequential damages.</p></div>
      </div>
    )
  },
  {
    id: 'dispute-resolution',
    title: 'Dispute Resolution & Governing Law',
    icon: <Scale className="w-5 h-5" />,
    content: (
      <div className="space-y-4 text-xs">
        <ol className="list-decimal ml-5 space-y-1"><li>Direct communication</li><li>Formal complaint (disputes@theratreat.com) ≤7 days</li><li>Investigation (≤14 business days)</li><li>Mediation</li><li>Binding arbitration (Arbitration & Conciliation Act, 2015)</li></ol>
        <div className="bg-gray-50 p-3 rounded"><ul className="space-y-1"><li><strong>Law:</strong> India (Maharashtra)</li><li><strong>Jurisdiction:</strong> Mumbai courts</li><li><strong>Arbitration Seat:</strong> Mumbai</li></ul></div>
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded"><h5 className="font-semibold text-yellow-800 mb-1">Appeals</h5><p className="text-[11px] text-yellow-700">Appeal within 7 days: appeals@theratreat.com</p></div>
      </div>
    )
  },
  {
    id: 'modifications',
    title: 'Terms Modification & Contact',
    icon: <RefreshCw className="w-5 h-5" />,
    content: (
      <div className="space-y-4 text-xs">
        <div className="border rounded p-3"><h5 className="font-semibold mb-1">Changes & Notice</h5><ul className="space-y-1"><li>30‑day notice for material updates</li><li>Email + in‑app banners</li><li>Archive of prior versions on request</li></ul></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded p-3"><h5 className="font-semibold mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" />Email</h5><ul className="space-y-1"><li>support@theratreat.com</li><li>legal@theratreat.com</li><li>disputes@theratreat.com</li><li>privacy@theratreat.com</li></ul></div>
          <div className="border rounded p-3"><h5 className="font-semibold mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-green-500" />Phone</h5><ul className="space-y-1"><li>+91-XXXXXXXXXX (Customer)</li><li>+91-XXXXXXXXXX (Professional)</li></ul></div>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded"><h5 className="font-semibold text-green-800 mb-1">Company Info</h5><p>TheraTreat Technologies Private Limited • CIN U72200MH2024PTC[XXXXXX]</p></div>
      </div>
    )
  }
];
