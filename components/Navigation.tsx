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
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-b border-slate-200 py-2 px-3 md:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-14 px-2 sm:px-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="inline-flex h-9 w-9 rounded-md items-center justify-center bg-blue-50 ring-1 ring-blue-100 overflow-hidden">
              <Image src={Logo} alt="TheraTreat" width={36} height={36} className="object-contain" />
            </span>
            <span className="text-base sm:text-lg font-semibold tracking-wide text-slate-900 drop-shadow-sm">TheraTreat</span>
          </Link>
          {/* Navigation Links (desktop) */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="ml-1 px-5 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200">
              Contact
            </Link>
          </nav>
          {/* Auth / Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            {!authUser && (
              <div className="hidden md:flex gap-2">
                <NavButton onClick={() => router.push('/auth/login')} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">Login</NavButton>
                <NavButton onClick={() => router.push('/auth/signup/account-type')} className="bg-blue-600 text-white hover:bg-blue-700 shadow">Sign Up</NavButton>
              </div>
            )}
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
    </header>
  );
}

export default Navigation;