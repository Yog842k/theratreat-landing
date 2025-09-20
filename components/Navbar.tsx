"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from '../logo.png'

export function Navbar() {
  return (
    <nav className="fixed w-full top-0 left-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 sm:px-6 lg:px-8 shadow-xl shadow-black/10">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Section */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Image src={Logo} alt="TheraTreat Logo" width={40} height={40} />
            </div>
            <div className="text-gray-800">
              <h1 className="text-xl font-bold tracking-tight">TheraTreat</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <ul className="flex items-center space-x-8">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-blue-50/50"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-blue-50/50"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-blue-50/50"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium px-4 py-2 rounded-lg shadow-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu (hidden by default) */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200/50">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            >
              About
            </Link>
            <Link 
              href="/services" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            >
              Services
            </Link>
            <Link 
              href="/contact" 
              className="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 mt-2"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}