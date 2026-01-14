"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/theralearn", label: "Overview" },
  { href: "/theralearn/therapists", label: "Therapists" },
  { href: "/theralearn/patients", label: "Patients" },
  { href: "/theralearn/students", label: "Students" },
  { href: "/theralearn/categories", label: "Categories" },
  { href: "/theralearn/reviews", label: "Reviews" },
  { href: "/theralearn/faqs", label: "FAQs" }
];

export function TheraLearnHeader() {
  const pathname = usePathname() || "";

  return (
    <div className="sticky top-16 z-[60] bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
