'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/NewAuthContext';
import { bookingService, type BookingData, type AvailabilitySlot } from '@/lib/booking-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'sonner';
import { 
  ArrowLeft, Building, Calendar as CalendarIcon, Calendar, 
  CheckCircle, Clock, CreditCard, Heart, MapPin, Phone, 
  Shield, Star, Video, AlertCircle, Info, ChevronRight, Sparkles
} from 'lucide-react';

type TherapyBookingProps = {
  therapistId: string;
};



// Session types will be injected with therapist pricing
const baseSessionTypes = [
  {
    id: 'video',
    name: 'Video Consultation',
    description: 'Face-to-face online session via secure video platform',
    icon: Video,
    duration: '50 minutes',
    features: ['HD Video', 'Screen Sharing', 'Encrypted'],
    popular: true
  },
  {
    id: 'audio',
    name: 'Audio Consultation',
    description: 'Voice-only session via secure phone connection',
    icon: Phone,
    duration: '50 minutes',
    features: ['Crystal Clear Audio', 'No Video', 'Privacy Focused']
  },
  {
    id: 'clinic',
    name: 'In-Clinic Session',
    description: "Visit therapist's clinic for face-to-face session",
    icon: Building,
    duration: '50 minutes',
    location: '123 Main St, New York, NY',
    features: ['In-Person', 'Comfortable Office', 'Parking Available']
  },
  {
    id: 'home',
    name: 'Home Care',
    description: 'At-home therapy sessions',
    icon: MapPin,
    duration: '60 minutes',
    features: ['Therapist comes to you', 'Comfort of home', 'Travel included']
  }
];

