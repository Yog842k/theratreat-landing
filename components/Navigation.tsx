'use client';

import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, ShoppingCart, Users, UserPlus, GraduationCap, Building, Store, X, User, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Logo from '../logo.png';
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/auth/NewAuthContext';
import Link from "next/link";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isJoinUsOpen, setIsJoinUsOpen] = useState(false);
  const [cartItems] = useState(3); // Mock cart items count
  const { user: authUser, logout: contextLogout } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsJoinUsOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsJoinUsOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    closeMenu();
  };

  const handleLogout = () => {
    contextLogout();
    closeMenu();
    router.refresh();
  };

  // Close profile menu on outside click / escape
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isProfileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-blue-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <Image width={50} height={50} alt="logo" src={Logo} className="h-10 w-10 sm:h-12 sm:w-12 rounded flex items-center justify-center text-white font-bold text-sm sm:text-base"/>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600">TheraTreat</h1>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/therabook" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              TheraBook
            </Link>
            <Link href="/shop" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              Shop
            </Link>
            <Link href="/courses" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              Courses
            </Link>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Join Us Dropdown */}
            <div className="hidden lg:block relative group">
              <Button 
                variant="ghost" 
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
              >
                <Users className="w-4 h-4" />
                <span>Join Us</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 duration-200" />
              </Button>
              <div className="absolute top-full right-0 hidden group-hover:block bg-white border border-blue-200 rounded-lg shadow-lg py-2 w-64 z-50">
                <button
                  onClick={() => handleNavigation('/therabook/therapists/apply')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 text-blue-600 border-b border-blue-100 w-full text-left transition-colors duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Apply as Therapist</span>
                </button>
                <button
                  onClick={() => handleNavigation('/auth/signup/account-type')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 text-blue-600 border-b border-blue-100 w-full text-left transition-colors duration-200"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Register as Instructor</span>
                </button>
                <button
                  onClick={() => handleNavigation('/seller/register')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 text-blue-600 border-b border-blue-100 w-full text-left transition-colors duration-200"
                >
                  <Store className="w-4 h-4" />
                  <span>Sell with us</span>
                </button>
                <button
                  onClick={() => handleNavigation('/auth/signup/account-type')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 text-blue-600 border-b border-blue-100 w-full text-left transition-colors duration-200"
                >
                  <Users className="w-4 h-4" />
                  <span>Register as Student</span>
                </button>
                <button
                  onClick={() => handleNavigation('/auth/signup/account-type')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 text-blue-600 w-full text-left transition-colors duration-200"
                >
                  <Building className="w-4 h-4" />
                  <span>Register as Clinic</span>
                </button>
              </div>
            </div>

            {/* About Us */}
            <Button 
              variant="ghost" 
              className="hidden lg:block text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
              onClick={() => handleNavigation('/about')}
            >
              About Us
            </Button>

            {/* Authentication Section */}
            <div className="hidden sm:flex items-center gap-3">
              {!authUser && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium px-4 py-2 transition-all duration-200 border border-transparent hover:border-blue-200"
                    onClick={() => handleNavigation('/auth/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    onClick={() => handleNavigation('/auth/signup/account-type')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
              {authUser && (
                <div className="relative" ref={profileMenuRef}>
                  <Button 
                    variant="ghost" 
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                    onClick={() => setIsProfileMenuOpen(o => !o)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{authUser.name || 'Account'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  {isProfileMenuOpen && (
                    <div 
                      role="menu"
                      className="absolute right-0 top-full bg-white border border-blue-200 rounded-lg shadow-lg mt-2 w-52 z-50 animate-in fade-in zoom-in-95"
                    >
                      <div className="px-4 py-3 border-b border-blue-100 text-xs text-gray-500">
                        Signed in as
                        <div className="font-medium text-blue-700 truncate">{authUser.email}</div>
                      </div>
                      {authUser?.userType === 'therapist' && (
                        <button onClick={() => { setIsProfileMenuOpen(false); handleNavigation('/therabook/dashboard/therapist'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-600 flex items-center gap-2"><LayoutDashboard className='w-4 h-4' /> Therapist Dashboard</button>
                      )}
                      <button onClick={() => { 
                        setIsProfileMenuOpen(false); 
                        if (authUser?.userType === 'therapist') {
                          // Always send therapists to their profile; editing happens from inside profile UI
                          handleNavigation('/therabook/profile/therapist');
                        } else {
                          handleNavigation('/therabook/profile/user');
                        }
                      }} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-600">Profile</button>
                      <button onClick={() => { setIsProfileMenuOpen(false); handleNavigation('/therabook/bookings'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-600">Bookings</button>
                      <button onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 border-t border-blue-100">Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Shopping Cart */}
            <Button 
              variant="ghost"
              onClick={() => handleNavigation('/cart')}
              className="relative text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse">
                  {cartItems}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              className="lg:hidden p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-blue-200 shadow-xl z-40 animate-in slide-in-from-top-2">
          <div className="px-4 py-6 max-h-screen overflow-y-auto">
            {/* Navigation Links */}
            <div className="mb-6 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-3 text-base font-medium hover:bg-blue-50 transition-colors duration-200" 
                onClick={() => handleNavigation('/therabook')}
              >
                TheraBook
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-3 text-base font-medium hover:bg-blue-50 transition-colors duration-200" 
                onClick={() => handleNavigation('/shop')}
              >
                Shop
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-3 text-base font-medium hover:bg-blue-50 transition-colors duration-200" 
                onClick={() => handleNavigation('/courses')}
              >
                Courses
              </Button>
            </div>

            {/* Mobile Authentication Section */}
            <div className="mb-6 space-y-3">
              {!authUser && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 py-3 text-base font-medium transition-all duration-300 rounded-lg"
                    onClick={() => handleNavigation('/auth/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-base font-medium transition-all duration-300 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={() => handleNavigation('/auth/signup/account-type')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
              {authUser && (
                <div className="space-y-2">
                  <div className="px-2 py-3 bg-blue-50 rounded-md text-blue-700 text-sm">
                    Signed in as <strong>{authUser.email}</strong>
                  </div>
                  {authUser?.userType === 'therapist' && (
                    <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-800 py-3 px-3 text-base font-medium hover:bg-blue-50" onClick={() => handleNavigation('/therabook/dashboard/therapist')}>Therapist Dashboard</Button>
                  )}
                  <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-800 py-3 px-3 text-base font-medium hover:bg-blue-50" onClick={() => handleNavigation(authUser?.userType === 'therapist' ? '/therabook/profile/therapist' : '/therabook/profile/user')}>Profile</Button>
                  <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-800 py-3 px-3 text-base font-medium hover:bg-blue-50" onClick={() => handleNavigation('/therabook/bookings')}>Bookings</Button>
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>Logout</Button>
                </div>
              )}
            </div>

            {/* Join Us Section */}
            <div className="mb-6">
              <button 
                onClick={() => setIsJoinUsOpen(!isJoinUsOpen)}
                className="w-full flex items-center justify-between px-3 py-3 text-base font-semibold text-blue-600 hover:text-blue-800 border-b border-blue-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Join Us</span>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform duration-300 ${isJoinUsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isJoinUsOpen && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg mt-2 overflow-hidden transition-all duration-300">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-4 text-base hover:bg-blue-200 border-b border-blue-200 rounded-none transition-colors duration-200" 
                    onClick={() => handleNavigation('/therabook/therapists/apply')}
                  >
                    <UserPlus className="w-5 h-5 mr-3" />
                    Apply as Therapist
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-4 text-base hover:bg-blue-200 border-b border-blue-200 rounded-none transition-colors duration-200" 
                    onClick={() => handleNavigation('/auth/signup/account-type')}
                  >
                    <GraduationCap className="w-5 h-5 mr-3" />
                    Register as Instructor
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-4 text-base hover:bg-blue-200 border-b border-blue-200 rounded-none transition-colors duration-200" 
                    onClick={() => handleNavigation('/seller/register')}
                  >
                    <Store className="w-5 h-5 mr-3" />
                    Sell with us
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-4 text-base hover:bg-blue-200 border-b border-blue-200 rounded-none transition-colors duration-200" 
                    onClick={() => handleNavigation('/auth/signup/account-type')}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    Register as Student
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-4 text-base hover:bg-blue-200 rounded-none transition-colors duration-200" 
                    onClick={() => handleNavigation('/auth/signup/account-type')}
                  >
                    <Building className="w-5 h-5 mr-3" />
                    Register as Clinic
                  </Button>
                </div>
              )}
            </div>

            {/* Other Menu Items */}
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-3 text-base font-medium hover:bg-blue-50 transition-colors duration-200" 
                onClick={() => handleNavigation('/about')}
              >
                About Us
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-blue-600 hover:text-blue-800 py-4 px-3 text-base font-medium hover:bg-blue-50 transition-colors duration-200" 
                onClick={() => handleNavigation('/cart')}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Shopping Cart
                {cartItems > 0 && (
                  <Badge variant="destructive" className="ml-2 h-6 w-6 text-xs p-0 flex items-center justify-center">
                    {cartItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}