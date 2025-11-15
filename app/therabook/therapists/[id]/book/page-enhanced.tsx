'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Phone, Building, ArrowLeft, CheckCircle, Shield, CreditCard, User, Mail, Star, Timer, MapPin, Heart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/NewAuthContext";
import { AuthDebug } from "@/components/AuthDebug";

interface BookingPageProps {
  params: {
    id: string;
  };
}

const mockTherapist = {
  name: "Dr. Sarah Johnson",
  title: "Clinical Psychologist",
  price: 120,
  image: "/api/placeholder/100/100",
  rating: 4.9,
  reviews: 156,
  location: "New York, NY",
  nextAvailable: "Today 3:00 PM"
};

const sessionTypes = [
  {
    id: "video",
    name: "Video Call",
    description: "Face-to-face online session via secure video platform",
    icon: Video,
    duration: "50 minutes",
    price: 120,
    features: ["HD Video Quality", "Screen Sharing", "Secure & Private"],
    popular: true
  },
  {
    id: "audio",
    name: "Audio Call", 
    description: "Voice-only session via secure phone connection",
    icon: Phone,
    duration: "50 minutes",
    price: 100,
    features: ["Crystal Clear Audio", "No Video Required", "Phone Friendly"]
  },
  {
    id: "clinic",
    name: "In-Person",
    description: "Visit therapist's clinic for face-to-face session", 
    icon: Building,
    duration: "50 minutes",
    price: 150,
    location: "123 Main St, New York, NY",
    features: ["Personal Connection", "Comfortable Office", "Parking Available"]
  },
];

const timeSlots = [
  { time: "9:00 AM", available: true, date: "Today" },
  { time: "10:00 AM", available: false, date: "Today", reason: "Booked" },
  { time: "11:00 AM", available: true, date: "Today" },
  { time: "1:00 PM", available: true, date: "Today" },
  { time: "2:00 PM", available: true, date: "Today" },
  { time: "3:00 PM", available: false, date: "Today", reason: "Booked" },
  { time: "4:00 PM", available: true, date: "Today" },
  { time: "5:00 PM", available: true, date: "Today" },
  { time: "9:00 AM", available: true, date: "Tomorrow" },
  { time: "10:00 AM", available: true, date: "Tomorrow" },
  { time: "11:00 AM", available: true, date: "Tomorrow" },
  { time: "2:00 PM", available: true, date: "Tomorrow" },
];

