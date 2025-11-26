'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';

export default function SellerRegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Application Submitted!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Thank you for your interest in becoming a seller on TheraStore. We've received your application and our team will review it shortly.
        </p>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">What's Next?</h2>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>We'll review your application within 2-3 business days</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>You'll receive an email notification once your application is approved</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>After approval, you can start listing your products</span>
            </li>
          </ul>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link href="/therastore">
            <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
          <Link href="/therastore/add-product">
            <button className="px-8 py-4 bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-full font-bold text-lg transition-all flex items-center gap-2">
              View Products
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}







