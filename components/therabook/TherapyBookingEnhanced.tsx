'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/NewAuthContext';
import { bookingService, type BookingData, type AvailabilitySlot } from '@/lib/booking-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';
import { ArrowLeft, Building, Calendar as CalendarIcon, Calendar, CheckCircle, Clock, CreditCard, Heart, MapPin, Phone, Shield, Star, Timer, Video } from 'lucide-react';

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
    name: 'Video Consultation',
    description: 'Face-to-face online session via secure video platform',
    icon: Video,
    duration: '50 minutes',
    price: 999,
    features: ['HD Video Quality', 'Screen Sharing', 'Secure & Private'],
    popular: true
  },
  {
    id: 'audio',
    name: 'Audio Consultation',
    description: 'Voice-only session via secure phone connection',
    icon: Phone,
    duration: '50 minutes',
    price: 499,
    features: ['Crystal Clear Audio', 'No Video Required', 'Phone Friendly']
  },
  {
    id: 'clinic',
    name: 'In-Clinic Session',
    description: "Visit therapist's clinic for face-to-face session",
    icon: Building,
    duration: '50 minutes',
    price: 699,
    location: '123 Main St, New York, NY',
    features: ['Personal Connection', 'Comfortable Office', 'Parking Available']
  },
  {
    id: 'home',
    name: 'Home Care',
    description: 'At-home therapy sessions',
    icon: Building,
    duration: '60 minutes',
    price: 1299,
    features: ['Therapist comes to you', 'Comfort of home']
  }
];

