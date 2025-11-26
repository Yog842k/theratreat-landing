'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';

export default function VendorRegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Application Submitted Successfully!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your interest in becoming a TheraStore vendor partner. 
          Our team will review your application and get back to you within 2-3 business days.
        </p>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
          <h2 className="font-bold text-emerald-900 mb-2">What happens next?</h2>
          <ul className="text-left text-emerald-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>We'll verify your business documents and compliance certificates</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Our team will review your product catalog and certifications</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>You'll receive an email with the approval status and next steps</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/therastore">
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-all flex items-center gap-2">
              <Home className="w-5 h-5" />
              Back to TheraStore
            </button>
          </Link>
          <Link href="/therastore/vendor-login">
            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-all flex items-center gap-2">
              Vendor Login
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

