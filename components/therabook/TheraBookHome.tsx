'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
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
  Quote,
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

  const stats = [
    { number: '500+', label: 'Verified Therapists', icon: UserCheck, color: 'text-green-600' },
    { number: '10k+', label: 'Sessions Booked', icon: Calendar, color: 'text-blue-600' },
    { number: '4.8', label: 'Average Rating', icon: Star, color: 'text-yellow-600' },
    { number: '8k+', label: 'Happy Patients', icon: Heart, color: 'text-purple-600' },
  ]

  const therapyServices = [
    { icon: Brain, title: 'Occupational Therapy', description: 'Motor skills, sensory integration, and daily living activities', color: 'from-purple-500 to-purple-600', therapyType: 'Occupational Therapist' },
    { icon: Activity, title: 'Physiotherapy', description: 'Rehabilitation, posture correction, and pain management', color: 'from-green-500 to-green-600', therapyType: 'Physiotherapist' },
    { icon: Stethoscope, title: 'ABA Therapy', description: 'Applied Behavior Analysis for autism interventions', color: 'from-teal-500 to-teal-600', therapyType: 'ABA Therapist' },
    { icon: Heart, title: 'Psychology', description: 'Counseling, psychotherapy and mental health support', color: 'from-pink-500 to-pink-600', therapyType: 'Clinical Psychologist' },
    { icon: Users, title: 'Special Education', description: 'Specialized learning and educational support', color: 'from-orange-500 to-orange-600', therapyType: 'Special Educator' },
  ]

  const sessionTypes = [
    { type: 'In-Clinic', icon: Building, description: 'Face-to-face therapy at clinic', price: 'From ₹699', color: 'from-orange-500 to-orange-600', formatId: 'in-clinic' },
    { type: 'At-Home', icon: Home, description: 'Therapy sessions at your home', price: 'From ₹1,299', color: 'from-purple-500 to-purple-600', formatId: 'at-home' },
    { type: 'Video Consultation', icon: Video, description: 'Face-to-face video session', price: 'From ₹999', color: 'from-blue-500 to-blue-600', formatId: 'video' },
    { type: 'Audio Consultation', icon: Phone, description: 'Voice-only session', price: 'From ₹499', color: 'from-green-500 to-green-600', formatId: 'audio' },
  ]

  const faqs = [
    { question: 'How do I choose the right therapist for my needs?', answer: 'Use filters to search by specialty, experience, ratings, and availability.' },
    { question: 'Are all therapist profiles verified?', answer: 'Yes, every therapist is license-verified and background-checked.' },
    { question: 'Do you offer both online and in-person sessions?', answer: 'Yes, video, audio, in-clinic, and at-home sessions are available.' },
  ]

  const onSubmitSearch = () => {
    const params: Record<string, string> = {}
    if (searchQuery) params.search = searchQuery
    goSearch(params)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="min-h-screen bg-gradient-to-br from-therabook-secondary via-white to-therabook-muted">
      {/* Hero */}
      <section className="relative py-20 px-6 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-blue-900/20" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <h1 className="font-bold text-white leading-tight text-[48px]">Book Trusted Therapists<br /><span className="text-blue-100">with Confidence</span></h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">Connect with verified healthcare professionals. Search by specialty, location, or session type to find the perfect match.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mt-12 max-w-3xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search therapists, specialties or conditions..." className="pl-10" />
                  </div>
                  <Button onClick={onSubmitSearch} className="bg-gradient-to-r from-therabook-primary to-blue-700 text-white hover:from-blue-700 hover:to-therabook-primary">Search</Button>
                </div>
              </CardContent>
            </Card>

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

      {/* Stats */}
      <section className="py-8 px-6 flex justify-center items-center bg-gradient-to-r from-therabook-muted to-white">
        <div className="max-w-6xl h-fit mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <Card className="text-center h-fit border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-therabook-primary">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-therabook-primary to-blue-700 p-3 mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-black" />
                  </div>
                  <p className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-6 bg-gradient-to-r from-therabook-accent via-therabook-secondary to-blue-700">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">Our Therapy Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Comprehensive therapy services delivered by certified professionals using evidence-based approaches</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapyServices.map((service, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm cursor-pointer group border-l-4 border-l-transparent hover:border-l-therabook-primary" onClick={() => goSearch({ therapyTypes: [service.therapyType] })}>
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

      {/* Session Types */}
      <section className="py-16 px-6 bg-gradient-to-r from-therabook-secondary via-white to-therabook-accent">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Button className={`w-full bg-gradient-to-r ${session.color} text-white hover:shadow-lg transition-all duration-300`} onClick={() => goSearch({ sessionFormats: [session.formatId] })}>
                    Find Therapists
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 px-6 bg-gradient-to-r from-therabook-accent via-therabook-secondary to-therabook-accent">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">Trust & Security</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Your privacy and data security are our top priorities with industry-leading compliance standards</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[{ icon: Shield, title: 'ISO 27001 Certified', description: 'Industry-leading security management standards' }, { icon: Lock, title: '256-bit Encryption', description: 'Bank-grade security for all data' }, { icon: UserCheck, title: 'Licensed Professionals', description: 'Rigorously verified and licensed therapists' }, { icon: FileCheck, title: 'HIPAA Compliant', description: 'Medical privacy standards compliance' }].map((feature, index) => (
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

      {/* Testimonials */}
      <section className="py-16 px-6 bg-gradient-to-br from-therabook-muted via-white to-therabook-secondary">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-therabook-primary">What Our Patients Say</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Real stories from people who have experienced their healing journey with TheraBook</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center mb-12">
            <Card className="inline-block p-8 border-0 bg-white/95 backdrop-blur-sm shadow-2xl border-t-4 border-t-therabook-primary">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-5xl font-bold text-therabook-primary">4.8</span>
                <div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on 2,847 reviews</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">98%</p>
                  <p className="text-sm text-muted-foreground">Patient satisfaction</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-therabook-primary">24/7</p>
                  <p className="text-sm text-muted-foreground">Support available</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[{ name: 'Ravi Gupta', role: 'Software Engineer', rating: 5, content: 'Found the perfect therapist for my anxiety. The platform made it so easy to compare specialists and book appointments.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' }, { name: 'Pooja Patel', role: 'Working Professional', rating: 5, content: 'Excellent service! Dr. Sharma helped me through depression with online sessions. Very convenient and effective.', image: 'https://images.unsplash.com/photo-1494790108755-2616c64c6ce6?w=50&h=50&fit=crop&crop=face' }].map((t, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.2 }}>
                <Card className="p-6 border-0 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-therabook-primary">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-4 mb-4">
                      <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-therabook-accent" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-therabook-primary">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <Quote className="w-8 h-8 text-therabook-accent mb-3" />
                    <p className="text-muted-foreground leading-relaxed">"{t.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
