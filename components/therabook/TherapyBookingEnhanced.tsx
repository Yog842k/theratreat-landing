'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/NewAuthContext';
import { bookingService, type BookingData, type AvailabilitySlot } from '@/lib/booking-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import { ArrowLeft, Building, Calendar as CalendarIcon, Calendar, CheckCircle, Clock, CreditCard, Heart, MapPin, Phone, Shield, Star, Timer, Video, AlertCircle, Info } from 'lucide-react';

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
  const { user, token, isAuthenticated, isLoading, refresh } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  // Start with fallback data immediately - don't wait for API
  const [therapist, setTherapist] = useState<any>(mockTherapistFallback);
  const [isLoadingTherapist, setIsLoadingTherapist] = useState(false); // Start as false to show UI immediately
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(true); // Start with fallback
  
  // Use refs to prevent cancellation on re-renders
  const fetchControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef<boolean>(false);
  const currentTherapistIdRef = useRef<string>('');
  const fetchCounterRef = useRef<number>(0);

  // 6-step flow overall
  // 1. Confirm Therapist (separate page - /confirm-therapist)
  // 2. Date & Time (Step 1 in this component)
  // 3. Session Format (Step 2 in this component)
  // 4. Your Details (Step 3 in this component)
  // 5. Payment (Step 4 in this component - integrated)
  // 6. Confirmation (separate page)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Payment state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [gatewayMode, setGatewayMode] = useState<string>('');

  // Patient details (Step 4)
  const [patientFullName, setPatientFullName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientLanguage, setPatientLanguage] = useState('');
  const [patientConcerns, setPatientConcerns] = useState('');
  const [patientEmergency, setPatientEmergency] = useState('');
  const [hasTherapyBefore, setHasTherapyBefore] = useState(false);

  // In-Home visit details (only required when session type is 'home')
  const [inHomeAddressLine1, setInHomeAddressLine1] = useState('');
  const [inHomeAddressLine2, setInHomeAddressLine2] = useState('');
  const [inHomeCity, setInHomeCity] = useState('');
  const [inHomePincode, setInHomePincode] = useState('');
  const [inHomeContactName, setInHomeContactName] = useState('');
  const [inHomeContactPhone, setInHomeContactPhone] = useState('');

  const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);
  const therapistIdValid = isValidObjectId(therapistId);

  const canProceedFromStep1 = useMemo(() => !!(selectedDate && selectedTime), [selectedDate, selectedTime]); // Step 1 is now Date & Time
  const canProceedFromStep2 = useMemo(() => !!selectedSessionType, [selectedSessionType]); // Step 2 is Session Type
  const inHomeSelected = useMemo(() => selectedSessionType === 'home', [selectedSessionType]);
  const canProceedFromStep3 = useMemo(() => {
    const baseOk = !!(patientFullName && patientEmail && patientPhone && patientConcerns);
    if (!inHomeSelected) return baseOk;
    const pinOk = /^\d{6}$/.test(inHomePincode.trim());
    const phoneOk = inHomeContactPhone.trim().length >= 10;
    return baseOk && !!(inHomeAddressLine1 && inHomeCity) && pinOk && phoneOk;
  }, [patientFullName, patientEmail, patientPhone, patientConcerns, inHomeSelected, inHomeAddressLine1, inHomeCity, inHomePincode, inHomeContactPhone]); // Step 3 is Details
  const canProceedFromStep4 = useMemo(() => !!bookingId, [bookingId]); // Step 4 is Payment - requires booking to be created
  const canBook = useMemo(() => (
    !!(therapistIdValid && selectedSessionType && selectedDate && selectedTime && canProceedFromStep3)
  ), [therapistIdValid, selectedSessionType, selectedDate, selectedTime, canProceedFromStep3]);

  useEffect(() => {
    // Skip if therapist ID is invalid
    if (!therapistIdValid) {
      return;
    }
    
    // Skip if we've already loaded this therapist (prevents duplicate fetches)
    if (hasLoadedRef.current && currentTherapistIdRef.current === therapistId) {
      console.log('[Frontend] Therapist already loaded, skipping fetch');
      return;
    }
    
    // Increment fetch counter to track the latest fetch
    fetchCounterRef.current += 1;
    const thisFetchId = fetchCounterRef.current;
    
    // Capture therapistId at the time of effect execution (for cleanup closure)
    const capturedTherapistId = therapistId;
    
    // Cancel any previous fetch ONLY if therapist ID changed (not on re-renders)
    if (fetchControllerRef.current && currentTherapistIdRef.current !== capturedTherapistId) {
      console.log('[Frontend] Cancelling previous fetch for different therapist');
      fetchControllerRef.current.abort();
      fetchControllerRef.current = null;
    }
    
    // Don't create new fetch if one is already in progress for the same therapist
    // (This handles React Strict Mode double-rendering)
    if (fetchControllerRef.current && currentTherapistIdRef.current === capturedTherapistId) {
      console.log('[Frontend] Fetch already in progress for this therapist, skipping duplicate');
      return;
    }
    
    // Create new abort controller for this fetch
    const abortController = new AbortController();
    fetchControllerRef.current = abortController;
    currentTherapistIdRef.current = capturedTherapistId;
    hasLoadedRef.current = false; // Reset loaded flag for new fetch
    
    let isMounted = true;
    
    async function loadTherapist() {
      try {
        console.log('[Frontend] 🚀 Starting fetch for therapist:', capturedTherapistId);
        
        // Make the API call - only abort if component actually unmounts
        const res = await fetch(`/api/therapists/${capturedTherapistId}`, {
          cache: 'no-store',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Check if request was aborted or this fetch is no longer the latest
        if (abortController.signal.aborted || thisFetchId !== fetchCounterRef.current) {
          console.log('[Frontend] Request was aborted or superseded by newer fetch, ignoring response');
          return;
        }
        
        if (!isMounted) {
          console.log('[Frontend] Component unmounted, ignoring response');
          return;
        }
        
        console.log('[Frontend] ✅ Response received:', { ok: res.ok, status: res.status });
        
        // Handle non-OK responses
        if (!res.ok) {
          if (res.status === 503) {
            console.log('[Frontend] Service unavailable (503), using fallback');
            return; // Keep fallback data
          }
          
          // Try to parse error
          let errorData: any = {};
          try {
            errorData = await res.json().catch(() => ({}));
          } catch {
            return; // Keep fallback data
          }
          
          // Check if it's a database error
          const isDbError = 
            errorData?.error?.includes('Database') || 
            errorData?.error?.includes('MongoDB') || 
            errorData?.error?.includes('connect') ||
            errorData?.error?.includes('unavailable') ||
            errorData?.message?.includes('Database') ||
            errorData?.message?.includes('database') ||
            errorData?.message?.includes('unavailable') ||
            (errorData?.success === false && errorData?.error === 'Database connection unavailable');
          
          if (isDbError) {
            console.log('[Frontend] Database error detected, using fallback');
            return; // Keep fallback data
          }
          
          console.warn('[Frontend] API error (non-database):', errorData);
          return; // Keep fallback data
        }
        
        // Parse successful response
        let data: any = {};
        try {
          const text = await res.text();
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('[Frontend] Failed to parse response:', parseError);
          return;
        }
        
        // Check if request was aborted or component unmounted
        if (abortController.signal.aborted || !isMounted) {
          console.log('[Frontend] Request aborted or component unmounted during parsing');
          return;
        }
        
        // Check if therapist ID has changed (don't update if it has)
        if (currentTherapistIdRef.current !== capturedTherapistId) {
          console.log('[Frontend] Therapist ID changed, ignoring response');
          return;
        }
        
        console.log('[Frontend] 📦 Parsed data:', { 
          success: data?.success, 
          hasTherapist: !!data?.therapist,
          therapistName: data?.therapist?.displayName || data?.therapist?.name 
        });
        
        // Process successful response - update state if therapist ID still matches
        if (data?.success === true && data?.therapist) {
          const t = data.therapist;
          if (t && isMounted && !abortController.signal.aborted && currentTherapistIdRef.current === capturedTherapistId) {
            console.log('[Frontend] ✅ Updating therapist state:', { 
              name: t.displayName || t.name, 
              id: t._id,
              fetchId: thisFetchId,
              currentCounter: fetchCounterRef.current
            });
            
            // Update state - React will handle re-rendering
            setTherapist({
              name: t.displayName || t.name || 'Therapist',
              title: t.title || t.specializations?.[0] || 'Licensed Therapist',
              price: t.consultationFee || t.price || 0,
              image: t.photo || t.image || t.profilePhotoUrl || '/api/placeholder/100/100',
              rating: t.rating || 0,
              reviews: t.reviewsCount || t.reviewCount || t.totalReviews || 0,
              location: t.location || '',
              nextAvailable: ''
            });
            
            setIsUsingFallbackData(false);
            hasLoadedRef.current = true;
            console.log('[Frontend] ✅ Therapist state updated successfully!');
            return;
          } else {
            console.warn('[Frontend] ⚠️ Skipping state update:', {
              hasT: !!t,
              isMounted,
              aborted: abortController.signal.aborted,
              idMatch: currentTherapistIdRef.current === capturedTherapistId
            });
          }
        }
        
        // Fallback: try to extract therapist from any response format
        const t = data?.data?.therapist || data?.therapist;
        if (t && isMounted && !abortController.signal.aborted && currentTherapistIdRef.current === capturedTherapistId) {
          console.log('[Frontend] ⚠️ Using fallback extraction path');
          setTherapist({
            name: t.displayName || t.name || 'Therapist',
            title: t.title || t.specializations?.[0] || 'Licensed Therapist',
            price: t.consultationFee || t.price || 0,
            image: t.photo || t.image || t.profilePhotoUrl || '/api/placeholder/100/100',
            rating: t.rating || 0,
            reviews: t.reviewsCount || t.reviewCount || t.totalReviews || 0,
            location: t.location || '',
            nextAvailable: ''
          });
          setIsUsingFallbackData(false);
          hasLoadedRef.current = true;
          console.log('[Frontend] ✅ Therapist state updated (fallback path)');
        } else {
          console.warn('[Frontend] ⚠️ No therapist data found or conditions not met:', {
            hasT: !!t,
            isMounted,
            aborted: abortController.signal.aborted,
            idMatch: currentTherapistIdRef.current === capturedTherapistId,
            data: data
          });
        }
      } catch (e: any) {
        // Only log if not aborted (aborted is expected when component unmounts)
        if (e?.name === 'AbortError') {
          console.log('[Frontend] Request aborted (expected on unmount/ID change)');
          return;
        }
        console.error('[Frontend] ❌ Error loading therapist:', e?.message || e);
      }
    }
    
    // Load therapist
    loadTherapist();
    
    // Cleanup: only abort if this fetch is no longer the latest one
    // This handles both therapist ID changes and React Strict Mode double-rendering
    return () => {
      isMounted = false;
      
      // Only abort if this fetch is superseded by a newer one or therapist ID changed
      const isSuperseded = thisFetchId !== fetchCounterRef.current;
      const therapistChanged = currentTherapistIdRef.current !== capturedTherapistId;
      
      if (isSuperseded || therapistChanged) {
        // This fetch is no longer needed - abort it
        if (fetchControllerRef.current === abortController) {
          console.log('[Frontend] Cleanup: aborting superseded fetch');
          abortController.abort();
          // Only clear if this is still the current one (not replaced)
          if (fetchControllerRef.current === abortController) {
            fetchControllerRef.current = null;
          }
        }
      } else {
        console.log('[Frontend] Cleanup: keeping fetch (still latest)');
      }
    };
  }, [therapistId, therapistIdValid]);

  useEffect(() => {
    if (!selectedDate || !therapistIdValid) {
      setAvailability([]);
      return;
    }
    
    // Debounce availability loading to prevent excessive API calls
    const timeoutId = setTimeout(() => {
      loadAvailability();
    }, 300); // 300ms debounce delay
    
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, therapistIdValid]);

  const loadAvailability = async () => {
    if (!selectedDate || !therapistIdValid) {
      setAvailability([]);
      return;
    }
    
    setIsLoadingAvailability(true);
    setBookingError(null);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await bookingService.getTherapistAvailability(therapistId, {
        date: dateString
      });
      setAvailability(response.availability as AvailabilitySlot[]);
    } catch (error: any) {
      // Use mock slots as fallback - don't show error for connection issues
      const errorMsg = error?.message || String(error) || '';
      const isDbError = errorMsg.includes('MongoDB') || 
                       errorMsg.includes('connect') || 
                       errorMsg.includes('Database') ||
                       errorMsg.includes('database');
      
      if (!isDbError) {
        console.error('Failed to load availability:', error);
        setBookingError('Unable to load availability. Please try again.');
      }
      
      // Fallback: Show all default slots as available (no random blocking!)
      // Only actual bookings should block slots
      const fallbackSlots = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '12:00', available: true },
        { time: '13:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
        { time: '17:00', available: true },
        { time: '18:00', available: true }
      ];
      setAvailability(fallbackSlots);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const getSelectedSessionType = () => sessionTypes.find((type) => type.id === selectedSessionType);
  const getSelectedPrice = () => {
    const st = getSelectedSessionType();
    if (st) {
      return st.price;
    }
    // If no session type selected, show therapist's consultation fee if available
    // Otherwise, show the minimum price from available session types (starting price)
    if (therapist.price && therapist.price > 0) {
      return therapist.price;
    }
    // Return minimum session type price as starting price
    const minPrice = Math.min(...sessionTypes.map(type => type.price));
    return minPrice;
  };

  const next = () => {
    if (step === 3 && canBook) {
      // Step 3 → Step 4: Create booking first, then proceed to payment
      handleCreateBooking();
    } else {
      setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
    }
  };
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));

  // Create booking before payment step with enhanced error handling and retry logic
  const handleCreateBooking = async (retryCount = 0): Promise<void> => {
    if (!canBook || !selectedDate) return;
    
    // Enhanced authentication check with detailed logging
    if (!isAuthenticated || !user) {
      console.error('[Booking] ❌ Authentication check failed', {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!token,
        isLoading
      });
      setBookingError('Please log in to book a session');
      return;
    }
    
    // Validate token exists - try to get from storage as fallback
    let finalToken = token;
    if (!finalToken) {
      console.warn('[Booking] ⚠️ Token missing from context, checking localStorage...');
      try {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (storedToken) {
          console.log('[Booking] ✅ Found token in storage');
          finalToken = storedToken;
        } else {
          console.error('[Booking] ❌ Token not found in storage either', {
            isAuthenticated,
            hasUser: !!user,
            userId: user?._id,
            userEmail: user?.email,
            isLoading,
            localStorageToken: !!localStorage.getItem('token'),
            sessionStorageToken: !!sessionStorage.getItem('token')
          });
          setBookingError('Authentication token is missing. Please log in again.');
          toast.error("Authentication required", { 
            description: "Please log in to continue booking",
            action: {
              label: "Go to Login",
              onClick: () => router.push('/therabook/login')
            }
          });
          return;
        }
      } catch (storageError) {
        console.error('[Booking] ❌ Error accessing storage:', storageError);
        setBookingError('Unable to access authentication. Please log in again.');
        toast.error("Authentication error", { description: "Please log in to continue" });
        return;
      }
    }
    
    setIsBooking(true);
    setBookingError(null);
    
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second
    
    try {
      // Log booking attempt with structured data (excluding token for security)
      console.log('[Booking] Creating booking attempt', {
        attempt: retryCount + 1,
        therapistId,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        sessionType: selectedSessionType,
        userId: user._id,
        userEmail: user.email,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        timestamp: new Date().toISOString()
      });

      const patientDetails: any = {
        fullName: patientFullName,
        email: patientEmail,
        phone: patientPhone,
        age: patientAge,
        language: patientLanguage,
        concerns: patientConcerns,
        emergencyContact: patientEmergency,
        hasTherapyBefore
      };

      if (inHomeSelected) {
        patientDetails.inHomeService = {
          addressLine1: inHomeAddressLine1,
          addressLine2: inHomeAddressLine2,
          city: inHomeCity,
          pincode: inHomePincode,
          contactName: inHomeContactName,
          contactPhone: inHomeContactPhone
        };
      }

      const bookingData: BookingData = {
        therapistId: therapistId,
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: selectedTime,
        sessionType: selectedSessionType,
        notes: JSON.stringify(patientDetails)
      };

      let booking;
      let newBookingId: string;
      
      // Use finalToken (from context or storage fallback)
      if (!finalToken) {
        throw new Error('Authentication token is missing. Please log in again.');
      }
      
      try {
        console.log('[Booking] 📤 Sending booking request', {
          hasToken: !!finalToken,
          tokenSource: finalToken === token ? 'context' : 'storage',
          tokenPrefix: finalToken?.substring(0, 20) + '...',
          bookingData: {
            therapistId: bookingData.therapistId,
            appointmentDate: bookingData.appointmentDate,
            appointmentTime: bookingData.appointmentTime,
            sessionType: bookingData.sessionType
          }
        });
        
        booking = await bookingService.createBooking(bookingData, finalToken);
        newBookingId = (booking as any)?._id || (booking as any)?.bookingId || 'unknown';
        
        console.log('[Booking] ✅ Booking created successfully', {
          bookingId: newBookingId,
          booking: booking,
          timestamp: new Date().toISOString()
        });
      } catch (bookingError: any) {
        // Enhanced error logging
        const errorDetails = {
          error: bookingError,
          message: bookingError?.message || 'Unknown error',
          response: bookingError?.response,
          status: bookingError?.status,
          statusText: bookingError?.statusText,
          data: bookingError?.data,
          stack: bookingError?.stack
        };
        
        console.error('[Booking] ❌ Booking creation failed', errorDetails);
        
        // Retry logic for network errors or transient failures
        const isRetryableError = 
          bookingError?.message?.includes('network') ||
          bookingError?.message?.includes('timeout') ||
          bookingError?.message?.includes('fetch') ||
          bookingError?.status === 500 ||
          bookingError?.status === 503 ||
          bookingError?.status === 502 ||
          !bookingError?.status; // Network errors often don't have status
        
        if (isRetryableError && retryCount < maxRetries) {
          console.log(`[Booking] 🔄 Retrying booking creation (${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
          return handleCreateBooking(retryCount + 1);
        }
        
        // Provide user-friendly error messages
        let userMessage = 'Failed to create booking';
        if (bookingError?.message?.includes('already booked') || bookingError?.message?.includes('duplicate')) {
          userMessage = 'This time slot is already booked. Please select another time.';
        } else if (bookingError?.message?.includes('network') || bookingError?.message?.includes('timeout')) {
          userMessage = 'Network error. Please check your connection and try again.';
        } else if (bookingError?.status === 401 || bookingError?.status === 403 || bookingError?.message?.includes('Unauthorized') || bookingError?.message?.includes('Authentication failed')) {
          userMessage = 'Your session has expired. Please log in again to continue booking.';
          // Clear potentially invalid token and redirect to login
          console.warn('[Booking] ⚠️ Authentication failed - token may be expired or invalid', {
            hasToken: !!finalToken,
            tokenLength: finalToken?.length || 0,
            error: bookingError?.message,
            status: bookingError?.status
          });
          
          // Clear auth state
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          } catch (e) {
            console.warn('[Booking] Could not clear auth storage:', e);
          }
          
          // Don't retry on auth errors - they won't succeed
          setBookingError(userMessage);
          toast.error("Session Expired", { 
            description: "Please log in again to continue booking",
            duration: 5000,
            action: {
              label: "Go to Login",
              onClick: () => {
                router.push('/therabook/login?redirect=' + encodeURIComponent(window.location.pathname));
              }
            }
          });
          
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/therabook/login?redirect=' + encodeURIComponent(window.location.pathname));
          }, 2000);
          
          throw bookingError;
        } else if (bookingError?.status === 400) {
          userMessage = bookingError?.message || 'Invalid booking data. Please check your selections.';
        } else if (bookingError?.message) {
          userMessage = bookingError.message;
        }
        
        setBookingError(userMessage);
        throw bookingError;
      }
      
      setBookingId(newBookingId);
      setBookingError(null); // Clear any previous errors
      
      // Check if user should skip payment (for specific emails)
      const allowedEmails = ['sachinparihar10@gmail.com'];
      const userEmail = user?.email || patientEmail || '';
      const shouldSkipPayment = allowedEmails.includes(userEmail.toLowerCase());
      
      if (shouldSkipPayment) {
        console.log('[Booking] ⏭️ Skipping payment for allowed email');
        // Mark booking as paid and redirect to confirmation
        try {
          // Update booking payment status to paid (this will automatically set status to 'confirmed')
          const updateResponse = await fetch(`/api/bookings/${newBookingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ 
              paymentStatus: 'paid'
            })
          });
          
          if (!updateResponse.ok) {
            const errorData = await updateResponse.json().catch(() => ({}));
            console.warn('[Booking] ⚠️ Payment status update response:', {
              status: updateResponse.status,
              error: errorData,
              bookingId: newBookingId
            });
      } else {
            console.log('[Booking] ✅ Payment status updated to paid');
          }
          
          // Redirect directly to confirmation
          router.push(`/therabook/therapists/${therapistId}/book/confirmation?bookingId=${newBookingId}`);
          return;
        } catch (updateError) {
          console.error('[Booking] ❌ Failed to update booking payment status:', {
            error: updateError,
            bookingId: newBookingId
          });
          // Still redirect to confirmation even if update fails
          router.push(`/therabook/therapists/${therapistId}/book/confirmation?bookingId=${newBookingId}`);
          return;
        }
      }
      
      // Load gateway config for normal payment flow
      fetch('/api/payments/razorpay/config').then(async r => {
        const json = await r.json().catch(() => null);
        const mode = json?.data?.mode || json?.mode;
        if (mode) {
          setGatewayMode(mode);
          console.log('[Booking] ✅ Payment gateway mode loaded:', mode);
        }
      }).catch((err) => {
        console.warn('[Booking] ⚠️ Failed to load payment gateway config:', err);
      });
      
      // Move to payment step
      setStep(4);
      console.log('[Booking] ✅ Booking flow completed, moved to payment step');
    } catch (error: any) {
      // Final error handling with detailed logging
      const errorLog = {
        error,
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        retryCount,
        timestamp: new Date().toISOString()
      };
      
      console.error('[Booking] ❌ Final booking error:', errorLog);
      
      // Don't set error if it's already been set (from retry logic)
      if (!bookingError) {
        setBookingError(error?.message || 'Failed to create booking. Please try again.');
      }
    } finally {
      setIsBooking(false);
    }
  };

  // Load Razorpay script
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

  // Handle payment
  const handlePayment = async () => {
    if (!bookingId) return;
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      // Create order on server
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
        const code = parsed?.code;
        const serverMsg = parsed?.message || parsed?.error || text || 'Failed to initialize payment';
        let friendly = serverMsg;
        if (code === 'RAZORPAY_NO_CREDENTIALS') {
          friendly = 'Payment gateway not configured. Please contact support.';
        } else if (code === 'RAZORPAY_PREFIX_MISMATCH') {
          friendly = serverMsg + ' (Key ID prefix mismatch)';
        } else if (code === 'RAZORPAY_WEAK_SECRET') {
          friendly = 'Payment gateway configuration error. Please contact support.';
        } else if (code === 'RAZORPAY_AUTH') {
          friendly = 'Gateway authentication failed. Please contact support.';
        }
        throw new Error(`[${code || 'ERR'}] ${friendly}`);
      }
      const { data } = parsed || {};
      const { order, keyId, simulated } = data || {};
      if (!order?.id || !keyId) throw new Error('Invalid order response');

      // If server is running in fake mode, bypass Razorpay and auto-verify
      if (simulated) {
        try {
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              bookingId,
              razorpay_payment_id: 'pay_FAKE',
              razorpay_order_id: order.id,
              razorpay_signature: 'sig_FAKE',
            })
          });
          if (!verifyRes.ok) throw new Error('Verification failed');
          router.push(`/therabook/therapists/${therapistId}/book/confirmation?bookingId=${bookingId}`);
          return;
        } catch (e) {
          console.error(e);
          setPaymentError('Payment verification failed (simulated). Please contact support.');
          setIsProcessingPayment(false);
          return;
        }
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

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
        },
        notes: { bookingId },
        handler: async function (response: any) {
          try {
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
            if (!verifyRes.ok) throw new Error('Verification failed');
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
      console.error('handlePayment error:', e);
      const msg = e?.message || '';
      if (/Failed to fetch|NetworkError/i.test(msg)) {
        setPaymentError('Could not reach the server. Please check your connection and try again.');
      } else {
        setPaymentError(msg || 'Payment failed. Please try again.');
      }
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

  const userRole = (user?.userType || '').toLowerCase();
  const isEndUser = userRole === 'user' || userRole === 'patient' || userRole === 'client';

  // Memoize StepHeader before any conditional returns (Rules of Hooks)
  const StepHeader = React.useMemo(() => {
    const stepLabels = ['Date & Time', 'Session Format', 'Your Details', 'Payment'];
    const stepText = stepLabels[step - 1];
    return (
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <Link href={`/therabook/therapists/${therapistId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-xl text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Profile</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-blue-100 flex-shrink-0">
                <AvatarImage src={therapist.image} alt={therapist.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm">
                  {String(therapist.name || '')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left sm:text-right min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{therapist.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{therapist.title}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{stepText}</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">Step {step + 1} of 6</Badge>
            </div>
            {/* 6-step indicators - responsive */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 mt-3 sm:mt-4">
              {['Confirm Therapist', ...stepLabels, 'Confirmation'].map((label, idx) => {
                const s = idx + 1;
                const active = s <= (step + 1); // step + 1 because step 1 is on separate page
                return (
                  <div key={label} className="flex flex-col items-center">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs sm:text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300'}`}>{s}</div>
                    <div className={`text-[10px] sm:text-xs mt-1 sm:mt-2 text-center leading-tight ${active ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
                      <span className="hidden sm:inline">{label}</span>
                      <span className="sm:hidden">{label.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }, [step, therapist, therapistId]);

  // Loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-600 text-sm sm:text-lg">Loading your session...</p>
        </div>
      </div>
    );
  }
  
  // Don't block UI for therapist loading - show immediately with fallback data

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

  // If logged in as therapist/admin/clinic-owner (non end-user), block booking creation and guide
  if (isAuthenticated && user && !isEndUser) {
    const isClinicOwner = userRole === 'clinic-owner';
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Bookings are for end users</h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {isClinicOwner 
                ? "You are logged in as a clinic owner. Clinic accounts cannot book therapy sessions. Please use a patient account to book sessions."
                : <>You are logged in as <span className="font-semibold">{userRole}</span>. Only end users (patients) can create bookings.</>}
            </p>
            <div className="space-y-4">
              {isClinicOwner ? (
                <Link href="/clinics/dashboard">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Go to Clinic Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/logout">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Switch Account
                  </Button>
                </Link>
              )}
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
      {StepHeader}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
        {/* Info Banner for Fallback Data */}
        {isUsingFallbackData && (
          <div className="mb-4 sm:mb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">Demo Mode</h4>
                  <p className="text-xs sm:text-sm text-amber-800">
                    We're using demo therapist data. Your booking will still be processed, but some details may be limited.
                  </p>
              </div>
            </div>
          </div>
            </div>
        )}
        
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Date & Time */}
            {step === 1 && (
              <>
                {/* Date Selection (Improved) */}
                <Card className="shadow-xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-4 sm:pb-6 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-2xl">Select Date</CardTitle>
                          <CardDescription className="text-xs sm:text-base">Choose your preferred date</CardDescription>
                        </div>
                      </div>
                      {selectedDate && (
                        <div className="text-xs sm:text-sm text-blue-700 font-medium bg-blue-50 border border-blue-200 rounded-full px-2 sm:px-3 py-1 w-full sm:w-auto text-center sm:text-left">
                          {formatDateShort(selectedDate)}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Quick Picks */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedDate(new Date())}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedDate(new Date(Date.now() + 24*60*60*1000))}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedDate(new Date(Date.now() + 7*24*60*60*1000))}
                      >
                        Next Week
                      </button>
                    </div>

                    {/* Inline Calendar */}
                      <div className="rounded-xl sm:rounded-2xl border border-gray-100 p-2 sm:p-3 lg:p-4">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Select session date"
                            value={selectedDate}
                            onChange={(newValue: Date | null) => setSelectedDate(newValue ?? undefined)}
                            disablePast
                            enableAccessibleFieldDOMStructure={false}
                            slots={{ textField: TextField }}
                          />
                        </LocalizationProvider>
                      </div>

                    <p className="text-xs text-gray-500">Select a date to view available time slots below.</p>
                  </CardContent>
                </Card>

                {/* Time Selection */}
                <Card className="shadow-xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-4 sm:pb-6 p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      Select Time Slot
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-lg mt-1">
                      {selectedDate ? `Available time slots for ${formatDateShort(selectedDate)}` : 'Select a date to see time slots'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {isLoadingAvailability ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                        <p className="text-gray-600 text-sm sm:text-base">Loading available times...</p>
                      </div>
                    ) : availability.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {availability.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl text-center transition-all duration-300 text-sm sm:text-base ${
                              selectedTime === slot.time
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                                : slot.available
                                ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:scale-95'
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="font-semibold flex items-center justify-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              {slot.time}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-gray-600 mb-2 sm:mb-4 text-sm sm:text-base">No available time slots for this date</p>
                        <p className="text-xs sm:text-sm text-gray-500">Please select a different date</p>
                      </div>
                    )}
                    {bookingError && 
                     !bookingError.includes('MongoDB') && 
                     !bookingError.includes('connect') && 
                     !bookingError.includes('Database') &&
                     !bookingError.includes('database') && (
                      <div className="mt-4 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-red-800 text-xs sm:text-sm font-medium">{bookingError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-4">
                      <Link href={`/therabook/therapists/${therapistId}/book/confirm-therapist`}>
                        <Button variant="outline" size="sm" className="rounded-xl sm:rounded-2xl px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base">Back</Button>
                      </Link>
                      <Button onClick={next} disabled={!canProceedFromStep1} size="sm" className="rounded-xl sm:rounded-2xl px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base">Continue</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Step 2: Session Format */}
            {step === 2 && (
              <Card className="shadow-xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 pb-4 sm:pb-6 p-4 sm:p-6 text-center">
                  <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Session Format
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-2">Choose how you'd like to connect</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 grid md:grid-cols-2 gap-3 sm:gap-4">
                  {sessionTypes.map((type) => {
                    const Icon = type.icon; 
                    const selected = selectedSessionType === type.id;
                    return (
                      <div 
                        key={type.id} 
                        onClick={() => setSelectedSessionType(type.id)} 
                        className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          selected 
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02] ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md active:scale-[0.98]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                            selected ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-md' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${selected ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-sm sm:text-base text-gray-900">{type.name}</h4>
                                  {type.popular && (
                                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] px-1.5 py-0">
                                      Popular
                                    </Badge>
                                  )}
                              </div>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{type.description}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold text-base sm:text-lg text-blue-700">₹{type.price}</div>
                                <div className="text-xs text-gray-500">{type.duration}</div>
                              </div>
                            </div>
                            {selected && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <div className="flex flex-wrap gap-1.5">
                                  {type.features?.map((feature, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-white border-blue-200 text-blue-700">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="md:col-span-2 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-2 sm:pt-4">
                    <Button variant="outline" onClick={back} className="rounded-xl sm:rounded-2xl px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base border-2 hover:bg-gray-50 transition-all">
                      Previous
                    </Button>
                    <Button 
                      onClick={next} 
                      disabled={!canProceedFromStep2}
                      className="rounded-xl sm:rounded-2xl px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Your Details */}
            {step === 3 && (
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

                  {/* In-Home fields only when 'Home' is selected */}
                  {inHomeSelected && (
                    <div className="mt-6 p-4 border rounded-2xl bg-orange-50 border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">Home Visit Address & Contact</h4>
                      <p className="text-sm text-orange-700 mb-4">Please provide the address and contact details for the home visit.</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Address Line 1 *</label>
                          <input className="mt-1 w-full border rounded-lg h-10 px-3" value={inHomeAddressLine1} onChange={(e)=>setInHomeAddressLine1(e.target.value)} placeholder="House/Flat, Street" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Address Line 2</label>
                          <input className="mt-1 w-full border rounded-lg h-10 px-3" value={inHomeAddressLine2} onChange={(e)=>setInHomeAddressLine2(e.target.value)} placeholder="Landmark, Area (optional)" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">City *</label>
                          <input className="mt-1 w-full border rounded-lg h-10 px-3" value={inHomeCity} onChange={(e)=>setInHomeCity(e.target.value)} placeholder="City" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Pincode *</label>
                          <input className="mt-1 w-full border rounded-lg h-10 px-3" value={inHomePincode} onChange={(e)=>{
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0,6);
                            setInHomePincode(val);
                          }} inputMode="numeric" placeholder="6-digit pincode" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">On-site Contact Name</label>
                          <input className="mt-1 w-full border rounded-lg h-10 px-3" value={inHomeContactName} onChange={(e)=>setInHomeContactName(e.target.value)} placeholder="Person at the location" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">On-site Contact Phone *</label>
                          <input className="mt-1 w-full border rounded-lg h-10 px-3" value={inHomeContactPhone} onChange={(e)=>{
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0,13);
                            setInHomeContactPhone(val);
                          }} inputMode="tel" placeholder="10+ digit phone" />
                        </div>
                      </div>
                      {/* Simple guidance/errors */}
                      {!canProceedFromStep4 && (
                        <p className="text-xs text-red-700 mt-3">Please complete all required fields for home visit (Address Line 1, City, 6-digit Pincode, and Contact Phone).</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between gap-4 mt-6">
                    <Button variant="outline" onClick={back}>Previous</Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={!canBook || isBooking}
                      onClick={next}
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
                  {bookingError && 
                   !bookingError.includes('MongoDB') && 
                   !bookingError.includes('connect') && 
                   !bookingError.includes('Database') &&
                   !bookingError.includes('database') && (
                    <div className="mt-4 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-800 text-xs sm:text-sm font-medium">{bookingError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment */}
            {step === 4 && bookingId && (
              <Card className="shadow-xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-4 sm:pb-6 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-2xl">Secure Payment</CardTitle>
                      <CardDescription className="text-xs sm:text-base">Complete your booking with secure payment</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {paymentError && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-800 text-sm font-medium">{paymentError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Secure Payment Gateway</h4>
                        <p className="text-sm text-blue-800">
                          Your payment is processed securely through Razorpay. We never store your card details.
                        </p>
                      </div>
                    </div>
                  </div>

                  {gatewayMode && (
                    <div className="text-xs text-gray-500 text-center">
                      Payment mode: <span className="font-medium">{gatewayMode}</span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <Button variant="outline" onClick={back} disabled={isProcessingPayment}>
                      Previous
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isProcessingPayment}
                      onClick={handlePayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-3" />
                          Pay Securely
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-32 shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4 sm:pb-6 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-2xl">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Therapist Info */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-white flex-shrink-0">
                    <AvatarImage src={therapist.image} alt={therapist.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm sm:text-lg">
                      {String(therapist.name || '')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-base sm:text-lg truncate">{therapist.name}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{therapist.title}</p>
                    {(therapist as any).rating ? (
                      <div className="flex items-center mt-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                        <span className="ml-1 text-xs sm:text-sm font-medium">{(therapist as any).rating}</span>
                        {(therapist as any).reviews ? (
                          <span className="ml-1 text-xs sm:text-sm text-gray-500">({(therapist as any).reviews})</span>
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

                {/* Home visit summary */}
                {inHomeSelected && (
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                    <h5 className="font-semibold text-orange-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Home Visit Address
                    </h5>
                    <div className="text-orange-800 text-sm">
                      <div>{inHomeAddressLine1 || '—'}</div>
                      {inHomeAddressLine2 ? <div>{inHomeAddressLine2}</div> : null}
                      <div>{[inHomeCity, inHomePincode].filter(Boolean).join(' - ') || '—'}</div>
                      {inHomeContactPhone ? (
                        <div className="mt-1">Contact: {inHomeContactName ? `${inHomeContactName} • ` : ''}{inHomeContactPhone}</div>
                      ) : null}
                    </div>
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
                    className="w-full mt-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={!bookingId || isProcessingPayment}
                    onClick={handlePayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-3" />
                        Pay Securely
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
