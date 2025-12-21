"use client";
import React, { useMemo } from 'react';
import { type StoreOrder } from '@/lib/therastore/orders';

export function DashboardTabs({ active, setActive, counts }: { active: string; setActive: (k: string) => void; counts: Record<string, number> }) {
  const tabs = useMemo(() => ([
    { key: 'orders', label: `Orders (${counts['orders'] || 0})` },
    { key: 'cancellations', label: `Cancelled (${counts['cancellations'] || 0})` },
    { key: 'inventory', label: 'Inventory' },
    { key: 'refunds', label: `Refunds (${counts['refunds'] || 0})` },
  ]), [counts]);

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {tabs.map(t => (
        <button key={t.key} onClick={() => setActive(t.key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${active===t.key?'bg-emerald-600 text-white border-emerald-600':'bg-white text-slate-700 hover:bg-emerald-50 border-slate-300'}`}>{t.label}</button>
      ))}
    </div>
  );
}
