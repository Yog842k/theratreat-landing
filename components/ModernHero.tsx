import { useState } from "react";
import { Badge } from "./ui/badge";
import { EnhancedSearch } from "./EnhancedSearch";
import {
  Brain,
  ShoppingCart,
  BookOpen,
  Calendar,
  Users,
  Star,
  Award
} from "lucide-react";
import clsx from "clsx";
import { ViewType } from "../constants/app-data";

interface ModernHeroProps {
  setCurrentView?: (view: ViewType) => void;
}

export function ModernHero({ setCurrentView }: ModernHeroProps) {
  const handleSearch = (searchParams: any) => {
    console.log("Search params:", searchParams);
    // The search will be handled by the EnhancedSearch component
  };

  return (
  <section className="relative min-h-[70vh] sm:min-h-[78vh] overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700" />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center space-y-8 sm:space-y-12">
          {/* Badge */}
          <Badge className="bg-blue-400/20 text-white border-white/30 backdrop-blur-md text-sm sm:text-base md:text-lg px-4 sm:px-5 py-1.5 sm:py-2">
            Complete Therapy Ecosystem
          </Badge>

          {/* Main Heading */}
          <div className="space-y-8">
            <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight max-w-4xl mx-auto tracking-tight">
              Your One Stop Solution for Therapy, Rehab, Wellness and Recovery
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Get matched with verified therapist, shop therapy equipments, take quick self-tests and enrol to learn.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto">
            <EnhancedSearch
              onSearch={handleSearch}
              setCurrentView={setCurrentView}
              variant="hero"
              placeholder="Search therapists, specialties, conditions..."
              showFilters={true}
            />
          </div>

          {/* Action Tabs (refactored) */}
          <HeroActionTabs setCurrentView={setCurrentView} />

          {/* Team Stats */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 sm:gap-x-8 text-white/90 mt-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xl sm:text-2xl font-bold">2,500+</span>
              </div>
              <span className="text-sm sm:text-base font-medium">Verified Therapists</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-xl sm:text-2xl font-bold">4.9</span>
              </div>
              <span className="text-sm sm:text-base font-medium">Average Rating</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xl sm:text-2xl font-bold">24/7</span>
              </div>
              <span className="text-sm sm:text-base font-medium">Support Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" fill="none" className="w-full h-20">
          <path 
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" 
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