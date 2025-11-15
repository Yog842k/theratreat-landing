import React, { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { 
  User, GraduationCap, Brain, Clock, DollarSign, Building2, Camera, 
  FileText, Shield, Upload, Calendar, Phone, Mail, MapPin, Languages,
  Award, CreditCard, CheckCircle, AlertTriangle, Download, Eye, Lock,
  UserCheck, Users, TrendingUp, Globe, Heart, Bot, Star, BarChart3,
  Network, ArrowRight, ArrowLeft, Stethoscope, Activity, Baby, Hand,
  MessageCircle, Loader2, Sparkles, CheckCircle2
} from "lucide-react";

interface TherapistRegistrationProps {
  setCurrentView: (view: any) => void;
}

interface FormData {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  password: string;
  residentialAddress: string;
  currentCity: string;
  state: string;
  preferredLanguages: string[];
  panCard: string;
  qualification: string;
  university: string;
  graduationYear: string;
  licenseNumber: string;
  designations: string[];
  primaryConditions: string[];
  experience: string;
  workplaces: string;
  onlineExperience: boolean;
  preferredDays: string[];
  preferredTimeSlots: string[];
  weeklySessions: string;
  sessionDurations: string[];
  sessionFee: string;
  dynamicPricing: boolean;
  freeFirstSession: boolean;
  paymentMode: string;
  sessionModesOffered: string[];
  sessionModePrices: {
    video: string;
    audio: string;
    inHome: string;
  };
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    accountNumberConfirm: string;
    ifscCode: string;
    upiId: string;
  };
  hasClinic: boolean;
  profilePhoto: File | null;
  profilePhotoUrl?: string;
  qualificationCertUrls: string[];
  licenseDocumentUrl?: string;
  resumeUrl?: string;
  bio: string;
  linkedIn: string;
  website: string;
  instagram: string;
  therapyLanguages: string[];
  agreements: {
    accuracy: boolean;
    verification: boolean;
    guidelines: boolean;
    confidentiality: boolean;
    independent: boolean;
    norms: boolean;
    conduct: boolean;
    terms: boolean;
    digitalConsent: boolean;
    secureDelivery: boolean;
    declaration: boolean;
    serviceAgreement: boolean;
  };
}

const DynamicReactSelect = dynamic(() => import("react-select"), { ssr: false });

