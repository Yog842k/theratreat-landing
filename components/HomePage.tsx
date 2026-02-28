"use client"

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ViewType } from "../constants/app-data";
import { motion } from "motion/react";
import {
  Calendar, Brain, ShoppingCart, CheckCircle, 
  ArrowRight, Shield, Heart, Activity, Lock, 
  UserCheck, Target, Sparkles, GraduationCap, Clock, LineChart, Lightbulb,
  HeartHandshake
} from "lucide-react";
interface HomePageProps {
  setCurrentView: (view: ViewType) => void;
}

// Organic, slow-moving blurred shapes for a calming background
const AmbientBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/50 blur-[100px]"
      animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-teal-100/40 blur-[120px]"
      animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full bg-purple-100/30 blur-[100px]"
      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// Futuristic grid + scanline overlay
const FuturisticOverlay = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 opacity-[0.25] bg-[linear-gradient(to_right,rgba(59,130,246,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.18)_1px,transparent_1px)] bg-[size:48px_48px]" />
    <motion.div
      className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-400/10 to-transparent"
      animate={{ y: ["0%", "85%", "0%"] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(14,165,233,0.15),transparent_40%)]" />
    <div className="absolute inset-0 opacity-40 bg-[linear-gradient(135deg,transparent_40%,rgba(59,130,246,0.06)_50%,transparent_60%)]" />
  </div>
);

