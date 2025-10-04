"use client";
import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  subtitle?: string;
  description?: string | ReactNode;
}

export function ComingSoon({ title, subtitle, description }: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-xl">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium ring-1 ring-blue-200 mb-2">
          Coming Soon
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg font-medium text-slate-600">
            {subtitle}
          </p>
        )}
        <p className="text-slate-500 leading-relaxed">
          {description || (
            <>We are actively building this module. Check back soon or follow our updates for the launch announcement.</>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/therabook" className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-medium shadow">
            Go to TheraBook
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;
