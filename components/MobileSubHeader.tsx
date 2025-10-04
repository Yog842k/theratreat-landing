"use client";
import Link from 'next/link';
import { useState } from 'react';
import { footerSections } from '@/constants/app-data';
import { Menu, X } from 'lucide-react';

/**
 * MobileSubHeader
 * Appears only on small screens. Collapsible panel surfacing key navigation
 * derived from footer modules + support links so users do not need to scroll
 * all the way down on mobile.
 */
export default function MobileSubHeader() {
  const [open, setOpen] = useState(false);

  const core = footerSections.coreModules.slice(0,4);
  const support = footerSections.support.slice(0,3);

  return (
    <div className="md:hidden sticky top-[56px] z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-slate-600">Explore</span>
        <button aria-label={open ? 'Close quick menu' : 'Open quick menu'} onClick={() => setOpen(o=>!o)}
          className="p-2 rounded-md hover:bg-slate-100 active:scale-95 transition">
          {open ? <X className="w-4 h-4"/> : <Menu className="w-4 h-4"/>}
        </button>
      </div>
      {open && (
        <div className="grid grid-cols-2 gap-3 px-3 pb-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Modules</p>
            <ul className="space-y-1">
              {core.map((m,i)=> (
                <li key={i}>
                  <Link href={m.href} className="block text-sm py-1 px-2 rounded hover:bg-blue-50 text-slate-700 font-medium">
                    {m.label.split(' - ')[0]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Support</p>
            <ul className="space-y-1">
              {support.map((s,i)=> (
                <li key={i}>
                  <Link href={s.href} className="block text-sm py-1 px-2 rounded hover:bg-blue-50 text-slate-700">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 mt-2 border-t border-slate-200 pt-2 flex flex-wrap gap-2">
            {footerSections.legal.slice(0,4).map((l,i)=>(
              <Link key={i} href={l.href} className="text-[10px] leading-4 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
