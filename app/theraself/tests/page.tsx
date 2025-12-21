"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Search, Clock, FileText, ArrowRight } from "lucide-react";
import { getIconByKey } from "@/components/ui/IconSelector";

type PublicTest = {
  _id?: string;
  title?: string;
  name?: string;
  icon?: string; // lucide key
  questions?: string[]; // legacy shape
  questionSets?: Array<{ name: string; questions: Array<{ text: string; options: string[] }> }>;
  slug?: string; // optional if backend provides it later
};

export default function TheraSelfTestsPage() {
  const [tests, setTests] = useState<PublicTest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/theraself/tests");
      const json = await res.json();
      const list = Array.isArray(json) ? json : [];
      setTests(list);
    } catch (e) {
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* 1. Header Section */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-900 text-white pb-24 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Self-Assessment Library</h1>
            <p className="text-indigo-100 max-w-2xl text-lg mb-8">
                Clinically-informed screening tools to help you understand your mental and physical well-being.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                    type="text" 
                    className="block w-full pl-10 pr-3 py-4 border-none rounded-xl text-gray-900 placeholder-gray-500 bg-white shadow-lg focus:ring-2 focus:ring-purple-400 outline-none" 
                    placeholder="Search for a condition or test..." 
                />
            </div>
        </div>
      </div>

      {/* 2. Content Grid (Overlapping Header) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((t) => {
            const Icon = getIconByKey(t.icon);
            const legacyCount = Array.isArray(t.questions) ? t.questions.length : 0;
            const structuredCount = Array.isArray(t.questionSets)
              ? t.questionSets.reduce((sum, s) => sum + (Array.isArray(s.questions) ? s.questions.length : 0), 0)
              : 0;
            const questionsCount = structuredCount || legacyCount;
            const href = t._id ? `/theraself/tests/${t._id}` : (t.slug ? `/theraself/tests/${t.slug}` : `#`);
            return (
            <div 
                key={String(t._id) + (t.slug || "")} 
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              
              {/* Card Header: Icon & Title */}
              <div className="flex items-start justify-between mb-4">
                <div className={`text-gray-700 bg-gray-50 p-3 rounded-xl`}>
                    <Icon className="w-6 h-6" />
                </div>
                {/* Meta Badges */}
                <div className="flex gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {questionsCount ? `${questionsCount} Qs` : "—"}</span>
                </div>
              </div>

              <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                    {t.title || t.name || 'Untitled Test'}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Self-assessment screening</p>
              </div>

              {/* Card Footer: Metadata & Button */}
              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {questionsCount ? `${questionsCount} Questions` : "No questions"}
                </div>
                
                <Link 
                    href={href} 
                    className="inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold group-hover:bg-purple-600 transition-colors"
                >
                    Start 
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          );})}
        </div>
      </main>
    </div>
  );
}