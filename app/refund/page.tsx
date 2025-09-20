"use client";
import { RotateCcw, PackageCheck, GraduationCap, HandCoins, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RefundCancellationPage() {
  const lastUpdated = "January 1, 2025";

  return (
    <div className="mt-15 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero */}
      <section className="border-b border-emerald-100">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-emerald-700 border-emerald-200">
            <RotateCcw className="w-4 h-4" />
            Clear refunds and cancellations
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">Refund & Cancellation Policy</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Simple, transparent rules across therapy sessions, products, and courses.
          </p>
          <div className="mt-4 flex justify-center gap-2 text-sm">
            <Badge variant="outline" className="bg-white">Last updated: {lastUpdated}</Badge>
            <Badge variant="outline" className="bg-white">Fast processing: 3–5 days</Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10 grid gap-6">
        {/* Therapy Sessions */}
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <HandCoins className="w-5 h-5" /> 1. Therapy Sessions (TheraBook)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Video/Audio/In-Clinic: Free cancellation 2+ hours before; 50% refund within window; no-show = no refund.</li>
              <li>Home Visits: Free cancellation 3+ hours before; 50% refund within window; no-show = no refund.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <PackageCheck className="w-5 h-5" /> 2. Products (TheraStore)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Most items: 30-day returns in original packaging</li>
              <li>Medical devices: 7-day return window (hygiene)</li>
              <li>Supplements: Non-returnable once opened</li>
            </ul>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <GraduationCap className="w-5 h-5" /> 3. Courses (TheraLearn)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Full refund within 7 days if under 25% completed</li>
              <li>Certificates issued on completion are non-refundable</li>
            </ul>
          </CardContent>
        </Card>

        {/* How to Request */}
        <Card className="bg-white/80 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-700" /> 4. How to Request a Refund
            </CardTitle>
            <CardDescription>We keep it straightforward.</CardDescription>
          </CardHeader>
          <CardContent className="text-gray-700">
            Email refunds@theratreat.in or support@theratreat.in with your order/booking details. Refunds are typically processed within 3–5 business days to the original payment method.
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-700" /> 5. Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            refunds@theratreat.in • support@theratreat.in • +91 8446602680
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
