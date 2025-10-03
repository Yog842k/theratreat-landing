'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';
import { useAuth } from '@/components/auth/NewAuthContext';
import { bookingService, type BookingData, type AvailabilitySlot } from '@/lib/booking-service';
import {
  ArrowLeft,
  Building,
  Calendar as CalendarIcon,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Heart,
  MapPin,
  Phone,
  Shield,
  Star,
  Timer,
  Video
} from 'lucide-react';

type TherapyBookingProps = {
  therapistId: string;
};

const mockTherapistFallback = {
  name: 'Loading Therapist...',
  title: '',
  price: 0,
  image: '/api/placeholder/100/100',
  rating: 0,
  reviews: 0,
  location: '',
  nextAvailable: ''
};

const sessionTypes = [
  {
    id: 'video',
    name: 'Video Call',
    description: 'Face-to-face online session via secure video platform',
    icon: Video,
    duration: '50 minutes',
    price: 120,
    features: ['HD Video Quality', 'Screen Sharing', 'Secure & Private'],
    popular: true
  },
  {
    id: 'audio',
    name: 'Audio Call',
    description: 'Voice-only session via secure phone connection',
    icon: Phone,
    duration: '50 minutes',
    price: 100,
    features: ['Crystal Clear Audio', 'No Video Required', 'Phone Friendly']
  },
  {
    id: 'clinic',
    name: 'In-Person',
    description: "Visit therapist's clinic for face-to-face session",
    icon: Building,
    duration: '50 minutes',
    price: 150,
    location: '123 Main St, New York, NY',
    features: ['Personal Connection', 'Comfortable Office', 'Parking Available']
  }
];

