'use client';

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import Link from "next/link";

export default function TheraBookInfo() {
  const features = [
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule sessions with verified therapists at your convenience. Choose from multiple time slots that work for you."
    },
    {
      icon: Video,
      title: "Multiple Session Types",
      description: "Choose from video calls, audio calls, in-clinic visits, or home consultations based on your preference."
    },
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All our therapists are licensed professionals with verified credentials and proven track records."
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Read reviews from real patients and choose therapists with high ratings and positive feedback."
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Book one-time sessions or ongoing therapy packages. Reschedule or cancel with ease when needed."
    },
    {
      icon: CheckCircle,
      title: "Follow-up Support",
      description: "Get continued support with follow-up sessions and track your progress over time."
    }
  ];

  const sessionTypes = [
    {
      icon: Video,
      title: "Video Consultation",
      description: "Face-to-face therapy from the comfort of your home",
      price: "Starting ₹800"
    },
    {
      icon: Phone,
      title: "Audio Consultation", 
      description: "Voice-only sessions for privacy and convenience",
      price: "Starting ₹600"
    },
    {
      icon: Home,
      title: "Home Visit",
      description: "Therapist visits you at your preferred location",
      price: "Starting ₹1200"
    },
    {
      icon: MapPin,
      title: "In-Clinic Session",
      description: "Traditional in-person therapy at therapist's clinic",
      price: "Starting ₹1000"
    }
  ];

  const specializations = [
    "Anxiety & Stress", "Depression", "Relationship Issues", "Trauma & PTSD", 
    "Addiction Recovery", "Child Psychology", "Family Therapy", "Career Counseling",
    "Eating Disorders", "Sleep Issues", "Anger Management", "Grief Counseling"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                Professional Therapy Services
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome to <span className="text-blue-100">TheraBook</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Connect with licensed therapists and mental health professionals. 
                Book sessions that fit your schedule and preferences.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/therabook">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Enter TheraBook
                </Button>
              </Link>
              <Link href="/therabook/therapists">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Users className="w-5 h-5 mr-2" />
                  Browse Therapists
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-blue-100">Verified Therapists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10,000+</div>
                <div className="text-blue-100">Sessions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">4.8★</div>
                <div className="text-blue-100">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Types */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Choose Your Preferred Session Type
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We offer flexible options to ensure you receive therapy in the way that&apos;s most comfortable for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {sessionTypes.map((type, index) => (
            <Card key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 hover:scale-105">
              <CardHeader className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <type.icon className="w-8 h-8 text-blue-500" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
                  {type.title}
                </CardTitle>
                <CardDescription className="text-gray-600 mb-3">
                  {type.description}
                </CardDescription>
                <div className="text-blue-600 font-semibold">
                  {type.price}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose TheraBook?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;ve designed every aspect of our platform to make finding and booking therapy sessions as simple as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-0">
                <CardHeader className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Find Specialists for Your Needs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our therapists specialize in various areas of mental health and wellness.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {specializations.map((spec, index) => (
            <Badge key={index} variant="secondary" className="p-3 text-center bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              {spec}
            </Badge>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Take the first step towards better mental health. Browse our verified therapists or let our smart selector help you find the perfect match.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/therabook/smart-selector">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <ArrowRight className="w-5 h-5 mr-2" />
                Find My Therapist
              </Button>
            </Link>
            <Link href="/therabook">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Calendar className="w-5 h-5 mr-2" />
                Start Booking
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
