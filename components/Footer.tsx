"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const isTheraStore = pathname?.startsWith("/therastore");
  const isTheraSelf = pathname?.startsWith("/theraself");
  const palette = isTheraStore
    ? {
        bg: "bg-emerald-700",
        border: "border-emerald-600",
        textMuted: "text-emerald-100",
        icon: "text-emerald-100",
        inputBg: "bg-emerald-600",
        inputBorder: "border-emerald-500",
        placeholder: "placeholder-emerald-200",
        focusRing: "focus:ring-emerald-300",
        buttonText: "text-emerald-700",
        buttonHover: "hover:bg-emerald-50",
      }
    : isTheraSelf
    ? {
        bg: "bg-purple-700",
        border: "border-purple-600",
        textMuted: "text-purple-100",
        icon: "text-purple-100",
        inputBg: "bg-purple-600",
        inputBorder: "border-purple-500",
        placeholder: "placeholder-purple-200",
        focusRing: "focus:ring-purple-300",
        buttonText: "text-purple-700",
        buttonHover: "hover:bg-purple-50",
      }
    : {
        bg: "bg-blue-700",
        border: "border-blue-600",
        textMuted: "text-blue-100",
        icon: "text-blue-100",
        inputBg: "bg-blue-600",
        inputBorder: "border-blue-500",
        placeholder: "placeholder-blue-200",
        focusRing: "focus:ring-blue-300",
        buttonText: "text-blue-700",
        buttonHover: "hover:bg-blue-50",
      };
  return (
    <footer className={`${palette.bg} text-white w-full overflow-x-hidden`} role="contentinfo">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4 min-w-0">
            <h3 className="text-2xl font-bold tracking-tight">TheraTreat<span className="align-super text-xs ml-1">™</span></h3>
            <p className={`${palette.textMuted} leading-relaxed text-sm md:text-base max-w-md`}>
              Your comprehensive healthcare ecosystem – connecting patients with providers, enabling self‑care,
              facilitating learning, and providing access to quality therapy equipment.
            </p>
            <div className="space-y-2 text-sm">
              <div className={`flex items-start gap-2 ${palette.textMuted}`}>
                <Phone className="w-4 h-4 mt-0.5" />
                <span className="select-all">+91 8446602680</span>
              </div>
              <div className={`flex items-start gap-2 ${palette.textMuted}`}>
                <Mail className="w-4 h-4 mt-0.5" />
                <span className="break-all">support@theratreat.in</span>
              </div>
              <div className={`flex items-start gap-2 ${palette.textMuted}`}>
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="break-words max-w-xs">1503/2, Jadhav Nagar, Shikrapur, Shirur, Pune 412208, Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Core Modules */}
          <div className="min-w-0">
            <h4 className="font-semibold mb-4 tracking-wide text-sm uppercase">Core Modules</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/therabook" className={`${palette.textMuted} hover:text-white transition`}>TheraBook – Consultations</Link></li>
              <li><Link href="/theraself" className={`${palette.textMuted} hover:text-white transition`}>TheraSelf – Assessments</Link></li>
              <li><Link href="/therastore" className={`${palette.textMuted} hover:text-white transition`}>TheraStore – Equipment</Link></li>
              <li><Link href="/theralearn" className={`${palette.textMuted} hover:text-white transition`}>TheraLearn – Education</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="min-w-0">
            <h4 className="font-semibold mb-4 tracking-wide text-sm uppercase">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className={`${palette.textMuted} hover:text-white transition`}>About</Link></li>
              <li><Link href="/contact" className={`${palette.textMuted} hover:text-white transition`}>Contact</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="min-w-0">
            <h4 className="font-semibold mb-4 tracking-wide text-sm uppercase">Legal & Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className={`${palette.textMuted} hover:text-white transition`}>Privacy Policy</Link></li>
              <li><Link href="/termsofUse" className={`${palette.textMuted} hover:text-white transition`}>Terms of Use</Link></li>
              <li><Link href="/refund" className={`${palette.textMuted} hover:text-white transition`}>Refund & Cancellation</Link></li>
              <li><Link href="/compliance" className={`${palette.textMuted} hover:text-white transition`}>Compliance</Link></li>
              <li><Link href="/hipaa" className={`${palette.textMuted} hover:text-white transition`}>HIPAA / Data Handling</Link></li>
              <li><Link href="/policies#accessibility" className={`${palette.textMuted} hover:text-white transition`}>Accessibility</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className={`border-t ${palette.border} mt-12 pt-8`}>
          <div className="w-full max-w-md">
            <h4 className="font-semibold mb-2">Stay Connected</h4>
            <p className={`${palette.textMuted} mb-4 text-sm`}>Get health tips, platform updates, and exclusive offers</p>
            <form onSubmit={(e)=>{e.preventDefault();}} className="flex gap-2 min-w-0">
              <input 
                type="email" 
                aria-label="Email address"
                required
                placeholder="Enter your email" 
                className={`w-0 flex-1 min-w-0 px-4 py-2 rounded-lg ${palette.inputBg} border ${palette.inputBorder} text-white ${palette.placeholder} focus:outline-none focus:ring-2 ${palette.focusRing}`}
              />
              <button type="submit" className={`bg-white ${palette.buttonText} shrink-0 px-5 sm:px-6 py-2 rounded-lg font-medium ${palette.buttonHover} transition`}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className={`border-t ${palette.border} mt-10 pt-6`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-5 w-full min-w-0">
            <div className={`flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-xs sm:text-sm ${palette.textMuted} max-w-full`}>
              <Link href="/policies#privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/policies#cancellation" className="hover:text-white transition">Cancellation</Link>
              <Link href="/policies#conduct" className="hover:text-white transition">Conduct</Link>
              <Link href="/policies#data-security" className="hover:text-white transition">Security</Link>
              <Link href="/policies#liability" className="hover:text-white transition">Liability</Link>
              <Link href="/policies#misuse" className="hover:text-white transition">Misuse</Link>
              <Link href="/policies#accessibility" className="hover:text-white transition">Accessibility</Link>
              <Link href="/policies#disclaimer" className="hover:text-white transition">Disclaimer</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link aria-label="Facebook" href="#" className={`${palette.icon} hover:text-white transition`}><Facebook className="w-5 h-5" /></Link>
              <Link aria-label="Twitter" href="#" className={`${palette.icon} hover:text-white transition`}><Twitter className="w-5 h-5" /></Link>
              <Link aria-label="Instagram" href="https://www.instagram.com/Theratreat.in/" target="_blank" rel="noopener" className={`${palette.icon} hover:text-white transition`}><Instagram className="w-5 h-5" /></Link>
              <Link aria-label="LinkedIn" href="https://www.linkedin.com/company/theratreat/" target="_blank" rel="noopener" className={`${palette.icon} hover:text-white transition`}><Linkedin className="w-5 h-5" /></Link>
              <Link aria-label="Youtube" href="#" className={`${palette.icon} hover:text-white transition`}><Youtube className="w-5 h-5" /></Link>
            </div>
          </div>
          <div className={`text-center mt-6 ${isTheraStore ? "text-emerald-200" : isTheraSelf ? "text-purple-200" : "text-blue-200"} text-xs sm:text-sm px-2 leading-relaxed`}>
            © {new Date().getFullYear()} TheraTreat. All rights reserved. | Comprehensive Healthcare Platform | HIPAA / DPDP Aware
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