export function TherapyBooking({ therapistId }: TherapyBookingProps) {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [therapist, setTherapist] = useState<any>(mockTherapistFallback);
  const [isLoadingTherapist, setIsLoadingTherapist] = useState(true);

  // Debug auth log
  console.log('🔍 Booking page auth state:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userName: user?.name
  });

  const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);
  const therapistIdValid = isValidObjectId(therapistId);
  const canProceed = !!(selectedDate && selectedTime && selectedSessionType && therapistIdValid);

  useEffect(() => {
    let active = true;
    async function loadTherapist() {
      setIsLoadingTherapist(true);
      try {
        if (!therapistIdValid) return;
        const res = await fetch(`/api/therapists/${therapistId}`);
        if (!res.ok) throw new Error('Failed to load therapist');
        const data = await res.json();
        const t = data?.data?.therapist || data?.therapist;
        if (t && active) {
          setTherapist({
            name: t.displayName || t.name || 'Therapist',
            title: t.title || t.specializations?.[0] || 'Licensed Therapist',
            price: t.consultationFee || t.price || 0,
            image: t.photo || t.image || '/api/placeholder/100/100',
            rating: t.rating || 0,
            reviews: t.reviewsCount || 0,
            location: t.location || '',
            nextAvailable: ''
          });
        }
      } catch (e) {
        console.warn('Therapist fetch failed, using fallback', e);
      } finally {
        if (active) setIsLoadingTherapist(false);
      }
    }
    loadTherapist();
    return () => {
      active = false;
    };
  }, [therapistId, therapistIdValid]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadAvailability = async () => {
    if (!selectedDate) return;
    setIsLoadingAvailability(true);
    setBookingError(null);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await bookingService.getTherapistAvailability(therapistId, {
        date: dateString
      });
      setAvailability(response.availability as AvailabilitySlot[]);
    } catch (error: any) {
      console.error('Failed to load availability:', error);
      const mockSlots = [
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '13:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: false },
        { time: '16:00', available: true },
        { time: '17:00', available: true }
      ];
      setAvailability(mockSlots);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleBooking = async () => {
    if (!canProceed || !selectedDate) return;
    if (!isAuthenticated || !user) {
      setBookingError('Please log in to book a session');
      return;
    }
    setIsBooking(true);
    setBookingError(null);
    try {
      const bookingData: BookingData = {
        therapistId: therapistId,
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: selectedTime,
        sessionType: selectedSessionType,
        notes: ''
      };
      console.log('Creating booking with data:', bookingData);
      const booking = await bookingService.createBooking(bookingData, token || undefined);
      console.log('Booking created successfully:', booking);
      const bookingId = (booking as any)?._id || (booking as any)?.bookingId || 'unknown';
      router.push(`/therabook/therapists/${therapistId}/book/payment?bookingId=${bookingId}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      setBookingError(error.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDateShort = (date: Date) => {
    try {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const getSelectedSessionType = () => sessionTypes.find((type) => type.id === selectedSessionType);
  const getSelectedPrice = () => {
    const st = getSelectedSessionType();
    return st ? st.price : therapist.price;
  };

  const userRole = (user?.userType || '').toLowerCase();
  const isEndUser = userRole === 'user' || userRole === 'patient';

  // Loading state while auth is being checked
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

  // If not authenticated, show prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Please log in to book a therapy session with <span className="font-semibold text-blue-600">{therapist.name}</span>
            </p>
            <div className="space-y-4">
              <Link href={`/auth/login?redirect=${encodeURIComponent(`/therabook/therapists/${therapistId}/book`)}`}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Log In to Book Session
                </Button>
              </Link>
              <Link href={`/auth/signup?redirect=${encodeURIComponent(`/therabook/therapists/${therapistId}/book`)}`}>
                <Button variant="outline" className="w-full py-4 rounded-2xl text-lg border-2 border-gray-200 hover:border-gray-300">
                  Create Account
                </Button>
              </Link>
              <Link href={`/therabook/therapists/${therapistId}`}>
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

  // If logged in as therapist/admin (non end-user), block booking creation and guide
  if (isAuthenticated && user && !isEndUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Bookings are for end users</h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              You are logged in as <span className="font-semibold">{userRole}</span>. Only end users (patients) can create bookings.
            </p>
            <div className="space-y-4">
              <Link href="/auth/logout">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Switch Account
                </Button>
              </Link>
              <Link href={`/therabook/therapists/${therapistId}`}>
                <Button variant="outline" className="w-full py-4 rounded-2xl text-lg border-2 border-gray-200 hover:border-gray-300">Back to Therapist Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If therapist id is invalid (demo mode)
  if (!therapistIdValid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Demo Therapist Only</h1>
            <p className="text-gray-600 mb-4">
              This booking page was opened with an ID that is not a valid therapist record.
            </p>
            <p className="text-gray-600 mb-6">
              To create a real booking, navigate from a real therapist profile (with a 24‑character ID) or seed a therapist in the database.
            </p>
            <Link href="/therabook/therapists">
              <Button className="w-full mb-3">Browse Therapists</Button>
            </Link>
            <Link href={`/therabook/therapists/${therapistId}`}>
              <Button variant="outline" className="w-full">Return to Profile</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <Link href={`/therabook/therapists/${therapistId}`}>
              <Button variant="ghost" className="hover:bg-gray-100 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                <AvatarImage src={therapist.image} alt={therapist.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {String(therapist.name || '')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">{therapist.name}</h1>
                <p className="text-sm text-gray-600">{therapist.title}</p>
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
              <div className="flex space-x-4" aria-hidden>
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

            {/* Date Selection */}
            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  Select Date
                </CardTitle>
                <CardDescription className="text-lg">Choose your preferred date</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn('w-full justify-start text-left font-normal h-12', !selectedDate && 'text-muted-foreground')}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDateShort(selectedDate) : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                  {selectedDate ? `Available time slots for ${formatDateShort(selectedDate)}` : 'Select a date to see time slots'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingAvailability ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading available times...</p>
                  </div>
                ) : availability.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {availability.map((slot) => (
                      <button
                        key={slot.time}
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
                        <div className="font-semibold flex items-center justify-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {slot.time}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No available time slots for this date</p>
                    <p className="text-sm text-gray-500">Please select a different date</p>
                  </div>
                )}
                {bookingError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{bookingError}</p>
                  </div>
                )}
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
                    <AvatarImage src={therapist.image} alt={therapist.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                      {String(therapist.name || '')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-lg">{therapist.name}</h4>
                    <p className="text-gray-600">{therapist.title}</p>
                    {(therapist as any).rating ? (
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{(therapist as any).rating}</span>
                        {(therapist as any).reviews ? (
                          <span className="ml-1 text-sm text-gray-500">({(therapist as any).reviews})</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Session Details */}
                {selectedSessionType && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Session Type
                    </h5>
                    <p className="text-blue-700 font-medium">{getSelectedSessionType()?.name}</p>
                    <p className="text-blue-600 text-sm">{getSelectedSessionType()?.duration}</p>
                  </div>
                )}

                {selectedDate && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date
                    </h5>
                    <p className="text-green-700 font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                    disabled={!canProceed || isBooking}
                    onClick={handleBooking}
                  >
                    {isBooking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-3" />
                        Proceed to Payment
                      </>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TherapyBooking;
