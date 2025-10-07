export const metadata = {
  title: 'Refund & Cancellation | TheraTreat',
  description: 'Refund and cancellation policy for TheraTreat bookings and purchases.'
};

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ShieldCheck, Clock, RefreshCcw, HelpCircle, CreditCard, AlertTriangle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/50 to-indigo-50 py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Hero */}
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 px-4 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> Fair & Transparent
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Refund & Cancellation Policy</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">Our goal is to keep things predictable, fair, and patient‑first while respecting provider time. This page explains how cancellations, reschedules, and refunds work across TheraTreat services.</p>
        </section>

        {/* Quick Summary Chips */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /> Standard Sessions</CardTitle>
              <CardDescription>24h full refund window</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Cancel ≥24h → 100% refund / credit. Inside window → partial.</CardContent>
          </Card>
          <Card className="border-emerald-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-emerald-600" /> Provider No‑Show</CardTitle>
              <CardDescription>Always protected</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Full refund or free reschedule of your choice.</CardContent>
          </Card>
            <Card className="border-indigo-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4 text-indigo-600" /> Processing Time</CardTitle>
              <CardDescription>Speed & transparency</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Refunds typically settle 3–5 business days (gateway dependent).</CardContent>
          </Card>
          <Card className="border-amber-200/70 bg-white/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> Late / No‑Show</CardTitle>
              <CardDescription>Fair use policy</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">Repeated late cancellations may limit booking privileges.</CardContent>
          </Card>
        </section>

        {/* Cancellation Windows Table */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Session Cancellation Windows</h2>
            <p className="text-slate-600 text-sm">Applies to video, audio, in‑clinic, and home visit sessions unless a provider publishes a stricter policy.</p>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When You Cancel</TableHead>
                    <TableHead>Refund</TableHead>
                    <TableHead>Credit Option</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">≥ 24h before</TableCell>
                    <TableCell><Badge variant="secondary">100%</Badge></TableCell>
                    <TableCell>Yes (full session credit)</TableCell>
                    <TableCell className="text-slate-600">Instant cancellation, slot released</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>12–24h before</TableCell>
                    <TableCell><Badge>50%</Badge></TableCell>
                    <TableCell>Yes (75% credit)</TableCell>
                    <TableCell className="text-slate-600">Provider prep partially incurred</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2–12h before</TableCell>
                    <TableCell><Badge className="bg-amber-500 hover:bg-amber-500">25%</Badge></TableCell>
                    <TableCell>Yes (50% credit)</TableCell>
                    <TableCell className="text-slate-600">Short‑notice impact</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>&lt; 2h / No‑show</TableCell>
                    <TableCell><Badge className="bg-rose-500 hover:bg-rose-500">0%</Badge></TableCell>
                    <TableCell>No</TableCell>
                    <TableCell className="text-slate-600">Session deemed consumed</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Provider cancels / no‑show</TableCell>
                    <TableCell><Badge className="bg-emerald-600 hover:bg-emerald-600">100%</Badge></TableCell>
                    <TableCell>Or free reschedule</TableCell>
                    <TableCell className="text-slate-600">We monitor provider reliability</TableCell>
                  </TableRow>
                </TableBody>
                <TableCaption className="text-xs">Credits can be used only for the same service category and expire in 90 days.</TableCaption>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Other Product Types */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Other Purchases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">TheraLearn (Courses)</CardTitle>
                <CardDescription>Self‑paced or cohort learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-slate-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Refund within 7 days if &lt; 25% content consumed.</li>
                  <li>No refund after certificate issued or &gt; 50% progress.</li>
                  <li>Instructor revenue share adjustments on refund.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">TheraStore (Physical / Kits)</CardTitle>
                <CardDescription>Devices, worksheets, wellness kits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-slate-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Return request within 7 days of delivery.</li>
                  <li>Unopened / hygienic items must be sealed.</li>
                  <li>Shipping & gateway fees non‑refundable unless defective.</li>
                  <li>Defective items replaced or refunded 100%.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How to Request */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">How to Request a Refund</h2>
          <ol className="list-decimal pl-6 space-y-3 text-sm leading-relaxed text-slate-700">
            <li>Go to Dashboard → Bookings → select the session and click <strong>Request Refund</strong> or <strong>Cancel</strong>.</li>
            <li>Choose a reason (optional screenshot / notes for provider).</li>
            <li>Submit. We confirm instantly; funds move after provider validation if required.</li>
            <li>Track status in Refunds tab: Pending → Approved → Settled.</li>
          </ol>
          <p className="text-xs text-slate-500">If payment was made via wallet credit, refund posts instantly back to your balance.</p>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-600" /> Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full border rounded-lg bg-white/70 backdrop-blur">
            <AccordionItem value="f1">
              <AccordionTrigger>Can I convert a refund into session credit?</AccordionTrigger>
              <AccordionContent>Yes. During cancellation you can pick credit. Credits apply immediately and bypass bank settlement delays.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="f2">
              <AccordionTrigger>What if my therapist is repeatedly late?</AccordionTrigger>
              <AccordionContent>Please flag inside the session summary. Reliability scoring may restrict provider visibility. Repeated provider faults = fee‑free cancellation.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="f3">
              <AccordionTrigger>Why do gateway fees sometimes not return?</AccordionTrigger>
              <AccordionContent>Payment processors may retain non‑refundable charges after authorization. We only pass through actual third‑party loss—never markup.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="f4">
              <AccordionTrigger>Can I dispute an outcome?</AccordionTrigger>
              <AccordionContent>Yes. Contact support with booking ID and brief context. Escalations resolved within 3 business days by a neutral review team.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Legal + Contact */}
        <section className="space-y-3 text-xs text-slate-500">
          <p>This policy may evolve to maintain fairness and regulatory compliance. Last updated {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}.</p>
          <p>Need help? Email <a href="mailto:support@theratreat.health" className="text-blue-600 hover:underline">support@theratreat.health</a> or use in‑app chat with subject “Refund Help”.</p>
          <p>Severe concerns about safety or misconduct should be escalated immediately via the Safety form (available in session view) — refund workflows do not replace emergency channels.</p>
        </section>
      </div>
    </main>
  );
}
