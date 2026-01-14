"use client";
import { useState } from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';
import { useRouter } from 'next/navigation';
import { footerSections } from '@/constants/app-data';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';


export default function MobileMenu(){
  const [open, setOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const core = footerSections.coreModules.slice(0,4);
  const support = footerSections.support.slice(0,3);
  const legal = footerSections.legal.slice(0,4);

  return (
    <div className="md:hidden relative z-[70]">
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
        <div className="fixed inset-x-2 sm:inset-x-3 top-[72px] mt-0 rounded-xl border border-slate-200 bg-white shadow-lg z-[80] animate-in fade-in slide-in-from-top-2">
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-500">Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md hover:bg-slate-100"
              aria-label="Close menu panel"
            >
              <X className="w-4 h-4"/>
            </button>
          </div>
          <div className="p-4 pt-3 flex flex-col gap-5 max-h-[65vh] overflow-y-auto overscroll-contain">
            {/* Auth Section */}
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Account</p>
              {!authUser && (
                <div className="flex gap-2">
                  <button onClick={()=>{ setOpen(false); router.push('/auth/login'); }} className="flex-1 text-sm px-3 py-2 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700">Login</button>
                  <button onClick={()=>{ setOpen(false); router.push('/auth/signup/account-type'); }} className="flex-1 text-sm px-3 py-2 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800">Sign Up</button>
                </div>
              )}
              {authUser && (
                <div className="space-y-1">
                  <div className="text-xs text-slate-600 mb-1 truncate">Signed in as <span className="font-medium text-slate-800">{authUser.email}</span></div>
                  {authUser?.userType === 'therapist' && (
                    <button onClick={()=>{ setOpen(false); router.push('/therabook/dashboard/therapist'); }} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-blue-50 font-medium">Therapist Dashboard</button>
                  )}
                  <button onClick={()=>{ setOpen(false); router.push(authUser?.userType === 'therapist' ? '/therabook/profile/therapist' : '/therabook/profile/user'); }} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-blue-50">Profile</button>
                  <button onClick={()=>{ setOpen(false); router.push('/therabook/bookings'); }} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-blue-50">Bookings</button>
                  <button onClick={()=>{ setOpen(false); logout(); }} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-red-50 text-red-600">Logout</button>
                </div>
              )}
            </div>
            {/* Join / Apply Section (only when not already clinic-bound therapist) */}
            {!authUser && (
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Join</p>
                <div className="flex flex-col gap-1">
                  <button onClick={()=>{ setOpen(false); router.push('/therabook/therapists/apply'); }} className="w-full text-left px-3 py-2 rounded-md text-sm bg-green-50 text-green-700 hover:bg-green-100 font-medium">Apply as Therapist</button>
                  <button onClick={()=>{ setOpen(false); router.push('/clinics/register'); }} className="w-full text-left px-3 py-2 rounded-md text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium">Join as Clinic</button>
                  <button onClick={()=>{ setOpen(false); router.push('/auth/signup/account-type'); }} className="w-full text-left px-3 py-2 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">All account types</button>
                </div>
              </div>
            )}
            {/* Explore (Modules + Support) */}
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Modules</p>
              <div className="grid grid-cols-2 gap-2">
                {core.map((m,i)=> (
                  <Link key={i} onClick={()=>setOpen(false)} href={m.href} className="text-xs sm:text-sm py-2 px-2 rounded-md hover:bg-blue-50 text-slate-700 font-medium border border-slate-100">
                    {m.label.split(' - ')[0]}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Support</p>
              <div className="flex flex-wrap gap-2">
                {support.map((s,i)=> (
                  <Link key={i} onClick={()=>setOpen(false)} href={s.href} className="text-xs py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Legal</p>
              <div className="flex flex-wrap gap-2">
                {legal.map((l,i)=>(
                  <Link key={i} onClick={()=>setOpen(false)} href={l.href} className="text-[10px] leading-4 px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
