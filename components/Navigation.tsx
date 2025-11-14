"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/NewAuthContext';
import { User, ChevronDown, LayoutDashboard, Building2, UserCheck } from 'lucide-react';
import Logo from '../logo.png';
// MobileSubHeader removed per request (hide sub bar on mobile)
import dynamic from 'next/dynamic';
const MobileMenu = dynamic(()=>import('./MobileMenu'), { ssr:false });

function NavButton({ className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`transition-colors duration-200 text-sm font-medium px-4 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${className}`}
    />
  );
}

export function Navigation() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const joinRef = useRef<HTMLDivElement | null>(null);

  // Close profile dropdown when clicking outside / pressing escape
  useEffect(() => {
    if (!open && !joinOpen) return;
    const click = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (joinRef.current && !joinRef.current.contains(e.target as Node)) setJoinOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setJoinOpen(false); } };
    document.addEventListener('mousedown', click);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', esc); };
  }, [open, joinOpen]);

  // Hide navigation on clinic dashboard pages (after all hooks are called)
  if (pathname?.startsWith('/clinics/dashboard')) {
    return null;
  }

  // Removed static marketing nav links (Home/About/Services/Contact) per request.

  return (
    <div className="w-full sticky top-2 md:top-4 z-[1000] flex justify-center items-center">
    <header className="w-[90%] rounded-full bg-gray-300/25 backdrop-blur-sm supports-[backdrop-filter]:bg-white/85 border-b border-slate-200 py-1.5 px-3 md:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between h-12 sm:h-14 px-1.5 sm:px-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 select-none" aria-label="TheraTreat Home">
            <Image
              src={Logo}
              alt="TheraTreat Logo"
              priority
              width={44}
              height={44}
              className="object-contain w-10 h-10 md:w-11 md:h-11"
            />
            <span className="text-base sm:text-xl text-[#2379b2] leading-none font-bold "><span className='text-[#112d45]'>Thera</span>Treat</span>
          </Link>
          {/* (Nav links removed) */}
          {/* Auth / Profile */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Mobile menu trigger (compact on <640px) */}
            <div className="sm:hidden">
              <MobileMenu />
            </div>
            {/* Auth / Join / Profile (hidden on very small screens to reduce crowding) */}
            <div className="hidden sm:flex gap-2 items-center">
              {/* Join Us dropdown (desktop / tablet) */}
              <div className="relative" ref={joinRef}>
                <NavButton onClick={() => { setJoinOpen(o => !o); setOpen(false); }}
                  aria-haspopup="true" aria-expanded={joinOpen}
                  className="flex items-center gap-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                  Join Us
                  <ChevronDown className={`w-4 h-4 transition-transform ${joinOpen ? 'rotate-180' : ''}`} />
                </NavButton>
                {joinOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100">Select an option</div>
                    {/* Only show Apply as Therapist if user is not already a clinic-bound therapist */}
                    {!(authUser && authUser.userType === 'therapist' && authUser.clinicId) && (
                      <button onClick={() => { setJoinOpen(false); router.push('/therabook/therapists/apply'); }}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-slate-50 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        Apply as Therapist
                      </button>
                    )}
                    <button onClick={() => { setJoinOpen(false); router.push('/clinics/register'); }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-slate-50 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Join as Clinic
                    </button>
                    <button onClick={() => { setJoinOpen(false); router.push('/auth/signup/account-type'); }}
                      className="w-full text-left mt-1 px-3 py-2 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">
                      See all account types
                    </button>
                  </div>
                )}
              </div>
              {/* Show Login/Sign Up only when not authenticated */}
              {!authUser && (
                <>
                  <NavButton onClick={() => router.push('/auth/login')} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">Login</NavButton>
                  <NavButton onClick={() => router.push('/auth/signup/account-type')} className="bg-blue-600 text-white hover:bg-blue-700 shadow">Sign Up</NavButton>
                </>
              )}
              {/* User profile menu when authenticated */}
              {authUser && (
                <div className="relative" ref={ref}>
                  <NavButton onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-slate-900 hover:bg-slate-100">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline max-w-[110px] truncate">{authUser.name || 'Account'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </NavButton>
                  {open && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg animate-in fade-in">
                      <div className="px-3 py-2 text-xs text-slate-600 border-b border-slate-200">Signed in as
                        <div className="font-medium text-slate-800 truncate">{authUser.email}</div>
                      </div>
                      {authUser?.userType === 'therapist' && (
                        <button onClick={() => { setOpen(false); router.push('/therabook/dashboard/therapist'); }} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-blue-50 flex items-center gap-2"><LayoutDashboard className='w-4 h-4 text-blue-600'/> Dashboard</button>
                      )}
                      <button onClick={() => { setOpen(false); router.push(authUser?.userType === 'therapist' ? '/therabook/profile/therapist' : '/therabook/profile/user'); }} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-blue-50">Profile</button>
                      <button onClick={() => { setOpen(false); router.push('/therabook/bookings'); }} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-blue-50">Bookings</button>
                      <button onClick={() => { setOpen(false); logout(); }} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-red-50 text-red-600">Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  {/* MobileSubHeader intentionally removed so no sub bar shows on mobile */}
    </header>
    </div>
  );
}

export default Navigation;