export default function BookingPage({ params }: BookingPageProps) {
  const [selectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  
  const { user, isAuthenticated, isLoading } = useAuth();

  // Debug logging
  console.log('🔍 Booking page auth state:', { 
    isLoading, 
    isAuthenticated, 
    hasUser: !!user,
    userName: user?.name 
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getSelectedSessionType = () => {
    return sessionTypes.find(type => type.id === selectedSessionType);
  };

  const getSelectedPrice = () => {
    const sessionType = getSelectedSessionType();
    if (sessionType) {
      return sessionType.price;
    }
    // If no session type selected, show therapist's price if available
    // Otherwise, show the minimum price from available session types (starting price)
    if (mockTherapist.price && mockTherapist.price > 0) {
      return mockTherapist.price;
    }
    // Return minimum session type price as starting price
    const minPrice = Math.min(...sessionTypes.map(type => type.price));
    return minPrice;
  };

  const canProceed = selectedDate && selectedTime && selectedSessionType;

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading your session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt WITHOUT redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AuthDebug />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Please log in to book a therapy session with <span className="font-semibold text-blue-600">{mockTherapist.name}</span>
            </p>
            <div className="space-y-4">
              <Link href={`/auth/login?redirect=${encodeURIComponent(`/therabook/therapists/${params.id}/book`)}`}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Mail className="w-5 h-5 mr-3" />
                  Log In to Book Session
                </Button>
              </Link>
              <Link href={`/auth/signup?redirect=${encodeURIComponent(`/therabook/therapists/${params.id}/book`)}`}>
                <Button variant="outline" className="w-full py-4 rounded-2xl text-lg border-2 border-gray-200 hover:border-gray-300">
                  Create Account
                </Button>
              </Link>
              <Link href={`/therabook/therapists/${params.id}`}>
                <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-800 rounded-2xl">
                  Back to Therapist Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated - show booking form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AuthDebug />
      
      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <Link href={`/therabook/therapists/${params.id}`}>
              <Button variant="ghost" className="hover:bg-gray-100 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                <AvatarImage src={mockTherapist.image} alt={mockTherapist.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {mockTherapist.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">{mockTherapist.name}</h1>
                <p className="text-sm text-gray-600">{mockTherapist.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main booking form */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Progress Indicator */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Book Your Session</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Step 1 of 3</Badge>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            {/* Session Type Selection */}
            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  Choose Session Type
                </CardTitle>
                <CardDescription className="text-lg">Select how you'd like to attend your session</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {sessionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setSelectedSessionType(type.id)}
                      className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedSessionType === type.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {type.popular && (
                        <div className="absolute -top-2 left-4">
                          <Badge className="bg-gradient-to-r from-orange-400 to-pink-500 text-white">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          selectedSessionType === type.id ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            selectedSessionType === type.id ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{type.name}</h3>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-800">${type.price}</div>
                              <div className="text-sm text-gray-500">{type.duration}</div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{type.description}</p>
                          
                          {type.location && (
                            <div className="flex items-center text-gray-500 mb-3">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="text-sm">{type.location}</span>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {type.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {selectedSessionType === type.id && (
                          <div className="p-2">
                            <CheckCircle className="w-8 h-8 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  Select Time Slot
                </CardTitle>
                <CardDescription className="text-lg">
                  {formatDate(selectedDate)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Today's slots */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Today
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {timeSlots.filter(slot => slot.date === "Today").map((slot) => (
                        <button
                          key={`today-${slot.time}`}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-4 border-2 rounded-xl text-center transition-all duration-300 ${
                            selectedTime === slot.time
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                              : slot.available
                              ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="font-semibold">{slot.time}</div>
                          {!slot.available && (
                            <div className="text-xs text-red-500 mt-1">{slot.reason}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tomorrow's slots */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-green-500" />
                      Tomorrow
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {timeSlots.filter(slot => slot.date === "Tomorrow").map((slot) => (
                        <button
                          key={`tomorrow-${slot.time}`}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-4 border-2 rounded-xl text-center transition-all duration-300 ${
                            selectedTime === slot.time
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                              : slot.available
                              ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="font-semibold">{slot.time}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Booking Summary */}
          <div>
            <Card className="sticky top-32 shadow-2xl border-0 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-6">
                <CardTitle className="text-2xl">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Therapist Info */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <Avatar className="w-16 h-16 ring-2 ring-white">
                    <AvatarImage src={mockTherapist.image} alt={mockTherapist.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                      {mockTherapist.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-lg">{mockTherapist.name}</h4>
                    <p className="text-gray-600">{mockTherapist.title}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{mockTherapist.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({mockTherapist.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                {selectedSessionType && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Session Type
                    </h5>
                    <p className="text-blue-700 font-medium">
                      {getSelectedSessionType()?.name}
                    </p>
                    <p className="text-blue-600 text-sm">
                      {getSelectedSessionType()?.duration}
                    </p>
                  </div>
                )}

                {selectedDate && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date
                    </h5>
                    <p className="text-green-700 font-medium">{formatDate(selectedDate)}</p>
                  </div>
                )}

                {selectedTime && (
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <h5 className="font-semibold text-purple-900 mb-2 flex items-center">
                      <Timer className="w-4 h-4 mr-2" />
                      Time
                    </h5>
                    <p className="text-purple-700 font-medium">{selectedTime}</p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span>Session fee</span>
                      <span className="font-semibold">${getSelectedPrice()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Platform fee</span>
                      <span>$5</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-3xl font-bold text-blue-600">${getSelectedPrice() + 5}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                    disabled={!canProceed}
                    onClick={() => {
                      // Handle booking confirmation
                      alert('Booking functionality would be implemented here');
                    }}
                  >
                    {canProceed ? (
                      <>
                        <CreditCard className="w-5 h-5 mr-3" />
                        Proceed to Payment
                      </>
                    ) : (
                      'Select all options to continue'
                    )}
                  </Button>
                </div>

                {/* Security & Info */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2 text-green-500" />
                    Your payment is secure and encrypted
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    Cancel up to 24 hours before your session
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Logged in as: <span className="font-medium">{user.name}</span> ({user.role})
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
