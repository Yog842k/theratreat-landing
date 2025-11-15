import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { ModernHero } from "./ModernHero";
import {  coreModules } from "../constants/app-data"; // removed platformStats per request
import { ViewType } from "../constants/app-data";
import { motion} from "framer-motion";

import { 
  Calendar,
  Brain,
  ShoppingCart,
  BookOpen,
  CheckCircle,
  Users,
  Award,
  Video,
  Stethoscope,
  ArrowRight,
  Play,
  Clock,
  Star,
  Shield,
  Zap,
  Heart,
  Activity,
  Monitor,
  Thermometer,
  User,
  MapPin,
  GraduationCap,
  TrendingUp,
  Globe,
  Lock,
  UserCheck,
  Phone,
  MessageCircle,
  FileCheck,
  Building,
  Verified,
  Target,
  Lightbulb,
  HeartHandshake,
  BadgeCheck
} from "lucide-react"; // Removed Quote (only used in testimonials)

interface HomePageProps {
  setCurrentView: (view: ViewType) => void;
}

export function HomePage({ setCurrentView }: HomePageProps) {
  // Why TheraTreat highlights
  const whyTheraTreatHighlights = [
    {
      icon: Globe,
      title: "One-Stop Therapy Hub",
      description: "From booking therapy sessions to accessing self-help tools and resources — everything you need for well-being is available in one trusted place.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: UserCheck,
      title: "Verified Professionals",
      description: "Every Therapist and healthcare expert is certified, licensed, and verified, so you can be assured that you're receiving Quality care.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Lightbulb,
      title: "Personalised Care",
      description: "Flexible therapy options, transparent pricing, and tailored recommendations to make your care journey smooth and suited to your unique needs.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Lock,
      title: "Secure & Confidential",
      description: "Your health data and therapy sessions are always private, with strict security measures ensuring that your personal information stays protected.",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: Target,
      title: "Evidence-Based Practice",
      description: "TheraTreat integrates clinical tools, progress tracking, and measurables, ensuring you see real results rather than vague promises.",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: HeartHandshake,
      title: "Community & Support",
      description: "Beyond therapy, join awareness drives, knowledge sharing to build a supportive healing network.",
      gradient: "from-pink-500 to-pink-600"
    }
  ];

  // Trust & Compliance Framework
  const complianceFeatures = [
    {
      icon: BadgeCheck,
      title: "ISO Certified",
      description: "Our platform follows international quality and management standards, ensuring consistency and reliability."
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Every step of data handling and storage is aligned with global standards for protecting sensitive health information."
    },
    {
      icon: FileCheck,
      title: "DPDP & GDPR Ready",
      description: "Fully compliant with India's Digital Personal Data Protection Act and global GDPR norms to safeguard your rights."
    },
    {
      icon: Lock,
      title: "256-Bit Encryption",
      description: "We use bank-grade encryption for every session, transaction, and data exchange."
    },
    {
      icon: UserCheck,
      title: "Verified Onboarding",
      description: "Only licensed, background-checked professionals are onboarded to ensure safety and credibility."
    },
    {
      icon: Monitor,
      title: "Continuous Monitoring",
      description: "Regular audits, system checks, and security updates guarantee that your data and sessions remain safe over time."
    }
  ];

  const services = [
    {
      id: "book",
      icon: Calendar,
      title: "TheraBook",
      subtitle: "Professional Healthcare Consultations",
      description: "Connect with trusted therapists, anytime, anywhere. TheraBook helps you find and book verified healthcare professionals for online or offline sessions. With secure booking, flexible scheduling, and smart therapist matching, you can start your therapy journey with confidence.",
      features: [
        "Video, audio, in-clinic, and Home consultations",
        "Verified therapists across multiple specialties",
        "Smart matching & calendar booking system",
        "Secure payments and confidentiality guaranteed"
      ],
      stats: "2,500+ Verified Therapists",
      bookingText: "Book a Consultation",
      exploreText: "Browse Therapists",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "self-test",
      icon: Brain,
      title: "TheraSelf",
      subtitle: "AI-Powered Self Assessment",
      description: "Understand yourself better with science-backed insights. TheraSelf offers intelligent self-assessments to educate oneself across mental, physical, and emotional health categories. Instantly receive personalized recommendations, progress reports, and next steps you can share with a therapist.",
      features: [
        "Multiple self-assessment categories",
        "AI-powered analysis & easy-to-read reports",
        "Personalized therapy/treatment recommendations",
        "Private, secure, and downloadable results"
      ],
      stats: "50,000+ Assessments Completed",
      bookingText: "Start Assessment",
      exploreText: "View Categories",
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: "store",
      icon: ShoppingCart,
      title: "TheraStore",
      subtitle: "Therapeutic Equipment & Wellness Supplies",
      description: "Everything you need for therapy, rehab & wellness in one place. TheraStore makes it simple to order professional Therapy equipment, tools, and wellness supplies with assured quality and fast delivery.",
      features: [
        "Curated Therapist-recommended Equipments",
        "Easy online ordering with secure payments",
        "Fast delivery with live order tracking",
        "Verified quality standards and returns policy"
      ],
      stats: "10,000+ Products Available",
      bookingText: "Shop Now",
      exploreText: "Browse Categories",
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: "learn",
      icon: BookOpen,
      title: "TheraLearn",
      subtitle: "Professional Development Hub",
      description: "Grow your skills. Advance your career. Learn More about Therapy. TheraLearn is a dedicated learning hub for healthcare professionals, Patients, and students. Access expert-led workshops, certification courses, and live learning sessions to keep your skills future-ready.",
      features: [
        "Expert-led courses & workshops",
        "Professional certification programs",
        "Interactive live sessions & webinars",
        "Career development & networking opportunities"
      ],
      stats: "500+ Learning Resources",
      bookingText: "Enroll Now",
      exploreText: "View Courses",
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-12 sm:space-y-16"
    >
      {/* Modern Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <ModernHero setCurrentView={setCurrentView} />
      </motion.div>

      {/* Core Services Sections */}
      <section className="space-y-12 sm:space-y-16 lg:space-y-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-2 sm:space-y-3 lg:space-y-4 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6"
        >
          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our Core Services
          </motion.h2>
          <motion.p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto px-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Comprehensive healthcare solutions designed to meet all your medical needs in one integrated platform
          </motion.p>
        </motion.div>

        {services.map((service, index) => (
          <motion.div 
            key={service.id} 
            className={`${service.bgColor} py-8 sm:py-12 lg:py-16 relative overflow-hidden`}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative">
              <div className={`grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-2 items-start lg:items-center ${index % 2 === 1 ? 'lg:grid-cols-2' : ''}`}> 
                {/* Content Side */}
                <motion.div 
                  className={`space-y-4 sm:space-y-5 lg:space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="space-y-3 sm:space-y-4">
                    <motion.div 
                      className="flex items-center flex-wrap gap-2 sm:gap-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <motion.div 
                        className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${service.gradient} text-white shadow-lg`}
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: 5,
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <service.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                      </motion.div>
                      <Badge variant="secondary" className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                        {service.stats}
                      </Badge>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-1 sm:space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent tracking-tight">{service.title}</h3>
                      <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium">{service.subtitle}</p>
                    </motion.div>
                    
                    <motion.p 
                      className="text-xs sm:text-sm lg:text-base leading-relaxed text-slate-700"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      {service.description}
                    </motion.p>
                  </div>

                  {/* Features */}
                  <motion.div 
                    className="space-y-2 sm:space-y-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    {service.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.8 + featureIndex * 0.1 }}
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-xs sm:text-sm lg:text-base">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pt-2 sm:pt-3 lg:pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                      <Button 
                        onClick={() => setCurrentView(service.id as ViewType)}
                        className={`w-full sm:w-auto bg-gradient-to-r ${service.gradient} text-white hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 text-xs sm:text-sm lg:text-base font-semibold`}
                        size="default"
                      >
                        {service.bookingText}
                        <ArrowRight className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentView(service.id as ViewType)}
                        className="w-full sm:w-auto border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 text-xs sm:text-sm lg:text-base font-semibold"
                        size="default"
                      >
                        {service.exploreText}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Visual Side */}
                <motion.div 
                  className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {service.id === "book" && (
                    <Card className="p-3 sm:p-4 lg:p-6 border-2 border-blue-100 shadow-2xl bg-white hover:shadow-blue-200 transition-shadow duration-300">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Featured Therapists
                          </Badge>
                          <motion.div 
                            className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br ${service.gradient} shadow-md`}
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <service.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </motion.div>
                        </div>
                        <Carousel className="w-full">
                          <CarouselContent>
                            {[
                              { name: "Dr. Sarah Johnson", specialty: "Clinical Psychology", rating: 4.9, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=face" },
                              { name: "Dr. Michael Chen", specialty: "Physical Therapy", rating: 4.8, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop&crop=face" },
                              { name: "Dr. Emily Rodriguez", specialty: "Speech Therapy", rating: 4.9, image: "https://images.unsplash.com/photo-1594824388875-fb4d2b3d7518?w=120&h=120&fit=crop&crop=face" }
                            ].map((therapist, idx) => (
                              <CarouselItem key={idx}>
                                <div className="text-center space-y-2 p-2 sm:p-4">
                                  <div className="relative inline-block">
                                    <img
                                      src={therapist.image}
                                      alt={therapist.name}
                                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto object-cover border-4 border-blue-100 shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white"></div>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm sm:text-base text-blue-600">{therapist.name}</h4>
                                    <p className="text-xs sm:text-sm text-slate-600">{therapist.specialty}</p>
                                    <div className="flex items-center justify-center space-x-1 mt-2">
                                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs sm:text-sm font-semibold text-slate-700">{therapist.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-1 sm:left-2 h-6 w-6 sm:h-8 sm:w-8" />
                          <CarouselNext className="right-1 sm:right-2 h-6 w-6 sm:h-8 sm:w-8" />
                        </Carousel>
                        <p className="text-xs sm:text-sm text-slate-600 text-center font-medium">
                          {service.stats} and growing
                        </p>
                      </div>
                    </Card>
                  )}

                  {service.id === "self-test" && (
                    <Card className="p-3 sm:p-4 lg:p-6 border-2 border-purple-100 shadow-2xl bg-white hover:shadow-purple-200 transition-shadow duration-300">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs sm:text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            Popular Assessments
                          </Badge>
                          <motion.div 
                            className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br ${service.gradient} shadow-md`}
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <service.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </motion.div>
                        </div>
                        <Carousel className="w-full">
                          <CarouselContent>
                            {[
                              { name: "Depression Assessment", questions: 21, duration: "10 min", icon: Brain },
                              { name: "Anxiety Scale", questions: 18, duration: "8 min", icon: Heart },
                              { name: "Stress Evaluation", questions: 25, duration: "12 min", icon: Activity }
                            ].map((assessment, idx) => (
                              <CarouselItem key={idx}>
                                <div className="text-center space-y-2 p-2 sm:p-4">
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 p-3 sm:p-4 mx-auto shadow-md border border-purple-200">
                                    <assessment.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm sm:text-base text-purple-600">{assessment.name}</h4>
                                    <p className="text-xs sm:text-sm text-slate-600">{assessment.questions} questions</p>
                                    <div className="flex items-center justify-center space-x-1 mt-2 bg-purple-50 rounded-full px-2 sm:px-3 py-1 inline-flex">
                                      <Clock className="w-3 h-3 text-purple-600" />
                                      <span className="text-xs sm:text-sm text-purple-600 font-medium">{assessment.duration}</span>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-1 sm:left-2 h-6 w-6 sm:h-8 sm:w-8" />
                          <CarouselNext className="right-1 sm:right-2 h-6 w-6 sm:h-8 sm:w-8" />
                        </Carousel>
                        <p className="text-xs sm:text-sm text-slate-600 text-center font-medium">
                          {service.stats} and growing
                        </p>
                      </div>
                    </Card>
                  )}

                  {service.id === "store" && (
                    <Card className="p-3 sm:p-4 lg:p-6 border-2 border-green-100 shadow-2xl bg-white hover:shadow-green-200 transition-shadow duration-300">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs sm:text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                            Featured Products
                          </Badge>
                          <motion.div 
                            className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br ${service.gradient} shadow-md`}
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <service.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </motion.div>
                        </div>
                        <Carousel className="w-full">
                          <CarouselContent>
                            {[
                              { name: "Digital Stethoscope", price: "₹12,999", rating: 4.8, icon: Stethoscope },
                              { name: "Blood Pressure Monitor", price: "₹3,499", rating: 4.7, icon: Monitor },
                              { name: "Digital Thermometer", price: "₹899", rating: 4.9, icon: Thermometer }
                            ].map((product, idx) => (
                              <CarouselItem key={idx}>
                                <div className="text-center space-y-2 p-2 sm:p-4">
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-green-100 to-green-50 p-3 sm:p-4 mx-auto shadow-md border border-green-200">
                                    <product.icon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm sm:text-base text-green-600">{product.name}</h4>
                                    <p className="text-xs sm:text-sm font-bold text-green-700 bg-green-50 rounded-full px-2 sm:px-3 py-1 inline-block">{product.price}</p>
                                    <div className="flex items-center justify-center space-x-1 mt-2">
                                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs sm:text-sm font-semibold text-slate-700">{product.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-1 sm:left-2 h-6 w-6 sm:h-8 sm:w-8" />
                          <CarouselNext className="right-1 sm:right-2 h-6 w-6 sm:h-8 sm:w-8" />
                        </Carousel>
                        <p className="text-xs sm:text-sm text-slate-600 text-center font-medium">
                          {service.stats} and growing
                        </p>
                      </div>
                    </Card>
                  )}

                  {service.id === "learn" && (
                    <Card className="p-3 sm:p-4 lg:p-6 border-2 border-orange-100 shadow-2xl bg-white hover:shadow-orange-200 transition-shadow duration-300">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs sm:text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                            Popular Courses
                          </Badge>
                          <motion.div 
                            className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br ${service.gradient} shadow-md`}
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <service.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </motion.div>
                        </div>
                        <Carousel className="w-full">
                          <CarouselContent>
                            {[
                              { name: "Advanced Physical Therapy", students: 1247, rating: 4.8, icon: Award },
                              { name: "Pediatric Psychology", students: 892, rating: 4.9, icon: Users },
                              { name: "Digital Health Tools", students: 654, rating: 4.7, icon: Video }
                            ].map((course, idx) => (
                              <CarouselItem key={idx}>
                                <div className="text-center space-y-2 p-2 sm:p-4">
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 p-3 sm:p-4 mx-auto shadow-md border border-orange-200">
                                    <course.icon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm sm:text-base text-orange-600">{course.name}</h4>
                                    <p className="text-xs sm:text-sm text-slate-600">{course.students} students</p>
                                    <div className="flex items-center justify-center space-x-1 mt-2">
                                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs sm:text-sm font-semibold text-slate-700">{course.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-1 sm:left-2 h-6 w-6 sm:h-8 sm:w-8" />
                          <CarouselNext className="right-1 sm:right-2 h-6 w-6 sm:h-8 sm:w-8" />
                        </Carousel>
                        <p className="text-xs sm:text-sm text-slate-600 text-center font-medium">
                          {service.stats} and growing
                        </p>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Why TheraTreat Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-2 sm:space-y-3 lg:space-y-4 mb-8 sm:mb-10 lg:mb-16"
          >
            <motion.h2 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Why TheraTreat?
            </motion.h2>
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              TheraTreat isn't just another therapy platform — it's a complete ecosystem designed to make therapy accessible, trustworthy, and effective.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {whyTheraTreatHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-200 bg-white group">
                  <CardContent className="p-4 sm:p-5 lg:p-6">
                    <motion.div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${highlight.gradient} p-3 sm:p-3.5 mb-3 sm:mb-4 shadow-lg`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 5,
                        boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <highlight.icon className="w-full h-full text-white" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-2 sm:mb-3 group-hover:text-blue-700 transition-colors">
                      {highlight.title}
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-2 sm:space-y-3 lg:space-y-4 mb-8 sm:mb-10 lg:mb-16"
          >
            <motion.div
              className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" />
              <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent tracking-tight">We Prioritize Trust & Compliance</h2>
            </motion.div>
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your health deserves nothing less than the highest standards of safety and privacy.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {complianceFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-300 bg-white group">
                  <CardContent className="p-4 sm:p-5 lg:p-6">
                    <motion.div 
                      className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4"
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    >
                      <motion.div
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-green-100 to-green-50 p-2 sm:p-2.5 flex items-center justify-center shadow-md border border-green-200"
                        whileHover={{ 
                          rotate: 5,
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <feature.icon className="w-full h-full text-green-600" />
                      </motion.div>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </motion.div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}