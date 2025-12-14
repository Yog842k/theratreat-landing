'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { EnhancedSearch } from '@/components/EnhancedSearch'
import {
  Search,
  Calendar,
  Star,
  Users,
  Video,
  Phone,
  Building,
  Shield,
  Lock,
  UserCheck,
  FileCheck,
  ArrowRight,
  Play,
  Heart,
  Brain,
  Stethoscope,
  Activity,
  Home,
  HelpCircle,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react'

export default function TheraBookHome() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // ... (Logic remains the same)
  const goSearch = (params: Record<string, string | string[]>) => {
    const usp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((vv) => usp.append(k, vv))
      else if (v) usp.set(k, v)
    })
    router.push(`/therabook/therapists${usp.toString() ? `?${usp.toString()}` : ''}`)
  }

  const goSmartSelector = () => router.push('/therabook/smart-selector')

  const conditions = [
    'Anxiety/Stress', 'Depression & Mood', 'Back & Neck Pain', 'Autism (ASD)',
    'Speech Delay', 'ADHD', 'Work Stress/Burnout', 'Sleep Issues'
  ]

  // UPDATED: Strictly Blue/White/Slate palette
  const therapyServices = [
    { icon: Brain, title: 'Occupational Therapy', description: 'Motor skills, sensory integration, and daily living activities', color: 'from-blue-600 to-blue-700', therapyType: 'Occupational Therapist' },
    { icon: Activity, title: 'Physiotherapy', description: 'Rehabilitation, posture correction, and pain management', color: 'from-sky-500 to-sky-600', therapyType: 'Physiotherapist' },
    { icon: Stethoscope, title: 'ABA Therapy', description: 'Applied Behavior Analysis for autism interventions', color: 'from-blue-500 to-blue-600', therapyType: 'ABA Therapist' },
    { icon: Heart, title: 'Psychology', description: 'Counseling, psychotherapy and mental health support', color: 'from-slate-500 to-slate-600', therapyType: 'Clinical Psychologist' },
    { icon: Users, title: 'Special Education', description: 'Specialized learning and educational support', color: 'from-indigo-500 to-indigo-600', therapyType: 'Special Educator' },
  ]

  // UPDATED: Strictly Blue/White/Slate palette
  const sessionTypes = [
    { type: 'Video Consultation', icon: Video, description: 'Face-to-face video session', price: 'From ₹999', color: 'from-blue-600 to-blue-700', formatId: 'video' },
    { type: 'Audio Consultation', icon: Phone, description: 'Voice-only session', price: 'From ₹499', color: 'from-sky-500 to-sky-600', formatId: 'audio' },
    { type: 'Home Care', icon: Home, description: 'At-home therapy sessions', price: 'From ₹1,299', color: 'from-indigo-500 to-indigo-600', formatId: 'at-home' },
    { type: 'In-Clinic Session', icon: Building, description: 'Face-to-face at clinic', price: 'From ₹699', color: 'from-slate-600 to-slate-700', formatId: 'in-clinic' },
  ]

  const faqs = [
    { question: 'How do I choose the right therapist?', answer: 'Our platform uses smart matching based on your specific needs, location preferences, and therapist specializations. You can filter by specialty, experience, ratings, and availability.' },
    { question: 'Are all therapist profiles verified?', answer: 'Yes, every therapist on our platform undergoes rigorous verification including license validation, background checks, and credential verification before being approved.' },
    { question: 'Do you offer online and in-person sessions?', answer: 'Absolutely! We offer video consultations, audio sessions, chat therapy, and in-clinic appointments based on your preference and therapist availability.' },
    { question: 'What are the consultation charges?', answer: 'Consultation fees vary by therapist and session type. Video sessions start from ₹999, audio from ₹499, home care from ₹1,299, and in-clinic from ₹699.' },
    { question: 'Is my personal information secure?', answer: 'Yes, we use bank-grade 256-bit encryption and are ISO 27001 certified. All data is HIPAA compliant and stored with the highest security standards.' },
    { question: 'Can I reschedule or cancel appointments?', answer: 'Yes, you can reschedule or cancel appointments up to 2 hours before the scheduled time through your dashboard or by contacting support.' },
  ]

  // Dynamic Featured Therapists (Logic Preserved)
  interface FeaturedTherapistItem {
    _id: string
    displayName: string
    title: string
    specializations?: string[]
    experience?: number
    image?: string
    rating?: number
    reviewCount?: number
    isVerified?: boolean
    consultationFee?: number
    totalSessions?: number
  }
  const [featuredTherapists, setFeaturedTherapists] = useState<FeaturedTherapistItem[]>([])
  const [therapistsLoading, setTherapistsLoading] = useState(false)
  const [therapistsError, setTherapistsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setTherapistsLoading(true)
        setTherapistsError(null)
        const res = await fetch('/api/therapists?limit=8&sortBy=rating&sortOrder=desc')
        if (!res.ok) throw new Error('Failed to load therapists')
        const json = await res.json()
        const items: FeaturedTherapistItem[] = json?.data?.therapists || []
        items.sort((a, b) => (Number(b.isVerified) - Number(a.isVerified)) || (b.rating || 0) - (a.rating || 0))
        setFeaturedTherapists(items.slice(0,4))
      } catch (e: any) {
        setTherapistsError(e.message || 'Error fetching therapists')
      } finally {
        setTherapistsLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const handleConditionSearch = (condition: string) => {
    goSearch({ conditions: [condition] })
  }
  const handleTherapyTypeSearch = (therapyType: string) => {
    goSearch({ therapyTypes: [therapyType] })
  }
  const handleSessionFormatSearch = (formatId: string) => {
    goSearch({ sessionFormats: [formatId] })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 px-4 md:px-6 bg-blue-700 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 md:w-96 md:h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 rounded-full bg-sky-400/20 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Book trusted therapists<br />
              <span className="text-blue-200">with confidence</span>
            </h1>
            <p className="text-base md:text-xl text-blue-100 max-w-2xl mx-auto px-2">
              Connect with verified healthcare professionals through our secure platform. Search by specialty, location, or session type.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mt-8 md:mt-12 max-w-3xl mx-auto">
            <EnhancedSearch
              onSearch={(params: any) => goSearch((params as Record<string, string | string[]>) || {})}
              setCurrentView={() => {}}
              variant="page"
              placeholder="Search specialists, conditions..."
              showFilters
            />

            <div className="flex flex-col sm:flex-row justify-center mt-6 space-y-3 sm:space-y-0 sm:space-x-4">
              <Button variant="outline" className="w-full sm:w-auto text-blue-700 border-blue-200 bg-white hover:bg-blue-50" onClick={() => goSearch({})}>
                <Users className="w-4 h-4 mr-2" />
                Browse All
              </Button>
              <Button onClick={goSmartSelector} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white border border-transparent shadow-lg hover:shadow-blue-900/20">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Me Choose
              </Button>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Find Care for Your Needs */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900">Find Care for Your Needs</h2>
            <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto">Select a condition to find specialists who can provide targeted treatment</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {conditions.map((condition, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.02 }}>
                <Button variant="outline" className="w-full h-14 md:h-16 text-xs md:text-sm whitespace-normal text-center border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50/50 transition-all duration-300" onClick={() => handleConditionSearch(condition)}>
                  {condition}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-10">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => goSearch({})}>
              View More <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>


      {/* Our Therapy Services */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900">Our Therapy Services</h2>
            <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto">Comprehensive services delivered by certified professionals</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapyServices.map((service, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                <Card className="h-full hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 border border-slate-100 bg-white cursor-pointer group" onClick={() => handleTherapyTypeSearch(service.therapyType)}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} p-3 mb-4 shadow-md`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{service.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{service.description}</p>
                    <div className="flex justify-end mt-auto">
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Featured Therapists */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900">Featured Therapists</h2>
            <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto">Connect with top-rated, verified healthcare professionals</p>
          </motion.div>
          
          <div className="min-h-[120px]">
            {therapistsLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-72 rounded-xl bg-slate-100 border border-slate-200" />
                ))}
              </div>
            )}
            
            {therapistsError && !therapistsLoading && (
              <div className="text-center text-sm text-red-600 p-6 bg-red-50 rounded-lg border border-red-100">{therapistsError}</div>
            )}
            
            {!therapistsLoading && !therapistsError && featuredTherapists.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredTherapists.map((t, index) => (
                  <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-200 bg-white border-t-4 border-t-blue-600">
                      <CardContent className="p-5 text-center flex flex-col h-full">
                        <div className="relative mb-4 mx-auto">
                          <img 
                            src={t.image || 'https://via.placeholder.com/120x120.png?text=Therapist'} 
                            alt={t.displayName} 
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-100" 
                            loading="lazy"
                          />
                          {t.isVerified && <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 border border-white">Verified</Badge>}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{t.displayName}</h3>
                        <p className="text-xs text-blue-600 font-medium mb-1 line-clamp-1">{t.specializations?.[0] || t.title}</p>
                        {(() => {
                          const raw = (t as any).experience ?? (t as any).yearsExperience ?? (t as any).yearsOfExperience ?? (t as any).expYears;
                          let label = '';
                          if (typeof raw === 'number') {
                            if (raw > 0) label = `${raw}+ yrs exp.`;
                          } else if (typeof raw === 'string') {
                            const s = raw.trim();
                            // Try to extract a leading number, else keep the range text succinct
                            const m = s.match(/(\d+)(?:\s*\+?)?/);
                            if (m && Number(m[1]) > 0) label = `${Number(m[1])}+ yrs exp.`;
                            else if (s.length) label = `${s.replace(/years?/i, 'yrs')}`;
                          }
                          return (
                            <p className="text-xs text-slate-400 mb-3">{label || 'Exp. N/A'}</p>
                          );
                        })()}
                        
                        <div className="flex items-center justify-center space-x-1 mb-4 bg-slate-50 py-1 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-slate-700">{t.rating?.toFixed(1) ?? '0.0'}</span>
                          <span className="text-xs text-slate-400">({t.reviewCount || 0})</span>
                        </div>

                        {(() => {
                          const normalizeSessionType = (val: string) => {
                            const s = (val || '').toLowerCase();
                            if (s.includes('video') || s === 'online') return 'video';
                            if (s.includes('audio')) return 'audio';
                            if (s.includes('home')) return 'at-home';
                            if (s.includes('clinic')) return 'in-clinic';
                            return s;
                          };
                          const rawSessions = Array.isArray((t as any).sessionTypes)
                            ? ((t as any).sessionTypes as string[])
                            : typeof (t as any).sessionTypes === 'string'
                            ? [String((t as any).sessionTypes)]
                            : [];
                          const sessionFormats = rawSessions.map(normalizeSessionType);
                          const defaults: Record<string, number> = {
                            video: 999,
                            audio: 499,
                            'in-clinic': 699,
                            'at-home': 1299,
                            clinic: 699,
                            home: 1299,
                          };
                          const fee = Number((t as any).consultationFee || 0);
                          let price = 0;
                          if (fee > 0) price = fee;
                          else if (sessionFormats.length) {
                            const available = sessionFormats.map((s) => defaults[s] || 0).filter((v) => v > 0);
                            if (available.length) price = Math.min(...available);
                          }
                          if (!price) price = Math.min(...Object.values(defaults));
                          return price > 0 ? (
                            <p className="text-xs text-blue-700 font-medium mb-2">From ₹{price.toLocaleString()}</p>
                          ) : null;
                        })()}

                        <div className="mt-auto space-y-2">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9 text-sm" onClick={() => goSearch({ therapist: t._id })}>Book Now</Button>
                          <Button variant="outline" size="sm" className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 h-9" onClick={() => router.push(`/therabook/therapists/${t._id}`)}>Profile</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Session Types */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900">Session Types</h2>
            <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto">Flexible options to fit your schedule</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sessionTypes.map((session, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-100 bg-white">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${session.color} p-3.5 mx-auto mb-4 shadow-md`}>
                      <session.icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{session.type}</h3>
                    <p className="text-sm text-slate-500 mb-4 h-10">{session.description}</p>
                    <p className="text-lg font-bold text-blue-600 mb-5">{session.price}</p>
                    <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => handleSessionFormatSearch(session.formatId)}>
                      Select
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Why Choose */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-blue-900">Why Choose TheraBook?</h2>
            <p className="text-sm md:text-lg text-blue-700/70 max-w-2xl mx-auto">
              Committed to trust, convenience, and professional excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: 'Easy Booking', desc: 'Instant confirmations with flexible rescheduling options' },
              { icon: UserCheck, title: 'Verified Professionals', desc: 'All therapists are licensed and rigorously vetted' },
              { icon: Shield, title: 'Quality Assured', desc: 'Regular quality checks ensure the highest standards' },
              { icon: Clock, title: 'Flexible Scheduling', desc: 'Book appointments that fit your lifestyle' },
              { icon: Heart, title: 'Follow-up Support', desc: 'Continuous care coordination and progress tracking' },
              { icon: Award, title: 'Personalized Care', desc: 'Tailored treatment plans based on your goals' }
            ].map((f, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full border-none shadow-sm bg-white hover:bg-blue-50/50 transition-colors">
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <f.icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{f.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Trust Badges */}
      <section className="py-12 px-4 md:px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 items-center justify-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
             {[
               { icon: Shield, text: "ISO 27001" },
               { icon: Lock, text: "256-bit Encrypted" },
               { icon: UserCheck, text: "Verified Experts" },
               { icon: FileCheck, text: "HIPAA Compliant" },
               { icon: Shield, text: "DPDP Ready" }
             ].map((item, idx) => (
               <div key={idx} className="flex flex-col items-center gap-2 group cursor-default">
                 <item.icon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                 <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-700">{item.text}</span>
               </div>
             ))}
          </div>
        </div>
      </section>


      {/* How it works */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3 mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">How TheraBook Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Simple, secure, and streamlined</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
             {/* Connector Line (Desktop Only) */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-700 z-0" />

            {[
              { step: '1', title: 'Find', desc: 'Search by specialty or need', icon: Search },
              { step: '2', title: 'Book', desc: 'Choose time & pay securely', icon: Calendar },
              { step: '3', title: 'Heal', desc: 'Start your journey', icon: Play }
            ].map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center mb-6 shadow-xl relative group">
                  <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
                  <item.icon className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm max-w-[200px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-slate-200 rounded-lg px-4 bg-white shadow-sm data-[state=open]:border-blue-200">
                <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600 hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </motion.div>
  )
}