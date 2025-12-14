"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type ResultDoc = {
  _id: string;
  testId: string;
  overallTheraScore: number;
  scaledInattention: number;
  scaledHyperactivity: number;
  scaledImpulsivity: number;
  level: string;
  reportText?: string;
  createdAt?: string;
};

export default function TheraSelfResultPage() {
  const params = useParams() as { id?: string };
  const id = params?.id as string | undefined;
  const router = useRouter();
  const [result, setResult] = useState<ResultDoc | null>(null);
  const [loading, setLoading] = useState(true);
  export default function TheraSelfResultPage() {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
          <p className="text-sm text-gray-700">This results page has been removed. Please view your report inline on the assessment page or from your dashboard under “My Self Tests”.</p>
          <div className="mt-4">
            <Link href="/theraself/tests" className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Go to Tests</Link>
          </div>
        </div>
      </div>
    );
  }

      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate report');
      setStatus("");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/theraself/tests" className="text-sm text-gray-600 hover:text-gray-900">Back to Tests</Link>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Print</button>
            <button
              onClick={() => {
                const txt = (result.reportText || '').trim();
                const blob = new Blob([txt || ''], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `TheraSelf_Report_${(result as any).childName || 'Child'}_${new Date().toISOString().slice(0,10)}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >Download TXT</button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Assessment Results</h1>
          <p className="text-sm text-gray-600">Overall TheraScore: <span className="font-semibold text-violet-700">{Math.round(result.overallTheraScore * 10) / 10}</span> ({result.level})</p>
          <p className="mt-1 text-sm text-gray-600">Child: <span className="font-semibold text-gray-900">{(result as any).childName || 'N/A'}</span> · Age: <span className="font-semibold text-gray-900">{(result as any).ageYears ?? 'N/A'}</span></p>
          {status && <p className="mt-2 text-xs text-gray-500">{status}</p>}

          <div className="mt-4 space-y-3">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">{b.label}</span>
                  <span className="text-gray-900 font-semibold">{Math.round(b.value * 10) / 10} / 10</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-2 bg-violet-600" style={{ width: `${Math.min(100, (b.value / 10) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {!result.reportText && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-amber-800">AI Report Missing</h3>
              <button onClick={generateIfMissing} disabled={generating} className="px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
                {generating ? 'Generating…' : 'Generate Now'}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-amber-900">{error}</p>}
            <p className="mt-2 text-sm text-amber-900">If this persists, set GEMINI_API_KEY in .env.local and restart.</p>
          </div>
        )}

        {result.reportText && (
          <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold text-purple-800">AI Summary Report</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">AI-generated</span>
            </div>
            <p className="mb-3 text-xs text-purple-700">Saved {new Date(result.createdAt || Date.now()).toLocaleString()}</p>
            <div className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">{result.reportText}</div>
          </div>
        )}
      </div>
    </div>
  );
}