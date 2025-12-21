"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getIconByKey } from "@/components/ui/IconSelector";

type TestDoc = {
  _id?: string;
  title?: string;
  name?: string;
  icon?: string;
  description?: string;
  questionSets?: Array<{ name: string; questions: Array<{ text: string; options: string[] }> }>;
  questions?: string[]; // legacy fallback
};

export default function TestAssessmentPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [test, setTest] = useState<TestDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string>("");
  const [childName, setChildName] = useState<string>("");
  const [ageYears, setAgeYears] = useState<string>("");
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resultId, setResultId] = useState<string>("");
  const [reportText, setReportText] = useState<string>("");

  const Icon = useMemo(() => getIconByKey(test?.icon), [test?.icon]);

  const questionsFlat = useMemo(() => {
    if (Array.isArray(test?.questionSets) && test!.questionSets.length) {
      return test!.questionSets.flatMap((s) => s.questions.map((q) => ({ section: s.name, text: q.text, options: q.options })));
    }
    if (Array.isArray(test?.questions)) {
      return test!.questions.map((t) => ({ section: "", text: t, options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }));
    }
    return [] as Array<{ section: string; text: string; options: string[] }>;
  }, [test]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/theraself/tests/${id}`, { cache: "no-store" });
        const json = await res.json();
        setTest(json || null);
      } catch (e) {
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const total = questionsFlat.length;
  const progress = total ? Math.round(((qIndex + 1) / total) * 100) : 0;

  function selectOption(val: string) {
    setAnswers((prev) => ({ ...prev, [qIndex]: val }));
  }
  function next() {
    if (!childName || !ageYears) {
      setError("Please enter child name and age to continue.");
      return;
    }
    if (qIndex < total - 1) setQIndex((i) => i + 1);
  }
  function prev() {
    if (qIndex > 0) setQIndex((i) => i - 1);
  }
  function saveDraft() {
    try {
      localStorage.setItem(`theraself_draft_${id}`, JSON.stringify({ answers, qIndex, ts: Date.now() }));
    } catch {}
  }

  async function finish() {
    // Map answers to numeric 0-3 by index
    const numericAnswers = questionsFlat.map((q, idx) => {
      const val = answers[idx];
      const num = typeof val === 'string' ? parseInt(val, 10) : (val as any);
      return Number.isFinite(num) ? num : 0;
    });
    // Partition into components by count (assuming ADHD template 6/5/4)
    const inatt = numericAnswers.slice(0, 6);
    const hyper = numericAnswers.slice(6, 11);
    const imp = numericAnswers.slice(11, 15);
    const sum = (arr: number[]) => arr.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
    const rawInattention = sum(inatt);
    const rawHyperactivity = sum(hyper);
    const rawImpulsivity = sum(imp);
    const scaledInattention = rawInattention * (10 / 18);
    const scaledHyperactivity = rawHyperactivity * (10 / 15);
    const scaledImpulsivity = rawImpulsivity * (10 / 12);
    const overallTheraScore = scaledInattention + scaledHyperactivity + scaledImpulsivity;
    const display = {
      inattention: Math.round(scaledInattention * 10) / 10,
      hyperactivity: Math.round(scaledHyperactivity * 10) / 10,
      impulsivity: Math.round(scaledImpulsivity * 10) / 10,
      overall: Math.round(overallTheraScore * 10) / 10,
    };
    const level = display.overall <= 9.9 ? 'low' : display.overall <= 17.9 ? 'moderate' : 'high';
    const frequentCount = numericAnswers.filter(v => v >= 2).length;
    const impulsivityMax = Math.max(...imp, 0);

    try {
      setFinishing(true);
      setError("");
      if (!childName || !ageYears) {
        setError("Child name and age are required.");
        setFinishing(false);
        return;
      }
      const resSave = await fetch('/api/theraself/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: id,
          answers: { all: numericAnswers, counts: { inattention: 6, hyperactivity: 5, impulsivity: 4 } },
          rawInattention,
          rawHyperactivity,
          rawImpulsivity,
          scaledInattention,
          scaledHyperactivity,
          scaledImpulsivity,
          overallTheraScore,
          level,
          childName,
          ageYears: Number(ageYears),
        }),
      });
      if (!resSave.ok) {
        const errText = await resSave.text();
        throw new Error(`Save failed: ${resSave.status} ${errText}`);
      }
      const saved = await resSave.json();
      console.log('[TheraSelf][finish] saved response:', saved);
      const rid = String(saved?.id ?? saved?.doc?._id?.$oid ?? saved?.doc?._id ?? '');
      if (!rid) {
        setError('No result id returned from save.');
        setFinishing(false);
        return;
      }
      setResultId(rid);
      // Generate AI report on this page and persist it
      const displayScores = {
        inattention: Math.round(scaledInattention * 10) / 10,
        hyperactivity: Math.round(scaledHyperactivity * 10) / 10,
        impulsivity: Math.round(scaledImpulsivity * 10) / 10,
        overall: Math.round(overallTheraScore * 10) / 10,
      };
      try {
        const resGen = await fetch('/api/theraself/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childName,
            ageYears: Number(ageYears),
            testTitle: test?.title || test?.name || 'Assessment',
            displayScores,
            heuristics: { frequentCount, impulsivityMax },
          }),
        });
        const genJson = await resGen.json();
        const text = String(genJson?.report || '');
        if (text) {
          await fetch(`/api/theraself/results/${rid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportText: text, childName, ageYears: Number(ageYears) }),
          });
          setReportText(text);
        } else {
          setError('AI did not return report text.');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to generate AI report');
      }
      // Hide question UI and show report section on same page
      setFinished(true);
    } catch (e) {
      const msg = (e as any)?.message || 'Failed to save results';
      setError(msg);
    } finally {
      setFinishing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const current = questionsFlat[qIndex];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/theraself/tests" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4" /> Back to Tests
          </Link>
          <div className="text-right">
            <div className="text-xs text-gray-500">Question {qIndex + 1} of {total}</div>
            <div className="mt-2 h-2 w-48 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-2 bg-violet-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        {!finished && (
        <div className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-50 p-2 text-violet-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{test?.title || test?.name || "Assessment"}</h1>
                <p className="text-xs text-violet-600 font-semibold">{current?.section || "psychological"}</p>
              </div>
            </div>
            <div className="text-violet-600 font-bold text-sm">{progress}% <span className="text-gray-400 font-medium">Complete</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
              <input value={childName} onChange={(e) => setChildName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" placeholder="e.g., Ayaan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
              <input value={ageYears} onChange={(e) => setAgeYears(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" placeholder="e.g., 5" inputMode="numeric" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{current?.text || "No question"}</h2>
            <div className="space-y-3">
              {current?.options?.map((opt, idx) => {
                const selected = answers[qIndex] === opt;
                return (
                  <button key={idx} onClick={() => selectOption(opt)} className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selected ? "border-violet-600 bg-violet-50 text-violet-900" : "border-gray-200 bg-white text-gray-800 hover:border-violet-300"}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button onClick={prev} disabled={qIndex===0} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <div className="flex items-center gap-4">
              <button onClick={saveDraft} className="px-4 py-2 rounded-lg border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100">Save Draft</button>
              {qIndex < total-1 ? (
                <button onClick={next} className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700">Next</button>
              ) : (
                <button onClick={finish} disabled={finishing} className="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800 disabled:opacity-50">{finishing ? 'Saving…' : 'Finish'}</button>
              )}
            </div>
          </div>
        </div>
        )}

        {finished && (
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold text-purple-800">AI Summary Report</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">AI-generated</span>
            </div>
            <p className="mb-3 text-xs text-purple-700">Saved {new Date().toLocaleString()}</p>
            <div className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">{reportText || 'Preparing report...'}</div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Print</button>
              <button
                onClick={() => {
                  const txt = (reportText || '').trim();
                  const blob = new Blob([txt || ''], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `TheraSelf_Report_${childName || 'Child'}_${new Date().toISOString().slice(0,10)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >Download TXT</button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-red-800 mb-1">Couldn’t generate report</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
      {finishing && !finished && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-600" />
            <p className="mt-3 text-sm text-gray-700">Preparing your results…</p>
            <p className="mt-1 text-xs text-gray-500">We’re generating your AI report</p>
          </div>
        </div>
      )}
    </div>
  );
}
