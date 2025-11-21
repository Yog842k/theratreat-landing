"use client";
import OtpVerification from "@/components/OtpVerification";
import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Upload, CheckCircle2, Building2, MapPin, Phone, Mail, Calendar, Clock, Briefcase, Globe, Instagram, FileText, Shield, Sparkles, ArrowRight, Check, AlertCircle, Heart, Award, Users, Zap, TrendingUp, Bot, Star, Network } from "lucide-react";
import { PRIMARY_FILTERS, CATEGORY_FILTERS, THERAPY_TYPES, getAllConditions } from "@/constants/therabook-filters";


interface ClinicFormData {
  
  ownerName?: string;
  designation?: string;
  designationOther?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerIdProof?: File | null;
  ownerPhoto?: File | null;
  signatureStamp?: File | null;
  signatureDate?: string;
  
  clinicName: string;
  clinicType: string;
  clinicTypeOther?: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  operatingDays: string[];
  operatingHours: string;
  services: string[];
  primaryFilters: string[];
  conditions: string[];
  numTherapists: string;
  website: string;
  yearsInOperation?: string;
  instagram: string;
  registrationTypeOther?: string;
  profilePhoto: File | null;
  pan: string;
  panCertificate: File | null;
  bankAccountName: string;
  bankName?: string;
  bankAccountNumber: string;
  bankIfsc: string;
  upiId?: string;
  bankProof: File | null;
  gstRegistered: string;
  gstin: string;
  gstBusinessName: string;
  gstCertificate: File | null;
  gstStatus: string;
  gstState: string;
  gstDeclarationAgreed: boolean;
  registrationTypes?: string[];
  clinicLicenseProof?: File | null;
  clinicPhotos?: FileList | null;
  clinicBrochure?: File | null;
  agreements: {
    accuracy: boolean;
    terms: boolean;
    consent: boolean;
  };

