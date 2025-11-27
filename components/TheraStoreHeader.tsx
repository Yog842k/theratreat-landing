'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Package,
  Heart,
  User,
  Menu,
  X,
  Home,
  LayoutGrid,
  TrendingUp,
  Award,
  MapPin,
  CreditCard,
  FileText,
  Truck,
  ChevronDown,
  LogIn,
  UserPlus,
  Store
} from 'lucide-react';

export function TheraStoreHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    const updateCounts = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('therastore_cart') || '[]');
        setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
        
        const wishlist = JSON.parse(localStorage.getItem('therastore_wishlist') || '[]');
        setWishlistCount(wishlist.length);
      } catch (error) {
        console.error('Error loading counts:', error);
      }
    };

    updateCounts();
    const interval = setInterval(updateCounts, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/therastore/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: '/therastore', label: 'Home', icon: Home },
    { href: '/therastore/products', label: 'Products', icon: LayoutGrid },
    { href: '/therastore/categories', label: 'Categories', icon: Award },
    { href: '/therastore/trending', label: 'Trending', icon: TrendingUp },
  ];

  const accountLinks = [
    { href: '/therastore/orders', label: 'Orders', icon: Package },
    { href: '/therastore/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/therastore/addresses', label: 'Addresses', icon: MapPin },
    { href: '/therastore/payments', label: 'Payments', icon: CreditCard },
    { href: '/therastore/refunds', label: 'Returns', icon: FileText },
    { href: '/therastore/tracking', label: 'Tracking', icon: Truck },
  ];

  return (
    <header className="relative z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/therastore" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-emerald-500/50">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-700 transition-all">
                TheraStore
              </h1>
              <p className="text-xs text-gray-500 -mt-1 font-medium">by TheraTreat</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/therastore' && (pathname?.startsWith(link.href) || false));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search therapy tools, rehab aids, or wellness devices..."
                className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-sm bg-gray-50 hover:bg-white"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link
              href="/therastore/wishlist"
              className="relative p-2.5 rounded-full hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-all group"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 group-hover:fill-emerald-600 transition-all" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg animate-pulse">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/therastore/cart"
              className="relative p-2.5 rounded-full hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-all group"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg animate-pulse">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Account Menu */}
            <div className="relative hidden md:block" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Account</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/auth/login"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link
                    href="/therastore/vendor-register"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    Become a Vendor
                  </Link>
                  <Link
                    href="/therastore/vendor-login"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    Vendor Login
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 animate-in fade-in slide-in-from-top-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search therapy tools, rehab aids, or wellness devices..."
                  className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-emerald-600 transition-colors text-sm"
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/therastore' && (pathname?.startsWith(link.href) || false));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mb-2">Account</p>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <UserPlus className="w-5 h-5" />
                  Register
                </Link>
                <Link
                  href="/therastore/vendor-register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Store className="w-5 h-5" />
                  Become a Vendor
                </Link>
                <Link
                  href="/therastore/vendor-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Store className="w-5 h-5" />
                  Vendor Login
                </Link>
                {accountLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (pathname?.startsWith(link.href) || false);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