export function TherapistRegistration({ setCurrentView }: TherapistRegistrationProps) {
  // GST Registration State
  const [gstRegistered, setGstRegistered] = useState<string>("");
  const [gstin, setGstin] = useState<string>("");
  const [gstBusinessName, setGstBusinessName] = useState<string>("");
  const [gstCertificate, setGstCertificate] = useState<File | null>(null);
  const [gstCertificateUrl, setGstCertificateUrl] = useState<string>("");
  const [gstStatus, setGstStatus] = useState<string>("");
  const [gstState, setGstState] = useState<string>("");
  const [gstDeclarationAgreed, setGstDeclarationAgreed] = useState<boolean>(false);
    // GST Verification State
    const [gstVerificationLoading, setGstVerificationLoading] = useState(false);
    const [gstVerificationResult, setGstVerificationResult] = useState<any>(null);
    const [gstVerificationError, setGstVerificationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [panVerified, setPanVerified] = useState<boolean>(false);
  const [panVerifyLoading, setPanVerifyLoading] = useState<boolean>(false);
  const [panVerifyMsg, setPanVerifyMsg] = useState<string>("");
  const [panVerifyErr, setPanVerifyErr] = useState<string>("");
  const [panVerifyDetails, setPanVerifyDetails] = useState<any>(null);
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpInfo, setOtpInfo] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [resendSeconds, setResendSeconds] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState({
    qualification: 0,
    license: 0,
    resume: 0,
    profile: 0
  });
  const [bankVerifying, setBankVerifying] = useState(false);
  const [bankVerifyMsg, setBankVerifyMsg] = useState<string>("");
  const [bankVerifyErr, setBankVerifyErr] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    password: "",
    residentialAddress: "",
    currentCity: "",
    state: "",
    preferredLanguages: [],
    panCard: "",
    qualification: "",
    university: "",
    graduationYear: "",
    licenseNumber: "",
    designations: [],
    primaryConditions: [],
    experience: "",
    workplaces: "",
    onlineExperience: false,
    preferredDays: [],
    preferredTimeSlots: [],
    weeklySessions: "",
    sessionDurations: [],
    sessionFee: "",
    dynamicPricing: false,
    freeFirstSession: false,
    paymentMode: "",
    sessionModesOffered: [],
    sessionModePrices: {
      video: "",
      audio: "",
      inHome: ""
    },
    bankDetails: {
      accountHolder: "",
      bankName: "",
      accountNumber: "",
      accountNumberConfirm: "",
      ifscCode: "",
      upiId: "",
    },
    hasClinic: false,
    profilePhoto: null,
    profilePhotoUrl: undefined,
    qualificationCertUrls: [],
    licenseDocumentUrl: undefined,
    resumeUrl: undefined,
    bio: "",
    linkedIn: "",
    website: "",
    instagram: "",
    therapyLanguages: [],
    agreements: {
      accuracy: false,
      verification: false,
      guidelines: false,
      confidentiality: false,
      independent: false,
      norms: false,
      conduct: false,
      terms: false,
      digitalConsent: false,
      secureDelivery: false,
      declaration: false,
      serviceAgreement: false
    }
  });

  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Personal & Contact Information",
    "Education & Credentials", 
    "Specialization & Experience",
    "Availability & Scheduling",
    "Session Charges & Payment",
    "Clinic/Offline Setup",
    "Profile Details",
    "Agreements & Consent"
  ];

  const designations = [
    "Behavioural Therapist", "Cognitive Behavioural Therapist", "Neuro-Developmental Therapist",
    "Occupational Therapist", "Physiotherapist", "Special Educator",
    "Speech and Language Pathologist", "Sports Therapist", "ABA Therapist",
    "Clinical Psychologist", "Psychotherapist", "Counseling Psychologist"
  ];

  const conditionCategories = [
    {
      id: "neurological",
      title: "Neurological & Neurodevelopmental",
      icon: Brain,
      conditions: ["Autism Spectrum Disorder (ASD)", "ADHD", "Cerebral Palsy", "Down Syndrome", "Developmental Delays"]
    },
    {
      id: "psychological",
      title: "Psychological & Mental Health",
      icon: Heart,
      conditions: ["Depression", "Anxiety Disorders", "OCD", "PTSD", "Bipolar Disorder"]
    },
    {
      id: "pediatric",
      title: "Pediatric Conditions",
      icon: Baby,
      conditions: ["Learning Disabilities", "Speech Delays", "Behavioral Challenges", "Motor Coordination Disorders"]
    }
  ];

  const languages = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Kannada"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Late Night"];
  const sessionDurations = ["30 min sessions", "45 min sessions", "60 min sessions"];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const uploadToCloud = async (file: File, cb: (url:string)=>void, kind?: keyof typeof uploadProgress) => {
    try {
      const isPdf = file.type === 'application/pdf';
      const endpoint = (kind === 'resume' || isPdf) ? '/api/uploads/resume' : '/api/uploads/profile';
      const maxBytes = endpoint === '/api/uploads/profile' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxBytes) {
        alert(`File too large (max ${endpoint === '/api/uploads/profile' ? '2MB' : '5MB'})`);
        return;
      }
      const fd = new FormData(); 
      fd.append('file', file);
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && kind) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(p => ({ ...p, [kind]: pct }));
          }
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (json.success && json.data?.url) {
              if (kind) setUploadProgress(p => ({ ...p, [kind]: 100 }));
              cb(json.data.url);
              resolve();
            } else {
              alert('Upload failed');
              reject(new Error('Upload failed'));
            }
          } catch(err) { reject(err as any); }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
      });
    } catch (e) { console.error(e); alert('Upload error'); }
  };

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  // Normalize phone number for OTP
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
    // Only require phone number to send OTP
    const phone = formData.phoneNumber?.trim();
    return Boolean(phone && phone.length >= 10);
  }, [formData.phoneNumber]);

  const sendOtp = async () => {
    if (!canSendOtp || otpSending || resendSeconds > 0) return;
    setOtpSending(true);
    setOtpError("");
    setOtpInfo("");
    setOtpVerified(false);
    setOtpSent(false);
    
    try {
      const normalizedPhone = normalizePhoneForOtp(formData.phoneNumber);
      if (!normalizedPhone || normalizedPhone.length < 10) {
        setOtpError('Please enter a valid phone number');
        setOtpSending(false);
        return;
      }

      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone, 
          purpose: 'therapist_registration' 
        })
      });
      
      const json = await res.json();
      
      if (res.ok && json?.success && json?.data?.otpSent) {
        setOtpSent(true);
        setOtpInfo(`OTP sent to ${json?.data?.phone || normalizedPhone}. Expires in ${json?.data?.ttlMinutes || 10} minutes.`);
        setResendSeconds(60);
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
    if (!formData.phoneNumber || !otpCode || otpVerifying) return;
    
    // Validate OTP code format
    if (!/^\d{4,6}$/.test(otpCode.trim())) {
      setOtpError('Please enter a valid OTP code (4-6 digits)');
      return;
    }

    setOtpVerifying(true);
    setOtpError("");
    setOtpInfo("");
    
    try {
      const normalizedPhone = normalizePhoneForOtp(formData.phoneNumber);
      if (!normalizedPhone) {
        setOtpError('Please enter a valid phone number');
        setOtpVerifying(false);
        return;
      }

      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone, 
          code: otpCode.trim(), 
          purpose: 'therapist_registration' 
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

  // Ref for scroll behavior
  const cardRef = useRef<HTMLDivElement>(null);

  const scrollToCard = () => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setTimeout(scrollToCard, 100);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setTimeout(scrollToCard, 100);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const bd = formData.bankDetails;
      if (!formData.qualificationCertUrls.length || !formData.licenseDocumentUrl || !formData.resumeUrl || !formData.profilePhotoUrl || !bd.accountHolder || !bd.bankName || !bd.accountNumber || !bd.accountNumberConfirm || bd.accountNumber !== bd.accountNumberConfirm || !bd.ifscCode) {
        alert('Please complete all mandatory uploads and bank details');
        setIsSubmitting(false);
        return;
      }
      // PAN verification is now optional for registration. Submission will proceed even if not verified.
      const submissionData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        otpCode: otpCode || undefined,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        residentialAddress: formData.residentialAddress,
        currentCity: formData.currentCity,
        state: formData.state,
        preferredLanguages: formData.preferredLanguages,
        panCard: formData.panCard,
        qualification: formData.qualification,
        university: formData.university,
        graduationYear: formData.graduationYear,
        licenseNumber: formData.licenseNumber,
        designations: formData.designations,
        primaryConditions: formData.primaryConditions,
        experience: formData.experience,
        workplaces: formData.workplaces,
        onlineExperience: formData.onlineExperience,
        preferredDays: formData.preferredDays,
        preferredTimeSlots: formData.preferredTimeSlots,
        weeklySessions: formData.weeklySessions,
        sessionDurations: formData.sessionDurations,
        sessionFee: formData.sessionFee,
        sessionModesOffered: formData.sessionModesOffered,
        sessionModePrices: formData.sessionModePrices,
        dynamicPricing: formData.dynamicPricing,
        freeFirstSession: formData.freeFirstSession,
        paymentMode: formData.paymentMode,
        bankDetails: formData.bankDetails,
        hasClinic: formData.hasClinic,
        bio: formData.bio,
        linkedIn: formData.linkedIn,
        website: formData.website,
        instagram: formData.instagram,
        therapyLanguages: formData.therapyLanguages,
        agreements: formData.agreements,
        profilePhotoUrl: formData.profilePhotoUrl,
        qualificationCertUrls: formData.qualificationCertUrls,
        licenseDocumentUrl: formData.licenseDocumentUrl,
        resumeUrl: formData.resumeUrl,
        isCompletingRegistration: true
      };
      
      const response = await fetch('/api/therapist-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      const result = await response.json();
      
      if (response.status === 202 && result?.otpSent) {
        setOtpSent(true);
        setOtpInfo(`OTP sent. Please enter code and submit again.`);
        setResendSeconds(60);
        setIsSubmitting(false);
        alert('OTP sent. Please enter code and submit again.');
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userType', 'therapist');
      }
      
      setIsSubmitting(false);
      alert('Welcome to Therabook. Your registration is complete and pending verification.');
      setCurrentView("therapist-dashboard");
      
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Registration failed: ${errorMessage}`);
    }
  };

  const isFormValid = () => {
    return Object.values(formData.agreements).every(value => value === true) &&
           formData.fullName && formData.email && formData.phoneNumber && 
           formData.password && formData.password.length >= 8;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info Fields */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Full Name *
                </Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Gender *
                </Label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl px-4 bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Date of Birth *
                </Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Phone Number *
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl flex-1"
                    maxLength={15}
                  />
                  <Button 
                    type="button" 
                    onClick={sendOtp}
                    disabled={!canSendOtp || otpSending || resendSeconds > 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center gap-2"
                  >
                    {otpSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : otpSent ? (
                      resendSeconds > 0 ? (
                        `Resend (${resendSeconds}s)`
                      ) : (
                        'Resend OTP'
                      )
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </div>
                
                {otpSent && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Enter Verification Code
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl flex-1 text-center text-lg font-semibold tracking-widest"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        onClick={verifyOtpCode}
                        disabled={!otpCode || otpCode.length < 4 || otpVerifying || otpVerified}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] flex items-center justify-center gap-2"
                      >
                        {otpVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : otpVerified ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Verified
                          </>
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {otpError && (
                  <div className="mt-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {otpError}
                    </p>
                  </div>
                )}
                
                {otpInfo && !otpError && (
                  <div className="mt-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {otpInfo}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password *
                </Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter secure password"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  City *
                </Label>
                <Input
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange("currentCity", e.target.value)}
                  placeholder="Enter city"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  State *
                </Label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl px-4 bg-white"
                >
                  <option value="">Select State</option>
                  {["Maharashtra","Delhi","Karnataka","Tamil Nadu","Telangana","Gujarat","West Bengal","Rajasthan","Uttar Pradesh"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  PAN Card *
                </Label>
                <Input
                  value={formData.panCard}
                  onChange={(e) => handleInputChange("panCard", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                  placeholder="ABCDE1234F"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
                <Button
                  type="button"
                  onClick={async () => {
                    if (!formData.panCard || !formData.fullName || !formData.dateOfBirth) {
                      setPanVerifyErr('Please enter PAN, Name, and DOB');
                      return;
                    }
                    setPanVerifyLoading(true);
                    try {
                      const initiateRes = await fetch('/api/pan/initiate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pan: formData.panCard, name: formData.fullName, dob: formData.dateOfBirth })
                      });
                      const initiateJson = await initiateRes.json();
                      if (!initiateRes.ok || !initiateJson?.success || !initiateJson.request_id) {
                        throw new Error(initiateJson?.message || 'PAN verification failed');
                      }
                      const verifyRes = await fetch('/api/pan/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ request_id: initiateJson.request_id })
                      });
                      const verifyJson = await verifyRes.json();
                      if (!verifyRes.ok || !verifyJson?.success) {
                        throw new Error(verifyJson?.message || 'PAN verification failed');
                      }
                      setPanVerified(true);
                      setPanVerifyMsg('PAN verified successfully');
                      setPanVerifyDetails(verifyJson?.data || null);
                    } catch (e: any) {
                      setPanVerified(false);
                      setPanVerifyErr(e?.message || 'PAN verification failed');
                    } finally {
                      setPanVerifyLoading(false);
                    }
                  }}
                  disabled={panVerifyLoading}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10"
                >
                  {panVerifyLoading ? 'Verifying...' : 'Verify PAN'}
                </Button>
                {panVerified && panVerifyDetails && (
                  <div className="mt-3 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                    <p className="text-green-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      PAN Verified Successfully
                    </p>
                  </div>
                )}
                {panVerifyErr && (
                  <p className="text-sm text-red-600 mt-2">{panVerifyErr}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-blue-600" />
                  Languages *
                </Label>
                {typeof window !== "undefined" && (
                  <DynamicReactSelect
                    isMulti
                    options={(Array.isArray(languages) ? languages : []).map(lang => ({ label: lang, value: lang }))}
                    value={(Array.isArray(formData.preferredLanguages) ? formData.preferredLanguages : []).map(lang => ({ label: lang, value: lang }))}
                    onChange={selected => handleInputChange("preferredLanguages", selected && Array.isArray(selected) ? selected.map((opt: any) => opt.value) : [])}
                    className="w-full"
                    classNamePrefix="react-select"
                    placeholder="Select preferred languages..."
                  />
                )}
                <p className="text-xs text-slate-500">You can select multiple languages</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Residential Address *</Label>
              <Textarea
                value={formData.residentialAddress}
                onChange={(e) => handleInputChange("residentialAddress", e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                className="border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
              />
            </div>

            {/* GST Registration Section - OUTSIDE the grid, always visible in step 1 */}
            <div className="space-y-4 mt-8 p-4 border-2 border-blue-100 rounded-xl bg-blue-50">
              <Label className="font-semibold text-blue-800">Q1. Do you have a valid GST registration?</Label>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="gstRegistered" value="yes" checked={gstRegistered === "yes"} onChange={() => setGstRegistered("yes")} />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="gstRegistered" value="no" checked={gstRegistered === "no"} onChange={() => setGstRegistered("no")} />
                  No
                </label>
              </div>
              {gstRegistered === "yes" && (
                <div className="space-y-4 mt-4">
                  <Label className="font-semibold">Q2. Please enter your GSTIN (15-digit GST Number):</Label>
                  <Input value={gstin} onChange={e => setGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))} placeholder="27ABCDE1234F1Z4" maxLength={15} className="mb-2" />
                    <button
                      type="button"
                      onClick={async () => {
                        setGstVerificationLoading(true);
                        setGstVerificationError(null);
                        setGstVerificationResult(null);
                        try {
                          const res = await fetch('/api/verify-gst', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ gstNumber: gstin }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setGstVerificationResult(data.result);
                          } else {
                            setGstVerificationError(data.error || 'Verification failed');
                          }
                        } catch (err: any) {
                          setGstVerificationError(err.message || 'Network error');
                        } finally {
                          setGstVerificationLoading(false);
                        }
                      }}
                      disabled={gstVerificationLoading || !gstin || gstin.length !== 15}
                      className="mb-2 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      {gstVerificationLoading ? 'Verifying...' : 'Verify GST'}
                    </button>
                    {gstVerificationResult && (
                      <div className="text-green-700 mt-2">
                        GST Verified!
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(gstVerificationResult, null, 2)}</pre>
                      </div>
                    )}
                    {gstVerificationError && (
                      <div className="text-red-700 mt-2">
                        {gstVerificationError}
                      </div>
                    )}
                  <Label className="font-semibold">Q3. Registered Business/Legal Name (as per GST certificate):</Label>
                  <Input value={gstBusinessName} onChange={e => setGstBusinessName(e.target.value)} placeholder="Business/Legal Name" className="mb-2" />
                  <Label className="font-semibold">Q4. Upload your GST Registration Certificate (PDF/JPEG):</Label>
                  <Input type="file" accept=".pdf,.jpeg,.jpg,.png" onChange={e => setGstCertificate(e.target.files?.[0] || null)} className="mb-2" />
                  {gstCertificate && <span className="text-green-700">{gstCertificate.name}</span>}
                  <Label className="font-semibold">Q5. Is your GST registration currently Active?</Label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="gstStatus" value="active" checked={gstStatus === "active"} onChange={() => setGstStatus("active")} />
                      Yes, Active
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="gstStatus" value="inactive" checked={gstStatus === "inactive"} onChange={() => setGstStatus("inactive")} />
                      No / Cancelled / Suspended
                    </label>
                  </div>
                  <Label className="font-semibold">Q6. State/UT of GST Registration:</Label>
                  <select value={gstState} onChange={e => setGstState(e.target.value)} className="w-full border-2 border-blue-200 rounded-lg p-2">
                    <option value="">Select State/UT</option>
                    {["Maharashtra","Karnataka","Delhi","Tamil Nadu","Telangana","Gujarat","West Bengal","Rajasthan","Uttar Pradesh"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
              {gstRegistered === "no" && (
                <div className="space-y-4 mt-4 p-4 border-2 border-yellow-200 rounded-xl bg-yellow-50">
                  <Label className="font-semibold text-yellow-800">Declaration:</Label>
                  <p className="text-sm text-gray-700">“I confirm that my annual professional turnover is below ₹20,00,000 and that I am not registered under GST as per current Indian GST laws. I understand that TheraTreat will deduct TDS as applicable under Section 194J for professional services.”</p>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={gstDeclarationAgreed} onChange={e => setGstDeclarationAgreed(e.target.checked)} />
                    <span className="font-semibold text-gray-800">I agree and confirm the above declaration.</span>
                  </label>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Qualification *</Label>
                <select
                  value={formData.qualification}
                  onChange={(e) => handleInputChange("qualification", e.target.value)}
                  className="w-full h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl px-4 bg-white"
                >
                  <option value="">Select qualification</option>
                  <option value="phd">PhD</option>
                  <option value="masters">Master's Degree</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="diploma">Diploma</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">University/Institute *</Label>
                <Input
                  value={formData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                  placeholder="Enter university name"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Graduation Year *</Label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                  className="w-full h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl px-4 bg-white"
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 50 }, (_, i) => 2024 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">License Number *</Label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  placeholder="Enter license number"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
                  {formData.qualificationCertUrls.length === 0 && (
                    <input 
                      multiple 
                      type="file" 
                      accept="application/pdf,image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(f => uploadToCloud(f, url => setFormData(p => ({...p, qualificationCertUrls: [...p.qualificationCertUrls, url]})), 'qualification'));
                      }}
                    />
                  )}
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-semibold text-slate-700">Qualification Certificates *</p>
                  <p className="text-sm text-slate-500 mt-1">PDF/Image (Max 5MB)</p>
                  {formData.qualificationCertUrls.length > 0 && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      {formData.qualificationCertUrls.length} uploaded
                    </div>
                  )}
                  {uploadProgress.qualification > 0 && uploadProgress.qualification < 100 && (
                    <Progress value={uploadProgress.qualification} className="mt-3" />
                  )}
                </div>
              </div>

              <div className="relative group">
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
                  {!formData.licenseDocumentUrl && (
                    <input 
                      type="file" 
                      accept="application/pdf,image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadToCloud(f, url => setFormData(p => ({...p, licenseDocumentUrl: url})), 'license');
                      }}
                    />
                  )}
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-semibold text-slate-700">Professional License *</p>
                  <p className="text-sm text-slate-500 mt-1">PDF/Image (Max 5MB)</p>
                  {formData.licenseDocumentUrl && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      Uploaded
                    </div>
                  )}
                  {uploadProgress.license > 0 && uploadProgress.license < 100 && (
                    <Progress value={uploadProgress.license} className="mt-3" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Professional Designations *</Label>
              <div className="grid md:grid-cols-3 gap-3">
                {designations.map((designation) => (
                  <div 
                    key={designation} 
                    onClick={() => handleArrayToggle("designations", designation)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.designations.includes(designation)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                        formData.designations.includes(designation)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {formData.designations.includes(designation) && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{designation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Primary Conditions *</Label>
              {conditionCategories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <category.icon className="w-5 h-5" />
                    <h4 className="font-semibold">{category.title}</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 pl-7">
                    {category.conditions.map((condition) => (
                      <div 
                        key={condition}
                        onClick={() => handleArrayToggle("primaryConditions", condition)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.primaryConditions.includes(condition)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            formData.primaryConditions.includes(condition)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-slate-300'
                          }`}>
                            {formData.primaryConditions.includes(condition) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-slate-700">{condition}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Years of Experience *</Label>
                <select
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  className="w-full h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl px-4 bg-white"
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="11-15">11-15 years</option>
                  <option value="20+">20+ years</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Online Experience *</Label>
                <div className="flex gap-4 pt-3">
                  <div 
                    onClick={() => handleInputChange("onlineExperience", true)}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.onlineExperience
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="text-center font-medium text-slate-700">Yes</p>
                  </div>
                  <div 
                    onClick={() => handleInputChange("onlineExperience", false)}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      !formData.onlineExperience
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="text-center font-medium text-slate-700">No</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Previous Workplaces</Label>
              <Textarea
                value={formData.workplaces}
                onChange={(e) => handleInputChange("workplaces", e.target.value)}
                placeholder="List previous workplaces..."
                rows={3}
                className="border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
              />
            </div>

            <div className="relative group">
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
                {!formData.resumeUrl && (
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadToCloud(f, url => setFormData(p => ({...p, resumeUrl: url})), 'resume');
                    }}
                  />
                )}
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <p className="font-semibold text-slate-700">Upload Resume/CV *</p>
                <p className="text-sm text-slate-500 mt-1">PDF (Max 5MB)</p>
                {formData.resumeUrl && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    Uploaded
                  </div>
                )}
                {uploadProgress.resume > 0 && uploadProgress.resume < 100 && (
                  <Progress value={uploadProgress.resume} className="mt-3" />
                )}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Preferred Days *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {days.map((day) => (
                  <div 
                    key={day}
                    onClick={() => handleArrayToggle("preferredDays", day)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      formData.preferredDays.includes(day)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-medium text-slate-700">{day}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Preferred Time Slots *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <div 
                    key={slot}
                    onClick={() => handleArrayToggle("preferredTimeSlots", slot)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      formData.preferredTimeSlots.includes(slot)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-medium text-slate-700">{slot}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Weekly Session Capacity *</Label>
                <select
                  value={formData.weeklySessions}
                  onChange={(e) => handleInputChange("weeklySessions", e.target.value)}
                  className="w-full h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl px-4 bg-white"
                >
                  <option value="">Select capacity</option>
                  <option value="1-5">1-5 sessions/week</option>
                  <option value="6-10">6-10 sessions/week</option>
                  <option value="11-20">11-20 sessions/week</option>
                  <option value="21-30">21-30 sessions/week</option>
                  <option value="30+">30+ sessions/week</option>
                </select>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">Session Durations *</Label>
                <div className="space-y-2">
                  {sessionDurations.map((duration) => (
                    <div 
                      key={duration}
                      onClick={() => handleArrayToggle("sessionDurations", duration)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.sessionDurations.includes(duration)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.sessionDurations.includes(duration)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-300'
                        }`}>
                          {formData.sessionDurations.includes(duration) && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Session Modes & Pricing *</Label>
              <div className="grid gap-4">
                {[
                  { id: 'video', label: 'Video Session', icon: Camera },
                  { id: 'audio', label: 'Audio Session', icon: Phone },
                  { id: 'inHome', label: 'In-Home Session', icon: Building2 }
                ].map(mode => {
                  const checked = formData.sessionModesOffered.includes(mode.id === 'inHome' ? 'in-home' : mode.id);
                  const storageKey = mode.id;
                  return (
                    <div key={mode.id} className={`p-4 rounded-xl border-2 transition-all ${checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => handleArrayToggle('sessionModesOffered', mode.id === 'inHome' ? 'in-home' : mode.id)}
                        />
                        <mode.icon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-slate-700 flex-1">{mode.label}</span>
                        <Input
                          type="number"
                          placeholder="₹ Price"
                          value={formData.sessionModePrices[storageKey as keyof typeof formData.sessionModePrices]}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            sessionModePrices: { ...prev.sessionModePrices, [storageKey]: e.target.value }
                          }))}
                          disabled={!checked}
                          className="w-32 h-10 border-2 border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Payment Mode *</Label>
              <select
                value={formData.paymentMode}
                onChange={(e) => handleInputChange("paymentMode", e.target.value)}
                className="w-full h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl px-4 bg-white"
              >
                <option value="">Select mode</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="space-y-4">
              <div 
                onClick={() => handleInputChange("dynamicPricing", !formData.dynamicPricing)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.dynamicPricing ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={formData.dynamicPricing} />
                  <span className="font-medium text-slate-700">Enable dynamic pricing</span>
                </div>
              </div>

              <div 
                onClick={() => handleInputChange("freeFirstSession", !formData.freeFirstSession)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.freeFirstSession ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={formData.freeFirstSession} />
                  <span className="font-medium text-slate-700">Offer free first session</span>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-700">Bank Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Account Holder *</Label>
                  <Input
                    value={formData.bankDetails.accountHolder}
                    onChange={(e) => handleNestedInputChange("bankDetails", "accountHolder", e.target.value)}
                    placeholder="Account holder name"
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Bank Name *</Label>
                  <Input
                    value={formData.bankDetails.bankName}
                    onChange={(e) => handleNestedInputChange("bankDetails", "bankName", e.target.value)}
                    placeholder="Bank name"
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Account Number *</Label>
                  <Input
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => handleNestedInputChange("bankDetails", "accountNumber", e.target.value)}
                    placeholder="Account number"
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Confirm Account Number *</Label>
                  <Input
                    value={formData.bankDetails.accountNumberConfirm}
                    onChange={(e) => handleNestedInputChange("bankDetails", "accountNumberConfirm", e.target.value)}
                    placeholder="Re-enter account number"
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  />
                  {formData.bankDetails.accountNumberConfirm && formData.bankDetails.accountNumber !== formData.bankDetails.accountNumberConfirm && (
                    <p className="text-sm text-red-600">Account numbers don't match</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">IFSC Code *</Label>
                  <Input
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) => handleNestedInputChange("bankDetails", "ifscCode", e.target.value)}
                    placeholder="IFSC code"
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">UPI ID (Optional)</Label>
                  <Input
                    value={formData.bankDetails.upiId}
                    onChange={(e) => handleNestedInputChange("bankDetails", "upiId", e.target.value)}
                    placeholder="UPI ID"
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={async () => {
                  setBankVerifying(true);
                  setBankVerifyErr("");
                  setBankVerifyMsg("");
                  try {
                    const res = await fetch('/api/idfy/verify-bank', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        accountNumber: formData.bankDetails.accountNumber,
                        ifsc: formData.bankDetails.ifscCode,
                        name: formData.bankDetails.accountHolder
                      })
                    });
                    const json = await res.json();
                    if (!res.ok || !json.ok) {
                      throw new Error(json?.message || 'Verification failed');
                    }
                    setBankVerifyMsg('Bank account verified');
                  } catch (e: any) {
                    setBankVerifyErr(e?.message || 'Verification failed');
                  } finally {
                    setBankVerifying(false);
                  }
                }}
                disabled={bankVerifying}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11"
              >
                {bankVerifying ? 'Verifying...' : 'Verify Bank Account'}
              </Button>
              {bankVerifyMsg && <p className="text-sm text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{bankVerifyMsg}</p>}
              {bankVerifyErr && <p className="text-sm text-red-600">{bankVerifyErr}</p>}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Do you have a physical clinic? *</Label>
              <div className="flex gap-4">
                <div 
                  onClick={() => handleInputChange("hasClinic", true)}
                  className={`flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    formData.hasClinic
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Yes</p>
                </div>
                <div 
                  onClick={() => handleInputChange("hasClinic", false)}
                  className={`flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    !formData.hasClinic
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No</p>
                </div>
              </div>
            </div>

            {formData.hasClinic && (
              <Alert className="border-amber-300 bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Please use the dedicated clinic registration flow for clinic owners.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        );

      case 7:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="relative group">
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadToCloud(f, url => setFormData(p => ({...p, profilePhotoUrl: url, profilePhoto: f})), 'profile');
                  }}
                />
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-blue-600" />
                </div>
                <p className="font-semibold text-slate-700 text-lg">Profile Photo *</p>
                <p className="text-sm text-slate-500 mt-1">JPG/PNG (Max 2MB)</p>
                {formData.profilePhotoUrl && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    Uploaded
                  </div>
                )}
                {uploadProgress.profile > 0 && uploadProgress.profile < 100 && (
                  <Progress value={uploadProgress.profile} className="mt-4" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Professional Bio *</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Write your professional bio (200-500 words)"
                rows={6}
                className="border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">LinkedIn (Optional)</Label>
                <Input
                  value={formData.linkedIn}
                  onChange={(e) => handleInputChange("linkedIn", e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Website (Optional)</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="yourwebsite.com"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Instagram (Optional)</Label>
                <Input
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="instagram.com/username"
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Therapy Languages *</Label>
                {typeof window !== "undefined" && (
                  <DynamicReactSelect
                    isMulti
                    options={(Array.isArray(languages) ? languages : []).map(lang => ({ label: lang, value: lang }))}
                    value={(Array.isArray(formData.therapyLanguages) ? formData.therapyLanguages : []).map(lang => ({ label: lang, value: lang }))}
                    onChange={selected => handleInputChange("therapyLanguages", selected && Array.isArray(selected) ? selected.map((opt: any) => opt.value) : [])}
                    className="w-full"
                    classNamePrefix="react-select"
                    placeholder="Select therapy languages..."
                  />
                )}
                <p className="text-xs text-slate-500">You can select multiple languages</p>
              </div>
            </div>
          </motion.div>
        );

      case 8:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Alert className="border-blue-300 bg-blue-50">
              <Shield className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-slate-700">
                Please read and accept all agreements to complete registration.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {[
                { id: 'accuracy', text: 'I confirm all information is accurate and up-to-date' },
                { id: 'verification', text: 'I agree to credential verification' },
                { id: 'guidelines', text: 'I agree to follow professional guidelines' },
                { id: 'confidentiality', text: 'I agree to maintain patient confidentiality' },
                { id: 'independent', text: 'I understand I am an independent practitioner' },
                { id: 'norms', text: 'I agree to adhere to professional norms' },
                { id: 'conduct', text: 'I agree to maintain professional conduct' },
                { id: 'terms', text: 'I have read and agree to Terms of Service' },
                { id: 'digitalConsent', text: 'I consent to digital record keeping' },
                { id: 'secureDelivery', text: 'I agree to secure service delivery' },
                { id: 'declaration', text: 'I declare fitness to provide therapy services' },
                { id: 'serviceAgreement', text: 'I agree to the Service Agreement' }
              ].map((agreement) => (
                <div 
                  key={agreement.id}
                  onClick={() => handleNestedInputChange("agreements", agreement.id, !formData.agreements[agreement.id as keyof typeof formData.agreements])}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.agreements[agreement.id as keyof typeof formData.agreements]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={formData.agreements[agreement.id as keyof typeof formData.agreements]}
                      className="mt-0.5"
                    />
                    <span className="text-sm font-medium text-slate-700 leading-relaxed">{agreement.text} *</span>
                  </div>
                </div>
              ))}
            </div>

            {!isFormValid() && (
              <Alert className="border-amber-300 bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Please complete all required fields and accept all agreements.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Sparkles className="w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Join TheraTreat</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Transform lives through therapy. Start your journey with us today.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-6 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-2xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Why Join Us?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Users, title: 'Expand Reach', desc: 'Connect with thousands of patients' },
                  { icon: TrendingUp, title: 'Boost Income', desc: 'Flexible pricing & transparent payouts' },
                  { icon: Calendar, title: 'Smart Scheduling', desc: 'Manage availability effortlessly' },
                  { icon: Bot, title: 'AI Tools', desc: 'Intelligent insights & automation' },
                  { icon: Star, title: 'Build Reputation', desc: 'Verified profiles & reviews' },
                  { icon: Network, title: 'Community', desc: 'Training & peer networking' }
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-slate-600">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-600">Step {currentStep} of {totalSteps}</h2>
              <p className="text-slate-600 mt-1">{stepTitles[currentStep - 1]}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-semibold">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Form */}
        <Card ref={cardRef} className="bg-white shadow-2xl border-0 mb-8">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-600">{stepTitles[currentStep - 1]}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Fill in the required information below</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mb-12">
          <Button 
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="px-8 py-6 text-lg font-semibold border-2 hover:bg-slate-50 disabled:opacity-40 rounded-xl"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Previous
          </Button>
          
          {currentStep === totalSteps ? (
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Complete Registration
                  <CheckCircle className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Next
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TherapistRegistration;