  password?: string;
  confirmPassword?: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const servicesList = THERAPY_TYPES;

const indianStates = [
  "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Telangana", "Gujarat", 
  "West Bengal", "Rajasthan", "Uttar Pradesh", "Kerala", "Punjab", "Haryana"
];

export default function ClinicRegistration() {
  // Clinic registration form state (typed)
  const [formData, setFormData] = useState<ClinicFormData>({
    ownerName: "",
    designation: "",
    designationOther: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerIdProof: null,
    ownerPhoto: null,
    signatureStamp: null,
    signatureDate: "",
    clinicName: "",
    clinicType: "",
    clinicTypeOther: "",
    registrationNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactEmail: "",
    contactPhone: "",
    operatingDays: [],
    operatingHours: "",
    services: [],
    primaryFilters: [],
    conditions: [],
    numTherapists: "",
    website: "",
    yearsInOperation: "",
    instagram: "",
    profilePhoto: null,
    pan: "",
    panCertificate: null,
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankProof: null,
    gstRegistered: "",
    gstin: "",
    gstBusinessName: "",
    gstCertificate: null,
    gstStatus: "",
    gstState: "",
    gstDeclarationAgreed: false,
    registrationTypes: [],
    clinicLicenseProof: null,
    clinicPhotos: null,
    clinicBrochure: null,
    agreements: {
      accuracy: false,
      terms: false,
      consent: false
    },
    password: "",
    confirmPassword: ""
  });

  // Memo and functions for OTP
  const canSendOtp = useMemo(() => {
    return Boolean(formData.ownerPhone && formData.ownerPhone.length === 10);
  }, [formData.ownerPhone]);

  const sendOtp = async () => {
    if (!canSendOtp || otpSending || resendSeconds > 0) return;
    setOtpSending(true);
  setOtpError("");
  setOtpInfo("");
    setOtpVerified(false);
    try {
      const phoneSource = formData.ownerPhone || '';
    let phone = phoneSource.replace(/\D/g, '');
    if (phone.length !== 10) {
      setOtpError('Please enter a valid 10-digit phone number');
      setOtpSending(false);
      return;
    }
      // Normalize phone to E.164 format (+91XXXXXXXXXX)
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone = digits.length === 10 ? `+91${digits}` : digits.length > 10 && digits.startsWith('91') ? `+${digits}` : digits.length > 10 ? `+${digits}` : `+91${digits}`;
      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, purpose: 'signup:clinic' })
      });
      const json = await res.json();
      if (res.ok && json?.success && json?.data?.otpSent) {
  setOtpSent(true);
  setOtpInfo(`OTP sent to ${json?.data?.phone || phone}`);
  setOtpError("");
  setResendSeconds(json?.data?.nextSendSeconds || json?.data?.ttlMinutes ? (json.data.ttlMinutes * 60) : 60);
  toast.success('OTP sent', {
    description: `OTP has been sent to ${phone}`,
  });
      } else {
  const errorMsg = json?.message || 'Failed to send OTP';
  setOtpError(errorMsg);
  toast.error('OTP failed', {
    description: errorMsg,
  });
      }
    } catch (e) {
      let msg = 'Failed to send OTP';
      if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
        msg = (e as any).message;
      }
      setOtpError(msg);
      toast.error('OTP error', {
        description: msg,
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleClinicOtpExpiredDuringSubmit = async () => {
    setOtpVerified(false);
    setOtpCode('');
    const message = 'OTP expired. A new code has been sent to the owner’s number.';
    setOtpError(message);
    toast.info('OTP expired', { description: 'Sending a fresh OTP to the owner’s phone.' });
    try {
      await sendOtp();
    } catch (error: any) {
      const fallbackMsg = error?.message || 'OTP resend failed. Please try again manually.';
      setOtpError(fallbackMsg);
      toast.error('OTP resend failed', { description: fallbackMsg });
    }
    setIsSubmitting(false);
  };

  const verifyOtpCode = async () => {
    if (!formData.contactPhone || !otpCode || otpVerifying) return;
    setOtpVerifying(true);
    setOtpError("");
    setOtpInfo("");
    try {
      const phoneSource = formData.ownerPhone || '';
      let phone = phoneSource.replace(/\D/g, '');
      if (phone.length !== 10) {
        setOtpError('Please enter a valid 10-digit phone number');
        setOtpVerifying(false);
        return;
      }
      // Normalize phone to E.164 format (+91XXXXXXXXXX)
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone = digits.length === 10 ? `+91${digits}` : digits.length > 10 && digits.startsWith('91') ? `+${digits}` : digits.length > 10 ? `+${digits}` : `+91${digits}`;
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, code: otpCode, purpose: 'signup:clinic' })
      });
      const json = await res.json();
      if (res.ok && json?.success && json?.data?.verified) {
  setOtpVerified(true);
  setOtpInfo('Phone verified successfully');
  setOtpError("");
  toast.success('Phone verified', {
    description: 'Your phone number has been verified successfully',
  });
      } else {
  const errorMsg = json?.message || 'OTP verification failed';
  setOtpError(errorMsg);
  toast.error('Verification failed', {
    description: errorMsg,
  });
      }
    } catch (e) {
      let msg = 'OTP verification failed';
      if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
        msg = (e as any).message;
      }
      setOtpError(msg);
      toast.error('Verification error', {
        description: msg,
      });
    } finally {
      setOtpVerifying(false);
    }
  };
  // State declarations
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // OTP & PAN verification state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInfo, setOtpInfo] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [panVerified, setPanVerified] = useState(false);
  const [panVerifyMsg, setPanVerifyMsg] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ...existing code...

  // ...existing code...

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (field: keyof ClinicFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof ClinicFormData, value: string) => {
    setFormData(prev => {
      let arr: string[] = [];
      if (field === "operatingDays" && Array.isArray(prev.operatingDays)) {
        arr = prev.operatingDays;
      } else if (field === "services" && Array.isArray(prev.services)) {
        arr = prev.services;
      } else if (field === "registrationTypes" && Array.isArray(prev.registrationTypes)) {
        arr = prev.registrationTypes;
      }
      const newArr = arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value];
      return { ...prev, [field]: newArr };
    });
  };

  const handleAgreementChange = (field: keyof ClinicFormData["agreements"], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      agreements: { ...prev.agreements, [field]: value }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Validate password before submission
      if (!formData.password || formData.password.trim() === '') {
        toast.error('Password required', {
          description: 'Please enter a password.',
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 8) {
        toast.error('Invalid password', {
          description: 'Password must be at least 8 characters long.',
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Password mismatch', {
          description: 'Passwords do not match. Please ensure both password fields match.',
        });
        setIsSubmitting(false);
        return;
      }

      // Validate ownerEmail is provided
      if (!formData.ownerEmail || formData.ownerEmail.trim() === '') {
        toast.error('Owner email required', {
          description: 'Owner email is required for login. Please enter the owner email.',
        });
        setIsSubmitting(false);
        return;
      }

      // Helper to upload a file and get its URL
      const uploadFile = async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/uploads/profile', {
          method: 'POST',
          body: form
        });
        const json = await res.json();
        if (json.success && json.data?.url) return json.data.url;
        return "";
      };

      // Upload documents and get URLs
      const ownerIdProofUrl = formData.ownerIdProof ? await uploadFile(formData.ownerIdProof) : "";
      const ownerPhotoUrl = formData.ownerPhoto ? await uploadFile(formData.ownerPhoto) : "";
      const signatureStampUrl = formData.signatureStamp ? await uploadFile(formData.signatureStamp) : "";
      const profilePhotoUrl = formData.profilePhoto ? await uploadFile(formData.profilePhoto) : "";
      const panCertificateUrl = formData.panCertificate ? await uploadFile(formData.panCertificate) : "";
      const bankProofUrl = formData.bankProof ? await uploadFile(formData.bankProof) : "";
      const gstCertificateUrl = formData.gstCertificate ? await uploadFile(formData.gstCertificate) : "";
      const clinicLicenseProofUrl = formData.clinicLicenseProof ? await uploadFile(formData.clinicLicenseProof) : "";
      const clinicBrochureUrl = formData.clinicBrochure ? await uploadFile(formData.clinicBrochure) : "";

      // Build API payload object with correct mappings and document URLs
      const apiPayload: any = {
        clinicName: formData.clinicName,
        clinicAddress: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        contactNumber: formData.contactPhone,
        email: formData.contactEmail,
        yearsInOperation: formData.yearsInOperation,
        ownerName: formData.ownerName,
        designation: formData.designation,
        ownerMobile: formData.ownerPhone, // Owner mobile for login (formerly clinic contact)
        ownerEmail: formData.ownerEmail,
        ownerPassword: formData.password, // Backend will hash this
        declarationAccepted: formData.agreements.accuracy,
        termsAccepted: formData.agreements.terms,
        clinicType: Array.isArray(formData.clinicType) ? formData.clinicType : [formData.clinicType].filter(Boolean),
        therapiesOffered: Array.isArray(formData.services) ? formData.services : [formData.services].filter(Boolean),
        primaryFilters: Array.isArray(formData.primaryFilters) ? formData.primaryFilters : [],
        conditions: Array.isArray(formData.conditions) ? formData.conditions : [],
        operatingDays: Array.isArray(formData.operatingDays) ? formData.operatingDays : [formData.operatingDays].filter(Boolean),
        registrationTypes: Array.isArray(formData.registrationTypes) ? formData.registrationTypes : [formData.registrationTypes].filter(Boolean),
        // Bank details mapped to backend expected names
        accountHolderName: formData.bankAccountName,
        bankName: formData.bankName || "", // Add this field to your form if missing
        accountNumber: formData.bankAccountNumber,
        ifscCode: formData.bankIfsc,
        upiId: formData.upiId || "", // Add this field to your form if missing
        // Document URLs
        ownerIdProofUrl,
        ownerPhotoUrl,
        signatureStampUrl,
        profilePhotoUrl,
        panCertificateUrl,
        bankProofUrl,
        gstCertificateUrl,
        clinicLicenseProofUrl,
        clinicBrochureUrl,
        // Add other mapped fields as needed
      };
      // Remove any File/FileList fields if present
      Object.keys(apiPayload).forEach(key => {
        if (apiPayload[key] instanceof File || apiPayload[key] instanceof FileList) {
          delete apiPayload[key];
        }
      });
      // Log what we're sending (excluding password for security in production)
      console.log('[CLINIC REGISTER FORM] Sending registration request:', {
        hasOwnerEmail: !!apiPayload.ownerEmail,
        hasOwnerPassword: !!apiPayload.ownerPassword,
        ownerEmail: apiPayload.ownerEmail,
        ownerPasswordLength: apiPayload.ownerPassword ? String(apiPayload.ownerPassword).length : 0,
        ownerName: apiPayload.ownerName,
        clinicName: apiPayload.clinicName
      });
      
      const res = await fetch('/api/clinics/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      
      let responseData;
      try {
        responseData = await res.json();
      } catch (jsonError) {
        // If JSON parsing fails, try to get text response
        const textResponse = await res.text();
        responseData = { message: textResponse, error: 'Failed to parse response' };
      }
      
      if (res.ok && responseData.success) {
        setSubmitError(null);
        setIsSubmitting(false);
        toast.success('Registration successful!', {
          description: 'Your clinic credentials are ready. Please login on the auth page.',
          duration: 5000,
        });
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        const errorMessage = responseData.message || responseData.error || 'Registration failed. Please check all fields and try again.';
        const errorCode = responseData.code || responseData.error;
        const isOtpExpired = (errorCode === 'EXPIRED') || (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('expired'));
        if (isOtpExpired) {
          await handleClinicOtpExpiredDuringSubmit();
          return;
        }
        setIsSubmitting(false);
        console.error('Registration error:', { status: res.status, error: errorMessage, responseData });
        toast.error('Registration failed', {
          description: errorMessage,
          duration: 5000,
        });
      }
    } catch (err) {
      const message = String(err);
      setSubmitError(message);
      toast.error('Registration error', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stepper config (expanded)
  const steps = [
    { num: 1, title: "Clinic Details", icon: Building2 },
    { num: 2, title: "PAN Info", icon: Shield },
    { num: 3, title: "Services", icon: Briefcase },
    { num: 4, title: "GST Info", icon: Shield },
    { num: 5, title: "Bank & Submit", icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 px-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)`
        }} />
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Why Join Us Section */}
        <div className="mb-12">
          <Card className="bg-white shadow-2xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Why Join Us?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Benefits from therapist registration */}
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Expand Reach</h3>
                  <p className="text-sm text-slate-600">Connect with thousands of patients</p>
                </div>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Boost Income</h3>
                  <p className="text-sm text-slate-600">Flexible pricing & transparent payouts</p>
                </div>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Smart Scheduling</h3>
                  <p className="text-sm text-slate-600">Manage availability effortlessly</p>
                </div>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">AI Tools</h3>
                  <p className="text-sm text-slate-600">Intelligent insights & automation</p>
                </div>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Build Reputation</h3>
                  <p className="text-sm text-slate-600">Verified profiles & reviews</p>
                </div>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Community</h3>
                  <p className="text-sm text-slate-600">Training & peer networking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Animation */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 bg-white shadow-lg shadow-blue-100 rounded-full border-2 border-blue-100">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-blue-600 text-sm font-bold">Partner with Us</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            Clinic <span className="text-blue-600">Registration</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join our network of healthcare providers and help transform lives together
          </p>
        </div>

        {/* Modern Progress Bar */}
        <div className={`mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-8 border border-blue-100">
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-blue-100 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
              
              {steps.map((step) => {
                const IconComponent = step.icon;
                const isActive = currentStep >= step.num;
                const isCurrent = currentStep === step.num;
                return (
                  <div key={step.num} className="flex flex-col items-center relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 border-4 ${
                      isActive 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-white shadow-lg shadow-blue-500/50' 
                        : 'bg-white border-blue-100'
                    } ${isCurrent ? 'scale-110' : ''}`}>
                      <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                    </div>
                    <span className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card ref={cardRef} className={`bg-white shadow-2xl shadow-blue-100/50 border-2 border-blue-100 rounded-3xl transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <CardContent className="p-8 md:p-12">
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-10">
              {/* Step 1: Clinic Details */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-4 border-b-2 border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Clinic Details</h2>
                      <p className="text-sm text-slate-500">Basic information about your clinic</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        Clinic Name*
                      </Label>
                      <Input 
                        value={formData.clinicName} 
                        onChange={e => handleInputChange("clinicName", e.target.value)}
                        placeholder="Your clinic name"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">Clinic Type*</Label>
                      <div className="flex flex-wrap gap-3">
                        {['Multispecialty','Therapy-only','Rehab Centre','Hospital-based'].map(type => (
                          <label key={type} className="flex items-center gap-2">
                            <input type="radio" name="clinicType" value={type} checked={formData.clinicType===type} onChange={e=>handleInputChange('clinicType',e.target.value)} className="accent-blue-600" required />
                            <span>{type}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2">
                          <input type="radio" name="clinicType" value="Others" checked={formData.clinicType==='Others'} onChange={e=>handleInputChange('clinicType',e.target.value)} className="accent-blue-600" required />
                          <span>Others:</span>
                          <Input value={formData.clinicTypeOther||''} onChange={e=>handleInputChange('clinicTypeOther',e.target.value)} placeholder="Specify" className="ml-2 h-10 border-blue-200 rounded" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">Clinic Address*</Label>
                    <textarea value={formData.address} onChange={e=>handleInputChange('address',e.target.value)} placeholder="Street, Area, Landmark" className="w-full h-20 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3" required />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">City*</Label>
                      <Input value={formData.city} onChange={e=>handleInputChange('city',e.target.value)} placeholder="Mumbai" className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl" required />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">State*</Label>
                      <select value={formData.state} onChange={e=>handleInputChange('state',e.target.value)} className="w-full h-12 border-2 border-blue-200 rounded-xl px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none bg-white" required>
                        <option value="">Select</option>
                        {indianStates.concat(['Other']).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">Pincode*</Label>
                      <Input value={formData.pincode} onChange={e=>handleInputChange('pincode',e.target.value)} placeholder="400001" maxLength={6} className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">Clinic Contact Number*</Label>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">+91</span>
                        <Input value={formData.contactPhone} onChange={e=>handleInputChange('contactPhone',e.target.value)} placeholder="9876543210" maxLength={10} className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl w-full" required />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">Clinic Email ID*</Label>
                      <Input type="email" value={formData.contactEmail} onChange={e=>handleInputChange('contactEmail',e.target.value)} placeholder="clinic@example.com" className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2">Clinic Website (Optional)</Label>
                      <Input type="url" value={formData.website} onChange={e=>handleInputChange('website',e.target.value)} placeholder="www.example.com" className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2">Years in Operation</Label>
                      <Input type="number" min={0} value={formData.yearsInOperation||''} onChange={e=>handleInputChange('yearsInOperation',e.target.value)} placeholder="e.g. 5" className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}
              {/* Step 2: PAN Info */}
              {currentStep === 2 && (
                <div className="space-y-4 bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">Password*</Label>
                      <Input 
                        type="password"
                        value={formData.password || ""}
                        onChange={e => handleInputChange("password", e.target.value)}
                        placeholder="Create a password for dashboard login"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">Confirm Password*</Label>
                      <Input 
                        type="password"
                        value={formData.confirmPassword || ""}
                        onChange={e => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Re-enter your password"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <Label className="text-slate-700 font-semibold mb-2 block">Full Name*</Label>
                  <Input value={formData.ownerName||''} onChange={e=>handleInputChange('ownerName',e.target.value)} placeholder="Owner/Coordinator Name" required className="h-12 border-2 border-blue-200 rounded-xl" />
                  <Label className="text-slate-700 font-semibold mb-2 block">Designation*</Label>
                  <div className="flex flex-wrap gap-3 mb-2">
                    {['Owner','Coordinator','Admin'].map(role => (
                      <label key={role} className="flex items-center gap-2">
                        <input type="radio" name="designation" value={role} checked={formData.designation===role} onChange={e=>handleInputChange('designation',e.target.value)} className="accent-blue-600" required />
                        <span>{role}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2">
                      <input type="radio" name="designation" value="Other" checked={formData.designation==='Other'} onChange={e=>handleInputChange('designation',e.target.value)} className="accent-blue-600" required />
                      <span>Other:</span>
                      <Input value={formData.designationOther||''} onChange={e=>handleInputChange('designationOther',e.target.value)} placeholder="Specify" className="ml-2 h-10 border-blue-200 rounded" />
                    </label>
                  </div>
                  <Label className="text-slate-700 font-semibold mb-2 block">Email Address*</Label>
                  <Input type="email" value={formData.ownerEmail||''} onChange={e=>handleInputChange('ownerEmail',e.target.value)} placeholder="owner@example.com" required className="h-12 border-2 border-blue-200 rounded-xl" />
                  <Label className="text-slate-700 font-semibold mb-2 block">Owner Mobile Number*</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">+91</span>
                    <Input
                      value={formData.ownerPhone||''}
                      onChange={e=>handleInputChange('ownerPhone',e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl w-full"
                    />
                  </div>
                  <Label className="text-slate-700 font-semibold mb-2 block">Government ID Proof (PAN / Aadhaar / Passport)</Label>
                  <Input type="file" accept=".pdf,.jpeg,.jpg,.png" onChange={e=>handleInputChange('ownerIdProof',e.target.files?.[0]||null)} className="h-12 border-2 border-blue-200 rounded-xl" />
                  {formData.ownerIdProof && (<div className="mt-2 text-green-700">{formData.ownerIdProof.name}</div>)}
                  <Label className="text-slate-700 font-semibold mb-2 block">Photo of Owner/Coordinator</Label>
                  <Input type="file" accept=".jpeg,.jpg,.png" onChange={e=>handleInputChange('ownerPhoto',e.target.files?.[0]||null)} className="h-12 border-2 border-blue-200 rounded-xl" />
                  {formData.ownerPhoto && (<div className="mt-2 text-green-700">{formData.ownerPhoto.name}</div>)}
                  <Label className="text-slate-700 font-semibold mb-2 block">Owner Mobile OTP Verification</Label>
                  <OtpVerification
                    phone={formData.ownerPhone || ''}
                    onVerified={() => {/* handle verified state if needed */}}
                  />
                </div>
              )}
              {/* Step 3: Services */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b-2 border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Services & Operations</h2>
                      <p className="text-sm text-slate-500">What you offer and when</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Operating Days
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {days.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleArrayToggle("operatingDays", day)}
                          className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 ${
                            formData.operatingDays.includes(day)
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105'
                              : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400 hover:shadow-md'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Operating Hours
                    </Label>
                    <div className="flex gap-4 items-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-1">Start</span>
                        <Input
                          type="time"
                          value={formData.operatingHours?.split(' - ')[0] || ''}
                          onChange={e => {
                            const end = formData.operatingHours?.split(' - ')[1] || '';
                            handleInputChange("operatingHours", `${e.target.value} - ${end}`);
                          }}
                          className="h-12 border-2 border-blue-200 rounded-xl"
                          required
                        />
                      </div>
                      <span className="mx-2 text-slate-500 font-bold">to</span>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-1">End</span>
                        <Input
                          type="time"
                          value={formData.operatingHours?.split(' - ')[1] || ''}
                          onChange={e => {
                            const start = formData.operatingHours?.split(' - ')[0] || '';
                            handleInputChange("operatingHours", `${start} - ${e.target.value}`);
                          }}
                          className="h-12 border-2 border-blue-200 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold mb-3 block">Therapy Types Offered *</Label>
                    <p className="text-xs text-slate-500 mb-3">Select all therapy types your clinic offers</p>
                    <div className="flex flex-wrap gap-3 max-h-60 overflow-y-auto p-2 border-2 border-blue-100 rounded-xl">
                      {servicesList.map(service => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleArrayToggle("services", service)}
                          className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 border-2 text-sm ${
                            formData.services.includes(service)
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                              : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400 hover:shadow-md'
                          }`}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold mb-3 block">Primary Filters (Quick Access Categories) *</Label>
                    <p className="text-xs text-slate-500 mb-3">Select the primary categories your clinic specializes in</p>
                    <div className="grid md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-2 border-2 border-blue-100 rounded-xl">
                      {PRIMARY_FILTERS.map(filter => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => handleArrayToggle("primaryFilters", filter.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            formData.primaryFilters.includes(filter.id)
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 shadow-md'
                              : 'bg-white border-blue-200 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{filter.icon}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-slate-700 mb-1">{filter.label}</div>
                              <div className="text-xs text-slate-500">{filter.description}</div>
                            </div>
                            {formData.primaryFilters.includes(filter.id) && (
                              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold mb-3 block">Conditions Treated *</Label>
                    <p className="text-xs text-slate-500 mb-3">Select specific conditions your clinic treats</p>
                    <div className="max-h-96 overflow-y-auto p-2 border-2 border-blue-100 rounded-xl space-y-4">
                      {Object.entries(CATEGORY_FILTERS).map(([key, category]) => (
                        <div key={key} className="space-y-2">
                          <h4 className="font-semibold text-sm text-blue-700">{category.label}</h4>
                          <div className="grid md:grid-cols-2 gap-2 pl-4">
                            {category.conditions.map(condition => (
                              <button
                                key={condition}
                                type="button"
                                onClick={() => handleArrayToggle("conditions", condition)}
                                className={`px-3 py-2 rounded-lg border-2 text-left text-sm transition-all ${
                                  formData.conditions.includes(condition)
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {formData.conditions.includes(condition) && (
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  )}
                                  <span>{condition}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        Number of Therapists
                      </Label>
                      <Input 
                        type="number"
                        value={formData.numTherapists} 
                        onChange={e => handleInputChange("numTherapists", e.target.value)}
                        placeholder="e.g. 5"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        Website
                      </Label>
                      <Input 
                        value={formData.website} 
                        onChange={e => handleInputChange("website", e.target.value)}
                        placeholder="www.example.com"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-blue-500" />
                        Instagram Handle
                      </Label>
                      <Input 
                        value={formData.instagram} 
                        onChange={e => handleInputChange("instagram", e.target.value)}
                        placeholder="@clinicname"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* Step 4: GST Info (restored) & Compliance & Registrations (merged) */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  {/* GST Information (restored) */}
                  <div className="flex items-center gap-4 pb-4 border-b-2 border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">GST Information</h2>
                      <p className="text-sm text-slate-500">Tax registration details</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-inner">
                    <Label className="text-slate-900 font-bold text-base flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      Do you have a valid GST registration?
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, gstRegistered: "yes" }))}
                        className={`py-4 px-6 rounded-xl font-bold transition-all duration-300 border-2 ${
                          formData.gstRegistered === "yes"
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/50 scale-105'
                            : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <Check className={`w-5 h-5 mx-auto mb-1 ${formData.gstRegistered === "yes" ? 'opacity-100' : 'opacity-0'}`} />
                        Yes, I have GST
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, gstRegistered: "no" }))}
                        className={`py-4 px-6 rounded-xl font-bold transition-all duration-300 border-2 ${
                          formData.gstRegistered === "no"
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/50 scale-105'
                            : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <Check className={`w-5 h-5 mx-auto mb-1 ${formData.gstRegistered === "no" ? 'opacity-100' : 'opacity-0'}`} />
                        No GST
                      </button>
                    </div>
                  </div>
                  {formData.gstRegistered === "yes" && (
                    <div className="space-y-6 bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-sm">
                      <div>
                        <Label className="text-slate-700 font-semibold mb-2 block">GSTIN (15-digit Number)</Label>
                        <Input 
                          value={formData.gstin} 
                          onChange={e => setFormData(f => ({ ...f, gstin: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15) }))} 
                          placeholder="27ABCDE1234F1Z4" 
                          maxLength={15}
                          className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 font-semibold mb-2 block">Registered Business Name</Label>
                        <Input 
                          value={formData.gstBusinessName} 
                          onChange={e => setFormData(f => ({ ...f, gstBusinessName: e.target.value }))} 
                          placeholder="As per GST certificate"
                          className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 font-semibold mb-2 block">Upload GST Certificate</Label>
                        <Input 
                          type="file" 
                          accept=".pdf,.jpeg,.jpg,.png" 
                          onChange={e => setFormData(f => ({ ...f, gstCertificate: e.target.files?.[0] || null }))}
                          className="h-12 border-2 border-blue-200 rounded-xl"
                        />
                        {formData.gstCertificate && (
                          <div className="mt-2 text-green-700">{formData.gstCertificate.name}</div>
                        )}
                      </div>
                      <div>
                        <Label className="text-slate-700 font-semibold mb-3 block">GST Status</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, gstStatus: "active" }))}
                            className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                              formData.gstStatus === "active"
                                ? 'bg-green-500 text-white border-green-600 shadow-lg'
                                : 'bg-white text-slate-700 border-blue-200 hover:border-green-400'
                            }`}
                          >
                            ✓ Active
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, gstStatus: "inactive" }))}
                            className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                              formData.gstStatus === "inactive"
                                ? 'bg-red-500 text-white border-red-600 shadow-lg'
                                : 'bg-white text-slate-700 border-blue-200 hover:border-red-400'
                            }`}
                          >
                            ✗ Inactive/Cancelled
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-700 font-semibold mb-2 block">State/UT of GST Registration</Label>
                        <select 
                          value={formData.gstState} 
                          onChange={e => setFormData(f => ({ ...f, gstState: e.target.value }))}
                          className="w-full h-12 border-2 border-blue-200 rounded-xl px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-slate-900 font-medium bg-white"
                        >
                          <option value="">Select State/UT</option>
                          {indianStates.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  {formData.gstRegistered === "no" && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-sm">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <Label className="text-amber-900 font-bold text-base mb-3 block">Declaration</Label>
                          <p className="text-slate-700 text-sm leading-relaxed mb-4 bg-white/50 p-4 rounded-xl">
                            "I confirm that my annual professional turnover is below ₹20,00,000 and that I am not registered under GST as per current Indian GST laws. I understand that TheraTreat will deduct TDS as applicable under Section 194J for professional services."
                          </p>
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex-shrink-0 mt-1">
                              <input 
                                type="checkbox" 
                                checked={formData.gstDeclarationAgreed} 
                                onChange={e => setFormData(f => ({ ...f, gstDeclarationAgreed: e.target.checked }))}
                                className="w-6 h-6 rounded-lg border-2 border-amber-400 appearance-none checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
                              />
                              {formData.gstDeclarationAgreed && (
                                <Check className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />
                              )}
                            </div>
                            <span className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">
                              I agree and confirm the above declaration
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Compliance & Registrations (merged) */}
                  <div className="space-y-6 bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-sm mt-8">
                    <Label className="text-slate-700 font-semibold mb-2 block">Clinic Registration Type*</Label>
                    <div className="flex flex-wrap gap-4 mb-2">
                      {['Shop & Establishment License','Clinical Establishment Registration','RCI Approved'].map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <input type="checkbox" checked={formData.registrationTypes?.includes(type)} onChange={e => {
                            const arr = formData.registrationTypes || [];
                            setFormData(f => ({ ...f, registrationTypes: e.target.checked ? [...arr, type] : arr.filter(t => t !== type) }));
                          }} className="accent-blue-600" />
                          <span>{type}</span>
                        </label>
                      ))}
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.registrationTypes?.includes('Other')} onChange={e => {
                          const arr = formData.registrationTypes || [];
                          setFormData(f => ({ ...f, registrationTypes: e.target.checked ? [...arr, 'Other'] : arr.filter(t => t !== 'Other') }));
                        }} className="accent-blue-600" />
                        <span>Other:</span>
                        <Input value={formData.registrationTypeOther||''} onChange={e=>setFormData(f=>({...f,registrationTypeOther:e.target.value}))} placeholder="Specify" className="ml-2 h-10 border-blue-200 rounded" />
                      </label>
                    </div>
                    <Label className="text-slate-700 font-semibold mb-2 block">Registration Number (if applicable)</Label>
                    <Input value={formData.registrationNumber||''} onChange={e=>setFormData(f=>({...f,registrationNumber:e.target.value}))} placeholder="Enter registration/license number" className="h-12 border-2 border-blue-200 rounded-xl" />
                    <Label className="text-slate-700 font-semibold mb-2 block">Upload Clinic License / Registration Proof*</Label>
                    <Input type="file" accept=".pdf,.jpeg,.jpg,.png" onChange={e=>setFormData(f=>({...f,clinicLicenseProof:e.target.files?.[0]||null}))} className="h-12 border-2 border-blue-200 rounded-xl" />
                    {formData.clinicLicenseProof && (<div className="mt-2 text-green-700">{formData.clinicLicenseProof.name}</div>)}
                  </div>
                  <div className="space-y-6 bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-sm">
                    <Label className="text-slate-700 font-semibold mb-2 block">Photos of Clinic (Reception / Therapy Rooms)</Label>
                    <Input type="file" multiple accept=".jpeg,.jpg,.png" onChange={e=>setFormData(f=>({...f,clinicPhotos:e.target.files}))} className="h-12 border-2 border-blue-200 rounded-xl" />
                    {formData.clinicPhotos && (<div className="mt-2 text-green-700">{Array.from(formData.clinicPhotos).map(f=>f.name).join(', ')}</div>)}
                    <Label className="text-slate-700 font-semibold mb-2 block">Clinic Brochure / Pamphlet (Optional)</Label>
                    <Input type="file" accept=".pdf,.jpeg,.jpg,.png" onChange={e=>setFormData(f=>({...f,clinicBrochure:e.target.files?.[0]||null}))} className="h-12 border-2 border-blue-200 rounded-xl" />
                    {formData.clinicBrochure && (<div className="mt-2 text-green-700">{formData.clinicBrochure.name}</div>)}
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100 mt-4">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      <span className="font-bold">🏥 Clinics registered under the Shop & Establishment Act or Clinical Establishment Act are recognized as “Clinical Establishments” under Indian law and are eligible for healthcare GST exemption.</span> TheraTreat collects this information for regulatory verification only.
                    </p>
                  </div>
                </div>
              )}
              {/* Step 5: Bank Details, Agreements & Submit */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b-2 border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Bank Details</h2>
                      <p className="text-sm text-slate-500">For payments and settlements</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">Account Holder Name</Label>
                      <Input 
                        value={formData.bankAccountName}
                        onChange={e => setFormData(f => ({ ...f, bankAccountName: e.target.value }))}
                        placeholder="Name as per bank"
                        className="h-12 border-2 border-blue-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">Account Number</Label>
                      <Input 
                        value={formData.bankAccountNumber}
                        onChange={e => setFormData(f => ({ ...f, bankAccountNumber: e.target.value }))}
                        placeholder="Bank account number"
                        className="h-12 border-2 border-blue-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">IFSC Code</Label>
                      <Input 
                        value={formData.bankIfsc}
                        onChange={e => setFormData(f => ({ ...f, bankIfsc: e.target.value }))}
                        placeholder="IFSC code"
                        className="h-12 border-2 border-blue-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">Upload Bank Proof</Label>
                      <Input 
                        type="file"
                        accept=".pdf,.jpeg,.jpg,.png"
                        onChange={e => setFormData(f => ({ ...f, bankProof: e.target.files?.[0] || null }))}
                        className="h-12 border-2 border-blue-200 rounded-xl"
                      />
                      {formData.bankProof && (
                        <div className="mt-2 text-green-700">{formData.bankProof.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <Label className="text-slate-900 font-black text-lg">Agreements & Consent</Label>
                    </div>
                    <div className="space-y-4">
                      {[
                        { key: 'accuracy', label: 'I confirm all information provided is accurate and up-to-date', icon: CheckCircle2 },
                        { key: 'terms', label: 'I agree to the terms and conditions of the platform', icon: FileText },
                        { key: 'consent', label: 'I give consent for data processing and communication', icon: Shield }
                      ].map((agreement) => {
                        const IconComponent = agreement.icon;
                        return (
                          <label key={agreement.key} className="flex items-start gap-4 cursor-pointer group bg-white rounded-xl p-4 border-2 border-blue-100 hover:border-blue-400 hover:shadow-md transition-all">
                            <div className="relative flex-shrink-0 mt-0.5">
                              <input 
                                type="checkbox" 
                                checked={formData.agreements[agreement.key as keyof typeof formData.agreements]} 
                                onChange={e => handleAgreementChange(agreement.key as keyof typeof formData.agreements, e.target.checked)}
                                className="w-6 h-6 rounded-lg border-2 border-blue-300 appearance-none checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
                              />
                              {formData.agreements[agreement.key as keyof typeof formData.agreements] && (
                                <Check className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />
                              )}
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <IconComponent className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              <span className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">
                                {agreement.label}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {/* SECTION 7: Signature & Consent */}
                  <div className="space-y-6 bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-sm mt-6">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Signature & Consent</h3>
                    <Label className="text-slate-700 font-semibold mb-2 block">Signature / Stamp*</Label>
                    <Input type="file" accept=".jpeg,.jpg,.png,.pdf" onChange={e=>setFormData(f=>({...f,signatureStamp:e.target.files?.[0]||null}))} className="h-12 border-2 border-blue-200 rounded-xl" />
                    {formData.signatureStamp && (<div className="mt-2 text-green-700">{formData.signatureStamp.name}</div>)}
                    <Label className="text-slate-700 font-semibold mb-2 block">Date*</Label>
                    <Input type="date" value={formData.signatureDate||''} onChange={e=>setFormData(f=>({...f,signatureDate:e.target.value}))} className="h-12 border-2 border-blue-200 rounded-xl w-48" />
                  </div>
                  <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-14 rounded-xl text-lg font-black shadow-xl shadow-blue-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Your Registration...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Zap className="w-6 h-6" />
                        Complete Registration
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    )}
                  </Button>
                  {submitError && (
                    <p className="mt-3 text-sm text-red-700 font-medium text-center">{submitError}</p>
                  )}
                  </div>
                </div>
              )}
            </form>
            {/* Step Navigation outside the form */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                disabled={currentStep === 1 || isSubmitting}
                onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-blue-300 text-blue-700 font-bold bg-white hover:bg-blue-50 hover:border-blue-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="15 18 9 12 15 6"/></svg>
                Previous
              </Button>
              <div className="flex gap-2">
                {currentStep < steps.length && (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCurrentStep(s => Math.min(steps.length, s + 1))}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-blue-600 text-white font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><polyline points="9 18 15 12 9 6"/></svg>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className={`mt-12 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-6 border-2 border-blue-100">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Secure & Encrypted</p>
                  <p className="text-xs text-slate-500">Bank-grade security</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Verified Process</p>
                  <p className="text-xs text-slate-500">Quick approval</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Join 2000+ Clinics</p>
                  <p className="text-xs text-slate-500">Growing network</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Professional Support</p>
                  <p className="text-xs text-slate-500">24/7 assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}