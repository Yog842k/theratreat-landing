'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
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
} from 'lucide-react'

export default function TheraBookHome() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

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

  const therapyServices = [
    { icon: Brain, title: 'Occupational Therapy', description: 'Motor skills, sensory integration, and daily living activities', color: 'from-purple-500 to-purple-600', therapyType: 'Occupational Therapist' },
    { icon: Activity, title: 'Physiotherapy', description: 'Rehabilitation, posture correction, and pain management', color: 'from-green-500 to-green-600', therapyType: 'Physiotherapist' },
    { icon: Stethoscope, title: 'ABA Therapy', description: 'Applied Behavior Analysis for autism interventions', color: 'from-teal-500 to-teal-600', therapyType: 'ABA Therapist' },
    { icon: Heart, title: 'Psychology', description: 'Counseling, psychotherapy and mental health support', color: 'from-pink-500 to-pink-600', therapyType: 'Clinical Psychologist' },
    { icon: Users, title: 'Special Education', description: 'Specialized learning and educational support', color: 'from-orange-500 to-orange-600', therapyType: 'Special Educator' },
  ]

  const sessionTypes = [
    { type: 'Video Consultation', icon: Video, description: 'Face-to-face video session', price: 'From ₹999', color: 'from-blue-500 to-blue-600', formatId: 'video' },
    { type: 'Audio Consultation', icon: Phone, description: 'Voice-only session', price: 'From ₹499', color: 'from-green-500 to-green-600', formatId: 'audio' },
    { type: 'Home Care', icon: Home, description: 'At-home therapy sessions', price: 'From ₹1,299', color: 'from-purple-500 to-purple-600', formatId: 'at-home' },
    { type: 'In-Clinic Session', icon: Building, description: 'Face-to-face at clinic', price: 'From ₹699', color: 'from-orange-500 to-orange-600', formatId: 'in-clinic' },
  ]

  const faqs = [
    { question: 'How do I choose the right therapist for my needs?', answer: 'Our platform uses smart matching based on your specific needs, location preferences, and therapist specializations. You can filter by specialty, experience, ratings, and availability.' },
    { question: 'Are all therapist profiles verified?', answer: 'Yes, every therapist on our platform undergoes rigorous verification including license validation, background checks, and credential verification before being approved.' },
    { question: 'Do you offer both online and in-person sessions?', answer: 'Absolutely! We offer video consultations, audio sessions, chat therapy, and in-clinic appointments based on your preference and therapist availability.' },
    { question: 'What are the consultation charges?', answer: 'Consultation fees vary by therapist and session type. Video sessions start from ₹999, audio from ₹499, home care from ₹1,299, and in-clinic from ₹699.' },
    { question: 'Is my personal information secure?', answer: 'Yes, we use bank-grade 256-bit encryption and are ISO 27001 certified. All data is HIPAA compliant and stored with the highest security standards.' },
    { question: 'Can I reschedule or cancel appointments?', answer: 'Yes, you can reschedule or cancel appointments up to 2 hours before the scheduled time through your dashboard or by contacting support.' },
  ]

  // Dynamic Featured Therapists (top rated / verified)
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
        // Fetch top therapists sorted by rating (limit 8 for layout flexibility)
        const res = await fetch('/api/therapists?limit=8&sortBy=rating&sortOrder=desc')
        if (!res.ok) throw new Error('Failed to load therapists')
        const json = await res.json()
        const items: FeaturedTherapistItem[] = json?.data?.therapists || []
        // Simple prioritization: verified first then rating
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

  const onSubmitSearch = () => {
    const params: Record<string, string> = {}
    if (searchQuery) params.search = searchQuery
    goSearch(params)
  }

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="min-h-screen bg-gradient-to-br from-therabook-secondary via-white to-therabook-muted">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-blue-700">
        <div className="absolute inset-0 bg-blue-900/20" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">Book trusted therapists<br /><span className="text-blue-100">with confidence</span></h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">Connect with verified healthcare professionals through our secure, user-friendly platform. Search by specialty, location, or session type and find the perfect match for your needs.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mt-12 max-w-4xl mx-auto">
            <EnhancedSearch
              onSearch={(params: any) => goSearch((params as Record<string, string | string[]>) || {})}
              setCurrentView={() => {}}
              variant="page"
              placeholder="Search therapists, specialties or conditions..."
              showFilters
            />

            <div className="flex justify-center mt-6 space-x-4">
              <Button variant="outline" className="text-therabook-primary border-therabook-border hover:bg-therabook-secondary" onClick={() => goSearch({})}>
                <Users className="w-4 h-4 mr-2" />
                Browse All Therapists
              </Button>
              <Button onClick={goSmartSelector} className="bg-gradient-to-r from-therabook-primary to-blue-700 hover:from-blue-700 hover:to-therabook-primary text-white">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Me Choose
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-blue-400/20 blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-blue-300/20 blur-xl" />
      </section>


      {/* Find Care for Your Needs */}
      <section className="py-16 px-6 bg-gradient-to-br from-therabook-secondary via-white to-therabook-muted">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">Find Care for Your Needs</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Connect with specialists who understand your specific condition and can provide targeted treatment</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {conditions.map((condition, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}>
                <Button variant="outline" className="w-full h-16 border-therabook-border text-therabook-primary hover:bg-therabook-secondary hover:border-therabook-primary transition-all duration-300 bg-white/80 backdrop-blur-sm" onClick={() => handleConditionSearch(condition)}>
                  {condition}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Therapy Services */}
      <section className="py-16 px-6 bg-gradient-to-r from-therabook-accent via-therabook-secondary to-therabook-accent">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">Our Therapy Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Comprehensive therapy services delivered by certified professionals using evidence-based approaches</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapyServices.map((service, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm cursor-pointer group border-l-4 border-l-transparent hover:border-l-therabook-primary" onClick={() => handleTherapyTypeSearch(service.therapyType)}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.color} p-3 mb-4`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-therabook-primary mb-3">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                    <div className="flex justify-end">
                      <ArrowRight className="w-5 h-5 text-therabook-primary group-hover:text-blue-700 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="py-16 px-6 bg-gradient-to-br from-white via-therabook-muted to-therabook-secondary">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">Meet Our Featured Therapists</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Connect with our top-rated, verified healthcare professionals who are ready to support your well-being journey</p>
          </motion.div>
          <div className="min-h-[120px]">
            {therapistsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-white/40 backdrop-blur-sm border border-therabook-border" />
                ))}
              </div>
            )}
            {therapistsError && !therapistsLoading && (
              <div className="text-center text-sm text-red-600 p-6 bg-red-50 rounded-lg border border-red-200">{therapistsError}</div>
            )}
            {!therapistsLoading && !therapistsError && featuredTherapists.length === 0 && (
              <div className="text-center text-sm text-slate-600 p-6 bg-white/70 rounded-lg border border-therabook-border">No therapists available yet. Please check back soon.</div>
            )}
            {!therapistsLoading && !therapistsError && featuredTherapists.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredTherapists.map((t, index) => (
                  <motion.div key={t._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm border-t-4 border-t-therabook-primary">
                      <CardContent className="p-6 text-center">
                        <div className="relative mb-4">
                          <img src={t.image || 'https://via.placeholder.com/120x120.png?text=Therapist'} alt={t.displayName} className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-therabook-accent" />
                          {t.isVerified && <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] px-2">Verified</Badge>}
                        </div>
                        <h3 className="text-lg font-semibold text-therabook-primary mb-1">{t.displayName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{t.specializations?.[0] || t.title}</p>
                        <p className="text-xs text-muted-foreground mb-3">{t.experience != null ? `${t.experience}+ yrs exp.` : 'Experience N/A'}</p>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{t.rating?.toFixed(1) ?? '0.0'}</span>
                          <span className="text-xs text-muted-foreground">({t.reviewCount || 0} reviews)</span>
                        </div>
                        {t.consultationFee != null && (
                          <p className="text-xs text-green-600 mb-2">From ₹{t.consultationFee}</p>
                        )}
                        <div className="space-y-2 pt-1">
                          <Button className="w-full bg-gradient-to-r from-therabook-primary to-blue-700 hover:from-blue-700 hover:to-therabook-primary text-white" onClick={() => goSearch({ therapist: t._id })}>Book Session</Button>
                          <Button variant="outline" size="sm" className="w-full text-therabook-primary border-therabook-border hover:bg-therabook-secondary" onClick={() => router.push(`/therabook/therapists/${t._id}`)}>View Profile</Button>
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

      {/* Choose Your Session Type */}
      <section className="py-16 px-6 bg-gradient-to-r from-therabook-secondary via-white to-therabook-accent">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">Choose Your Session Type</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Flexible consultation options designed to fit your schedule and comfort preferences</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sessionTypes.map((session, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <Card className={`h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm cursor-pointer ring-2 ring-transparent hover:ring-therabook-border`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${session.color} p-4 mx-auto mb-4`}>
                      <session.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{session.type}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{session.description}</p>
                    <p className="text-lg font-bold text-therabook-primary mb-6">{session.price}</p>
                    <Button className={`w-full bg-gradient-to-r ${session.color} text-white hover:shadow-lg transition-all duration-300`} onClick={() => handleSessionFormatSearch(session.formatId)}>
                      Find Therapists
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 px-6 bg-gradient-to-r from-therabook-accent via-therabook-secondary to-therabook-accent">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">Trust & Security</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Your privacy and data security are our top priorities with industry-leading compliance standards</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {[{ icon: Shield, title: 'ISO 27001 Certified', description: 'Security management best practices' }, { icon: Lock, title: '256-bit Encryption', description: 'Bank-grade encryption in transit & at rest' }, { icon: UserCheck, title: 'Licensed Professionals', description: 'Rigorously verified & credentialed experts' }, { icon: FileCheck, title: 'HIPAA Compliant', description: 'US medical privacy alignment' }, { icon: Shield, title: 'DPDP Approved', description: 'Aligned with India DPDP data protection principles' }].map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm border-t-4 border-t-green-500">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-green-100 p-3 mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-6 bg-gradient-to-r from-green-50 to-therabook-secondary border-0 shadow-lg">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Enterprise-Grade Security</h3>
              <p className="text-muted-foreground mb-6">Your sensitive health data is protected by bank-level security and monitored 24/7 for any threats or vulnerabilities</p>
              <div className="flex justify-center space-x-4">
                <Button className="bg-green-600 hover:bg-green-700">View Security Details</Button>
                <Button variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">Privacy Policy</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials section removed pending real verified reviews integration */}

      {/* How it works */}
      <section className="py-16 px-6 bg-gradient-to-r from-therabook-secondary via-white to-therabook-accent">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">How TheraBook Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Simple, secure, and streamlined process to connect you with the right healthcare professional</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ step: '01', title: 'Find Your Therapist', description: 'Use our smart search to find therapists by specialty, location, or session type.', icon: Search, color: 'from-blue-500 to-blue-600' }, { step: '02', title: 'Book Your Session', description: 'Choose your preferred time slot and session type, complete secure payment.', icon: Calendar, color: 'from-purple-500 to-purple-600' }, { step: '03', title: 'Start Your Journey', description: 'Join your session online or visit the clinic, begin your healing journey.', icon: Play, color: 'from-green-500 to-green-600' }].map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.2 }} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="text-center">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} p-5 mx-auto mb-6 shadow-lg`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="relative">
                  <Badge className={`absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${step.color} text-white px-3 py-1 shadow-md`}>
                    Step {step.step}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-therabook-primary mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gradient-to-br from-therabook-muted via-white to-therabook-secondary">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Find answers to common questions about our platform and services</p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                <AccordionItem value={`item-${index}`} className="border border-therabook-border rounded-lg px-6 bg-white/95 backdrop-blur-sm shadow-sm">
                  <AccordionTrigger className="text-left font-semibold text-therabook-primary hover:text-blue-700">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>
    </motion.div>
  )
}
