import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { ModernHero } from "./ModernHero";
import {  platformStats, coreModules } from "../constants/app-data";
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
  Quote,
  Target,
  Lightbulb,
  HeartHandshake,
  BadgeCheck
} from "lucide-react";

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

  const testimonials = [
    {
      id: 1,
      name: "Sarah Mitchell",
      role: "Marketing Manager",
      image: "https://images.unsplash.com/photo-1494790108755-2616c64c6ce6?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      content: "TheaPheap completely transformed my approach to mental health. The AI-powered assessments gave me insights I never had before, and booking sessions with Dr. Johnson was seamless. Highly recommend!",
      service: "TheraSelf & TheraBook",
      location: "New York, NY",
      date: "2 weeks ago"
    },
    {
      id: 2,
      name: "Dr. Michael Rivera",
      role: "Physical Therapist",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      content: "As a healthcare professional, I'm impressed by TheraLearn's course quality. The ACLS certification program was comprehensive and the online format made it convenient to complete alongside my practice.",
      service: "TheraLearn",
      location: "Los Angeles, CA",
      date: "1 month ago"
    },
    {
      id: 3,
      name: "Jennifer Adams",
      role: "Clinic Administrator",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      content: "TheraStore has been a game-changer for our clinic. The medical equipment quality is excellent, and the fast delivery ensures we never run out of essential supplies. Great customer service too!",
      service: "TheraStore",
      location: "Chicago, IL",
      date: "3 weeks ago"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-16"
    >
      {/* Modern Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <ModernHero setCurrentView={setCurrentView} />
      </motion.div>

      {/* Platform Stats */}
      <section className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {platformStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <motion.div
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="text-center border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <motion.div
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    </motion.div>
                    <motion.p 
                      className="text-3xl font-bold text-blue-600 mb-2"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                    >
                      {stat.number}
                    </motion.p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Core Services Sections */}
      <section className="space-y-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 max-w-7xl mx-auto px-6"
        >
          <motion.h2 
            className="text-4xl font-bold text-blue-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our Core Services
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
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
            className={`${service.bgColor} py-16 relative overflow-hidden`}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <div className="max-w-7xl mx-auto px-6 relative">
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-cols-2' : ''}`}>
                {/* Content Side */}
                <motion.div 
                  className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="space-y-4">
                    <motion.div 
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <motion.div 
                        className={`p-3 rounded-lg bg-gradient-to-r ${service.gradient} text-white`}
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: 5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <service.icon className="w-8 h-8" />
                      </motion.div>
                      <Badge variant="secondary" className="px-3 py-1 hover:bg-blue-100 transition-colors">
                        {service.stats}
                      </Badge>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <h3 className="text-3xl font-bold text-blue-600">{service.title}</h3>
                      <p className="text-xl text-muted-foreground">{service.subtitle}</p>
                    </motion.div>
                    
                    <motion.p 
                      className="text-lg leading-relaxed text-foreground"
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
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    {service.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex}
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.8 + featureIndex * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={() => setCurrentView(service.id as ViewType)}
                        className={`bg-gradient-to-r ${service.gradient} text-white hover:shadow-lg transition-all duration-300`}
                        size="lg"
                      >
                        {service.bookingText}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentView(service.id as ViewType)}
                        className="border-2 hover:bg-blue-50 transition-all duration-300"
                        size="lg"
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
                    <Card className="p-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-sm">
                            Featured Therapists
                          </Badge>
                          <motion.div 
                            className={`p-2 rounded-full bg-gradient-to-r ${service.gradient}`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <service.icon className="w-4 h-4 text-white" />
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
                                <div className="text-center space-y-2 p-4">
                                  <img
                                    src={therapist.image}
                                    alt={therapist.name}
                                    className="w-16 h-16 rounded-full mx-auto object-cover"
                                  />
                                  <div>
                                    <h4 className="font-semibold text-sm text-blue-600">{therapist.name}</h4>
                                    <p className="text-xs text-muted-foreground">{therapist.specialty}</p>
                                    <div className="flex items-center justify-center space-x-1 mt-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs">{therapist.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </Carousel>
                        <p className="text-sm text-muted-foreground text-center">
                          {service.stats} and growing
                        </p>
                      </div>
                    </Card>
                  )}

                  {service.id === "self-test" && (
                    <Card className="p-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-sm">
                            Popular Assessments
                          </Badge>
                          <motion.div 
                            className={`p-2 rounded-full bg-gradient-to-r ${service.gradient}`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <service.icon className="w-4 h-4 text-white" />
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
                                <div className="text-center space-y-2 p-4">
                                  <div className="w-12 h-12 rounded-lg bg-purple-100 p-3 mx-auto">
                                    <assessment.icon className="w-6 h-6 text-purple-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-purple-600">{assessment.name}</h4>
                                    <p className="text-xs text-muted-foreground">{assessment.questions} questions</p>
                                    <div className="flex items-center justify-center space-x-1 mt-1">
                                      <Clock className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{assessment.duration}</span>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </Carousel>
                        <p className="text-sm text-muted-foreground text-center">
                          {service.stats} and growing
                        </p>
                      </div>
                    </Card>
                  )}

                  {service.id === "store" && (
                    <Card className="p-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-sm">
                            Featured Products
                          </Badge>
                          <motion.div 
                            className={`p-2 rounded-full bg-gradient-to-r ${service.gradient}`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <service.icon className="w-4 h-4 text-white" />
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
                                <div className="text-center space-y-2 p-4">
                                  <div className="w-12 h-12 rounded-lg bg-green-100 p-3 mx-auto">
                                    <product.icon className="w-6 h-6 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-green-600">{product.name}</h4>
                                    <p className="text-xs font-medium text-green-700">{product.price}</p>
                                    <div className="flex items-center justify-center space-x-1 mt-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs">{product.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </Carousel>
                        <p className="text-sm text-muted-foreground text-center">
                          {service.stats} and growing
                        </p>
                      </div>
                    </Card>
                  )}

                  {service.id === "learn" && (
                    <Card className="p-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-sm">
                            Popular Courses
                          </Badge>
                          <motion.div 
                            className={`p-2 rounded-full bg-gradient-to-r ${service.gradient}`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <service.icon className="w-4 h-4 text-white" />
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
                                <div className="text-center space-y-2 p-4">
                                  <div className="w-12 h-12 rounded-lg bg-orange-100 p-3 mx-auto">
                                    <course.icon className="w-6 h-6 text-orange-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-orange-600">{course.name}</h4>
                                    <p className="text-xs text-muted-foreground">{course.students} students</p>
                                    <div className="flex items-center justify-center space-x-1 mt-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs">{course.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </Carousel>
                        <p className="text-sm text-muted-foreground text-center">
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
      <section className="py-16 bg-gradient-to-r from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <motion.h2 
              className="text-4xl font-bold text-blue-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Why TheraTreat?
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              TheraTreat isn't just another therapy platform — it's a complete ecosystem designed to make therapy accessible, trustworthy, and effective.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyTheraTreatHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <motion.div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${highlight.gradient} p-3 mb-4`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 5,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <highlight.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">
                      {highlight.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
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
      <section className="py-16 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <motion.div
              className="flex items-center justify-center space-x-3 mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Shield className="w-8 h-8 text-blue-600" />
              <h2 className="text-4xl font-bold text-blue-600">We Prioritize Trust & Compliance</h2>
            </motion.div>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your health deserves nothing less than the highest standards of safety and privacy.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-green-200 hover:border-green-300 bg-white/90">
                  <CardContent className="p-6">
                    <motion.div 
                      className="flex items-center space-x-3 mb-4"
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    >
                      <motion.div
                        className="w-10 h-10 rounded-lg bg-green-100 p-2 flex items-center justify-center"
                        whileHover={{ 
                          rotate: 5,
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <feature.icon className="w-6 h-6 text-green-600" />
                      </motion.div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-12"
          >
            <h2 className="text-4xl font-bold text-blue-600">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real experiences from healthcare professionals and patients who trust TheraTreat
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-600">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      
                      <Quote className="w-8 h-8 text-blue-200" />
                      
                      <p className="text-muted-foreground leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      
                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className="text-xs">
                            {testimonial.service}
                          </Badge>
                          <span className="text-muted-foreground">{testimonial.date}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{testimonial.location}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* New Era of Therapy - Comprehensive Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/30 to-indigo-900/50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-4xl"
                >
                  🌍
                </motion.span>
                <h2 className="text-4xl md:text-5xl font-bold">
                  A New Era of Therapy Starts With TheraTreat
                </h2>
              </div>
            </motion.div>

            {/* Main Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-4xl mx-auto">
                We didn't build TheraTreat to follow trends —<br />
                we built it to transform lives.
              </p>

              {/* Three Principles */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid md:grid-cols-3 gap-6 my-12 max-w-4xl mx-auto"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <span className="text-2xl">🌱</span>
                  <span className="text-lg font-medium">Therapy meets Technology</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <span className="text-2xl">🤝</span>
                  <span className="text-lg font-medium">Compassion meets Community</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <span className="text-2xl">🚀</span>
                  <span className="text-lg font-medium">India leads the World in Accessible Wellness</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="space-y-6"
              >
                <p className="text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                  More than a platform —<br />
                  It's a Revolution in Care: Breaking stigma, Opening doors, and Shaping the Future of Health.
                </p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold"
                >
                  <motion.span
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    ✨
                  </motion.span>
                  <span>The future of therapy isn't coming.</span>
                </motion.div>

                <p className="text-2xl md:text-3xl font-bold">
                  It's here. And it begins with us.
                </p>
              </motion.div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="pt-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setCurrentView("patient-register")}
                  size="lg"
                  className="bg-gradient-to-r from-white to-blue-50 text-blue-900 hover:from-blue-50 hover:to-white font-bold px-12 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Join the Movement
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </motion.div>
  );
}