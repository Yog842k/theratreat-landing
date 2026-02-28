"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, ChevronLeft, Sparkles, User, Printer, Download, CheckCircle2, ArrowRight } from "lucide-react";
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

type FlowQuestion = {
  text: string;
  options?: string[];
  kind: "text" | "options";
  placeholder?: string;
  inputMode?: "text" | "numeric";
};

type ChatMessage = {
  id: string;
  sender: "ai" | "user";
  text: string;
  options?: string[];
  kind?: "text" | "options";
  placeholder?: string;
  inputMode?: "text" | "numeric";
};

const INTRO_QUESTION_COUNT = 2;

export default function TestAssessmentPage() {
  const params = useParams() as { id?: string };
  const id = params?.id as string | undefined;
  const [test, setTest] = useState<TestDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flowAnswers, setFlowAnswers] = useState<Record<number, string>>({});
  const [childName, setChildName] = useState<string>("");
  const [ageYears, setAgeYears] = useState<number | undefined>(undefined);
  const [isForChild, setIsForChild] = useState(true);
  const [error, setError] = useState<string>("");
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resultId, setResultId] = useState<string>("");
  const [reportText, setReportText] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef<Record<number, string>>({});
  const flowAnswersRef = useRef<Record<number, string>>({});
  const answerLockRef = useRef(false);
  const [lockedQuestionIndex, setLockedQuestionIndex] = useState<number | null>(null);

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

  const introQuestions = useMemo<FlowQuestion[]>(() => [
    {
      text: isForChild ? "Before we begin, what is the child's name?" : "Before we begin, what is your name?",
      kind: "text",
      placeholder: "Type the name",
      inputMode: "text",
    },
    {
      text: isForChild ? "How old is the child (in years)?" : "How old are you (in years)?",
      kind: "text",
      placeholder: "e.g., 4",
      inputMode: "numeric",
    },
  ], [isForChild]);

  const flowQuestions = useMemo<FlowQuestion[]>(() => {
    const base = questionsFlat.map((q) => ({
      text: q.text,
      options: q.options,
      kind: "options" as const,
    }));
    return [...introQuestions, ...base];
  }, [questionsFlat, introQuestions]);

  // Only scroll to bottom when a new AI message is added (not after user answers), but do not force bottom alignment
  const prevChatLength = useRef(0);
  useEffect(() => {
    if (
      chat.length > prevChatLength.current &&
      chat.length > 0 &&
      chat[chat.length - 1].sender === "ai" &&
      chatBottomRef.current
    ) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevChatLength.current = chat.length;
  }, [chat]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    flowAnswersRef.current = flowAnswers;
  }, [flowAnswers]);

  const seedChat = (titleText: string, questions: Array<{ text: string; options: string[] }>) => {
    const flowSeed: FlowQuestion[] = [
      ...introQuestions,
      ...questions.map((q) => ({
        text: q.text,
        options: q.options,
        kind: "options" as const,
      })),
    ];
    setChat([
      {
        id: "intro",
        sender: "ai",
        text: `Welcome to the ${titleText || "Assessment"}! Let's begin.`,
      },
      flowSeed[0]
        ? {
            id: `q-0`,
            sender: "ai",
            text: flowSeed[0].text,
            options: flowSeed[0].options,
            kind: flowSeed[0].kind,
            placeholder: flowSeed[0].placeholder,
            inputMode: flowSeed[0].inputMode,
          }
        : undefined,
    ].filter(Boolean) as any);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setAnswers({});
        answersRef.current = {};
        setFlowAnswers({});
        flowAnswersRef.current = {};
        setChildName("");
        setAgeYears(undefined);
        setInputValue("");
        setFinished(false);
        setFinishing(false);
        setReportText("");
        setError("");

        const res = await fetch(`/api/admin/theraself/tests/${id}`, { cache: "no-store" });
        const json = await res.json();
        setTest(json || null);
        
        let questions: any[] = [];
        if (json?.questionSets?.length) {
          questions = json.questionSets.flatMap((s: any) => s.questions.map((q: any) => ({ ...q, section: s.name })));
        } else if (json?.questions?.length) {
          questions = json.questions.map((t: string) => ({ text: t, options: ["Not at all", "Several days", "More than half the days", "Nearly every day"], section: "" }));
        }
        seedChat(json?.title || json?.name || "Assessment", questions);
      } catch (e) {
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!test) return;
    if (Object.keys(flowAnswersRef.current).length > 0) return;
    let questions: any[] = [];
    if (test?.questionSets?.length) {
      questions = test.questionSets.flatMap((s: any) => s.questions.map((q: any) => ({ ...q, section: s.name })));
    } else if (test?.questions?.length) {
      questions = test.questions.map((t: string) => ({ text: t, options: ["Not at all", "Several days", "More than half the days", "Nearly every day"], section: "" }));
    }
    setChildName("");
    setAgeYears(undefined);
    setInputValue("");
    seedChat(test?.title || test?.name || "Assessment", questions);
  }, [isForChild, test, introQuestions]);

  const total = flowQuestions.length;
  const progress = total ? Math.round((Object.keys(flowAnswers).length / total) * 100) : 0;
  const currentQuestionIndex = chat.filter(m => m.sender === "ai" && m.id.startsWith("q-")).length - 1;
  const canToggleSubject = !finished && !finishing && Object.keys(flowAnswers).length === 0;

  const handleUserAnswer = (answer: string, questionIndex: number) => {
    if (typing || finishing || finished) return;
    if (!Number.isFinite(questionIndex)) return;
    if (answerLockRef.current) return;

    if (questionIndex !== currentQuestionIndex) return;
    if (flowAnswersRef.current[questionIndex] !== undefined) return;

    const trimmedAnswer = String(answer ?? "").trim();
    if (!trimmedAnswer) return;

    answerLockRef.current = true;
    setLockedQuestionIndex(questionIndex);

    const nextFlowAnswers = { ...flowAnswersRef.current, [questionIndex]: trimmedAnswer };
    flowAnswersRef.current = nextFlowAnswers;
    setFlowAnswers(nextFlowAnswers);

    let nextTestAnswers = answersRef.current;
    if (questionIndex >= INTRO_QUESTION_COUNT) {
      const testIndex = questionIndex - INTRO_QUESTION_COUNT;
      nextTestAnswers = { ...answersRef.current, [testIndex]: trimmedAnswer };
      answersRef.current = nextTestAnswers;
      setAnswers(nextTestAnswers);
    } else if (questionIndex === 0) {
      setChildName(trimmedAnswer);
    } else if (questionIndex === 1) {
      const parsed = parseInt(trimmedAnswer, 10);
      setAgeYears(Number.isFinite(parsed) ? parsed : undefined);
    }

    setInputValue("");
    setChat(prev => [
      ...prev,
      {
        id: `a-${questionIndex}-${Date.now()}`,
        sender: "user",
        text: trimmedAnswer,
      },
    ]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (questionIndex < flowQuestions.length - 1) {
        const nextQuestion = flowQuestions[questionIndex + 1];
        setChat(prev => [
          ...prev,
          {
            id: `q-${questionIndex + 1}`,
            sender: "ai",
            text: nextQuestion.text,
            options: nextQuestion.options,
            kind: nextQuestion.kind,
            placeholder: nextQuestion.placeholder,
            inputMode: nextQuestion.inputMode,
          },
        ]);
      } else {
        finish(nextTestAnswers);
      }
      answerLockRef.current = false;
      setLockedQuestionIndex(null);
    }, 700);
  };

  async function finish(finalAnswers?: Record<number, string>) {
    const resolvedAnswers = finalAnswers ?? answersRef.current;
    const numericAnswers = questionsFlat.map((q, idx) => {
      const val = resolvedAnswers[idx];
      const num = typeof val === 'string' ? parseInt(val, 10) : (val as any);
      return Number.isFinite(num) ? num : 0;
    });

    // Scoring logic (simplified for UI demo)
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
      
      const resSave = await fetch('/api/theraself/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: id,
          childName: childName || undefined,
          ageYears: ageYears ?? undefined,
          answers: { all: numericAnswers, counts: { inattention: 6, hyperactivity: 5, impulsivity: 4 } },
          rawInattention,
          rawHyperactivity,
          rawImpulsivity,
          scaledInattention,
          scaledHyperactivity,
          scaledImpulsivity,
          overallTheraScore,
          level,
        }),
      });
      if (!resSave.ok) {
        const errText = await resSave.text();
        throw new Error(`Save failed: ${resSave.status} ${errText}`);
      }
      const saved = await resSave.json();
      const rid = String(saved?.id ?? saved?.doc?._id?.$oid ?? saved?.doc?._id ?? '');
      if (!rid) {
        setError('No result id returned from save.');
        setFinishing(false);
        return;
      }
      setResultId(rid);

      try {
        const resGen = await fetch('/api/theraself/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childName: childName || undefined,
            ageYears: ageYears ?? undefined,
            testTitle: test?.title || test?.name || 'Assessment',
            displayScores: display,
            heuristics: { frequentCount, impulsivityMax },
          }),
        });
        const genJson = await resGen.json().catch(() => ({}));
        if (!resGen.ok || genJson?.ok === false) {
          setError(genJson?.error || 'AI report generation failed.');
        } else {
          const text = String(genJson?.report || '');
          if (text) {
            await fetch(`/api/theraself/results/${rid}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reportText: text }),
            });
            setReportText(text);
          } else {
            setError('AI did not return report text.');
          }
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to generate AI report');
      }
      setFinished(true);
    } catch (e) {
      const msg = (e as any)?.message || 'Failed to save results';
      setError(msg);
    } finally {
      setFinishing(false);
    }
  }

  const handleDownload = () => {
    const txt = (reportText || '').trim();
    const blob = new Blob([txt || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TheraSelf_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-200 rounded-full animate-ping opacity-50"></div>
          <Loader2 className="h-10 w-10 animate-spin text-violet-600 relative z-10" />
        </div>
        <p className="mt-6 text-sm font-semibold text-slate-500 tracking-wide uppercase animate-pulse">Initializing Assessment...</p>
      </div>
    );
  }

  return (
    <div className="theraself-shell min-h-screen flex flex-col text-slate-900 selection:bg-violet-200 selection:text-violet-900 bg-gradient-to-br from-purple-50 via-white to-violet-50 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute top-24 -right-16 h-80 w-80 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
      </div>
      
      {/* ========================================
        MODERN GLASS HEADER
        ======================================== 
      */}
      <header className="sticky top-0 z-30">
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] px-4 py-3">
          <Link 
            href="/theraself/tests" 
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-700 transition-all duration-200"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:border-violet-200 group-hover:bg-violet-50 transition-colors">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span className="hidden sm:inline">Exit Assessment</span>
          </Link>
          
          <div className="flex flex-col items-end gap-2 w-40 sm:w-56">
            <div className="flex items-center justify-between w-full text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">
              <span>Progress</span>
              <span className="text-violet-600">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-100">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(139,92,246,0.4)] relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40" />
              </div>
            </div>
          </div>
          </div>
        </div>
      </header>

      {/* ========================================
        MAIN CHAT AREA
        ======================================== 
      */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:py-10 relative z-10">
        <div className="flex flex-col gap-6 pb-24">
          {/* Chat scrollable area */}
          <div className="rounded-[28px] border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white/60">
              <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                    <Sparkles className="h-5 w-5" />
                  </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">TheraSelf AI Session</p>
                  <p className="text-xs text-slate-500">Real-time guided assessment</p>
                </div>
              </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-400 animate-pulse" />
                    Live
                  </div>
                </div>
              <div className="px-5 pb-3">
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={isForChild}
                    onChange={(e) => {
                      if (!canToggleSubject) return;
                      setIsForChild(e.target.checked);
                    }}
                    disabled={!canToggleSubject}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  This assessment is for a child
                </label>
                {!canToggleSubject && (
                  <p className="mt-1 text-xs text-slate-400">Start a new assessment to change this.</p>
                )}
              </div>
              <div className="max-h-[520px] min-h-[320px] overflow-y-auto p-5" style={{scrollbarGutter:'stable'}}>
            {chat.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "ai" ? "items-start" : "items-end"} gap-2 group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards`}>
                {/* Avatar Label */}
                <div className={`flex items-center gap-2 px-1 ${msg.sender === "user" && "flex-row-reverse"}`}>
                  {msg.sender === "ai" ? (
                    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 p-1.5 rounded-xl shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-1.5 rounded-xl shadow-sm">
                      <User className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.sender === "ai" ? "AI Assistant" : "You"}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className={`relative max-w-[90%] sm:max-w-[85%] rounded-[20px] px-6 py-4 text-[15px] leading-relaxed shadow-sm transition-all
                    ${msg.sender === "ai" 
                      ? "bg-white/90 border border-slate-200/70 text-slate-700 rounded-tl-md shadow-[0_8px_20px_rgba(15,23,42,0.08)]" 
                      : "bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-700 text-white rounded-tr-md shadow-[0_12px_30px_rgba(76,29,149,0.35)]"
                    }`}>
                  {msg.text}

                    {msg.sender === "ai" && msg.id.startsWith("q-") && Number.isFinite(Number(msg.id.slice(2))) && flowAnswers[Number(msg.id.slice(2))] && (
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        Selected: <span className="text-slate-600 normal-case font-medium">{flowAnswers[Number(msg.id.slice(2))]}</span>
                      </div>
                    )}

                    {/* Text Input */}
                    {(() => {
                      const questionIndex = msg.id.startsWith("q-") ? Number(msg.id.slice(2)) : NaN;
                      if (!Number.isFinite(questionIndex)) return null;
                      if (msg.kind !== "text") return null;
                      if (flowAnswers[questionIndex] !== undefined) return null;
                      if (questionIndex !== currentQuestionIndex) return null;
                      const disabled = typing || lockedQuestionIndex === questionIndex;
                      const canSend = inputValue.trim().length > 0 && !disabled;
                      return (
                        <div className="mt-5 flex flex-col sm:flex-row gap-3">
                          <input
                            type={msg.inputMode === "numeric" ? "number" : "text"}
                            inputMode={msg.inputMode || "text"}
                            min={msg.inputMode === "numeric" ? 0 : undefined}
                            placeholder={msg.placeholder || "Type your response"}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && canSend) {
                                e.preventDefault();
                                handleUserAnswer(inputValue, questionIndex);
                              }
                            }}
                            className="w-full sm:flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            disabled={disabled}
                          />
                          <button
                            onClick={() => handleUserAnswer(inputValue, questionIndex)}
                            disabled={!canSend}
                            className="h-11 sm:h-auto sm:w-32 rounded-xl bg-violet-600 text-white text-sm font-semibold shadow-md shadow-violet-200 hover:bg-violet-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                      );
                    })()}

                    {/* Option Cards */}
                    {(() => {
                      if (!msg.options) return null;
                      const questionIndex = msg.id.startsWith("q-") ? Number(msg.id.slice(2)) : NaN;
                    if (!Number.isFinite(questionIndex)) return null;
                    if (flowAnswers[questionIndex] !== undefined) return null;
                    return (
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-700 delay-150">
                          {msg.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleUserAnswer(opt, questionIndex)}
                              disabled={typing || lockedQuestionIndex === questionIndex}
                              className={`group/btn relative w-full text-left p-4 rounded-2xl border border-slate-200 bg-white/70 
                                         hover:bg-white hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/50 hover:-translate-y-1
                                         transition-all duration-300 ease-out active:scale-[0.98]
                                         disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:-translate-y-0`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-slate-700 group-hover/btn:text-violet-700 transition-colors text-sm">{opt}</span>
                                <ArrowRight className="h-4 w-4 text-violet-300 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                              </div>
                            </button>
                          ))}
                        </div>
                    );
                  })()}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex flex-col items-start gap-2 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 px-1">
                  <div className="bg-violet-50 border border-violet-100 p-1.5 rounded-xl">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                </div>
                <div className="bg-white border border-slate-200/70 rounded-[20px] rounded-tl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} className="h-4" />
          </div>
          </div>

          {/* ========================================
            RESULTS & REPORT CARD
            ======================================== 
          */}
          {finished && (
            <div id="report-print" className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="relative overflow-hidden rounded-[32px] border border-violet-100 bg-white shadow-2xl shadow-violet-500/10">
                {/* Decorative Background Blob */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                
                <div className="relative p-8 sm:p-10">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-8">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/50 border border-violet-200 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                         <CheckCircle2 className="w-3.5 h-3.5" />
                         Analysis Complete
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Your Insights</h3>
                      <p className="text-slate-500 mt-1 font-medium">Generated by AI based on your responses</p>
                    </div>
                    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-4 rounded-2xl shadow-lg shadow-violet-200">
                       <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Report Text */}
                  <div className="prose prose-slate max-w-none mb-10">
                    <div className="text-slate-600 text-[15px] sm:text-base whitespace-pre-wrap leading-relaxed bg-slate-50/80 rounded-2xl p-6 sm:p-8 border border-slate-100/50 shadow-inner">
                      {reportText || 'Finalizing your personalized report...'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 no-print">
                    <button 
                      onClick={() => window.print()} 
                      className="w-full sm:flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm"
                    >
                      <Printer className="h-4 w-4" /> 
                      Print
                    </button>
                    <button 
                      onClick={handleDownload} 
                      className="group w-full sm:flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4 group-hover:animate-bounce" /> 
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2">
              <div className="p-2 bg-white rounded-full shrink-0 shadow-sm border border-red-100 text-red-500 font-bold">!</div>
              <div>
                <h3 className="font-bold text-red-900">System Notification</h3>
                <p className="text-sm text-red-700 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================
        ANALYSIS OVERLAY (LOADING STATE)
        ======================================== 
      */}
      {finishing && !finished && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center text-center max-w-sm px-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-2 bg-fuchsia-500 rounded-full animate-ping opacity-20 [animation-delay:0.2s]" />
              <div className="relative bg-white p-6 rounded-full shadow-2xl shadow-violet-200 border border-violet-100">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
              </div>
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Analyzing Responses</h4>
            <p className="text-slate-500 leading-relaxed font-medium">
              Our AI is reviewing your answers to generate a comprehensive clinical summary...
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap");
        .theraself-shell {
          font-family: "Sora", "Space Grotesk", "Segoe UI", system-ui, sans-serif;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #report-print,
          #report-print * {
            visibility: visible;
          }
          #report-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
