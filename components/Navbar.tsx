"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from '../logo.png'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 left-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      {/* Backdrop for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="relative max-w-6xl mx-auto bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl md:rounded-full px-4 sm:px-6 lg:px-8 shadow-xl shadow-black/10">
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
            <button
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2"
              onClick={() => setIsOpen((o) => !o)}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          id="mobile-nav"
          className={`md:hidden ${isOpen ? "block" : "hidden"}`}
          aria-hidden={!isOpen}
        >
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50">
            <div className="mx-2 rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden">
              <nav className="py-2">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-700 text-base font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-700 text-base font-medium"
                >
                  About
                </Link>
                <Link
                  href="/services"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-700 text-base font-medium"
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 text-base font-medium"
                >
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}