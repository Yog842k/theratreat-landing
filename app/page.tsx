"use client";
import { ModernHero } from "../components/ModernHero";
import Link from "next/link";
import { coreModules } from "./data";
import { Globe, UserCheck, Lightbulb, Shield, BadgeCheck, FileCheck, Users, HeartHandshake } from "lucide-react";
import { BookOpen } from "lucide-react";
import {Brain} from "lucide-react";
import {ShoppingCart} from "lucide-react";
import { Heart } from "lucide-react";
import { Award } from "lucide-react";

type CoreModule = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  features: string[];
  cta: string;
};
export default function Home() {
  return (
    <>
      <ModernHero />
      
      {/* Individual Service Details Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          
          {/* TheraBook */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8 lg:p-12 border border-blue-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-blue-600 text-sm font-medium">2,500+ Verified Therapists</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">TheraBook</h2>
                <p className="text-lg text-gray-600 mb-6">Professional Healthcare Consultations</p>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Connect with trusted therapists, anytime, anywhere. TheraBook helps you find and book verified healthcare professionals for online or offline sessions. With secure booking, flexible scheduling, and smart therapist matching, you can start your therapy journey with confidence.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Video, audio, in-clinic, and Home consultations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Verified therapists across multiple specialities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Smart matching & calendar booking system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Secure payments and confidentiality guaranteed</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
                  <div className="text-center mb-4">
                    <span className="text-gray-600 text-sm">Featured Therapists</span>
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full mb-3 flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Dr. Yogesh Shingane</h4>
                      <p className="text-sm text-gray-600">Clinical Psychology</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">4.9</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600">2,500+ Verified Therapists and growing</p>
                </div>
              </div>
            </div>
          </div>

          {/* TheraSelf */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-3xl p-8 lg:p-12 border border-purple-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 flex justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
                  <div className="text-center mb-4">
                    <span className="text-gray-600 text-sm">Popular Assessments</span>
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full mb-3 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Depression Assessment</h4>
                      <p className="text-sm text-gray-600">21 questions</p>
                      <p className="text-xs text-gray-500 mt-1">⏱ 10 mins</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600">50,000+ Assessments Completed and growing</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-purple-600 text-sm font-medium">50,000+ Assessments Completed</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">TheraSelf</h2>
                <p className="text-lg text-gray-600 mb-6">AI-Powered Self Assessment</p>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Understand yourself better with science-backed insights. TheraSelf offers intelligent self-assessments to educate oneself across mental, physical, and emotional health categories. Instantly receive personalized recommendations, progress reports, and next steps you can share with a therapist.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Multiple self-assessment categories</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">AI-powered analysis & easy-to-read reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Personalized therapy/treatment recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Private, secure, and downloadable results</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TheraStore */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-3xl p-8 lg:p-12 border border-green-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-600 text-sm font-medium">10,000+ Products Available</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">TheraStore</h2>
                <p className="text-lg text-gray-600 mb-6">Therapeutic Equipment & Wellness Supplies</p>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Everything you need for therapy, rehab & wellness in one place. TheraStore makes it simple to order professional Therapy equipment, tools, and wellness supplies with assured quality and fast delivery.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Curated Therapist-recommended Equipments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Easy online ordering with secure payments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Fast delivery with live order tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Verified quality standards and returns policy</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
                  <div className="text-center mb-4">
                    <span className="text-gray-600 text-sm">Featured Products</span>
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full mb-3 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Digital Stethoscope</h4>
                      <p className="text-sm text-gray-600">₹12,999</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600">10,000+ Products Available and growing</p>
                </div>
              </div>
            </div>
          </div>

          {/* TheraLearn */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-3xl p-8 lg:p-12 border border-orange-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 flex justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
                  <div className="text-center mb-4">
                    <span className="text-gray-600 text-sm">Popular Courses</span>
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full mb-3 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Advanced Physical Therapy</h4>
                      <p className="text-sm text-gray-600">1247 students</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600">500+ Learning Resources and growing</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-orange-600 text-sm font-medium">500+ Learning Resources</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">TheraLearn</h2>
                <p className="text-lg text-gray-600 mb-6">Professional Development Hub</p>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Grow your skills. Advance your career. Learn More about Therapy. TheraLearn is a dedicated learning hub for healthcare professionals, Patients, and students. Access expert-led workshops, certification courses, and live learning sessions to keep your skills future-ready.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Expert-led courses & workshops</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Professional certification programs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Interactive live sessions & webinars</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Career development & networking opportunities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Why TheraTreat Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why TheraTreat?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              TheraTreat isn't just another therapy platform — it's a complete ecosystem designed to make therapy accessible, trustworthy, and effective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">One-Stop Therapy Hub</h3>
              <p className="text-gray-600">From booking therapy sessions to accessing self-help tools and resources — everything you need for well-being is available in one trusted place.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Professionals</h3>
              <p className="text-gray-600">Every therapist and healthcare expert is certified, licensed, and verified, so you can be assured that you're receiving quality care.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalized Care</h3>
              <p className="text-gray-600">Flexible therapy options, transparent pricing, and tailored recommendations to make your care journey smooth and suited to your unique needs.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Compassionate Support</h3>
              <p className="text-gray-600">Our platform is built with empathy at its core, providing a safe and supportive environment for your mental health journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section className="py-16 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h2 className="text-4xl font-bold text-blue-600">We Prioritize Trust & Compliance</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your health deserves nothing less than the highest standards of safety and privacy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example compliance features, replace with dynamic data if available */}
            <div className="h-full hover:shadow-lg transition-all duration-300 border-green-200 hover:border-green-300 bg-white/90 p-6 rounded-lg">
              <BadgeCheck className="w-6 h-6 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">ISO Certified</h3>
              <p className="text-gray-600 text-sm">Our platform follows international quality and management standards, ensuring consistency and reliability.</p>
            </div>
            <div className="h-full hover:shadow-lg transition-all duration-300 border-green-200 hover:border-green-300 bg-white/90 p-6 rounded-lg">
              <Shield className="w-6 h-6 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">HIPAA Compliant</h3>
              <p className="text-gray-600 text-sm">Every step of data handling and storage is aligned with global standards for protecting sensitive health information.</p>
            </div>
            <div className="h-full hover:shadow-lg transition-all duration-300 border-green-200 hover:border-green-300 bg-white/90 p-6 rounded-lg">
              <FileCheck className="w-6 h-6 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">DPDP & GDPR Ready</h3>
              <p className="text-gray-600 text-sm">Fully compliant with India's Digital Personal Data Protection Act and global GDPR norms to safeguard your rights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section (Therapists) */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-600 via-blue-600 to-purple-700">
        {/* Subtle glow decor */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            A New Era of Therapy Starts With
            <span className="block">TheraTreat</span>
          </h2>

          <p className="mt-4 text-base md:text-lg text-white/90">
            We didn't build TheraTreat to follow trends —
            <br className="hidden sm:block" /> we built it to transform lives.
          </p>

          {/* Pill badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <span role="img" aria-label="sprout">🌱</span> Therapy meets Technology
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <span role="img" aria-label="handshake">🤝</span> Compassion meets Community
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <span role="img" aria-label="india">🇮🇳</span> India leads the World in Accessible Wellness
            </span>
          </div>

          <p className="mt-10 text-white/90">
            More than a platform —
          </p>
          <p className="mt-1 text-white/90 max-w-3xl mx-auto">
            It's a Revolution in Care: Breaking stigma, Opening doors, and Shaping the Future of Health.
          </p>

          <p className="mt-8 text-2xl md:text-3xl font-semibold text-white">
            ✨ The future of therapy isn't coming.
          </p>
          <p className="mt-2 text-2xl md:text-3xl font-semibold text-white">
            It's here. And it begins with us.
          </p>

          <div className="mt-10 flex justify-center">
            <a
              href="/register-therapist"
              className="inline-flex items-center rounded-full bg-white/95 hover:bg-white text-blue-700 hover:text-blue-800 px-6 py-3 text-sm md:text-base font-semibold shadow-lg transition"
            >
              Join as Therapist
              <span className="ml-2" aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
