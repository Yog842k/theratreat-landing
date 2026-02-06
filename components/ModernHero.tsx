import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Brain,
  ShoppingCart,
  BookOpen,
  Calendar,
  Users,
  Star
} from "lucide-react";
import clsx from "clsx";
import { ViewType } from "../constants/app-data";

interface ModernHeroProps {
  setCurrentView?: (view: ViewType) => void;
}

export function ModernHero({ setCurrentView }: ModernHeroProps) {
  return (
    <section className="relative min-h-[72vh] sm:min-h-[78vh] overflow-hidden w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-700 to-emerald-700" />
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.35),transparent_45%),radial-gradient(circle_at_10%_80%,rgba(16,185,129,0.35),transparent_45%)]" />
      <div className="absolute -top-24 right-6 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-24 left-6 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-24 sm:pb-28 lg:pb-32">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6 text-left animate-in slide-in-from-left-4">
            <Badge className="bg-white/15 text-white border-white/30 backdrop-blur-md text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2">
              Complete Therapy Ecosystem
            </Badge>

            <div className="space-y-5">
              <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Your One-Stop Therapy Platform for Care, Rehab, and Recovery
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                Book verified therapists, explore personalized self-tests, and equip your recovery with trusted tools - all in one calm, guided experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => setCurrentView?.("book")}
                className="bg-white text-slate-900 hover:bg-white/90 shadow-xl shadow-black/20"
              >
                Book a Session
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCurrentView?.("therapists")}
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Browse Therapists
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-white/90">
              {["Video or In-Clinic", "Insurance Friendly", "Progress Tracking"].map((item) => (
                <div key={item} className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-x-8 text-white/90 pt-2">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-lg sm:text-xl font-semibold">2,500+ Verified Therapists</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-lg sm:text-xl font-semibold">4.9 Average Rating</span>
              </div>
            </div>
          </div>

          <div className="relative grid gap-4 animate-in slide-in-from-right-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl">
              <img
                src="/images/psychologist.png"
                alt="Therapist session"
                className="aspect-[4/3] w-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.35))]" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                <span className="rounded-full bg-white/20 px-3 py-1">Therapy Session</span>
                <span className="rounded-full bg-white/20 px-3 py-1">Verified Care</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl">
                <img
                  src="/images/theraself.png"
                  alt="Self assessment tools"
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 flex items-end p-3">
                  <span className="rounded-lg bg-white/20 px-3 py-1 text-xs text-white">Self-Assessment</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Live Availability</p>
                  <p className="mt-2 text-lg font-semibold">Next session in 30 minutes</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
                    <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                    Real-time booking
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl">
                  <img
                    src="/images/Therastore.png"
                    alt="Therapy equipment"
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 flex items-end p-3">
                    <span className="rounded-lg bg-white/20 px-3 py-1 text-xs text-white">TheraStore</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-slate-900 shadow-xl">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/90 text-white flex items-center justify-center font-semibold">
                4.9
              </div>
              <div className="text-sm">
                <p className="font-semibold">Rated Excellent</p>
                <p className="text-slate-600">20k+ patient reviews</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12">
          <HeroActionTabs setCurrentView={setCurrentView} />
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute left-0 right-0 w-full pointer-events-none" style={{ zIndex: 0, bottom: -1 }}>
        <svg
          viewBox="0 0 1200 140"
          fill="none"
          preserveAspectRatio="none"
          className="block w-full h-[140px]"
        >
          <path 
            d="M0,70 C300,140 900,0 1200,70 L1200,140 L0,140 Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

interface HeroActionTabsProps {
  setCurrentView?: (view: ViewType) => void;
}

function HeroActionTabs({ setCurrentView }: HeroActionTabsProps) {
  const items: { key: ViewType; label: string; icon: JSX.Element; color: string; hover?: string }[] = [
    {
      key: 'book',
      label: 'Book Consultation',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-500'
    },
    {
      key: 'store',
      label: 'Shop Equipment',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'bg-emerald-600 hover:bg-emerald-500'
    },
    {
      key: 'self-test',
      label: 'Take Self-Test',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-violet-600 hover:bg-violet-500'
    },
    {
      key: 'learn',
      label: 'Enroll to Learn',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-orange-600 hover:bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {items.map(item => (
        <button
          key={item.key}
            onClick={() => setCurrentView?.(item.key)}
            className={clsx(
              'group relative flex flex-col items-center justify-center gap-3 rounded-xl h-28 md:h-28 px-2 text-center text-white font-medium tracking-tight shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
              item.color
            )}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-md bg-white/10 group-hover:bg-white/15 transition-colors">
            {item.icon}
          </span>
          <span className="text-[11px] md:text-xs leading-tight font-semibold whitespace-pre-line">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
