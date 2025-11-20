'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ReactSelect from 'react-select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Heart, 
  Shield, 
  CheckCircle, 
  Upload,
  ArrowLeft,
  ArrowRight,
  Sunrise,
  Sun,
  Moon,
  Calendar,
  Check,
  Loader2,
  Phone,
  Mail,
  Lock,
  Image as ImageIcon,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const INDIA_STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

interface OnboardingData {
  fullName: string;
  profilePhoto?: File;
  profileImageUrl?: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  phoneNumber: string;
  emailId: string;
  password: string;
  confirmPassword: string;
  preferredLanguage: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  seekingTherapy: string;
  preferredTherapistGender: string;
  preferredTimeSlots: string[];
  previousTherapyExperience: string;
  reasonForTherapy: string;
  currentMedications: string;
  diagnosedConditions: string;
  medicalReports?: FileList | File[];
  disabilitySupport: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  relationshipToYou: string;
  smsEmailConsent: boolean;
  termsAccepted: boolean;
  informationAccurate: boolean;
  responsibleUse: boolean;
  emergencyDisclaimer: boolean;
}

const steps = [
  { id: 1, title: 'Personal Details', percentage: 20, icon: User },
  { id: 2, title: 'Location & Preferences', percentage: 40, icon: MapPin },
  { id: 3, title: 'Health Information', percentage: 60, icon: Heart },
  { id: 4, title: 'Emergency Contact', percentage: 80, icon: Shield },
  { id: 5, title: 'Legal Consents', percentage: 100, icon: CheckCircle }
];

const preferredLanguageOptions = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'odia', label: 'Odia' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'punjabi', label: 'Punjabi' }
];

const timeSlotOptions = [
  { value: 'Morning', icon: Sunrise, hint: '6 AM – 11 AM', color: 'from-amber-400 to-orange-500' },
  { value: 'Afternoon', icon: Sun, hint: '11 AM – 4 PM', color: 'from-yellow-400 to-amber-500' },
  { value: 'Evening', icon: Moon, hint: '4 PM – 9 PM', color: 'from-indigo-400 to-purple-500' },
  { value: 'Weekends', icon: Calendar, hint: 'Sat & Sun', color: 'from-emerald-400 to-teal-500' }
];

// Custom Select Styles (Blue accent)
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? '#2563eb' : '#e5e7eb', // blue-600
    boxShadow: state.isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#2563eb'
    },
    borderRadius: '0.75rem',
    padding: '0.25rem',
    transition: 'all 0.2s'
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#e0e7ff' : 'white', // blue-600, blue-100
    color: state.isSelected ? 'white' : '#111827',
    '&:active': {
      backgroundColor: '#2563eb'
    }
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#2563eb', // blue-600 for selected value
    fontWeight: 500
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: 220,
    overflowY: 'auto'
  })
};

