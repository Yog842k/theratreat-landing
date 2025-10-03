"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/NewAuthContext';
import { User, ChevronDown, LayoutDashboard } from 'lucide-react';
import Logo from '../logo.png';

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', click);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', esc); };
  }, [open]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' }
  ];

  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-600/90 py-3 px-3 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between rounded-full bg-gradient-to-r from-blue-400/70 via-blue-500/70 to-blue-500/70 border border-white/30 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)] px-4 sm:px-6 h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="inline-flex h-9 w-9 rounded-md items-center justify-center bg-white/25 ring-1 ring-white/40 overflow-hidden">
              <Image src={Logo} alt="TheraTreat" width={36} height={36} className="object-contain" />
            </span>
            <span className="text-base sm:text-lg font-semibold tracking-wide text-slate-900 drop-shadow-sm">TheraTreat</span>
          </Link>
          {/* Navigation Links (desktop) */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="px-4 py-2 text-sm font-medium text-slate-800/80 hover:text-slate-900 hover:bg-white/40 rounded-md transition-colors">
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="ml-1 px-5 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
              Contact
            </Link>
          </nav>
          {/* Auth / Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            {!authUser && (
              <div className="hidden md:flex gap-2">
                <NavButton onClick={() => router.push('/auth/login')} className="text-slate-800/80 hover:text-slate-900 hover:bg-white/40">Login</NavButton>
                <NavButton onClick={() => router.push('/auth/signup/account-type')} className="bg-blue-600 text-white hover:bg-blue-700">Sign Up</NavButton>
              </div>
            )}
            {authUser && (
              <div className="relative" ref={ref}>
                <NavButton onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-slate-900 hover:bg-white/40">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline max-w-[110px] truncate">{authUser.name || 'Account'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </NavButton>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/40 bg-white/90 backdrop-blur p-2 shadow-lg animate-in fade-in">
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
    </header>
  );
}

export default Navigation;