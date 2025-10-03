'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Clock, Calendar, Award, BookOpen, Users, Video, Phone, Building, CheckCircle, Shield, Heart, MessageCircle, ThumbsUp, Zap, ArrowLeft, Quote } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/NewAuthContext";

interface TherapistProfileProps {
  params: {
    id: string;
  };
}

// Mock therapist data
const mockTherapist = {
  id: "1",
  name: "Dr. Sarah Johnson",
  title: "Clinical Psychologist",
  specializations: ["Anxiety Disorders", "Depression", "Cognitive Behavioral Therapy", "Trauma Recovery"],
  rating: 4.9,
  reviews: 156,
  experience: "8 years",
  location: "New York, NY",
  price: 120,
  image: "/api/placeholder/150/150",
  sessions: 1250,
  bio: "Dr. Sarah Johnson is a licensed clinical psychologist with over 8 years of experience helping individuals overcome anxiety, depression, and trauma. She specializes in evidence-based treatments including Cognitive Behavioral Therapy (CBT) and has extensive training in trauma-informed care. Her compassionate approach combines scientific rigor with deep empathy, creating a safe space where clients can explore their challenges and develop practical strategies for lasting change.",
  education: [
    "Ph.D. in Clinical Psychology - Columbia University",
    "M.A. in Psychology - New York University", 
    "B.A. in Psychology - Cornell University"
  ],
  certifications: [
    "Licensed Clinical Psychologist (NY)",
    "Certified CBT Practitioner",
    "Trauma-Informed Care Specialist"
  ],
  languages: ["English", "Spanish"],
  sessionTypes: ["Video Call", "Audio Call", "In-Person"],
  availability: {
    nextAvailable: "Today 3:00 PM",
    weeklySlots: 25
  }
};

const reviews = [
  {
    id: 1,
    rating: 5,
    comment: "Dr. Johnson has been incredibly helpful in my journey with anxiety. Her approach is both professional and compassionate. I've seen significant improvement in just a few sessions.",
    author: "Sarah M.",
    date: "2 weeks ago",
    verified: true
  },
  {
    id: 2,
    rating: 5,
    comment: "Excellent therapist. Really helped me work through some difficult times. Her CBT techniques are practical and effective. Highly recommend!",
    author: "Michael K.",
    date: "1 month ago",
    verified: true
  },
  {
    id: 3,
    rating: 4,
    comment: "Very knowledgeable and patient. The techniques she taught me have been life-changing. She creates a really safe environment to explore difficult topics.",
    author: "Jessica L.",
    date: "2 months ago",
    verified: true
  }
];

export default function TherapistProfilePage({ params }: TherapistProfileProps) {
  const therapist = mockTherapist;
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/therabook/therapists">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Therapists
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="relative">
                <Avatar className="w-40 h-40 ring-4 ring-blue-100">
                  <AvatarImage src={therapist.image} alt={therapist.name} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {therapist.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                    {therapist.name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-6">{therapist.title}</p>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{therapist.rating}</div>
                    <div className="text-sm text-gray-600">{therapist.reviews} reviews</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{therapist.sessions}</div>
                    <div className="text-sm text-gray-600">sessions</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{therapist.experience}</div>
                    <div className="text-sm text-gray-600">experience</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="text-xl font-bold text-gray-800">${therapist.price}</div>
                    <div className="text-sm text-gray-600">per session</div>
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary" className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0 rounded-full">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link href={`/therabook/therapists/${params.id}/book`}>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Calendar className="w-5 h-5 mr-3" />
                      Book Session Now
                    </Button>
                  </Link>
                  <div className="mt-2 text-sm text-gray-500">
                    Next available: <span className="font-medium text-green-600">{therapist.availability.nextAvailable}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-2 rounded-none">
              <TabsTrigger value="about" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                <BookOpen className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
              <TabsTrigger value="qualifications" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Award className="w-4 h-4 mr-2" />
                Qualifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="availability" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Calendar className="w-4 h-4 mr-2" />
                Availability
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="p-8">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">About Dr. {therapist.name.split(' ')[1]}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{therapist.bio}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {therapist.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="px-3 py-1">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-purple-500" />
                      Session Types
                    </h4>
                    <div className="space-y-2">
                      {therapist.sessionTypes.map((type) => (
                        <div key={type} className="flex items-center text-gray-600">
                          {type === "Video Call" && <Video className="w-4 h-4 mr-2 text-blue-500" />}
                          {type === "Audio Call" && <Phone className="w-4 h-4 mr-2 text-green-500" />}
                          {type === "In-Person" && <Building className="w-4 h-4 mr-2 text-purple-500" />}
                          {type}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qualifications" className="p-8">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-3 text-yellow-500" />
                    Education & Certifications
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Education</h4>
                      <div className="space-y-3">
                        {therapist.education.map((edu, index) => (
                          <div key={index} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-gray-700">{edu}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Certifications</h4>
                      <div className="space-y-3">
                        {therapist.certifications.map((cert, index) => (
                          <div key={index} className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center">
                            <Shield className="w-5 h-5 mr-3 text-green-500" />
                            <p className="text-gray-700">{cert}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Client Reviews</h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-xl font-semibold text-gray-800">{therapist.rating}</span>
                    <span className="ml-2 text-gray-600">({therapist.reviews} reviews)</span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      
                      <div className="relative">
                        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-200" />
                        <p className="text-gray-700 italic pl-6 leading-relaxed">{review.comment}</p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">— {review.author}</span>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-500">
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="availability" className="p-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Availability & Booking</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                      <h4 className="font-semibold text-green-800 mb-2">Next Available</h4>
                      <p className="text-2xl font-bold text-green-600">{therapist.availability.nextAvailable}</p>
                    </div>
                    
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-2">This Week</h4>
                      <p className="text-2xl font-bold text-blue-600">{therapist.availability.weeklySlots} slots available</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-2">Session Fee</h4>
                      <p className="text-3xl font-bold text-purple-600">${therapist.price}</p>
                      <p className="text-sm text-purple-600">per 50-minute session</p>
                    </div>

                    <Link href={`/therabook/therapists/${params.id}/book`}>
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Calendar className="w-5 h-5 mr-3" />
                        Book Your Session
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
