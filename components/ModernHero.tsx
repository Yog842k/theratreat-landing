import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { EnhancedSearch } from "./EnhancedSearch";
import { 
  Search, 
  MapPin,
  Brain,
  ShoppingCart,
  BookOpen,
  Calendar,
  Users,
  Star,
  Award
} from "lucide-react";
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
    <section className="relative min-h-[80vh] overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700" />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center space-y-12">
          {/* Badge */}
          <Badge className="bg-blue-400/20 text-white border-white/30 backdrop-blur-md text-lg px-6 py-2">
            Complete Therapy Ecosystem
          </Badge>

          {/* Main Heading */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight max-w-4xl mx-auto">
              Your One Stop Solution for Therapy, Rehab, Wellness and Recovery
            </h1>
            <p className="text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
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

          {/* Four CTA Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Button 
              size="lg" 
              onClick={() => setCurrentView?.("book")}
              className="bg-therabook-primary hover:bg-therabook-primary/90 text-therabook-primary-foreground border border-therabook-primary/30 backdrop-blur-md rounded-xl p-6 h-auto flex-col space-y-3 group transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Calendar className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Book Consultation</span>
            </Button>
            
            <Button 
              size="lg" 
              onClick={() => setCurrentView?.("store")}
              className="bg-therastore-primary hover:bg-therastore-primary/90 text-therastore-primary-foreground border border-therastore-primary/30 backdrop-blur-md rounded-xl p-6 h-auto flex-col space-y-3 group transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ShoppingCart className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Shop Equipment</span>
            </Button>
            
            <Button 
              size="lg" 
              onClick={() => setCurrentView?.("self-test")}
              className="bg-theraself-primary hover:bg-theraself-primary/90 text-theraself-primary-foreground border border-theraself-primary/30 backdrop-blur-md rounded-xl p-6 h-auto flex-col space-y-3 group transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Brain className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Take Self-Test</span>
            </Button>
            
            <Button 
              size="lg" 
              onClick={() => setCurrentView?.("learn")}
              className="bg-theralearn-primary hover:bg-theralearn-primary/90 text-theralearn-primary-foreground border border-theralearn-primary/30 backdrop-blur-md rounded-xl p-6 h-auto flex-col space-y-3 group transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <BookOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Enroll to Learn</span>
            </Button>
          </div>

          {/* Team Stats */}
          <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-12 text-white/90">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Users className="w-6 h-6" />
                <span className="text-2xl font-bold">2,500+</span>
              </div>
              <span className="text-lg">Verified Therapists</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">4.9</span>
              </div>
              <span className="text-lg">Average Rating</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Award className="w-6 h-6" />
                <span className="text-2xl font-bold">24/7</span>
              </div>
              <span className="text-lg">Support Available</span>
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