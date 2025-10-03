'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Types
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface SelectProps {
  children?: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

// Icons
import {
  Calendar,
  Users,
  Star,
  Clock,
  Video,
  Home,
  MapPin,
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
  Lock,
  Verified,
  UserCheck,
  Quote,
  Brain,
  Activity,
  MessageSquare,
  GraduationCap,
  Puzzle,
  Baby,
  Stethoscope,
  HeartHandshake,
  Zap,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

// Component definitions
const Button: React.FC<ButtonProps> = ({ children, variant = 'default', size = 'default', className = '', onClick = () => {}, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants: Record<string, string> = {
    default: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    outline: 'border-2 border-current text-current bg-transparent hover:bg-current hover:text-white',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    default: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Card: React.FC<CardProps> = ({ children, className = '', onClick = () => {} }) => (
  <div 
    className={`bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
    {...props}
  />
);

export default function TheraBookLanding() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Content data
  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
    'Indore', 'Thane', 'Bhopal',
  ];

  const featuredTherapists = [
    { id: 1, name: 'Dr. Priya Sharma', specialization: 'Clinical Psychologist', experience: '8 years', rating: 4.9, reviews: 156, location: 'Mumbai', price: '₹1200/session', languages: ['Hindi', 'English', 'Marathi'], specialties: ['Anxiety', 'Depression', 'CBT'] },
    { id: 2, name: 'Dr. Rajeev Kumar', specialization: 'Psychiatrist', experience: '12 years', rating: 4.8, reviews: 203, location: 'Delhi', price: '₹1500/session', languages: ['Hindi', 'English'], specialties: ['ADHD', 'Bipolar', 'Medication Management'] },
    { id: 3, name: 'Dr. Anjali Mehra', specialization: 'Family Therapist', experience: '10 years', rating: 4.9, reviews: 187, location: 'Bangalore', price: '₹1000/session', languages: ['English', 'Kannada', 'Hindi'], specialties: ['Couples Therapy', 'Family Conflicts', 'Communication'] },
  ];

  // Animation presets
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  };

  const stagger = {
    animate: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const Select: React.FC<SelectProps> = ({ value, onValueChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button
          type="button"
          className="w-full px-4 py-3 text-left border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || 'Select Location'}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                onValueChange('');
                setIsOpen(false);
              }}
            >
              All Locations
            </div>
            {locations.map((location) => (
              <div
                key={location}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onValueChange(location);
                  setIsOpen(false);
                }}
              >
                {location}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Floating Navbar */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-md border border-white/50 shadow-2xl rounded-2xl"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TheraBook
            </span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#conditions" className="hover:text-blue-600 transition-colors">Conditions</a>
            <a href="#therapy" className="hover:text-blue-600 transition-colors">Therapies</a>
            <a href="#therapists" className="hover:text-blue-600 transition-colors">Therapists</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Session Types</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => {}}>Login</Button>
            <Button size="sm" onClick={() => {}}>Book now</Button>
            <button 
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md"
          >
            <nav className="px-6 py-4 space-y-3">
              <a href="#conditions" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">Conditions</a>
              <a href="#therapy" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">Therapies</a>
              <a href="#therapists" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">Therapists</a>
              <a href="#pricing" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">Session Types</a>
              <a href="#faq" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">FAQ</a>
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-6xl mx-auto text-center text-white"
          >
            <motion.h1 
              className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                TheraBook
              </span>
            </motion.h1>
            
            <motion.h2 
              className="text-3xl md:text-4xl font-light mb-8 text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Where Healing Begins
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-100/90 leading-relaxed max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Connect with Verified Therapists and Rehab Professionals. Book sessions that suit your needs — securely and with confidence.
            </motion.p>

            {/* Enhanced Search */}
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-12 bg-white/20 backdrop-blur-xl rounded-3xl p-6 max-w-4xl mx-auto border border-white/30 shadow-2xl"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <Input
                    placeholder="Search by therapists, clinics, specialization, or condition"
                    className="pl-12 h-14 text-gray-800 placeholder:text-gray-500 bg-white border-0 shadow-inner"
                  />
                </div>
                <div className="relative lg:w-72">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 z-10" />
                  <div className="pl-12">
                    <Select value={selectedLocation} onValueChange={setSelectedLocation} />
                  </div>
                </div>
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" onClick={() => {}}>
                  <Search className="w-6 h-6 mr-2" />
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Animated Stats */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16"
            >
              {[
                { icon: CheckCircle, label: 'Verified Therapists', value: '500+' },
                { icon: Calendar, label: 'Happy Families', value: '10,000+' },
                { icon: Star, label: 'Avg Rating', value: '4.8' },
              ].map((metric, i) => (
                <motion.div 
                  key={metric.label} 
                  variants={fadeUp}
                  className="bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30 hover:bg-white/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <metric.icon className="w-8 h-8 text-yellow-300" />
                    <span className="text-4xl font-black">{metric.value}</span>
                  </div>
                  <div className="text-blue-100 font-medium">{metric.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all" onClick={() => {}}>
                Help me choose therapy
              </Button>
              <Button size="lg" variant="outline" className="border-3 border-white text-white hover:bg-white hover:text-blue-700 font-bold px-12 py-4 rounded-full" onClick={() => {}}>
                Browse Therapists
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Therapists Section */}
      <section id="therapists" className="py-24 bg-gradient-to-b from-white to-indigo-50">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Meet Some of Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Top Therapists
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Highly-reviewed professionals who are dedicated to your healing journey.
            </p>
          </motion.div>

          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {featuredTherapists.map((therapist) => (
              <motion.div key={therapist.id} variants={fadeUp}>
                <Card className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 group border-2 border-transparent hover:border-blue-200">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-10 h-10 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 hover:text-blue-700 transition-colors cursor-pointer mb-1">
                        {therapist.name}
                      </h3>
                      <p className="text-blue-600 font-medium">{therapist.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium">{therapist.experience} experience</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium">{therapist.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                      <span className="font-bold text-gray-900">{therapist.rating}</span>
                      <span className="text-gray-500 ml-2">({therapist.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="flex-1 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white" onClick={() => {}}>
                      FREE Discovery
                    </Button>
                    <Button size="sm" className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => {}}>
                      Book Session
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TheraBook
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Accessible, secure and simple therapy booking for everyone.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-gray-900">Explore</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="#conditions" className="hover:text-blue-700 transition-colors">Conditions</a></li>
              <li><a href="#therapy" className="hover:text-blue-700 transition-colors">Therapies</a></li>
              <li><a href="#therapists" className="hover:text-blue-700 transition-colors">Therapists</a></li>
              <li><a href="#pricing" className="hover:text-blue-700 transition-colors">Session Types</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-gray-900">Company</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="#" className="hover:text-blue-700 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-blue-700 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-700 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-blue-700 transition-colors">Terms</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-gray-900">Get in touch</h4>
            <ul className="space-y-3 text-gray-600">
              <li>Email: support@therabook.app</li>
              <li>Phone: +91-00000-00000</li>
              <li>Mon–Sat: 9:00–18:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <div className="container mx-auto px-6 py-8 text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>© 2024 TheraBook. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
