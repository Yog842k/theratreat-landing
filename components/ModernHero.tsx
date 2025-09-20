"use client";
import "../app/globals.css";

// Simple custom Button component
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "lg" | "md" | "sm";
  className?: string;
  children: React.ReactNode;
};

function Button({ size = "md", className = "", children, ...props }: ButtonProps) {
  const sizeClasses = size === "lg" ? "px-6 py-4 text-lg" : size === "sm" ? "px-2 py-1 text-sm" : "px-4 py-2";
  return (
    <button
      className={`rounded-xl font-medium transition-all duration-300 ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Simple custom Badge component
type BadgeProps = {
  className?: string;
  children: React.ReactNode;
};

function Badge({ className = "", children }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full px-4 py-2 font-medium ${className}`}>
      {children}
    </span>
  );
}

import { 
  Calendar,
  ShoppingCart,
  Brain,
  BookOpen,
  Users,
  Star,
  Award
} from "lucide-react";

interface ModernHeroProps {
  setCurrentView?: (view: string) => void;
}

export function ModernHero({ setCurrentView }: ModernHeroProps) {
  return (
    <section className="relative min-h-[100vh] overflow-hidden">
      {/* Original Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700" />
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.1) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="text-center space-y-12">
          {/* Badge */}
          <Badge className="bg-white/10 mt-10 text-white border border-white/20 backdrop-blur-sm text-sm">
            Complete Therapy Ecosystem
          </Badge>

          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-light text-white leading-[1.1] max-w-3xl mx-auto tracking-tight">
             Your One Stop Solution for <br /> Therapy, Rehab, Wellness and Recovery
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto font-light">
              Connect with verified therapists, access quality equipment, 
              take assessments, and expand your knowledge — all in one place.
            </p>
          </div>

          {/* Four CTA Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Button 
              onClick={() => setCurrentView?.("book")}
              className="relative bg-white/5 hover:bg-white/15 backdrop-blur-lg border border-white/20 hover:border-white/30 shadow-xl hover:shadow-2xl rounded-3xl p-8 h-auto flex-col space-y-4 group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/30 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Calendar className="w-8 h-8 text-blue-300 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="relative flex flex-col z-10 space-y-2">
                <span className="font-semibold text-white text-lg">Book Consultation</span>
                <span className="text-sm text-white/70 font-light leading-relaxed">Connect with verified therapy experts</span>
              </div>
            </Button>

            <Button 
              onClick={() => setCurrentView?.("store")}
              className="relative bg-white/5 hover:bg-white/15 backdrop-blur-lg border border-white/20 hover:border-white/30 shadow-xl hover:shadow-2xl rounded-3xl p-8 h-auto flex-col space-y-4 group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/30 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                <ShoppingCart className="w-8 h-8 text-green-300 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="relative flex flex-col z-10 space-y-2">
                <span className="font-semibold text-white text-lg">Shop Equipment</span>
                <span className="text-sm text-white/70 font-light leading-relaxed">Premium therapy tools & devices</span>
              </div>
            </Button>

            <Button 
              onClick={() => setCurrentView?.("self-test")}
              className="relative bg-white/5 hover:bg-white/15 backdrop-blur-lg border border-white/20 hover:border-white/30 shadow-xl hover:shadow-2xl rounded-3xl p-8 h-auto flex-col space-y-4 group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/30 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Brain className="w-8 h-8 text-purple-300 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="relative flex flex-col z-10 space-y-2">
                <span className="font-semibold text-white text-lg">Take Assessment</span>
                <span className="text-sm text-white/70 font-light leading-relaxed">Professional self-evaluation tools</span>
              </div>
            </Button>

            <Button 
              onClick={() => setCurrentView?.("learn")}
              className="relative bg-white/5 hover:bg-white/15 backdrop-blur-lg border border-white/20 hover:border-white/30 shadow-xl hover:shadow-2xl rounded-3xl p-8 h-auto flex-col space-y-4 group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-orange-600/30 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                <BookOpen className="w-8 h-8 text-orange-300 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="relative flex flex-col z-10 space-y-2">
                <span className="font-semibold text-white text-lg">Learn & Grow</span>
                <span className="text-sm text-white/70 font-light leading-relaxed">Expert educational resources</span>
              </div>
            </Button>
          </div>

          {/* Primary CTA removed as requested */}
        </div>
      </div>
    </section>
  );
}