export function TherapyBookingEnhanced({ therapistId }: TherapyBookingProps) {
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

  // 6-step flow overall
  // 1. Select Therapist (review card)
  // 2. Date & Time
  // 3. Session Format
  // 4. Your Details
  // 5. Payment (other page)
  // 6. Confirmation (other page)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Patient details (Step 4)
  const [patientFullName, setPatientFullName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientLanguage, setPatientLanguage] = useState('');
  const [patientConcerns, setPatientConcerns] = useState('');
  const [patientEmergency, setPatientEmergency] = useState('');
  const [hasTherapyBefore, setHasTherapyBefore] = useState(false);

  const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);
  const therapistIdValid = isValidObjectId(therapistId);

  const canProceedFromStep1 = true; // Step 1 is just therapist review
  const canProceedFromStep2 = useMemo(() => !!(selectedDate && selectedTime), [selectedDate, selectedTime]);
  const canProceedFromStep3 = useMemo(() => !!selectedSessionType, [selectedSessionType]);
  const canProceedFromStep4 = useMemo(() => (
    !!(patientFullName && patientEmail && patientPhone && patientConcerns)
  ), [patientFullName, patientEmail, patientPhone, patientConcerns]);
  const canBook = useMemo(() => (
    !!(therapistIdValid && selectedSessionType && selectedDate && selectedTime && canProceedFromStep4)
  ), [therapistIdValid, selectedSessionType, selectedDate, selectedTime, canProceedFromStep4]);

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

  const getSelectedSessionType = () => sessionTypes.find((type) => type.id === selectedSessionType);
  const getSelectedPrice = () => {
    const st = getSelectedSessionType();
    return st ? st.price : therapist.price;
  };

  const next = () => setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));

  const handleBooking = async () => {
    if (!canBook || !selectedDate) return;
    if (!isAuthenticated || !user) {
      setBookingError('Please log in to book a session');
      return;
    }
    setIsBooking(true);
    setBookingError(null);
    try {
      const patientDetails = {
        fullName: patientFullName,
        email: patientEmail,
        phone: patientPhone,
        age: patientAge,
        language: patientLanguage,
        concerns: patientConcerns,
        emergencyContact: patientEmergency,
        hasTherapyBefore
      };

      const bookingData: BookingData = {
        therapistId: therapistId,
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: selectedTime,
        sessionType: selectedSessionType,
        notes: JSON.stringify(patientDetails)
      };
      const booking = await bookingService.createBooking(bookingData, token || undefined);
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

  const StepHeader = () => {
    const stepLabels = ['Select Therapist', 'Date & Time', 'Session Format', 'Your Details', 'Payment', 'Confirmation'];
    const stepText = stepLabels[step - 1];
    return (
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg sticky top-0 z-50">
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
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{stepText}</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Step {step} of 6</Badge>
            </div>
            {/* 6-step indicators */}
            <div className="grid grid-cols-6 gap-4 mt-4">
              {stepLabels.map((label, idx) => {
                const s = idx + 1;
                const active = s <= step;
                return (
                  <div key={label} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300'}`}>{s}</div>
                    <div className={`text-xs mt-2 ${active ? 'text-blue-700' : 'text-gray-500'}`}>{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <StepHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Select Therapist (review) */}
            {step === 1 && (
              <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-6 text-center">
                  <CardTitle className="text-3xl">Select Therapist</CardTitle>
                  <CardDescription>Choose your preferred therapist</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="max-w-2xl mx-auto p-6 border rounded-2xl bg-white">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={therapist.image} alt={therapist.name} />
                        <AvatarFallback>{String(therapist.name||'').slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold mt-4">{therapist.name}</h3>
                      <p className="text-gray-600">{therapist.title}</p>
                      <div className="flex gap-2 items-center mt-2">
                        {(therapist as any).rating ? (
                          <>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{(therapist as any).rating}</span>
                          </>
                        ) : null}
                        <Badge variant="outline" className="text-green-700 border-green-300">Verified</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">Specializes in anxiety, depression, and trauma therapy with a focus on CBT and mindfulness.</p>
                      <div className="flex gap-4 mt-6">
                        <Link href="/therabook/therapists">
                          <Button variant="outline">Choose Different Therapist</Button>
                        </Link>
                        <Button onClick={next}>Continue with {therapist.name?.split(' ')[0] || 'Therapist'}</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <>
                {/* Date Selection (Improved) */}
                <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <CalendarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">Select Date</CardTitle>
                          <CardDescription className="text-base">Choose your preferred date</CardDescription>
                        </div>
                      </div>
                      {selectedDate && (
                        <div className="hidden sm:block text-sm text-blue-700 font-medium bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                          {formatDateShort(selectedDate)}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Quick Picks */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        onClick={() => setSelectedDate(new Date())}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        onClick={() => setSelectedDate(new Date(Date.now() + 24*60*60*1000))}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        onClick={() => setSelectedDate(new Date(Date.now() + 7*24*60*60*1000))}
                      >
                        Next Week
                      </button>
                    </div>

                    {/* Inline Calendar */}
                    <div className="rounded-2xl border border-gray-100 p-3 sm:p-4">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        numberOfMonths={2}
                        showOutsideDays
                        fromDate={new Date()}
                        disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                        className="w-full"
                        classNames={{
                          months: 'flex flex-col lg:flex-row gap-4',
                          month: 'space-y-4 w-full',
                          caption: 'flex justify-center relative items-center',
                          caption_label: 'text-base font-medium',
                          nav: 'space-x-1 flex items-center',
                          nav_button: 'h-8 w-8 bg-transparent hover:bg-gray-100 rounded-md',
                          table: 'w-full border-collapse',
                          head_row: 'grid grid-cols-7',
                          head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.85rem]',
                          row: 'grid grid-cols-7 mt-2',
                          cell: 'h-9 w-9 text-center text-sm p-0 relative',
                          day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-gray-100',
                          day_selected: 'bg-blue-600 text-white hover:bg-blue-600',
                          day_today: 'bg-blue-50 text-blue-700 font-semibold',
                          day_outside: 'text-gray-300',
                          day_disabled: 'text-gray-300 opacity-50',
                        }}
                        initialFocus
                      />
                    </div>

                    <p className="text-xs text-gray-500">Select a date to view available time slots below.</p>
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
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={back} className="rounded-2xl px-6">Back</Button>
                      <Button onClick={next} disabled={!canProceedFromStep2} className="rounded-2xl px-6">Continue</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Step 3: Session Format */}
            {step === 3 && (
              <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-6 text-center">
                  <CardTitle className="text-3xl">Session Format</CardTitle>
                  <CardDescription>Choose how you'd like to connect</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-4">
                  {sessionTypes.map((type) => {
                    const Icon = type.icon; const selected = selectedSessionType === type.id;
                    return (
                      <div key={type.id} onClick={() => setSelectedSessionType(type.id)} className={`p-5 rounded-2xl border cursor-pointer transition ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-xl ${selected ? 'bg-blue-600' : 'bg-gray-100'}`}>
                            <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{type.name}</h4>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-blue-700">₹{type.price}</div>
                                <div className="text-xs text-gray-500">{type.duration}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="md:col-span-2 flex justify-between pt-2">
                    <Button variant="outline" onClick={back}>Previous</Button>
                    <Button onClick={next} disabled={!canProceedFromStep3}>Continue</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Your Details */}
            {step === 4 && (
              <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-6 text-center">
                  <CardTitle className="text-3xl">Your Details</CardTitle>
                  <CardDescription>Tell us about yourself</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Full Name *</label>
                      <input className="mt-1 w-full border rounded-lg h-10 px-3" value={patientFullName} onChange={(e)=>setPatientFullName(e.target.value)} placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Age</label>
                      <input className="mt-1 w-full border rounded-lg h-10 px-3" value={patientAge} onChange={(e)=>setPatientAge(e.target.value)} placeholder="Enter your age" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email Address *</label>
                      <input className="mt-1 w-full border rounded-lg h-10 px-3" value={patientEmail} onChange={(e)=>setPatientEmail(e.target.value)} placeholder="Enter your email" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone Number *</label>
                      <input className="mt-1 w-full border rounded-lg h-10 px-3" value={patientPhone} onChange={(e)=>setPatientPhone(e.target.value)} placeholder="Enter your phone number" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Primary Concerns *</label>
                      <textarea className="mt-1 w-full border rounded-lg px-3 py-2" rows={3} value={patientConcerns} onChange={(e)=>setPatientConcerns(e.target.value)} placeholder="Please describe what you'd like to work on in therapy..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Preferred Language</label>
                      <input className="mt-1 w-full border rounded-lg h-10 px-3" value={patientLanguage} onChange={(e)=>setPatientLanguage(e.target.value)} placeholder="e.g., English, Hindi" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Emergency Contact</label>
                      <input className="mt-1 w-full border rounded-lg h-10 px-3" value={patientEmergency} onChange={(e)=>setPatientEmergency(e.target.value)} placeholder="Name and phone number" />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2 mt-2">
                      <input id="had-therapy" type="checkbox" checked={hasTherapyBefore} onChange={(e)=>setHasTherapyBefore(e.target.checked)} />
                      <label htmlFor="had-therapy" className="text-sm">I have had therapy sessions before</label>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4 mt-6">
                    <Button variant="outline" onClick={back}>Previous</Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={!canBook || isBooking}
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
                          Continue to Payment
                        </>
                      )}
                    </Button>
                  </div>
                  {bookingError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{bookingError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
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
                      <span className="font-semibold">₹{getSelectedPrice()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Platform fee</span>
                      <span>₹5</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-3xl font-bold text-blue-600">₹{getSelectedPrice() + 5}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA varies by step */}
                {step === 1 && (
                  <Button onClick={next} className="w-full mt-2 rounded-2xl">Continue</Button>
                )}
                {step === 2 && (
                  <Button onClick={next} disabled={!canProceedFromStep2} className="w-full mt-2 rounded-2xl">Continue</Button>
                )}
                {step === 3 && (
                  <Button onClick={next} disabled={!canProceedFromStep3} className="w-full mt-2 rounded-2xl">Continue</Button>
                )}
                {step === 4 && (
                  <Button
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={!canBook || isBooking}
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
                        Continue to Payment
                      </>
                    )}
                  </Button>
                )}

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

export default TherapyBookingEnhanced;
