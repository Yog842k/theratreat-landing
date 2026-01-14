"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  Activity, 
  Brain, 
  ShieldCheck, 
  Menu, 
  X, 
  Baby, 
  User, 
  ScanFace,
  Lock, 
  CheckCircle2,
  Smartphone,
  ArrowRight,
  Play,
  Footprints,
  Eye,
  HeartPulse,
  Sparkles,
  Zap,
  Globe,
  Stethoscope,
  Smile,
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';

export default function TheraAI() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen selection:bg-violet-500 selection:text-white overflow-x-hidden" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      
      {/* --- 1. Navbar (Floating - Adaptive) --- */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 flex justify-center px-4`}>
        <div className={`
          flex justify-between items-center w-full max-w-6xl 
          backdrop-blur-xl border shadow-lg transition-all duration-300
          rounded-full px-6 py-3
          ${scrolled 
            ? 'bg-white/90 border-white/50 shadow-[0_10px_30px_rgba(76,29,149,0.1)] scale-[0.99] py-2' 
            : 'bg-white/10 border-white/20 shadow-none text-white'} 
          {/* Note: Navbar text color adapts based on scroll */}
        `}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${scrolled ? 'bg-violet-600 text-white' : 'bg-white text-violet-900'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <span className={`text-lg font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              Thera<span className={scrolled ? 'text-violet-600' : 'text-violet-200'}>AI</span>
            </span>
          </div>

          <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${scrolled ? 'text-slate-600' : 'text-violet-100'}`}>
            {['Domains', 'Technology', 'For Families', 'Therapists'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="hover:text-violet-400 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className={`font-medium text-sm px-4 py-2 rounded-full transition ${scrolled ? 'text-violet-900 hover:bg-violet-50' : 'text-white hover:bg-white/10'}`}>Log in</button>
            <Link href="/theraself/tests" className={`px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-lg ${scrolled ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-violet-900 hover:bg-violet-50'}`}>
              Get Started
            </Link>
          </div>

          <button className={`md:hidden p-2 ${scrolled ? 'text-slate-600' : 'text-white'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* --- 2. HERO SECTION: DARK PURPLE --- */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 px-6 overflow-hidden bg-[#0f0c29]">
        
        {/* Dark Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#0f0c29] z-0"></div>
        
        {/* White Grid Overlay (Low Opacity) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none z-0"></div>

        {/* Glow Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/30 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/20 rounded-full blur-[120px] -ml-20 -mb-20 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          
            {/* LEFT: Content (White Text) */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-violet-100 text-xs font-bold uppercase tracking-wider mb-8 shadow-[0_0_15px_rgba(167,139,250,0.3)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-300"></span>
                </span>
                World's First Multi-Domain AI Rehab Screening
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                AI-Powered Early
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]">
                  Rehabilitation Screening
                </span>
              </h1>

              <p className="text-lg text-violet-100/80 mb-8 leading-relaxed max-w-lg">
                Instant physical, cognitive, developmental, emotional, and sensory screening using your smartphone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/theraself/tests" className="h-14 px-8 rounded-2xl bg-white text-violet-900 font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                  Start Self Assessment <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold text-white/80 mb-6">
                {['5 Domains', '30+ Tests', 'AI Powered', 'GDPR & HIPAA', 'Medical-Grade Privacy', 'AI Screening'].map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-200" />
                    <span className="tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          {/* RIGHT: Glass Stack (Dark Mode Version) */}
          <div className="relative h-[500px] w-full hidden lg:block [perspective:1000px]">
             
             {/* Back Card */}
             <div className="absolute top-10 right-0 w-[85%] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 transform rotate-[-2deg] opacity-60 scale-95 z-0">
                <div className="flex justify-between items-center mb-6">
                   <div className="h-8 w-24 bg-white/10 rounded-lg"></div>
                   <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                </div>
                <div className="space-y-3">
                   <div className="h-4 w-full bg-white/10 rounded"></div>
                   <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                   <div className="h-32 w-full bg-white/5 rounded-xl mt-4"></div>
                </div>
             </div>

             {/* Main Card (Glass) */}
             <div className="absolute top-0 right-[10%] w-[85%] bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 p-6 z-10">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center text-violet-300 border border-violet-500/30">
                         <ScanFace className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-white">Gait Analysis</div>
                         <div className="text-xs text-slate-400">Live Tracking</div>
                      </div>
                   </div>
                   <div className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> Active
                   </div>
                </div>
                <div className="relative h-48 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                   <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,#4c1d95_50%,transparent_100%)] opacity-30 animate-pulse"></div>
                   <Activity className="w-24 h-24 text-violet-500 opacity-80" />
                </div>
                <div className="flex justify-between items-center text-sm text-white">
                   <span className="text-slate-400">Confidence Score</span>
                   <span className="font-bold">98.5%</span>
                </div>
             </div>

             {/* Floating Card */}
             <div className="absolute bottom-12 -left-4 bg-white rounded-2xl p-4 shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-white z-20 animate-[bounce_3s_ease-in-out_infinite]">
                <div className="flex items-center gap-3">
                   <div className="bg-fuchsia-100 p-2 rounded-lg text-fuchsia-600">
                      <Brain className="w-6 h-6" />
                   </div>
                   <div>
                      <div className="text-xs text-slate-400 font-bold uppercase">Cognitive</div>
                      <div className="text-sm font-bold text-slate-900">Normal Limits</div>
                   </div>
                   <CheckCircle2 className="w-5 h-5 text-green-500 ml-2" />
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* --- 3. DOMAINS: WHITE SECTION --- */}
      <section id="domains" className="py-24 px-6 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Domains TheraAI Covers</h2>
              <p className="text-slate-500 text-lg">Comprehensive screening across all rehabilitation areas.</p>
            </div>
            <Link href="/theraself/tests" className="text-violet-700 font-bold flex items-center gap-2 hover:gap-3 transition-all group bg-violet-50 px-5 py-3 rounded-full hover:bg-violet-100">
              View Full Protocol <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DomainCard 
              icon={<Activity />} 
              title="Physical Function" 
              desc="Posture, gait, balance, and range of motion analysis"
              tags={['Posture Scan', 'Gait Analysis', 'Balance Test']}
              color="bg-violet-100 text-violet-700"
              className="md:col-span-2"
            />
             <DomainCard 
              icon={<Brain />} 
              title="Cognitive Function" 
              desc="Memory, attention, processing speed, and executive function"
              tags={['Memory Screening', 'Attention Test', 'Processing Speed']}
              color="bg-fuchsia-100 text-fuchsia-700"
            />
            <DomainCard 
              icon={<Baby />} 
              title="Neurodevelopment" 
              desc="Developmental milestones for children 0-18 years"
              tags={['Milestone Check (0-6 yrs)', 'School Readiness', 'Teen Development']}
              color="bg-indigo-100 text-indigo-700"
            />
            <DomainCard 
              icon={<Sparkles />} 
              title="Behavioral & Sensory" 
              desc="Sensory processing, ADHD screening, autism indicators"
              tags={['ADHD Screening', 'Sensory Profile', 'Autism Indicators']}
              color="bg-purple-100 text-purple-700"
            />
            <DomainCard 
              icon={<Smile />} 
              title="Psychological Screening" 
              desc="Depression, anxiety, stress, and emotional wellbeing"
              tags={['Depression Screen', 'Anxiety Test', 'Stress Assessment']}
              color="bg-pink-100 text-pink-700"
            />
          </div>
        </div>
      </section>

      {/* --- 4. HOW IT WORKS: DARK PURPLE SECTION --- */}
      <section id="how-it-works" className="py-24 bg-[#2e1065] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0f0c29] to-[#2e1065] opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">How TheraAI Works</h2>
            <p className="text-violet-200">Simple, fast, and accurate screening in 5 steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
             <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"></div>
              
              {/* Steps adapted for Dark Mode */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-violet-500 text-violet-300 flex items-center justify-center font-bold text-lg mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                  1
                </div>
                <h3 className="text-base font-bold text-white mb-1">Scan with Camera</h3>
                <p className="text-violet-200/70 text-xs">Use your smartphone camera for AI analysis.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-violet-500 text-violet-300 flex items-center justify-center font-bold text-lg mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                  2
                </div>
                <h3 className="text-base font-bold text-white mb-1">Answer Tests</h3>
                <p className="text-violet-200/70 text-xs">Complete structured assessments.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-violet-500 text-violet-300 flex items-center justify-center font-bold text-lg mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                  3
                </div>
                <h3 className="text-base font-bold text-white mb-1">AI Analyzes</h3>
                <p className="text-violet-200/70 text-xs">TheraAI processes your data.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-violet-500 text-violet-300 flex items-center justify-center font-bold text-lg mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                  4
                </div>
                <h3 className="text-base font-bold text-white mb-1">Get Scores</h3>
                <p className="text-violet-200/70 text-xs">Receive functional scores & risk levels.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-violet-500 text-violet-300 flex items-center justify-center font-bold text-lg mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                  5
                </div>
                <h3 className="text-base font-bold text-white mb-1">Connect Therapist</h3>
                <p className="text-violet-200/70 text-xs">Instant therapist referral.</p>
              </div>
          </div>
        </div>
      </section>

      {/* --- 4b. AUDIENCE SECTION: WHITE --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">For Everyone in Your Family</h2>
            <p className="text-slate-600 text-lg">TheraAI serves every generation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AudienceCard title="For Parents" subtitle="Guide childhood milestones" items={['Track child milestones', 'Early intervention', 'Development screening']} />
            <AudienceCard title="For Adults" subtitle="Stay ahead of stress & posture" items={['Mental health screening', 'Posture & ergonomics', 'Stress management']} />
            <AudienceCard title="For Elderly" subtitle="Support safe independence" items={['Fall risk assessment', 'Cognitive screening', 'Mobility tracking']} />
          </div>
        </div>
      </section>

      {/* --- 5. BENEFITS: WHITE SECTION --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Early Detection Benefits</h2>
              <p className="text-slate-600">Catch issues before they become problems.</p>
            </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard title="Posture Issues" desc="Detect forward head and rounded shoulders early." icon={<User />} />
            <BenefitCard title="Gait Irregularities" desc="Identify walking pattern problems." icon={<Footprints />} />
            <BenefitCard title="Development Delays" desc="Catch milestone delays in children." icon={<Baby />} />
            <BenefitCard title="Cognitive Decline" desc="Early signs of memory issues." icon={<Brain />} />
            <BenefitCard title="Mental Health Risk" desc="Depression and anxiety screening." icon={<HeartPulse />} />
            <BenefitCard title="Sensory Processing" desc="Identify sensory integration needs." icon={<Eye />} />
          </div>
        </div>
      </section>

      {/* --- 6. TRUST BAR: DARK SECTION --- */}
      <section className="py-16 bg-[#0f0c29] text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-4">
              <Stethoscope className="w-10 h-10 mx-auto mb-4 text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
              <div className="font-bold text-xl mb-1">Clinical Guidance</div>
              <div className="text-slate-400 text-sm">Built with expert therapists</div>
            </div>
            <div className="p-4">
              <Lock className="w-10 h-10 mx-auto mb-4 text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
              <div className="font-bold text-xl mb-1">GDPR & HIPAA Ready</div>
              <div className="text-slate-400 text-sm">Medical-grade data security</div>
            </div>
            <div className="p-4">
              <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
              <div className="font-bold text-xl mb-1">AI Safety Certified</div>
              <div className="text-slate-400 text-sm">Validated screening models</div>
            </div>
        </div>
      </section>

      {/* --- 7. CTA: WHITE SECTION (With Purple Card) --- */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative bg-gradient-to-r from-violet-700 to-indigo-900 rounded-[2rem] p-12 text-center text-white overflow-hidden shadow-2xl shadow-violet-900/30">
            {/* Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/30 rounded-full blur-[80px] -mr-16 -mt-16 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/30 rounded-full blur-[80px] -ml-16 -mb-16 animate-pulse delay-700"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">Start Your Health Screening Today</h2>
              <p className="text-violet-100 mb-10 max-w-lg mx-auto text-lg">Free, fast, and accurate AI-powered screening in minutes.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/theraself/tests" className="bg-white text-violet-900 px-8 py-4 rounded-xl font-bold hover:bg-violet-50 transition shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  Start Assessment Now
                </Link>
                <Link href="/therabook/therapists" className="bg-violet-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-violet-700 transition border border-white/20">
                  I'm a Therapist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer intentionally removed for TheraSelf page */}
    </div>
  );
}

// --- Sub Components ---

type DomainCardProps = {
  icon: React.ReactElement;
  title: string;
  desc: string;
  tags: string[];
  color: string;
  className?: string;
};

function DomainCard({ icon, title, desc, tags, color, className = "" }: DomainCardProps) {
  return (
    <div className={`group bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] hover:border-violet-200 transition-all duration-300 ${className}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${color} shadow-sm group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-full border border-slate-100 group-hover:border-violet-200 group-hover:text-violet-600 transition-colors">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

type BenefitCardProps = {
  title: string;
  desc: string;
  icon: React.ReactElement;
};

function BenefitCard({ title, desc, icon }: BenefitCardProps) {
  return (
    <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-100 hover:border-violet-300 hover:shadow-[0_10px_30px_rgba(139,92,246,0.15)] transition-all duration-300 group">
       <div className="shrink-0 w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all">
         {React.cloneElement(icon, { className: "w-6 h-6" })}
       </div>
       <div>
         <h3 className="font-bold text-slate-900 mb-1 group-hover:text-violet-700 transition-colors text-lg">{title}</h3>
         <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
       </div>
    </div>
  )
}

type AudienceCardProps = {
  title: string;
  subtitle: string;
  items: string[];
};

function AudienceCard({ title, subtitle, items }: AudienceCardProps) {
  return (
    <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-[0_10px_30px_rgba(15,12,41,0.05)] hover:border-violet-200 hover:shadow-[0_15px_40px_rgba(139,92,246,0.12)] transition-all">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-bold">★</div>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
            <CheckCircle2 className="w-4 h-4 text-violet-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}