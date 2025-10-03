'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Phone, Building, ArrowLeft, CheckCircle } from "lucide-react";
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
};

const sessionTypes = [
  {
    id: "video",
    name: "Video Call",
    description: "Face-to-face online session via secure video platform",
    icon: Video,
    duration: "50 minutes",
  },
  {
    id: "audio",
    name: "Audio Call", 
    description: "Voice-only session via secure phone connection",
    icon: Phone,
    duration: "50 minutes",
  },
  {
    id: "clinic",
    name: "In-Person",
    description: "Visit therapist's clinic for face-to-face session", 
    icon: Building,
    duration: "50 minutes",
    location: "123 Main St, New York, NY",
  },
];

const timeSlots = [
  { time: "9:00 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "11:00 AM", available: true },
  { time: "1:00 PM", available: true },
  { time: "2:00 PM", available: true },
  { time: "3:00 PM", available: false },
  { time: "4:00 PM", available: true },
  { time: "5:00 PM", available: true },
];

export default function BookingPage({ params }: BookingPageProps) {
  const [selectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState("");
  
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

  const canProceed = selectedDate && selectedTime && selectedSessionType;

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt WITHOUT redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthDebug />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">Please log in to book a therapy session with {mockTherapist.name}</p>
            <div className="space-y-4">
              <Link href={`/auth/login?redirect=${encodeURIComponent(`/therabook/therapists/${params.id}/book`)}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Log In to Book Session
                </Button>
              </Link>
              <Link href={`/auth/signup?redirect=${encodeURIComponent(`/therabook/therapists/${params.id}/book`)}`}>
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
              <Link href={`/therabook/therapists/${params.id}`}>
                <Button variant="ghost" className="w-full">
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
    <div className="min-h-screen bg-gray-50">
      <AuthDebug />
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <Link href={`/therabook/therapists/${params.id}`}>
            <Button variant="ghost" className="mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={mockTherapist.image} alt={mockTherapist.name} />
              <AvatarFallback>{mockTherapist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mockTherapist.name}</h1>
              <p className="text-gray-600">{mockTherapist.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">${mockTherapist.price}/session</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main booking form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Session Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Session Type
                </CardTitle>
                <CardDescription>Choose how you'd like to attend your session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedSessionType(type.id)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        selectedSessionType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-1 text-blue-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{type.name}</h3>
                            <span className="text-sm text-gray-500">{type.duration}</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{type.description}</p>
                          {type.location && (
                            <p className="text-gray-500 text-sm mt-1">{type.location}</p>
                          )}
                        </div>
                        {selectedSessionType === type.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Available Times
                </CardTitle>
                <CardDescription>
                  {formatDate(selectedDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        selectedTime === slot.time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : slot.available
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockTherapist.image} alt={mockTherapist.name} />
                    <AvatarFallback>{mockTherapist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{mockTherapist.name}</h4>
                    <p className="text-sm text-gray-600">{mockTherapist.title}</p>
                  </div>
                </div>

                {selectedSessionType && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900">Session Type</h5>
                    <p className="text-blue-700 text-sm">
                      {sessionTypes.find(type => type.id === selectedSessionType)?.name}
                    </p>
                  </div>
                )}

                {selectedDate && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900">Date</h5>
                    <p className="text-green-700 text-sm">{formatDate(selectedDate)}</p>
                  </div>
                )}

                {selectedTime && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h5 className="font-medium text-purple-900">Time</h5>
                    <p className="text-purple-700 text-sm">{selectedTime}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">${mockTherapist.price}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!canProceed}
                    onClick={() => {
                      // Handle booking confirmation
                      alert('Booking functionality would be implemented here');
                    }}
                  >
                    {canProceed ? 'Confirm Booking' : 'Select all options to continue'}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Logged in as: {user.name} ({user.role})
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