export function TherapyBookingEnhanced({ therapistId }: TherapyBookingProps) {
    const [therapist, setTherapist] = useState<any>(null);
    // Only use therapist data if loaded from API/database
    const sessionTypesWithPricing = useMemo(() => {
      if (!therapist) return [];
      return baseSessionTypes.map(type => {
        let price = therapist?.pricing?.[type.id] ?? therapist?.pricing?.[type.id.toLowerCase()] ?? therapist?.price ?? 0;
        if (typeof price === 'string') price = parseFloat(price) || 0;
        if (typeof price !== 'number' || isNaN(price)) price = 0;
        return { ...type, price };
      });
    }, [therapist]);
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();

  // --- State Management ---
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // (removed duplicate therapist state declaration)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(true);
   
  // Refs to manage fetch lifecycles (race conditions)
  const fetchControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef<boolean>(false);
  const currentTherapistIdRef = useRef<string>('');
  const fetchCounterRef = useRef<number>(0);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
   
  // Payment State
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [gatewayMode, setGatewayMode] = useState<string>('');

  // Form Details
  const [patientFullName, setPatientFullName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientLanguage, setPatientLanguage] = useState('');
  const [patientConcerns, setPatientConcerns] = useState('');
  const [patientEmergency, setPatientEmergency] = useState('');
  const [hasTherapyBefore, setHasTherapyBefore] = useState(false);

  // Home Visit Details
  const [inHomeAddressLine1, setInHomeAddressLine1] = useState('');
  const [inHomeAddressLine2, setInHomeAddressLine2] = useState('');
  const [inHomeCity, setInHomeCity] = useState('');
  const [inHomePincode, setInHomePincode] = useState('');
  const [inHomeContactName, setInHomeContactName] = useState('');
  const [inHomeContactPhone, setInHomeContactPhone] = useState('');

  // --- Validation Logic ---
  const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);
  const therapistIdValid = isValidObjectId(therapistId);

  const canProceedFromStep1 = useMemo(() => !!(selectedDate && selectedTime), [selectedDate, selectedTime]);
  const canProceedFromStep2 = useMemo(() => !!selectedSessionType, [selectedSessionType]);
  const inHomeSelected = useMemo(() => selectedSessionType === 'home', [selectedSessionType]);
  
  const canProceedFromStep3 = useMemo(() => {
    const baseOk = !!(patientFullName && patientEmail && patientPhone && patientConcerns);
    if (!inHomeSelected) return baseOk;
    // Extra validation for Home visits
    const pinOk = /^\d{6}$/.test(inHomePincode.trim());
    const phoneOk = inHomeContactPhone.trim().length >= 10;
    return baseOk && !!(inHomeAddressLine1 && inHomeCity) && pinOk && phoneOk;
  }, [patientFullName, patientEmail, patientPhone, patientConcerns, inHomeSelected, inHomeAddressLine1, inHomeCity, inHomePincode, inHomeContactPhone]);
  
  const canProceedFromStep4 = useMemo(() => !!bookingId, [bookingId]);
  
  const canBook = useMemo(() => (
    !!(therapistIdValid && selectedSessionType && selectedDate && selectedTime && canProceedFromStep3)
  ), [therapistIdValid, selectedSessionType, selectedDate, selectedTime, canProceedFromStep3]);


  // --- Data Loading Effects ---

  // 1. Load Therapist Data (Real API)
  useEffect(() => {
    // Skip if therapist ID is invalid
    if (!therapistIdValid) return;
    
    // Skip if we've already loaded this therapist
    if (hasLoadedRef.current && currentTherapistIdRef.current === therapistId) return;

    fetchCounterRef.current += 1;
    const thisFetchId = fetchCounterRef.current;
    
    // Cleanup previous controller
    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    
    const abortController = new AbortController();
    fetchControllerRef.current = abortController;
    currentTherapistIdRef.current = therapistId;

    async function loadTherapist() {
      try {
        const res = await fetch(`/api/therapists/${therapistId}`, {
          signal: abortController.signal,
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error('Failed to load therapist');
        const data = await res.json();
        
        // Handle various response structures
        const t = data?.data?.therapist || data?.therapist;

        if (t && thisFetchId === fetchCounterRef.current) {
          // Always use pricing object if available, else fallback
          let pricing = t.pricing || {};
          if (Object.keys(pricing).length === 0) {
            const fallbackVal = t.consultationFee ?? t.sessionFee ?? t.price ?? 0;
            pricing = { video: fallbackVal, audio: fallbackVal, clinic: fallbackVal, home: fallbackVal };
          } else {
            pricing = {
              video: pricing.video ?? t.consultationFee ?? t.sessionFee ?? t.price ?? 0,
              audio: pricing.audio ?? t.consultationFee ?? t.sessionFee ?? t.price ?? 0,
              clinic: pricing.clinic ?? t.consultationFee ?? t.sessionFee ?? t.price ?? 0,
              home: pricing.home ?? t.consultationFee ?? t.sessionFee ?? t.price ?? 0
            };
          }
          setTherapist({
            name: t.displayName || t.name || 'Therapist',
            title: t.title || t.specializations?.[0] || 'Licensed Therapist',
            price: t.consultationFee || t.price || 0,
            image: t.photo || t.image || t.profilePhotoUrl || '/api/placeholder/100/100',
            rating: t.rating || 0,
            reviews: t.reviewsCount || t.reviewCount || 0,
            location: t.location || '',
            nextAvailable: '',
            pricing
          });
          setIsUsingFallbackData(false);
          hasLoadedRef.current = true;
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error('Therapist load error', e);
      }
    }

    loadTherapist();

    return () => {
      if (thisFetchId === fetchCounterRef.current) abortController.abort();
    };
  }, [therapistId, therapistIdValid]);

  // 2. Load Availability (Real API)
  useEffect(() => {
    if (!selectedDate || !therapistIdValid) {
      setAvailability([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      loadAvailability();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedDate, therapistIdValid]);

  const loadAvailability = async () => {
    if (!selectedDate) return;
    setIsLoadingAvailability(true);
    setBookingError(null);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await bookingService.getTherapistAvailability(therapistId, { date: dateString });
      setAvailability(response.availability as AvailabilitySlot[]);
    } catch (error) {
       console.error("Availability load failed", error);
       setBookingError("Could not load availability. Please try again.");
       setAvailability([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // 3. Load Gateway Config (Razorpay mode)
  useEffect(() => {
    if (step === 4) {
        fetch('/api/payments/razorpay/config').then(async r => {
            const json = await r.json().catch(() => null);
            const mode = json?.data?.mode || json?.mode;
            if (mode) setGatewayMode(mode);
        }).catch(err => console.warn('Failed to load gateway config', err));
    }
  }, [step]);


  // --- Helper Functions ---

  const getSelectedSessionType = () => sessionTypesWithPricing.find((type) => type.id === selectedSessionType);
  
  const getSelectedPrice = () => {
    const st = getSelectedSessionType();
    if (st) return st.price;
    if (therapist.price && therapist.price > 0) return therapist.price;
    // Fallback minimum
    return 499; 
  };

  const next = () => {
    if (step === 3 && canBook) {
      handleCreateBooking();
    } else {
      setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
    }
  };
  
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));

  // --- Payment & Booking Logic ---

  // Load Razorpay Script Helper
  const loadRazorpayScript = () => new Promise<boolean>((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) return resolve(true);
    if (document.getElementById('razorpay-js')) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.id = 'razorpay-js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  // Step 3 -> 4: Create Booking in Backend
    const handleCreateBooking = async () => {
      if(!isAuthenticated || !token) {
        toast.error("Please log in to book");
        // Save state to localStorage if needed before redirect
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      
      setIsBooking(true);
      setBookingError(null);

      try {
        // Construct booking payload
        const bookingPayload: BookingData = {
          therapistId,
          appointmentDate: selectedDate!.toISOString().split('T')[0],
          appointmentTime: selectedTime,
          sessionType: selectedSessionType,
          notes: JSON.stringify({
            fullName: patientFullName,
            email: patientEmail,
            phone: patientPhone,
          age: patientAge,
          concerns: patientConcerns,
          emergency: patientEmergency,
          language: patientLanguage,
          hasTherapyBefore,
          inHomeDetails: inHomeSelected ? {
            addressLine1: inHomeAddressLine1,
            addressLine2: inHomeAddressLine2,
            city: inHomeCity,
            pincode: inHomePincode,
            contactName: inHomeContactName,
            contactPhone: inHomeContactPhone
          } : undefined
        })
      };

        // Call Booking Service
        const booking = await bookingService.createBooking(bookingPayload, token);
          
        const newBookingId = (booking as any)._id || (booking as any).bookingId;
          
        if (!newBookingId) throw new Error("No booking ID returned from server");
          
        setBookingId(newBookingId);
        // Bypass payment for specific email
        if (user?.email === 'sachinparihar10@gmail.com') {
        router.push(`/therabook/therapists/${therapistId}/book/confirmation?bookingId=${newBookingId}`);
        return;
        }
        // Do NOT redirect to confirmation here. Only move to payment step.
        setStep(4); // Move to Payment Step
      } catch (err: any) {
        console.error("Booking creation error:", err);
        setBookingError(err.message || 'Failed to create booking. Please try again.');
        toast.error("Booking Failed", { description: err.message });
      } finally {
        setIsBooking(false);
      }
    };

  // Step 4: Handle Payment (Razorpay)
  const handlePayment = async () => {
    if (!bookingId) return;
    
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
        // 1. Create Order on Server
        const res = await fetch('/api/payments/razorpay/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ bookingId })
        });

        const text = await res.text();
        let parsed: any = null;
        try { parsed = text ? JSON.parse(text) : null; } catch {}
        
        if (!res.ok) {
            throw new Error(parsed?.message || parsed?.error || 'Failed to initialize payment');
        }

        const { data } = parsed || {};
        const { order, keyId, simulated } = data || {};
        
        if (!order?.id || !keyId) throw new Error('Invalid order response from server');

        // 2. Handle Simulated/Dev Mode
        if (simulated) {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    bookingId,
                    razorpay_payment_id: 'pay_FAKE_' + Date.now(),
                    razorpay_order_id: order.id,
                    razorpay_signature: 'sig_FAKE',
                })
            });
            if (!verifyRes.ok) throw new Error('Verification failed (simulated)');
            router.push(`/therabook/therapists/${therapistId}/book/confirmation?bookingId=${bookingId}`);
            return;
        }

        // 3. Load Razorpay SDK
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Razorpay SDK failed to load');

        // 4. Open Payment Modal
        const options: any = {
            key: keyId,
            amount: order.amount,
            currency: order.currency,
            name: 'TheraBook',
            description: 'Therapy session payment',
            order_id: order.id,
            prefill: {
                name: patientFullName || user?.name || '',
                email: patientEmail || user?.email || '',
                contact: patientPhone || '',
            },
            notes: { bookingId },
            handler: async function (response: any) {
                try {
                    // 5. Verify Payment on Server
                    const verifyRes = await fetch('/api/payments/razorpay/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({
                            bookingId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                    });
                    
                    if (!verifyRes.ok) throw new Error('Payment verification failed');
                    
                    // 6. Redirect to Confirmation ONLY after payment is verified
                    router.push(`/therabook/therapists/${therapistId}/book/confirmation?bookingId=${bookingId}`);
                } catch (e) {
                    console.error(e);
                    setPaymentError('Payment verification failed. Please contact support.');
                    setIsProcessingPayment(false);
                }
            },
            modal: {
                ondismiss: () => setIsProcessingPayment(false)
            },
            theme: { color: '#2563eb' }
        };

        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();

    } catch (e: any) {
        console.error('Payment error:', e);
        setPaymentError(e.message || 'Payment initialization failed. Please try again.');
        setIsProcessingPayment(false);
    }
  };

  const formatDateShort = (date: Date) => {
    try {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  // --- Renderers ---

  // 1. Step Header Component
  const StepHeader = useMemo(() => {
    const stepLabels = ['Date & Time', 'Session Type', 'Details', 'Payment'];
    return (
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Navigation & Context */}
            <div className="flex items-center gap-4">
               <Link href={`/therabook/therapists/${therapistId}`}>
                 <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                 </Button>
               </Link>
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <Avatar className="h-9 w-9 ring-1 ring-slate-200">
                  <AvatarImage src={therapist?.image || '/api/placeholder/100/100'} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {therapist?.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                   <h2 className="text-sm font-bold text-slate-900 leading-tight">{therapist?.name || 'Therapist'}</h2>
                   <p className="text-xs text-slate-500 font-medium">Step {step}: {stepLabels[step - 1]}</p>
                </div>
              </div>
            </div>

            {/* Right: Progress Stepper */}
            <div className="flex items-center gap-2">
                {stepLabels.map((label, idx) => {
                    const s = idx + 1;
                    const isActive = s === step;
                    const isCompleted = s < step;
                    return (
                        <div key={label} className="flex items-center group">
                            <div className={`
                                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300
                                ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-50 scale-105' : ''}
                                ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                                ${!isActive && !isCompleted ? 'bg-slate-100 text-slate-400' : ''}
                            `}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : s}
                            </div>
                            {idx < stepLabels.length - 1 && (
                                <div className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

          </div>
        </div>
      </div>
    );
  }, [step, therapist, therapistId]);


  if (isLoading || therapist === null) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 text-sm animate-pulse">Loading booking experience...</p>
      </div>
  );

  if (!therapistIdValid) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
            <h2 className="text-xl font-bold text-slate-900">Invalid Therapist ID</h2>
            <Link href="/therabook/therapists"><Button variant="link">Return to Directory</Button></Link>
        </div>
    </div>
  ); 

  if (!therapist) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <p className="text-red-500 font-bold">Therapist data could not be loaded from the database.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      {StepHeader}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (Content) - Spans 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Date & Time */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Date Selection Card */}
                <Card className="border-0 shadow-md shadow-slate-200/50 overflow-hidden">
                  <CardHeader className="border-b border-slate-50 bg-white pb-4">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <CalendarIcon className="w-5 h-5" />
                      </div>
                      Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Date Pills */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                       {[0, 1, 2, 3, 7].map((days) => {
                           const d = new Date();
                           d.setDate(d.getDate() + days);
                           const isSelected = selectedDate?.toDateString() === d.toDateString();
                           return (
                               <button
                                   key={days}
                                   onClick={() => setSelectedDate(d)}
                                   className={`
                                     flex flex-col items-center justify-center min-w-[4.5rem] py-3 rounded-xl text-sm font-medium transition-all duration-200 border
                                     ${isSelected 
                                       ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 transform scale-105' 
                                       : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}
                                   `}
                               >
                                   <span className="text-xs opacity-80 font-normal">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                   <span className="text-lg font-bold">{d.getDate()}</span>
                               </button>
                           )
                       })}
                    </div>

                    <div className="p-1">
                       <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="Or pick a specific date"
                              value={selectedDate}
                              onChange={(newValue: Date | null) => setSelectedDate(newValue ?? undefined)}
                              disablePast
                              className="w-full bg-white"
                              enableAccessibleFieldDOMStructure={false}
                              slots={{ textField: (params) => <TextField {...params} fullWidth /> }}
                            />
                       </LocalizationProvider>
                    </div>
                  </CardContent>
                </Card>

                {/* Time Selection Card */}
                <Card className="border-0 shadow-md shadow-slate-200/50">
                  <CardHeader className="border-b border-slate-50 bg-white pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            Select Time
                        </CardTitle>
                        {selectedDate && <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{formatDateShort(selectedDate)}</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isLoadingAvailability ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                            <span className="text-slate-400 text-sm">Checking therapist's schedule...</span>
                        </div>
                    ) : availability.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {availability.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`
                              py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 border
                              ${selectedTime === slot.time
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200/50 transform scale-105 ring-2 ring-blue-100'
                                : slot.available
                                  ? 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700'
                                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed decoration-slice opacity-60'}
                            `}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                         <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                         <p className="text-slate-500 font-medium">No slots available for this date.</p>
                         <p className="text-slate-400 text-sm">Please select another day.</p>
                      </div>
                    )}
                    
                    {bookingError && (
                         <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                             <AlertCircle className="w-4 h-4"/> {bookingError}
                         </div>
                    )}

                  </CardContent>
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-end">
                     <Button 
                        onClick={next} 
                        disabled={!canProceedFromStep1}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                     >
                        Continue to Format <ChevronRight className="w-4 h-4 ml-2" />
                     </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 2: Session Format */}
            {step === 2 && (
              <Card className="border-0 shadow-md shadow-slate-200/50 animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Choose Session Format</CardTitle>
                  <CardDescription className="text-slate-500">How would you like to connect with {therapist.name}?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {sessionTypesWithPricing.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedSessionType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedSessionType(type.id)}
                        className={`
                          relative group flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300
                          ${isSelected 
                            ? 'border-blue-600 bg-blue-50/30 shadow-md ring-1 ring-blue-100' 
                            : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm hover:bg-slate-50/50'}
                        `}
                      >
                        <div className={`
                           p-3 rounded-xl flex-shrink-0 transition-colors
                           ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}
                        `}>
                           <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-1">
                              <h3 className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{type.name}</h3>
                              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-sm">₹{type.price}</span>
                           </div>
                           <p className="text-slate-500 text-sm mb-3 leading-relaxed">{type.description}</p>
                           <div className="flex flex-wrap gap-2">
                              {type.features.slice(0, 3).map((f, i) => (
                                 <Badge key={i} variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-normal">
                                    {f}
                                 </Badge>
                              ))}
                           </div>
                        </div>

                        {isSelected && (
                           <div className="absolute top-[-10px] right-[-10px] bg-blue-600 rounded-full p-1 shadow-md animate-in zoom-in duration-200">
                              <CheckCircle className="w-5 h-5 text-white" />
                           </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-between pt-6 mt-2 border-t border-slate-100">
                     <Button variant="outline" onClick={back} className="border-slate-200 text-slate-600">Back</Button>
                     <Button 
                        onClick={next} 
                        disabled={!canProceedFromStep2}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-200"
                     >
                        Continue to Details <ChevronRight className="w-4 h-4 ml-2" />
                     </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <Card className="border-0 shadow-md shadow-slate-200/50 animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader>
                  <CardTitle className="text-xl">Patient Details</CardTitle>
                  <CardDescription>We need a few details to prepare for your session.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                   
                   {/* Personal Info Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                         <input 
                            className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                            placeholder="e.g. John Doe"
                            value={patientFullName}
                            onChange={(e) => setPatientFullName(e.target.value)}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Age</label>
                         <input 
                            className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                            placeholder="e.g. 28"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value)}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                         <input 
                            type="email"
                            className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                            placeholder="john@example.com"
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                         <input 
                            type="tel"
                            className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                            placeholder="+91 98765 43210"
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                         />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Primary Concerns <span className="text-red-500">*</span></label>
                         <textarea 
                            className="flex min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
                            placeholder="Briefly describe what you'd like to discuss or work on..."
                            value={patientConcerns}
                            onChange={(e) => setPatientConcerns(e.target.value)}
                         />
                      </div>
                   </div>

                   {/* Conditional Home Visit Section */}
                   {inHomeSelected && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-6 space-y-4 animate-in slide-in-from-top-2">
                         <div className="flex items-center gap-2 text-amber-900 font-bold border-b border-amber-200 pb-2">
                            <MapPin className="w-5 h-5 text-amber-600" /> Home Visit Required Details
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input className="h-11 rounded-lg border border-amber-200 bg-white px-3 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="Address Line 1 *" value={inHomeAddressLine1} onChange={e=>setInHomeAddressLine1(e.target.value)} />
                             <input className="h-11 rounded-lg border border-amber-200 bg-white px-3 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="City *" value={inHomeCity} onChange={e=>setInHomeCity(e.target.value)} />
                             <input className="h-11 rounded-lg border border-amber-200 bg-white px-3 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="Pincode (6 digits) *" value={inHomePincode} onChange={e=>setInHomePincode(e.target.value)} />
                             <input className="h-11 rounded-lg border border-amber-200 bg-white px-3 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="Contact Person Name" value={inHomeContactName} onChange={e=>setInHomeContactName(e.target.value)} />
                             <input className="md:col-span-2 h-11 rounded-lg border border-amber-200 bg-white px-3 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="Contact Phone at Location *" value={inHomeContactPhone} onChange={e=>setInHomeContactPhone(e.target.value)} />
                         </div>
                         <p className="text-xs text-amber-700 italic">* Therapist will use these details to reach your location.</p>
                      </div>
                   )}
                   
                   {bookingError && (
                         <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                             <AlertCircle className="w-4 h-4"/> {bookingError}
                         </div>
                   )}

                   <div className="flex justify-between pt-6 border-t border-slate-100">
                     <Button variant="outline" onClick={back} className="border-slate-200 text-slate-600">Back</Button>
                     <Button 
                        onClick={next} 
                        disabled={!canProceedFromStep3 || isBooking}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-200 min-w-[160px]"
                     >
                        {isBooking ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div> Creating...</>
                        ) : (
                            <>Proceed to Payment <CreditCard className="w-4 h-4 ml-2" /></>
                        )}
                     </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
               <Card className="border-0 shadow-lg ring-1 ring-slate-200 animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-emerald-400 to-blue-500 w-full" />
                  <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 pt-6">
                     <div className="flex flex-col items-center text-center gap-2">
                        <div className="bg-emerald-100 p-3 rounded-full mb-2">
                           <Shield className="w-8 h-8 text-emerald-600" />
                        </div>
                        <CardTitle className="text-2xl text-slate-900">Secure Payment</CardTitle>
                        <CardDescription className="text-slate-500">
                            Complete your booking securely via Razorpay
                        </CardDescription>
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 text-center space-y-8">
                     
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm mx-auto">
                        <p className="text-slate-500 text-sm mb-1">Total Amount Payable</p>
                        <div className="text-4xl font-bold text-slate-900 flex items-start justify-center gap-1">
                            <span className="text-lg mt-1 font-medium text-slate-400">₹</span>
                            {getSelectedPrice() + 5}
                        </div>
                     </div>

                     {/* Info Alert */}
                     <div className="max-w-md mx-auto bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex items-start gap-3 text-left border border-blue-100">
                        <Sparkles className="w-5 h-5 flex-shrink-0 text-blue-600" />
                        <div>
                           <strong>Almost there!</strong> Your slot with {therapist.name} is reserved for 10 minutes. Complete the payment to confirm your booking.
                        </div>
                     </div>

                     {paymentError && (
                         <div className="max-w-md mx-auto bg-red-50 text-red-700 text-sm p-4 rounded-lg flex items-start gap-3 text-left border border-red-100">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <div>{paymentError}</div>
                         </div>
                     )}

                     <div className="space-y-4">
                        <Button 
                            size="lg" 
                            onClick={handlePayment} 
                            disabled={isProcessingPayment}
                            className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-100 text-lg h-14 rounded-xl transition-all hover:-translate-y-1"
                        >
                            {isProcessingPayment ? (
                                <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div> Processing Payment...</>
                            ) : 'Pay Now Securely'}
                        </Button>
                        
                        <Button variant="ghost" size="sm" onClick={back} disabled={isProcessingPayment} className="text-slate-400 hover:text-slate-600">
                            Go Back / Cancel
                        </Button>
                     </div>
                     
                     {gatewayMode && <p className="text-xs text-slate-300 pt-4">Payment Mode: {gatewayMode}</p>}

                     <div className="flex items-center justify-center gap-4 opacity-50 grayscale pt-4">
                        <CreditCard className="h-6 w-6" />
                        <div className="font-bold text-xs border border-slate-400 rounded px-1">UPI</div>
                        <div className="font-bold text-xs">VISA</div>
                     </div>
                  </CardContent>
               </Card>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky Summary Sidebar - Spans 4 cols */}
          <div className="lg:col-span-4 hidden lg:block">
             <div className="sticky top-28 space-y-4">
                <Card className="border-0 shadow-lg ring-1 ring-slate-200 bg-white overflow-hidden rounded-2xl">
                   <div className="h-1.5 bg-blue-600 w-full" />
                   <CardHeader className="pb-4 pt-5 border-b border-slate-100">
                      <CardTitle className="text-lg flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-600" /> 
                          Booking Summary
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-6 pt-6">
                      
                      {/* Therapist Snapshot */}
                      <div className="flex items-start gap-3">
                         <Avatar className="h-12 w-12 rounded-xl ring-1 ring-slate-100 shadow-sm">
                            <AvatarImage src={therapist.image} />
                            <AvatarFallback>{therapist.name?.[0]}</AvatarFallback>
                         </Avatar>
                         <div>
                            <div className="font-bold text-slate-900 leading-tight">{therapist.name}</div>
                            <div className="text-xs text-slate-500 font-medium mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                                {therapist.title}
                            </div>
                         </div>
                      </div>

                      {/* Selection List */}
                      <div className="space-y-4">
                         <div className="group flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-slate-500 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Calendar className="w-3.5 h-3.5"/></div>
                                Date
                            </span>
                            <span className="font-semibold text-slate-900">{selectedDate ? formatDateShort(selectedDate) : <span className="text-slate-300">--</span>}</span>
                         </div>
                         <div className="group flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-slate-500 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Clock className="w-3.5 h-3.5"/></div>
                                Time
                            </span>
                            <span className="font-semibold text-slate-900">{selectedTime || <span className="text-slate-300">--</span>}</span>
                         </div>
                         <div className="group flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-slate-500 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Video className="w-3.5 h-3.5"/></div>
                                Type
                            </span>
                            <span className="font-semibold text-slate-900 text-right truncate max-w-[120px]">
                                {getSelectedSessionType()?.name || <span className="text-slate-300">--</span>}
                            </span>
                         </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-100">
                         <div className="flex justify-between text-sm text-slate-600">
                            <span>Consultation Fee</span>
                            <span>₹{getSelectedPrice()}</span>
                         </div>
                         <div className="flex justify-between text-sm text-slate-600">
                            <span>Platform Fee</span>
                            <span>₹5</span>
                         </div>
                         <div className="h-px bg-slate-200 my-1" />
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">Total</span>
                            <span className="text-xl font-bold text-blue-700">₹{getSelectedPrice() + 5}</span>
                         </div>
                      </div>
                      
                      {/* Trust Badges */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-2">
                         <div className="flex items-center justify-center gap-1 bg-white border border-slate-100 py-1.5 rounded-md">
                            <Shield className="w-3 h-3" /> SSL Secure
                         </div>
                         <div className="flex items-center justify-center gap-1 bg-white border border-slate-100 py-1.5 rounded-md">
                            <Heart className="w-3 h-3" /> Verified Pro
                         </div>
                      </div>

                   </CardContent>
                </Card>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TherapyBookingEnhanced;