// Subtle circuit lines
const CircuitLines = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="absolute left-10 top-20 h-[420px] w-px bg-gradient-to-b from-transparent via-blue-300/60 to-transparent" />
    <div className="absolute right-16 top-10 h-[520px] w-px bg-gradient-to-b from-transparent via-sky-300/60 to-transparent" />
    <div className="absolute left-10 top-20 h-px w-[260px] bg-gradient-to-r from-blue-300/60 to-transparent" />
    <div className="absolute right-16 top-44 h-px w-[220px] bg-gradient-to-l from-sky-300/60 to-transparent" />
    <motion.div
      className="absolute left-10 top-56 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
      animate={{ y: [0, 120, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute right-16 top-32 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.8)]"
      animate={{ y: [0, 140, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export function HomePage({ setCurrentView }: HomePageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const onboardingSteps = [
    {
      step: "01",
      title: "Establish Your Baseline",
      desc: "Take a quick AI-assisted self-assessment to map your current well-being.",
      icon: Brain,
      color: "text-blue-600",
      bg: "bg-blue-100",
      action: () => setCurrentView("self-test")
    },
    {
      step: "02",
      title: "Meet Your Expert",
      desc: "Get intelligently matched with a verified professional tailored to your specific needs.",
      icon: UserCheck,
      color: "text-blue-600",
      bg: "bg-blue-100",
      action: () => setCurrentView("book")
    },
    {
      step: "03",
      title: "Follow Your Plan",
      desc: "Access your prescribed exercises, curated equipment, and daily learning resources.",
      icon: LineChart,
      color: "text-blue-600",
      bg: "bg-blue-100",
      action: () => setCurrentView("self-test")
    }
  ];

  const personalToolkit = [
    {
      id: "book",
      icon: Calendar,
      title: "Your Sessions",
      subtitle: "Upcoming & Past Consultations",
      description: "Manage your video, audio, or in-clinic sessions. Thera AI ensures you are always paired with the right specialist.",
      color: "text-blue-600",
      bgLight: "bg-blue-100",
      status: "Ready to schedule",
      features: ["Smart matching", "Reschedule anytime", "Pre-session notes"]
    },
    {
      id: "self-test",
      icon: Brain,
      title: "Your Assessments",
      subtitle: "Track Your Progress",
      description: "Review your past assessments and take new ones to see how your baseline improves over time.",
      color: "text-blue-600",
      bgLight: "bg-blue-100",
      status: "Assessment pending",
      features: ["Instant insights", "Share with therapist", "Trend analysis"]
    },
    {
      id: "store",
      icon: ShoppingCart,
      title: "Your Prescribed Gear",
      subtitle: "Therapeutic Equipment",
      description: "Access the specific wellness products and rehab tools recommended directly by your therapist for your recovery stage.",
      color: "text-blue-600",
      bgLight: "bg-blue-100",
      status: "Personalized store",
      features: ["Therapist approved", "Targeted for you", "Doorstep delivery"]
    },
    {
      id: "learn",
      icon: GraduationCap,
      title: "Your Learning Path",
      subtitle: "Guided Education",
      description: "Resources, guides, and courses curated specifically for your condition and wellness goals.",
      color: "text-blue-600",
      bgLight: "bg-blue-100",
      status: "0% completed",
      features: ["Condition specific", "Paced for you", "Expert led"]
    }
  ];

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/60 to-slate-100 overflow-hidden font-sans text-slate-800">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-gradient-to-b from-[#F5FAFF] via-blue-50 to-slate-50">
        <AmbientBackground />
        <FuturisticOverlay />
        <CircuitLines />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.14),transparent_35%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 text-blue-800 rounded-full border border-blue-200 shadow-sm backdrop-blur relative">
                <span className="absolute -inset-0.5 rounded-full border border-blue-300/40 pointer-events-none" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-sm font-semibold tracking-wide">Setup Profile (Step 1 of 3)</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-blue-950 leading-[1.1]">
                  Your personalized wellness <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500">
                    starts right here.
                  </span>
                </h1>
                <p className="text-xl text-slate-700 leading-relaxed max-w-lg font-medium">
                  From your first assessment to matching you with the right expert. Let's build a care plan tailored entirely for you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => setCurrentView("self-test")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 py-7 text-lg font-semibold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 border-0"
                >
                  Start Initial Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setCurrentView("self-test")}
                  className="bg-white border-slate-200 text-blue-900 rounded-full px-10 py-7 text-lg font-semibold shadow-sm hover:bg-blue-50 hover:border-blue-100 transition-all hover:-translate-y-1"
                >
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  See how AI helps
                </Button>
              </div>

              <div className="flex items-center gap-5 pt-10 border-t border-blue-100/70 text-sm font-semibold text-slate-600 bg-white/60 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue-100/60 to-transparent" />
                <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-blue-600" /> 100% Private</span>
                <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /> HIPAA Compliant</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /> Takes ~5 mins</span>
              </div>
            </motion.div>

            {/* Right Visual - Personal Dashboard Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              {/* Floating HUD chips */}
              <motion.div
                className="absolute -top-6 -left-8 bg-white/80 border border-blue-200 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm flex items-center gap-2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-semibold text-blue-900">Neural Match: 98%</span>
              </motion.div>
              <motion.div
                className="absolute -bottom-8 right-2 bg-white/80 border border-blue-200 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm flex items-center gap-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">AI Insights Active</span>
              </motion.div>

              <div className="relative w-full aspect-square max-w-lg mx-auto bg-white/90 border border-blue-100 rounded-[40px] shadow-2xl p-10 flex flex-col gap-5 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.12),transparent_35%)]" />
                <div className="absolute inset-0 border border-blue-300/30 rounded-[40px]" />
                
                {/* Mockup Header */}
                <div className="flex justify-between items-center mb-5 pb-5 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-bold text-blue-950">Your Action Plan</h3>
                    <p className="text-sm font-medium text-slate-500">Updated <span className="text-blue-600">just now</span></p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=user&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full rounded-full" />
                  </div>
                </div>

                {/* Journey Snapshot */}
                <div className="rounded-3xl border border-blue-100 bg-white/70 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Today</p>
                      <h4 className="text-lg font-bold text-blue-950">Journey Snapshot</h4>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/10 text-blue-700 border border-blue-200">
                      1 of 3 done
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
                    <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-teal-400" />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-white to-blue-50/70 p-5 rounded-2xl border border-blue-100 shadow-sm flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-base font-bold text-slate-900">Complete Self-Assessment</h5>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Completed</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 font-medium">Baseline captured and ready for matching.</p>
                      </div>
                    </div>

                    <div className="bg-white/80 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-base font-bold text-slate-900">Schedule Consultation</h5>
                          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Next up</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 font-medium">Pick a time that fits your week.</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 opacity-80">
                      <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-base font-bold text-slate-600">Access Prescribed Plan</h5>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">Locked</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Unlocks after your first session.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ONBOARDING STEPS */}
      <section className="py-24 border-y border-blue-100/80 bg-gradient-to-b from-white to-blue-50/40 relative">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(59,130,246,0.06),transparent_40%)] pointer-events-none" />
        <div className="absolute inset-x-8 top-16 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,rgba(59,130,246,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20 max-w-xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-950 tracking-tight">How your journey unfolds</h2>
            <p className="text-lg text-slate-600 mt-3 font-medium">Three simple steps to craft your personal well-being plan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 z-0" />
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent z-0" />

            {onboardingSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group cursor-pointer"
                onClick={step.action}
              >
                <div className={`relative w-20 h-20 rounded-3xl ${step.bg} flex items-center justify-center border-8 border-white shadow-lg mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-blue-500/30 bg-gradient-to-br from-blue-100 via-blue-50 to-sky-100`}>
                  <div className="absolute -inset-2 rounded-3xl border border-blue-300/40" />
                  <div className="absolute -inset-3 rounded-3xl border border-blue-400/20" />
                  <step.icon className="w-9 h-9 text-blue-700" />
                </div>
                <Badge variant="outline" className="mb-5 text-blue-600 border-blue-200 bg-blue-50/50 px-4 py-1.5 font-semibold">Step {step.step}</Badge>
                <h3 className="text-2xl font-bold text-blue-950 mb-3">{step.step}. {step.title}</h3>
                <p className="text-base text-slate-700 font-medium px-4 leading-relaxed">{step.desc}</p>
                <Button variant="ghost" className="mt-4 text-blue-700 hover:text-blue-800 hover:bg-blue-50">
                    Go <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONAL TOOLKIT MODULES */}
      <section className="py-32 bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40 relative border-b border-blue-100/80">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[260px] bg-blue-200/40 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute right-10 top-12 h-24 w-24 rounded-full border border-blue-300/40 bg-white/40 backdrop-blur-sm" />
        <div className="absolute left-8 bottom-12 h-20 w-20 rounded-full border border-sky-300/40 bg-white/30 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-20">
            <Badge className="bg-blue-600 text-white mb-4 px-4 py-1 font-semibold border-0">Unlock Your Plan</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-blue-950 mb-6 tracking-tight">Your Personal Toolkit</h2>
            <p className="text-xl text-slate-700 font-medium leading-relaxed">Complete your setup to unlock these personalized tools, specifically configured by AI and your therapist for your condition and wellness goals.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {personalToolkit.map((module, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Card className="h-full border border-blue-100/70 shadow-sm rounded-[32px] overflow-hidden group hover:shadow-2xl hover:border-blue-300 transition-all duration-300 bg-white relative">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                  <CardContent className="p-12 flex flex-col h-full">
                    <div className="absolute top-6 right-6 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-blue-600/10 text-blue-700 border border-blue-200">
                      Module
                    </div>
                    <div className="flex justify-between items-start mb-10">
                      <div className={`w-20 h-20 rounded-3xl ${module.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-100`}>
                        <module.icon className="w-10 h-10 text-blue-700" />
                      </div>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-0 rounded-full px-4 py-2 font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Activity className="w-4 h-4 text-blue-600" />
                        {module.status}
                      </Badge>
                    </div>

                    <h3 className="text-3xl font-bold text-blue-950 mb-2.5">{module.title}</h3>
                    <p className={`font-semibold mb-5 text-lg ${module.color}`}>{module.subtitle}</p>
                    <p className="text-slate-700 mb-10 flex-grow leading-relaxed font-medium">{module.description}</p>

                    <div className="space-y-3.5 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden">
                      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue-100/60 to-transparent" />
                      {module.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-base text-slate-800 font-medium">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 ${module.color}`} />
                          {feat}
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={() => setCurrentView(module.id as ViewType)}
                      variant="outline" 
                      className="w-full justify-between hover:bg-blue-50 text-blue-900 rounded-xl py-7 border border-slate-200 hover:border-blue-100 font-semibold text-base"
                    >
                      View {module.title}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US (Feature Grid) */}
      <section className="py-24 bg-gradient-to-b from-white via-blue-50/30 to-white relative">
        <div className="absolute top-[-40px] right-[-40px] w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-950 mb-4 tracking-tight">Built around you.</h2>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full mb-8" />
            <p className="text-xl text-slate-700 font-medium leading-relaxed">We designed this entire ecosystem so you can ignore the complexities of healthcare logistics and focus entirely on what matters: the healing process.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {[
              { icon: Target, title: "Precision Matching", desc: "Thera AI connects you with the right professional based strictly on your unique assessment findings." },
              { icon: Lightbulb, title: "Personalized Paths", desc: "Adaptive recovery plans that update automatically as you report progress." },
              { icon: Shield, title: "Strictly Secure", desc: "Bank-grade encryption protecting your most sensitive personal health data." },
              { icon: CheckCircle, title: "Verified Network", desc: "100% of our professionals undergo rigorous, continuous background checks." },
              { icon: UserCheck, title: "Your Own Pace", desc: "No pressure. Start assessments, book sessions, or access gear only when you feel ready." },
              { icon: HeartHandshake, title: "Continuous Support", desc: "Access supportive community resources and therapist guidance between sessions." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 group"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-sky-100 flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 group-hover:border-blue-700 transition-colors duration-300 shadow-[0_10px_25px_rgba(59,130,246,0.15)]">
                  <item.icon className="w-7 h-7 text-blue-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950 mb-2.5">{item.title}</h3>
                  <p className="text-base text-slate-700 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL ONBOARDING CTA */}
      <section className="relative py-32 overflow-hidden border-t border-slate-200">
        <div className="absolute inset-0 bg-slate-950" />
        {/* Glowing background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-700/30 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center z-10 space-y-10">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-blue-600/20 text-blue-200 rounded-full border border-blue-500/30 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide uppercase">Your journey awaits</span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Take the first step <br/> toward healing.
          </h2>
          <p className="text-2xl text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
            Establish your baseline assessment so Thera AI and our experts can craft your personalized wellness plan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
            <Button 
              size="lg" 
              onClick={() => setCurrentView("self-test")}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-12 py-8 text-xl font-bold shadow-2xl shadow-blue-500/30 transition-all hover:-translate-y-1 border-0"
            >
              Start My Assessment
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <Button 
              size="lg" 
              onClick={() => setCurrentView("book")}
              variant="outline"
              className="bg-transparent border-blue-600 text-blue-100 hover:bg-white/5 rounded-full px-12 py-8 text-xl font-bold transition-all hover:-translate-y-1"
            >
              Skip & Book directly
            </Button>
          </div>

          <p className="pt-10 text-slate-400 text-base font-semibold border-t border-white/10 max-w-md mx-auto">
            Your data is 100% encrypted and strictly confidential.
          </p>
        </div>
      </section>
    </div>
  );
}
