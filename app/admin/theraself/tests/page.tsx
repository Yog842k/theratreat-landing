"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  FileJson, 
  ExternalLink, 
  ClipboardList, 
  Save, 
  X,
  Layers,
  HelpCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";

type SelfTest = {
  _id?: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  questions?: Array<{ id: string; text: string; type: string; options?: string[] }>;
  questionSets?: Array<{ name: string; questions: Array<{ text: string; options: string[] }> }>;
  scoring?: any;
  updatedAt?: string;
};

export default function AdminTheraSelfTestsPage() {
  const [tests, setTests] = useState<SelfTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/theraself/tests", { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setTests(Array.isArray(data) ? data : data.items || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="mx-auto max-w-6xl px-6 py-10">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-blue-600 w-8 h-8" />
              TheraSelf Tests
            </h1>
            <p className="text-slate-500 mt-1">Manage self-assessment definitions and question logic.</p>
          </div>
          <div className="flex gap-3">
             <Link 
                href="/api/admin/theraself/tests" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
             >
                <FileJson className="w-4 h-4" /> JSON
             </Link>
             <Link 
                href="/theraself/tests" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
             >
                Public Library <ExternalLink className="w-4 h-4" />
             </Link>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 flex items-center gap-2">
            <X className="w-5 h-5" /> {error}
          </div>
        )}
        
        {loading && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1,2].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
          </div>
        )}

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {!loading && tests.length === 0 && (
             <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400">No tests found. Create one below.</p>
             </div>
          )}
          {tests.map((t) => (
            <div key={t._id || t.slug} className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded">
                        {t.category || "General"}
                     </span>
                     <Link href={`/api/admin/theraself/tests/${t._id || t.slug}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                        <FileJson className="w-4 h-4" />
                     </Link>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">{t.slug}</span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1">{t.title}</h3>
                {t.description && <p className="text-sm text-slate-500 line-clamp-2">{t.description}</p>}
                
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 font-medium">
                   <div className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> {t.questions?.length || 0} Questions
                   </div>
                   {t.questionSets && t.questionSets.length > 0 && (
                       <div className="flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {t.questionSets.length} Sets
                       </div>
                   )}
                </div>
              </div>

              <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={async () => {
                    const title = prompt("Update title", t.title || "");
                    if (title == null) return;
                    await fetch(`/api/admin/theraself/tests/${t._id || t.slug}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title })
                    });
                    await load();
                  }}
                >
                  <Edit2 className="w-4 h-4" /> Edit Title
                </button>
                <button
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  title="Delete Test"
                  onClick={async () => {
                    if (!confirm("Delete this test?")) return;
                    await fetch(`/api/admin/theraself/tests/${t._id || t.slug}`, { method: "DELETE" });
                    await load();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Form Section */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
             <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Create New Test
             </h2>
          </div>
          <div className="p-6">
             <FormAdd onAdded={load} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FormAdd({ onAdded }: { onAdded: () => void }) {
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [questionSets, setQuestionSets] = useState<Array<{ name: string; questions: Array<{ text: string; options: string[] }> }>>([
    { name: "Default", questions: [{ text: "", options: ["", "", "", "3"] }] }
  ]);
  const [saving, setSaving] = useState(false);
  const [scoringPrompt, setScoringPrompt] = useState("");

  // Auto-generate slug from title unless user overrides
  function toSlug(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  useEffect(() => {
    if (!slugTouched) {
      setSlug(toSlug(title));
    }
  }, [title]);

  // Helpers to move items
  function moveArrayItem<T>(arr: T[], from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
    const copy = arr.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/theraself/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          description: desc,
          category,
          questionSets: questionSets.map(s => ({
            name: s.name.trim(),
            questions: s.questions
              .filter(q => q.text.trim().length > 0)
              .map(q => ({ text: q.text.trim(), options: [
                (q.options[0] || "").trim(),
                (q.options[1] || "").trim(),
                (q.options[2] || "").trim(),
                (q.options[3] || "3").trim()
              ] }))
          })),
          scoring: scoringPrompt.trim() ? { prompt: scoringPrompt.trim() } : undefined
        })
      });
      if (!res.ok) throw new Error("Failed to create");
      setSlug(""); setSlugTouched(false); setTitle(""); setDesc(""); setCategory(""); setQuestionSets([{ name: "Default", questions: [{ text: "", options: ["", "", "", "3"] }] }]);
      setScoringPrompt("");
      onAdded();
    } catch (e) {
      alert((e as any)?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  // Helper styles for inputs
  const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";


  return (
    <form onSubmit={submit} className="space-y-8">
      {/* 1. Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Slug (ID)</label>
          <input className={inputClass} placeholder="e.g. anxiety-test-01" value={slug} onChange={e=>{ setSlug(e.target.value); setSlugTouched(true); }} required />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} placeholder="e.g. Generalized Anxiety Assessment" value={title} onChange={e=>setTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} placeholder="e.g. Mental Health" value={category} onChange={e=>setCategory(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={2} placeholder="Brief description of what this test measures..." value={desc} onChange={e=>setDesc(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Scoring Prompt (AI)</label>
          <textarea
            className={inputClass}
            rows={3}
            placeholder="Describe how the AI should score this test. Example: 'Sum the values of all answers. If total >= 10, high risk. If 5-9, moderate risk. Otherwise, low risk.'"
            value={scoringPrompt}
            onChange={e => setScoringPrompt(e.target.value)}
            required
          />
          <span className="text-xs text-slate-400">This prompt will be used by the AI to generate scoring and reports for this test.</span>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 2. Question Sets */}
      <div>
        <div className="flex items-center justify-between mb-4">
         <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
           <Layers className="w-4 h-4 text-blue-500" /> Question Sets
         </label>
         <div className="flex gap-2">
         <button 
           type="button" 
           className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
           onClick={()=>setQuestionSets(sets=>[...sets, { name: "", questions: [{ text: "", options: ["", "", "", "3"] }] }])}
         >
           <Plus className="w-3 h-3" /> Add Set
         </button>
         <button
           type="button"
           className="text-xs font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-md"
           title="Load ADHD Early Childhood (2–6) template"
           onClick={()=>{
             setTitle(t=> t || "THERASELF — ADHD EARLY CHILDHOOD (AGES 2–6)");
             setDesc(d=> d || "15-QUESTION PARENT SCREENING (V1.0) | Scale: 0=Not at all, 1=Sometimes, 2=Often, 3=Almost every day");
             const scale = ["0","1","2","3"];
             setQuestionSets([
               {
                 name: "SECTION 1 — INATTENTION (6)",
                 questions: [
                   { text: "My child has difficulty following simple instructions (even when they understand the words).", options: scale },
                   { text: "My child easily gets distracted by surrounding noises, objects, or people.", options: scale },
                   { text: "My child struggles to stay focused on play activities for more than a short time.", options: scale },
                   { text: "My child moves quickly from one toy or activity to another without finishing.", options: scale },
                   { text: "My child seems not to listen when spoken to directly.", options: scale },
                   { text: "My child often forgets or loses items needed for play (toys, crayons, shoes).", options: scale },
                 ]
               },
               {
                 name: "SECTION 2 — HYPERACTIVITY (5)",
                 questions: [
                   { text: "My child is always ‘on the go,’ with high energy most of the day.", options: scale },
                   { text: "My child finds it hard to sit still during meals, story time, or structured activities.", options: scale },
                   { text: "My child climbs, jumps, or runs in situations where it is not appropriate.", options: scale },
                   { text: "My child fidgets constantly (hands, feet, body movement).", options: scale },
                   { text: "My child talks a lot or makes continuous noises.", options: scale },
                 ]
               },
               {
                 name: "SECTION 3 — IMPULSIVITY (4)",
                 questions: [
                   { text: "My child acts without thinking about safety (running into the street, climbing unsafe surfaces).", options: scale },
                   { text: "My child interrupts adults or other children frequently.", options: scale },
                   { text: "My child struggles to wait their turn during play or group activities.", options: scale },
                   { text: "My child grabs toys or objects from others without waiting or asking.", options: scale },
                 ]
               }
             ]);
           }}
         >
           Load ADHD 2–6 Template
         </button>
         </div>
        </div>
        <div className="space-y-6">
         {questionSets.map((set, si) => (
          <div key={si} className="relative rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-colors">
            {/* Set Header */}
            <div className="flex gap-3 mb-4 items-center">
              <div className="flex-1">
                <input 
                  className={`${inputClass} font-medium text-slate-900 bg-slate-50 focus:bg-white`} 
                  placeholder="Set Name (e.g. 'Part A')" 
                  value={set.name} 
                  onChange={e=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, name: e.target.value}:v))} 
                />
              </div>
              <div className="flex gap-2">
               <button type="button" className="px-3 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1" onClick={()=>setQuestionSets(arr=>moveArrayItem(arr, si, si-1))} disabled={si===0}>
                <ArrowUp className="w-3 h-3" /> Up
               </button>
               <button type="button" className="px-3 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1" onClick={()=>setQuestionSets(arr=>moveArrayItem(arr, si, si+1))} disabled={si===questionSets.length-1}>
                <ArrowDown className="w-3 h-3" /> Down
               </button>
               {questionSets.length > 1 && (
                <button 
                  type="button" 
                  className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-xs font-medium" 
                  onClick={()=>setQuestionSets(arr=>arr.filter((_,idx)=>idx!==si))}
                >
                  Remove Set
                </button>
               )}
              </div>
            </div>

            {/* Nested Questions */}
            <div className="pl-4 border-l-2 border-slate-100 space-y-3">
             {set.questions.map((qq, qi) => (
              <React.Fragment key={qi}>
                <div className="flex gap-2 items-center">
                  <input 
                    className={`${inputClass}`} 
                    placeholder={`Question ${qi+1}...`} 
                    value={qq.text} 
                    onChange={e=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: v.questions.map((w,j)=>j===qi?{ ...w, text: e.target.value }:w)}:v))} 
                  />
                  <div className="flex gap-1">
                    <button 
                      type="button" 
                      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                      title="Add next question"
                      onClick={()=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: [...v.questions, { text: "", options: ["", "", "", "3"] }]}:v))}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      title="Move up"
                      disabled={qi===0}
                      onClick={()=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: moveArrayItem(v.questions, qi, qi-1)}:v))}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      title="Move down"
                      disabled={qi===set.questions.length-1}
                      onClick={()=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: moveArrayItem(v.questions, qi, qi+1)}:v))}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    {set.questions.length > 1 && (
                      <button 
                        type="button" 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove this question"
                        onClick={()=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: v.questions.filter((_,j)=>j!==qi)}:v))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Options for this question */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input className={`${inputClass}`} placeholder="Option A" value={qq.options[0] || ""} onChange={e=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: v.questions.map((w,j)=>j===qi?{ ...w, options: [e.target.value, w.options[1] || "", w.options[2] || "", w.options[3] || "3"] }:w)}:v))} />
                  <input className={`${inputClass}`} placeholder="Option B" value={qq.options[1] || ""} onChange={e=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: v.questions.map((w,j)=>j===qi?{ ...w, options: [w.options[0] || "", e.target.value, w.options[2] || "", w.options[3] || "3"] }:w)}:v))} />
                  <input className={`${inputClass}`} placeholder="Option C" value={qq.options[2] || ""} onChange={e=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: v.questions.map((w,j)=>j===qi?{ ...w, options: [w.options[0] || "", w.options[1] || "", e.target.value, w.options[3] || "3"] }:w)}:v))} />
                  <input className={`${inputClass}`} placeholder="Option D (Score 3)" value={qq.options[3] || "3"} onChange={e=>setQuestionSets(arr=>arr.map((v,idx)=>idx===si?{...v, questions: v.questions.map((w,j)=>j===qi?{ ...w, options: [w.options[0] || "", w.options[1] || "", w.options[2] || "", e.target.value] }:w)}:v))} />
                </div>
              </React.Fragment>
             ))}
            </div>
          </div>
         ))}
        </div>
      </div>

      <hr className="border-slate-100" />


      {/* Submit */}
      <div className="pt-4">
         <button 
            disabled={saving} 
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400"
         >
            {saving ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving Test..." : "Save New Test"}
         </button>
      </div>
    </form>
  );
}