export default function PatientOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    phoneNumber: '',
    emailId: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
    seekingTherapy: '',
    preferredTherapistGender: '',
    preferredTimeSlots: [],
    previousTherapyExperience: '',
    reasonForTherapy: '',
    currentMedications: '',
    diagnosedConditions: '',
    disabilitySupport: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    relationshipToYou: '',
    smsEmailConsent: false,
    termsAccepted: false,
    informationAccurate: false,
    responsibleUse: false,
    emergencyDisclaimer: false
  });

  const [otpCode, setOtpCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpInfo, setOtpInfo] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [resendSeconds, setResendSeconds] = useState<number>(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'dateOfBirth' && value) {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        newData.age = age.toString();
      }
      return newData;
    });
  };

  const handleTimeSlotToggle = (slot: string) => {
    setData(prev => ({
      ...prev,
      preferredTimeSlots: prev.preferredTimeSlots.includes(slot)
        ? prev.preferredTimeSlots.filter(s => s !== slot)
        : [...prev.preferredTimeSlots, slot]
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, fieldName: 'profilePhoto' | 'medicalReports') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      if (fieldName === 'profilePhoto') {
        const file = files[0];
        if (file.size > 2 * 1024 * 1024) {
          setError('Profile photo must be less than 2MB');
          return;
        }
        if (!file.type.startsWith('image/')) {
          setError('Profile photo must be an image file');
          return;
        }
        updateData('profilePhoto', file);
      } else if (fieldName === 'medicalReports') {
        const validFiles = files.filter(file => {
          if (file.size > 5 * 1024 * 1024) {
            setError(`${file.name} is too large. Maximum size is 5MB per file.`);
            return false;
          }
          return true;
        });
        if (validFiles.length > 0) {
          updateData('medicalReports', validFiles);
        }
      }
      setError('');
    }
  };

  const normalizePhoneForOtp = (phone: string): string => {
    if (!phone) return '';
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // If starts with country code, use as is, otherwise add default
    const defaultCountryCode = process.env.NEXT_PUBLIC_OTP_DEFAULT_COUNTRY_CODE || '+91';
    if (digits.length === 10) {
      return defaultCountryCode + digits;
    } else if (digits.length > 10 && digits.startsWith('91')) {
      return '+' + digits;
    } else if (digits.length > 10) {
      return '+' + digits;
    }
    return defaultCountryCode + digits;
  };

  const canSendOtp = useMemo(() => {
    return Boolean(
      data.fullName &&
      data.emailId &&
      data.password && data.password.length >= 8 &&
      data.phoneNumber && data.phoneNumber.length >= 10
    );
  }, [data.fullName, data.emailId, data.password, data.phoneNumber]);

  const sendOtp = async () => {
    if (!canSendOtp || otpSending || resendSeconds > 0) return;
    setOtpSending(true);
    setOtpError("");
    setOtpInfo("");
    setOtpVerified(false);
    setOtpSent(false);
    try {
      const normalizedPhone = normalizePhoneForOtp(data.phoneNumber);
      if (!normalizedPhone || normalizedPhone.length < 10) {
        setOtpError('Please enter a valid phone number');
        setOtpSending(false);
        return;
      }

      // Uses Twilio Verify Service for OTP sending
      // Custom message: "Welcome to theratreat, your OTP is {code}"
      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone, 
          purpose: 'patient_registration' 
        })
      });
      
      const json = await res.json();
      
      if (res.ok && json?.success && json?.data?.otpSent) {
        setOtpSent(true);
        setOtpInfo(`OTP sent to ${json?.data?.phone || normalizedPhone}. Expires in ${json?.data?.ttlMinutes || 10} minutes.`);
        setResendSeconds(json?.data?.nextSendSeconds || 60);
        setOtpError("");
      } else {
        // Extract error message from various possible response formats
        const errorMsg = json?.message || json?.data?.message || json?.errors || 'Failed to send OTP';
        setOtpError(errorMsg);
        setOtpSent(false);
        console.error('[OTP Send Error]', { response: json, status: res.status });
      }
    } catch (e: any) {
      setOtpError(e?.message || 'Failed to send OTP. Please try again.');
      setOtpSent(false);
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtpCode = async () => {
    if (!data.phoneNumber || !otpCode || otpVerifying) return;
    
    // Validate OTP code format
    if (!/^\d{4,6}$/.test(otpCode.trim())) {
      setOtpError('Please enter a valid OTP code (4-6 digits)');
      return;
    }

    setOtpVerifying(true);
    setOtpError("");
    setOtpInfo("");
    
    try {
      const normalizedPhone = normalizePhoneForOtp(data.phoneNumber);
      if (!normalizedPhone) {
        setOtpError('Please enter a valid phone number');
        setOtpVerifying(false);
        return;
      }

      // Uses Twilio Verify Service for OTP verification
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone, 
          code: otpCode.trim(), 
          purpose: 'patient_registration' 
        })
      });
      
      const json = await res.json();
      
      if (res.ok && json?.success && json?.data?.verified) {
        setOtpVerified(true);
        setOtpInfo('Phone verified successfully! ✓');
        setOtpError("");
      } else {
        const errorMsg = json?.message || json?.data?.message || 'OTP verification failed';
        setOtpError(errorMsg);
        setOtpVerified(false);
      }
    } catch (e: any) {
      setOtpVerified(false);
      setOtpError(e?.message || 'OTP verification failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 1:
        if (!data.fullName || !data.gender || !data.dateOfBirth || !data.phoneNumber || !data.emailId || !data.password || !data.confirmPassword) {
          setError('Please fill in all required fields');
          return false;
        }
        if (data.password !== data.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        const pwd = data.password;
        const passwordOk = pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
        if (!passwordOk) {
          setError('Password must meet all requirements');
          return false;
        }
        if (!/^\d{10}$/.test(data.phoneNumber)) {
          setError('Phone number must be exactly 10 digits');
          return false;
        }
        break;
      case 2:
        if (!data.preferredLanguage || !data.city || !data.state || !data.pinCode || !data.seekingTherapy) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (!data.previousTherapyExperience || !data.disabilitySupport) {
          setError('Please answer all required questions');
          return false;
        }
        break;
      case 4:
        if (!data.emergencyContactName || !data.emergencyContactPhone || !data.relationshipToYou) {
          setError('Please fill in all emergency contact details');
          return false;
        }
        break;
      case 5:
        if (!data.smsEmailConsent || !data.termsAccepted || !data.informationAccurate || !data.responsibleUse || !data.emergencyDisclaimer) {
          setError('Please accept all required terms and conditions');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !otpVerified) {
      setError('Please verify your phone number via OTP before proceeding.');
      return;
    }
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Always send 10-digit phone number, let backend normalize
      const phone = data.phoneNumber.replace(/\D/g, '').slice(-10);
      if (phone.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }
      const payload = {
        fullName: data.fullName,
        email: data.emailId,
        password: data.password,
        phoneNumber: phone,
        otpCode: otpCode || undefined,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        pinCode: data.pinCode,
        preferredLanguage: data.preferredLanguage,
        preferredTherapistGender: data.preferredTherapistGender,
        preferredTimeSlots: data.preferredTimeSlots,
        previousTherapyExperience: data.previousTherapyExperience,
        reasonForTherapy: data.reasonForTherapy,
        userType: 'patient'
      };
      const res = await fetch('/api/patient-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.status === 202 && result?.otpSent) {
        setOtpSent(true);
        setOtpInfo('OTP sent. Please enter code and submit again.');
        setResendSeconds(60);
        setLoading(false);
        alert('OTP sent. Please enter code and submit again.');
        return;
      }
      if (!res.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      // Registration successful, now sign in
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.emailId, password: data.password })
      });
      const loginResult = await loginRes.json();
      if (!loginRes.ok || !loginResult?.token) {
        setLoading(false);
        alert('Registration succeeded but login failed. Please sign in manually.');
        return;
      }
      // Store token (localStorage for demo, replace with cookie if needed)
      localStorage.setItem('authToken', loginResult.token);
      setLoading(false);
      // Show toast and redirect
      if (typeof window !== 'undefined') {
        // Show toast
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Signed in successfully', type: 'success' } }));
        // Redirect to home
        window.location.href = '/';
      }
    } catch (e) {
      setLoading(false);
      let msg = 'Registration failed';
      if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
        msg = (e as any).message;
      }
      setError(msg);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: {
        const passwordValidation = {
          length: data.password.length >= 8,
          upper: /[A-Z]/.test(data.password),
          lower: /[a-z]/.test(data.password),
          number: /[0-9]/.test(data.password),
          special: /[^A-Za-z0-9]/.test(data.password)
        };
        
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
                <p className="text-sm text-gray-500">Let's start with your basic information</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={data.fullName}
                  onChange={(e) => updateData('fullName', e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Profile Photo (Optional)
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          setError('Profile photo must be less than 2MB');
                          return;
                        }
                        updateData('profilePhoto', file);
                        setError('');
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-blue-600 bg-blue-50 scale-[1.02]' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'profilePhoto')}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-300">
                        {data.profilePhoto ? (
                          <ImageIcon className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Upload className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {data.profilePhoto ? data.profilePhoto.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
                      </div>
                      {data.profilePhoto && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          <Check className="w-3 h-3 mr-1" />
                          File uploaded
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Gender *
                  </Label>
                  <ReactSelect
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                    ]}
                    value={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                    ].find(opt => opt.value === data.gender) || null}
                    onChange={selected => updateData('gender', selected ? selected.value : '')}
                    styles={customSelectStyles}
                    placeholder="Select gender"
                    isClearable
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => updateData('dateOfBirth', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              {data.age && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Age (Auto-calculated)
                  </Label>
                  <div className="h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center">
                    <span className="text-gray-700 font-medium">{data.age} years old</span>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Phone Number *
                </Label>
                <div className="flex gap-2">
                  <div className="h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center text-gray-600 font-medium">
                    
                  </div>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={data.phoneNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateData('phoneNumber', digits);
                    }}
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 flex-1"
                  />
                </div>

                {/* Enhanced OTP UI */}
                <div className="mt-4">
                  {!otpVerified ? (
                    <div className="space-y-3">
                      <Button
                        type="button"
                        disabled={!canSendOtp || otpSending || resendSeconds > 0}
                        onClick={sendOtp}
                        className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-violet-500/30"
                      >
                        {otpSending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending OTP...
                          </>
                        ) : otpSent ? (
                          resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : 'Resend OTP'
                        ) : (
                          <>
                            <Phone className="w-4 h-4 mr-2" />
                            Send OTP
                          </>
                        )}
                      </Button>
                      
                      {otpInfo && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-green-700">{otpInfo}</p>
                        </div>
                      )}
                      
                      {otpError && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700">{otpError}</p>
                        </div>
                      )}
                      
                      {otpSent && (
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otpCode}
                            maxLength={6}
                            onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                            className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 text-center text-lg font-semibold tracking-widest"
                          />
                          <Button
                            type="button"
                            disabled={!otpCode || otpCode.length < 6 || !data.phoneNumber || otpVerifying}
                            onClick={verifyOtpCode}
                            className="h-12 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 font-medium shadow-lg shadow-violet-500/30"
                          >
                            {otpVerifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                      <div className="p-2 rounded-full bg-green-500">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-700">Phone Verified!</p>
                        <p className="text-xs text-green-600">Your phone number has been successfully verified</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="emailId" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address *
                </Label>
                <Input
                  id="emailId"
                  type="email"
                  placeholder="your@email.com"
                  value={data.emailId}
                  onChange={(e) => updateData('emailId', e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Create Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={data.password}
                    autoComplete="new-password"
                    onChange={(e) => updateData('password', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                  <div className="mt-3 space-y-2">
                    {[
                      { label: 'At least 8 characters', valid: passwordValidation.length },
                      { label: 'One uppercase letter', valid: passwordValidation.upper },
                      { label: 'One lowercase letter', valid: passwordValidation.lower },
                      { label: 'One number', valid: passwordValidation.number },
                      { label: 'One special character', valid: passwordValidation.special }
                    ].map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${rule.valid ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {rule.valid && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs ${rule.valid ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={data.confirmPassword}
                    autoComplete="new-password"
                    onChange={(e) => updateData('confirmPassword', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                  {data.confirmPassword && (
                    <div className="mt-3">
                      {data.password === data.confirmPassword ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-medium">Passwords match</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Passwords do not match</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Location & Preferences</h3>
                <p className="text-sm text-gray-500">Help us match you with the right therapist</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="preferredLanguage" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Preferred Language *
                  </Label>
                  <ReactSelect
                    options={preferredLanguageOptions}
                    value={preferredLanguageOptions.find(opt => opt.value === data.preferredLanguage) || null}
                    onChange={selected => updateData('preferredLanguage', selected ? selected.value : '')}
                    styles={customSelectStyles}
                    placeholder="Select language"
                    isClearable
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700 mb-2 block">
                    City / Town *
                  </Label>
                  <Input
                    id="city"
                    placeholder="Enter your city"
                    value={data.city}
                    onChange={(e) => updateData('city', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="state" className="text-sm font-semibold text-gray-700 mb-2 block">
                    State *
                  </Label>
                  <ReactSelect
                    options={INDIA_STATES.map(s => ({ value: s, label: s }))}
                    value={INDIA_STATES.map(s => ({ value: s, label: s })).find(o => o.value === data.state) || null}
                    onChange={(selected) => updateData('state', selected ? selected.value : '')}
                    styles={customSelectStyles}
                    placeholder="Select state"
                    isClearable
                  />
                </div>

                <div>
                  <Label htmlFor="pinCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                    PIN Code *
                  </Label>
                  <Input
                    id="pinCode"
                    placeholder="Enter PIN code"
                    value={data.pinCode}
                    onChange={(e) => updateData('pinCode', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Are you seeking therapy? *
                </Label>
                <RadioGroup
                  value={data.seekingTherapy}
                  onValueChange={(value) => updateData('seekingTherapy', value)}
                  className="grid grid-cols-3 gap-3"
                >
                  {['online', 'in-person', 'both'].map((option) => (
                    <label
                      key={option}
                      className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        data.seekingTherapy === option
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <RadioGroupItem value={option} id={option} className="sr-only" />
                      <span className={`text-sm font-medium capitalize ${
                        data.seekingTherapy === option ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {option === 'in-person' ? 'In Person' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </span>
                      {data.seekingTherapy === option && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="preferredTherapistGender" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Preferred Therapist Gender
                </Label>
                <ReactSelect
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'no-preference', label: 'No Preference' },
                  ]}
                  value={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'no-preference', label: 'No Preference' },
                  ].find(opt => opt.value === data.preferredTherapistGender) || null}
                  onChange={selected => updateData('preferredTherapistGender', selected ? selected.value : '')}
                  styles={customSelectStyles}
                  placeholder="Select preference"
                  isClearable
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Preferred Time Slots
                </Label>
                <p className="text-xs text-gray-500 mb-4">Select one or more time windows that work for you</p>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                  {timeSlotOptions.map(({ value, icon: Icon, hint, color }) => {
                    const selected = data.preferredTimeSlots.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleTimeSlotToggle(value)}
                        className={`relative rounded-xl p-4 text-left transition-all duration-200 ${
                          selected
                            ? 'bg-gradient-to-br ' + color + ' text-white shadow-lg scale-105'
                            : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-600'}`} />
                          <div>
                            <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-gray-900'}`}>
                              {value}
                            </p>
                            <p className={`text-xs ${selected ? 'text-white/90' : 'text-gray-500'}`}>
                              {hint}
                            </p>
                          </div>
                        </div>
                        {selected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-violet-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Health Information</h3>
                <p className="text-sm text-gray-500">Help us understand your needs better</p>
              </div>
              <Badge className="ml-auto bg-amber-100 text-amber-700 hover:bg-amber-100">
                Optional
              </Badge>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Do you have any previous therapy experience? *
                </Label>
                <RadioGroup
                  value={data.previousTherapyExperience}
                  onValueChange={(value) => updateData('previousTherapyExperience', value)}
                  className="grid grid-cols-2 gap-3"
                >
                  {['yes', 'no'].map((option) => (
                    <label
                      key={option}
                      className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        data.previousTherapyExperience === option
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <RadioGroupItem value={option} id={`therapy-${option}`} className="sr-only" />
                      <span className={`text-sm font-medium capitalize ${
                        data.previousTherapyExperience === option ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                      {data.previousTherapyExperience === option && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="reasonForTherapy" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Reason for seeking therapy
                </Label>
                <Textarea
                  id="reasonForTherapy"
                  placeholder="Share what brings you here today..."
                  value={data.reasonForTherapy}
                  onChange={(e) => updateData('reasonForTherapy', e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 min-h-[100px]"
                  rows={4}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Any current medications?
                </Label>
                <RadioGroup
                  value={data.currentMedications}
                  onValueChange={(value) => updateData('currentMedications', value)}
                  className="grid grid-cols-2 gap-3"
                >
                  {['yes', 'no'].map((option) => (
                    <label
                      key={option}
                      className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        data.currentMedications === option
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <RadioGroupItem value={option} id={`meds-${option}`} className="sr-only" />
                      <span className={`text-sm font-medium capitalize ${
                        data.currentMedications === option ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                      {data.currentMedications === option && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="diagnosedConditions" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Any diagnosed conditions? (Optional)
                </Label>
                <Textarea
                  id="diagnosedConditions"
                  placeholder="Share any relevant diagnosed conditions..."
                  value={data.diagnosedConditions}
                  onChange={(e) => updateData('diagnosedConditions', e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 min-h-[100px]"
                  rows={4}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Medical Reports (Optional)
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    id="medicalReports"
                    accept="application/pdf,image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      updateData('medicalReports', files.filter(f => f.size <= 5 * 1024 * 1024));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'medicalReports')}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-300">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {data.medicalReports && data.medicalReports.length > 0
                            ? `${data.medicalReports.length} file(s) selected`
                            : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB each)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Do you have any disability / support needs? *
                </Label>
                <RadioGroup
                  value={data.disabilitySupport}
                  onValueChange={(value) => updateData('disabilitySupport', value)}
                  className="grid grid-cols-2 gap-3"
                >
                  {['yes', 'no'].map((option) => (
                    <label
                      key={option}
                      className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        data.disabilitySupport === option
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <RadioGroupItem value={option} id={`disability-${option}`} className="sr-only" />
                      <span className={`text-sm font-medium capitalize ${
                        data.disabilitySupport === option ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                      {data.disabilitySupport === option && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Emergency Contact</h3>
                <p className="text-sm text-gray-500">A trusted person we can reach in case of emergency</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="emergencyContactName" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Contact Name *
                  </Label>
                  <Input
                    id="emergencyContactName"
                    placeholder="Enter contact person's name"
                    value={data.emergencyContactName}
                    onChange={(e) => updateData('emergencyContactName', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <Label htmlFor="relationshipToYou" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Relationship *
                  </Label>
                  <ReactSelect
                    options={[
                      { value: 'parent', label: 'Parent' },
                      { value: 'spouse', label: 'Spouse' },
                      { value: 'sibling', label: 'Sibling' },
                      { value: 'friend', label: 'Friend' },
                      { value: 'guardian', label: 'Guardian' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={[
                      { value: 'parent', label: 'Parent' },
                      { value: 'spouse', label: 'Spouse' },
                      { value: 'sibling', label: 'Sibling' },
                      { value: 'friend', label: 'Friend' },
                      { value: 'guardian', label: 'Guardian' },
                      { value: 'other', label: 'Other' },
                    ].find(opt => opt.value === data.relationshipToYou) || null}
                    onChange={selected => updateData('relationshipToYou', selected ? selected.value : '')}
                    styles={customSelectStyles}
                    placeholder="Select relationship"
                    isClearable
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContactPhone" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Phone Number *
                </Label>
                <div className="flex gap-2">
                  <div className="h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center text-gray-600 font-medium">
                    +91
                  </div>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={data.emergencyContactPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateData('emergencyContactPhone', digits);
                    }}
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Legal Consents</h3>
                <p className="text-sm text-gray-500">Please review and accept our terms</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { id: 'smsEmailConsent', label: 'I consent to receiving SMS, email, or WhatsApp reminders.' },
                { id: 'termsAccepted', label: 'I accept the Terms of Use, Privacy Policy, and Refund Policy.' },
                { id: 'informationAccurate', label: 'I confirm the information I have provided is true and accurate.' },
                { id: 'responsibleUse', label: 'I agree to use TheraTreat responsibly and will not impersonate anyone else.' },
                { id: 'emergencyDisclaimer', label: 'I understand that this platform does not offer emergency services. In case of crisis, I will contact appropriate local authorities.' }
              ].map((consent) => (
                <label
                  key={consent.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    data[consent.id as keyof OnboardingData]
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <Checkbox
                    id={consent.id}
                    checked={data[consent.id as keyof OnboardingData] as boolean}
                    onCheckedChange={(checked) => updateData(consent.id as keyof OnboardingData, checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-700 flex-1">{consent.label}</span>
                  {data[consent.id as keyof OnboardingData] && (
                    <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
                  )}
                </label>
              ))}

              <Alert className="mt-6 border-amber-200 bg-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800 ml-2">
                  <strong className="block mb-1">Emergency Services Disclaimer</strong>
                  If you are experiencing a mental health emergency, please contact your local emergency services (108 in India, 911 in US) or visit your nearest emergency room immediately.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
            Patient Registration
          </h1>
          <p className="text-gray-600">Join TheraTreat to start your wellness journey</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-blue-600">
              Step {currentStep} of 5
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {steps[currentStep - 1].percentage}% Complete
            </span>
          </div>
          <Progress value={steps[currentStep - 1].percentage} className="h-3 bg-blue-100" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index + 1 === currentStep;
              const isComplete = index + 1 < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white scale-110'
                        : isComplete
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    {isComplete ? <Check className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium text-center hidden md:block ${
                    isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm mb-8 rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-10">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-700 ml-2">{error}</AlertDescription>
              </Alert>
            )}

            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="h-12 px-6 rounded-xl border-2 hover:bg-blue-50 disabled:opacity-40 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-blue-700">Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={loading}
            className="h-12 px-8 rounded-xl font-semibold shadow-lg"
            style={{background: 'linear-gradient(to right, #2563eb, #3b82f6)', boxShadow: '0 4px 24px 0 rgba(37,99,235,0.15)', color: '#fff'}}>
            {currentStep === 5 ? (
              loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                  <span className="text-white">Completing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-white" />
                  <span className="text-white">Complete Registration</span>
                </>
              )
            ) : (
              <>
                <span className="text-white">Next Step</span>
                <ArrowRight className="w-4 h-4 ml-2 text-white" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}