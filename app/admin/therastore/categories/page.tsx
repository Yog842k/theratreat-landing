"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FolderTree, 
  Tag, 
  Save, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Loader2, 
  AlertCircle,
  LayoutGrid 
} from 'lucide-react';
import { therastoreCategories } from '@/constants/app-data';

type Subcat = { key: string; label: string };
type AdminCategory = { key: string; name: string; subcategories: Subcat[]; count?: number; active?: boolean };

export default function AdminTheraStoreCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const initial = therastoreCategories.map(c => ({ key: c.key, name: c.label, subcategories: c.subcategories }));
    setCategories(initial);
    (async () => {
      try {
        const res = await fetch('/api/therastore/categories');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const byName = new Map<string, AdminCategory>();
            initial.forEach(c => byName.set(c.name, c));
            (json.data as any[]).forEach((c: any) => {
              const existing = byName.get(c.name);
              if (existing) byName.set(c.name, { ...existing, count: c.count || 0 });
            });
            setCategories(Array.from(byName.values()));
          }
        }
      } catch {}
    })();
  }, []);

  const addCategory = () => {
    setCategories(prev => [...prev, { key: `custom-${Date.now()}`, name: '', subcategories: [] }]);
  };

  const removeCategory = (idx: number) => {
    if (!confirm("Are you sure you want to remove this category?")) return;
    setCategories(prev => prev.filter((_, i) => i !== idx));
  };

  const updateCategory = (idx: number, patch: Partial<AdminCategory>) => {
    setCategories(prev => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const addSubcategory = (idx: number) => {
    setCategories(prev => prev.map((c, i) => (i === idx ? { ...c, subcategories: [...c.subcategories, { key: `sub-${Date.now()}`, label: '' }] } : c)));
  };

  const removeSubcategory = (catIdx: number, subIdx: number) => {
    setCategories(prev => prev.map((c, i) => i === catIdx ? { ...c, subcategories: c.subcategories.filter((_, si) => si !== subIdx) } : c));
  };

  const saveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const resp = await fetch('/api/therastore/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
      const json = await resp.json();
      if (resp.ok && json && (json.success || json.message)) {
        setMessage({ text: 'Categories saved successfully', type: 'success' });
        // Auto-dismiss success message
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(json?.error || 'Failed to save categories');
      }
    } catch (e: any) {
      setMessage({ text: e?.message || 'Failed to save categories', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-10">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600 hidden md:block" />
                Store Categories
              </h1>
            </div>
          </div>
          <button 
            onClick={saveAll} 
            disabled={saving} 
            className="hidden md:flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-sm shadow-blue-200"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-6">
          {categories.map((cat, idx) => (
            <div key={cat.key} className="group bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200 overflow-hidden">
              
              {/* Category Header (Parent) */}
              <div className="p-4 md:p-5 bg-slate-50/50 border-b border-slate-100">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Name</label>
                      <input
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                        value={cat.name}
                        onChange={(e) => updateCategory(idx, { name: e.target.value })}
                        placeholder="e.g. Wellness"
                      />
                    </div>
                    <div className="space-y-1 relative">
                       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug / Key</label>
                       <div className="flex items-center gap-2">
                        <input
                            className="w-full bg-slate-50 text-slate-600 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                            value={cat.key}
                            onChange={(e) => updateCategory(idx, { key: e.target.value })}
                            placeholder="e.g. wellness-products"
                        />
                        {/* Mobile Delete Button */}
                        <button 
                            onClick={() => removeCategory(idx)}
                            className="md:hidden p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                       </div>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
                     <span className="text-xs text-slate-400 font-medium uppercase">Products</span>
                     <span className="text-lg font-bold text-slate-700">{cat.count || 0}</span>
                  </div>

                  <button 
                    onClick={() => removeCategory(idx)}
                    className="hidden md:block p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Category"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Subcategories (Children) */}
              <div className="p-4 md:p-5 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Sub-categories
                  </h3>
                </div>
                
                <div className="space-y-3 pl-0 md:pl-4 border-l-0 md:border-l-2 border-slate-100">
                  {cat.subcategories.length === 0 && (
                    <p className="text-sm text-slate-400 italic py-2">No sub-categories defined.</p>
                  )}
                  {cat.subcategories.map((s, sIdx) => (
                    <div key={s.key} className="flex flex-col md:flex-row gap-2 md:items-center animate-in fade-in slide-in-from-top-2 duration-300">
                       <div className="flex-1 flex gap-2">
                          <input 
                            className="flex-[2] bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                            value={s.label} 
                            placeholder="Subcategory Name"
                            onChange={(e) => {
                                const label = e.target.value;
                                setCategories(prev => prev.map((c, i) => i === idx ? { ...c, subcategories: c.subcategories.map((x, j) => j === sIdx ? { ...x, label } : x) } : c));
                            }} 
                          />
                          <input 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm font-mono text-slate-500 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" 
                            value={s.key} 
                            placeholder="key"
                            onChange={(e) => {
                                const key = e.target.value;
                                setCategories(prev => prev.map((c, i) => i === idx ? { ...c, subcategories: c.subcategories.map((x, j) => j === sIdx ? { ...x, key } : x) } : c));
                            }} 
                          />
                       </div>
                       <button 
                         onClick={() => removeSubcategory(idx, sIdx)}
                         className="p-2 self-end md:self-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addSubcategory(idx)}
                    className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-blue-50 transition-colors w-fit"
                  >
                    <Plus className="w-4 h-4" /> Add Sub-category
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Add New Category Button */}
        <button 
            onClick={addCategory} 
            className="mt-8 w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-slate-500 font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
        >
            <Plus className="w-5 h-5" /> Add New Category
        </button>

      </div>

      {/* Mobile Floating Action Bar */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-30 pb-safe">
         <button 
            onClick={saveAll} 
            disabled={saving} 
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 active:scale-95 transition-transform"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </button>
      </div>

    </div>
  );
}
