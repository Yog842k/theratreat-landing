"use client";
import { useState } from 'react';
import { footerSections } from '@/constants/app-data';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

/**
 * MobileMenu
 * Replaces prior MobileSubHeader. Only renders a button inside the primary
 * nav bar (small screens). Opens a floating panel (overlay) below the header
 * without introducing a persistent second bar that caused overflow.
 */
export default function MobileMenu(){
  const [open, setOpen] = useState(false);
  const core = footerSections.coreModules.slice(0,4);
  const support = footerSections.support.slice(0,3);
  const legal = footerSections.legal.slice(0,4);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(o=>!o)}
        className="p-2 rounded-md hover:bg-slate-100 active:scale-95 transition flex items-center gap-1 text-slate-700"
      >
        {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        <span className="text-xs font-semibold">Menu</span>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-2 mx-2 rounded-xl border border-slate-200 bg-white shadow-lg z-[60] animate-in fade-in slide-in-from-top-2"
        >
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-500">Explore</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md hover:bg-slate-100"
              aria-label="Close menu panel"
            >
              <X className="w-4 h-4"/>
            </button>
          </div>
          <div className="p-4 pt-3 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto overscroll-contain">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Modules</p>
              <ul className="space-y-1">
                {core.map((m,i)=> (
                  <li key={i}>
                    <Link onClick={()=>setOpen(false)} href={m.href} className="block text-sm py-1.5 px-2 rounded hover:bg-blue-50 text-slate-700 font-medium">
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
                    <Link onClick={()=>setOpen(false)} href={s.href} className="block text-sm py-1.5 px-2 rounded hover:bg-blue-50 text-slate-700">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 border-t border-slate-200 pt-3 flex flex-wrap gap-2">
              {legal.map((l,i)=>(
                <Link key={i} onClick={()=>setOpen(false)} href={l.href} className="text-[10px] leading-4 px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
