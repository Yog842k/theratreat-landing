import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactSelect from "react-select";
import "./react-select-custom.css";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { 
  User, 
  GraduationCap, 
  Brain, 
  Clock, 
  DollarSign, 
  Building2, 
  Camera, 
  FileText, 
  Shield, 
  Upload,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Languages,
  Award,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Lock,
  UserCheck,
  Users,
  TrendingUp,
  Globe,
  Heart,
  Bot,
  Star,
  BarChart3,
  Network,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Activity,
  Baby,
  Hand,
  MessageCircle,
  CreditCard as BankIcon,
  Loader2
} from "lucide-react";



interface TherapistRegistrationProps {
  setCurrentView: (view: any) => void;
}

interface FormData {
  // Personal & Contact Information
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  password: string; // Added password field for registration
  residentialAddress: string;
  currentCity: string;
  state: string;
  preferredLanguages: string[];
  panCard: string;
  
  // Education & Credentials
  qualification: string;
  university: string;
  graduationYear: string;
  licenseNumber: string;
  
  // Specialization & Experience
  designations: string[];
  primaryConditions: string[];
  experience: string;
  workplaces: string;
  onlineExperience: boolean;
  
  // Availability & Scheduling
  preferredDays: string[];
  preferredTimeSlots: string[];
  weeklySessions: string;
  sessionDurations: string[];
  
  // Session Charges & Payment
  sessionFee: string;
  dynamicPricing: boolean;
  freeFirstSession: boolean;
  paymentMode: string;
  // Session Modes & Pricing
  sessionModesOffered: string[]; // e.g. ['video','audio','in-clinic']
  sessionModePrices: {
    video: string;
    audio: string;
    inHome: string;
  };
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
  
  // Clinic Setup
  hasClinic: boolean;
  
  // Profile Details
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
  
  // Agreements & Consents
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


export function TherapistRegistration({ setCurrentView }: TherapistRegistrationProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [panVerified, setPanVerified] = useState<boolean>(false);
  const [panVerifyLoading, setPanVerifyLoading] = useState<boolean>(false);
  const [panVerifyMsg, setPanVerifyMsg] = useState<string>("");
  const [panVerifyErr, setPanVerifyErr] = useState<string>("");
  const [panVerifyDetails, setPanVerifyDetails] = useState<{
    nameOnCard?: string;
    dobOnCard?: string;
    match?: { nameMatch?: boolean; dobMatch?: boolean; score?: number };
    provider?: any;
  } | null>(null);
  // OTP state for phone verification
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpInfo, setOtpInfo] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [resendSeconds, setResendSeconds] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    password: "", // Added password field initialization
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
      ifscCode: "",
      upiId: ""
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

  // Upload progress trackers
  const [uploadProgress, setUploadProgress] = useState({
    qualification: 0,
    license: 0,
    resume: 0,
    profile: 0
  });

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

  // All comprehensive designations from your specification
  const designations = [
    "Behavioural Therapist", "Cognitive Behavioural Therapist", "Neuro-Developmental Therapist",
    "Occupational Therapist", "Physiotherapist", "Special Educator",
    "Speech and Language Pathologist", "Sports Therapist", "ABA Therapist",
    "Acupuncture/Acupressure Therapist", "Animal-Assisted Therapist", "Aqua Therapist",
    "Aromatherapist", "Art Therapist", "Chiropractor / Osteopath", "Clinical Psychologist",
    "Cupping Therapist", "Dance Movement Therapist", "Dietician", "Fitness Instructor",
    "Hand Therapist", "Holistic/Hypnotherapist", "Horticultural Therapist",
    "Massage Therapist", "Music Therapist", "Naturopathic Therapist", "Neonatal Therapist",
    "Orthotistician", "Prosthetist", "Panchakarma Therapist", "Play Therapist",
    "Psychotherapist", "Recreational Therapist", "Rehabilitation Therapist", "Yoga Therapist"
  ];

  // All comprehensive condition categories from your specification
  const conditionCategories = [
    {
      id: "neurological",
      title: "🧠 Neurological & Neurodevelopmental Conditions",
      conditions: [
        "Autism Spectrum Disorder (ASD)", "Attention Deficit Hyperactivity Disorder (ADHD)",
        "Cerebral Palsy", "Down Syndrome", "Developmental Delays", "Sensory Processing Disorder",
        "Intellectual Disabilities", "Traumatic Brain Injury (TBI)", "Stroke (Post-Stroke Rehabilitation)",
        "Epilepsy", "Multiple Sclerosis", "Parkinson's Disease", "Alzheimer's Disease",
        "Huntington's Disease", "Guillain-Barré Syndrome"
      ]
    },
    {
      id: "orthopedic",
      title: "🦴 Orthopedic & Musculoskeletal Conditions",
      conditions: [
        "Fractures and Dislocations", "Arthritis (Rheumatoid, Osteoarthritis)", "Scoliosis",
        "Frozen Shoulder", "Sports Injuries", "Sprains and Strains",
        "Post-Surgical Rehabilitation (e.g. joint replacements)", "Back and Neck Pain",
        "Postural Deformities", "Carpal Tunnel Syndrome", "Plantar Fasciitis",
        "Tendonitis", "Spinal Cord Injury"
      ]
    },
    {
      id: "cardiovascular",
      title: "❤️ Cardiovascular & Pulmonary Conditions",
      conditions: [
        "Post-Heart Attack (MI) Rehabilitation", "Hypertension", "Coronary Artery Disease",
        "Chronic Obstructive Pulmonary Disease (COPD)", "Asthma", "Congestive Heart Failure",
        "Post-CABG (Bypass Surgery) Recovery", "Post-COVID Rehabilitation",
        "Deep Vein Thrombosis (DVT)", "Pulmonary Fibrosis"
      ]
    },
    {
      id: "psychological",
      title: "🧘‍♀️ Psychological & Psychiatric Conditions",
      conditions: [
        "Depression", "Anxiety Disorders", "Obsessive-Compulsive Disorder (OCD)",
        "Bipolar Disorder", "Schizophrenia", "Post-Traumatic Stress Disorder (PTSD)",
        "Eating Disorders (Anorexia, Bulimia, Binge Eating)", "Personality Disorders",
        "Sleep Disorders (Insomnia, Sleep Apnea)", "Substance Use/Addiction",
        "Self-Harm & Suicidal Ideation", "Panic Disorder", "Phobias"
      ]
    },
    {
      id: "pediatric",
      title: "🧒 Pediatric Conditions",
      conditions: [
        "Learning Disabilities (Dyslexia, Dysgraphia, Dyscalculia)", "Speech and Language Delays",
        "Motor Coordination Disorders (Dyspraxia)", "Feeding Difficulties", "Behavioral Challenges",
        "Autism & ADHD (covered above)", "Premature Birth Complications",
        "Developmental Apraxia of Speech", "Visual-Motor Integration Issues"
      ]
    },
    {
      id: "geriatric",
      title: "👩‍🦳 Geriatric Conditions",
      conditions: [
        "Dementia & Alzheimer's", "Fall Risk & Balance Issues", "Parkinson's (covered above)",
        "Arthritis (covered above)", "Post-Surgery Rehab (Hip, Knee replacements)",
        "Osteoporosis", "Age-related Hearing/Vision Loss", "Incontinence",
        "Social Isolation & Depression", "Polypharmacy Side Effects"
      ]
    },
    {
      id: "womens-health",
      title: "💕 Women's Health Conditions",
      conditions: [
        "Postpartum Depression", "PCOS & Hormonal Imbalance Support", "Infertility Counseling",
        "Menopause Management", "Prenatal & Postnatal Physiotherapy", "Pelvic Floor Dysfunction",
        "Sexual Health Issues", "Breast Cancer Rehab"
      ]
    },
    {
      id: "surgical-recovery",
      title: "🧑‍⚕️ Surgical & Medical Recovery",
      conditions: [
        "Post-Orthopedic Surgeries", "Post-Neurosurgeries", "Post-Cardiac Surgeries",
        "Post-Cancer Therapy (Chemo/Radiation Recovery)", "Scar Management",
        "Lymphedema", "Wound Healing Support", "Amputation & Prosthesis Training"
      ]
    },
    {
      id: "speech-language",
      title: "🗣️ Speech & Language Conditions",
      conditions: [
        "Aphasia", "Stuttering", "Articulation Disorders", "Voice Disorders",
        "Language Delay", "Auditory Processing Disorders", "Mutism", "Resonance Disorders"
      ]
    },
    {
      id: "sensory-perceptual",
      title: "👁️ Sensory & Perceptual Disorders",
      conditions: [
        "Sensory Integration Disorder", "Visual Processing Disorder", "Auditory Processing Disorder",
        "Tactile Defensiveness", "Body Awareness Challenges",
        "Proprioception & Vestibular Dysfunction"
      ]
    },
    {
      id: "occupational-therapy",
      title: "👩‍⚕️ Occupational Therapy Specific Concerns",
      conditions: [
        "Activities of Daily Living (ADL) Difficulties", "Handwriting Issues",
        "Fine Motor Skill Delay", "Time Management/Executive Function",
        "Vocational Rehabilitation", "Social Skills Training", "Assistive Device Training"
      ]
    },
    {
      id: "community-lifestyle",
      title: "🌍 Community & Lifestyle Disorders",
      conditions: [
        "Work Stress & Burnout", "Internet/Game Addiction", "Anger Management",
        "Career Confusion", "Relationship Issues", "Parenting Challenges",
        "Grief & Loss", "Low Self-Esteem", "Screen Time Addiction"
      ]
    }
  ];

  const languages = [
    "English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Kannada",
    "Malayalam", "Punjabi", "Odia", "Urdu", "Assamese", "Nepali", "Spanish", "French", "Other"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Late Night"];
  const sessionDurations = ["30 min sessions", "45 min sessions", "60 min sessions"];
  // Note: In-home address/contact details are captured at booking time only.

  const panFormatValid = useMemo(() => {
    const pan = (formData.panCard || '').toUpperCase();
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  }, [formData.panCard]);

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
      if (file.size > 5 * 1024 * 1024) { alert('File too large (max 5MB)'); return; }
      const fd = new FormData(); fd.append('file', file);
      // Use XHR to track progress since fetch doesn't expose it natively
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
  const endpoint = kind === 'resume' ? '/api/uploads/resume' : '/api/uploads/profile';
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

  // Aadhaar image upload removed; Aadhaar verification is done via IDfy

  // Handle resend countdown for OTP
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const canSendOtp = useMemo(() => {
    return Boolean(
      formData.fullName &&
      formData.email &&
      formData.password && formData.password.length >= 8 &&
      formData.phoneNumber
    );
  }, [formData.fullName, formData.email, formData.password, formData.phoneNumber]);

  const sendOtp = async () => {
    if (!canSendOtp || otpSending) return;
    setOtpSending(true);
    setOtpError("");
    setOtpInfo("");
    setOtpVerified(false);
    try {
      const res = await fetch('/api/therapist-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          resendOtp: true,
          isCompletingRegistration: false
        })
      });
      const json = await res.json();
      if (res.status === 202 && json?.otpSent) {
        setOtpSent(true);
        setOtpInfo(`OTP sent to ${json?.phone || formData.phoneNumber}. Expires in ${json?.ttlMinutes ?? 5} min.`);
        setResendSeconds(60);
      } else if (!res.ok) {
        throw new Error(json?.message || 'Failed to send OTP');
      } else {
        // Unexpected success path; treat as sent
        setOtpSent(true);
        setOtpInfo('OTP sent. Please check your phone.');
        setResendSeconds(60);
      }
    } catch (e: any) {
      setOtpError(e?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtpCode = async () => {
    if (!formData.phoneNumber || !otpCode || otpVerifying) return;
    setOtpVerifying(true);
    setOtpError("");
    setOtpInfo("");
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phoneNumber, code: otpCode, purpose: 'therapist_registration' })
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'OTP verification failed');
      }
      setOtpVerified(true);
      setOtpInfo('OTP verified successfully.');
    } catch (e: any) {
      setOtpVerified(false);
      setOtpError(e?.message || 'OTP verification failed');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleNext = () => {
    // Gate Step 1 by PAN verification
    if (currentStep === 1) {
      const pan = (formData.panCard || '').trim();
      if (!pan) {
        alert('Please enter PAN to proceed.');
        return;
      }
      if (!panVerified) {
        alert('Please verify your PAN before proceeding.');
        return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const bd = formData.bankDetails;
      // In-home specific address/contact is not required during registration
      if (!formData.qualificationCertUrls.length || !formData.licenseDocumentUrl || !formData.resumeUrl || !formData.profilePhotoUrl || !bd.accountHolder || !bd.bankName || !bd.accountNumber || !bd.ifscCode) {
        alert('Please complete all mandatory uploads and bank details.');
        setIsSubmitting(false);
        return;
      }
      // Combine all form data for submission using formData state
      const submissionData = {
        // Account creation fields
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        otpCode: otpCode || undefined,
        
        // Personal information
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        residentialAddress: formData.residentialAddress,
        currentCity: formData.currentCity,
  state: formData.state,
        preferredLanguages: formData.preferredLanguages,
        panCard: formData.panCard,
        
        // Education & credentials
        qualification: formData.qualification,
        university: formData.university,
        graduationYear: formData.graduationYear,
        licenseNumber: formData.licenseNumber,
        
        // Specialization
        designations: formData.designations,
        primaryConditions: formData.primaryConditions,
        experience: formData.experience,
        workplaces: formData.workplaces,
        onlineExperience: formData.onlineExperience,
        
        // Availability
        preferredDays: formData.preferredDays,
        preferredTimeSlots: formData.preferredTimeSlots,
        weeklySessions: formData.weeklySessions,
        sessionDurations: formData.sessionDurations,
        
        // Payments
        sessionFee: formData.sessionFee,
  sessionModesOffered: formData.sessionModesOffered,
  sessionModePrices: formData.sessionModePrices,
        dynamicPricing: formData.dynamicPricing,
        freeFirstSession: formData.freeFirstSession,
        paymentMode: formData.paymentMode,
        bankDetails: formData.bankDetails,
        
        // Profile details
        hasClinic: formData.hasClinic,
        bio: formData.bio,
        linkedIn: formData.linkedIn,
        website: formData.website,
        instagram: formData.instagram,
        therapyLanguages: formData.therapyLanguages,
        
        // Agreements
        agreements: formData.agreements,
        
        // Uploaded assets (Cloudinary)
        profilePhotoUrl: formData.profilePhotoUrl,
        qualificationCertUrls: formData.qualificationCertUrls,
        licenseDocumentUrl: formData.licenseDocumentUrl,
        resumeUrl: formData.resumeUrl,

        // Indicate this is complete registration
        isCompletingRegistration: true
      };
      
      console.log('Submitting registration data:', submissionData);
      
      // Submit to API
      const response = await fetch('/api/therapist-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });
      
      const result = await response.json();
      // If OTP was just sent (no code provided), inform user to enter OTP and re-submit
      if (response.status === 202 && result?.otpSent) {
        setOtpSent(true);
        setOtpInfo(`OTP sent to ${result?.phone || formData.phoneNumber}. Expires in ${result?.ttlMinutes ?? 5} min.`);
        setResendSeconds(60);
        setIsSubmitting(false);
        alert('We sent you an OTP. Please enter the code and submit again to complete registration.');
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      console.log('Registration successful:', result);
      
      // Store authentication token if provided
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userType', 'therapist');
      }
      
      setIsSubmitting(false);
      
      // Show success message
      alert('Registration completed successfully! Welcome to TheraBook.');
      
      // Navigate to therapist dashboard
      setCurrentView("therapist-dashboard");
      
    } catch (error) {
      setIsSubmitting(false);
      console.error('Registration failed:', error);
      
      // Show error message to user
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
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">👤 Personal & Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <ReactSelect
                  instanceId="tr-gender"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "non-binary", label: "Non-binary" },
                    { value: "prefer-not-to-say", label: "Prefer not to say" },
                  ]}
                  value={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "non-binary", label: "Non-binary" },
                    { value: "prefer-not-to-say", label: "Prefer not to say" },
                  ].find(opt => opt.value === formData.gender) || null}
                  onChange={selected => handleInputChange("gender", selected ? selected.value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select gender"
                  isClearable
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number * [+91 - ]</Label>
                <div className="space-y-2">
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="+91 "
                  />
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={!canSendOtp || otpSending || resendSeconds > 0} onClick={sendOtp}>
                      {otpSending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>) : (otpSent ? (resendSeconds > 0 ? `Resend OTP (${resendSeconds})` : 'Resend OTP') : 'Send OTP')}
                    </Button>
                    <Input
                      id="otpCode"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-44"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!otpCode || otpCode.length < 6 || !formData.phoneNumber || otpVerifying}
                      onClick={verifyOtpCode}
                    >
                      {otpVerifying ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>) : (otpVerified ? 'Verified' : 'Verify OTP')}
                    </Button>
                  </div>
                  {otpInfo && <p className="text-xs text-green-700">{otpInfo}</p>}
                  {otpError && <p className="text-xs text-red-600">{otpError}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email ID *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password * (min 8 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter a secure password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCity">Current City / Location *</Label>
                <Input
                  id="currentCity"
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange("currentCity", e.target.value)}
                  placeholder="Enter your current city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <select
                  id="state"
                  className="w-full border rounded px-3 py-2 text-sm bg-background"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                >
                  <option value="">Select State</option>
                  {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="residentialAddress">Residential Address *</Label>
              <Textarea
                id="residentialAddress"
                value={formData.residentialAddress}
                onChange={(e) => handleInputChange("residentialAddress", e.target.value)}
                placeholder="Enter your complete residential address"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Preferred Communication Language(s) *</Label>
              <ReactSelect
                instanceId="tr-comm-langs"
                isMulti
                options={languages.map(lang => ({ value: lang, label: lang }))}
                value={formData.preferredLanguages.map(lang => ({ value: lang, label: lang }))}
                onChange={selected => handleInputChange("preferredLanguages", selected.map(opt => opt.value))}
                classNamePrefix="react-select"
                placeholder="Select language(s)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="panCard">PAN Card Number *</Label>
                <Input
                  id="panCard"
                  value={formData.panCard}
                  onChange={(e) => {
                    const raw = e.target.value.toUpperCase();
                    const clean = raw.replace(/[^A-Z0-9]/g, '').slice(0, 10);
                    handleInputChange("panCard", clean);
                    setPanVerified(false);
                    setPanVerifyMsg("");
                    setPanVerifyErr("");
                    setPanVerifyDetails(null);
                  }}
                  placeholder="ABCDE1234F"
                />
                <p className="text-xs text-muted-foreground mt-1">Format: AAAAA9999A. Ensure your Name and DOB match your PAN card.</p>
                {formData.panCard && !panFormatValid && (
                  <p className="text-xs text-red-600 mt-1">PAN format is invalid.</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={panVerifyLoading || !formData.panCard || !formData.fullName || !formData.dateOfBirth || !panFormatValid}
                    onClick={async () => {
                      try {
                        setPanVerifyLoading(true);
                        setPanVerified(false);
                        setPanVerifyMsg("");
                        setPanVerifyErr("");
                        setPanVerifyDetails(null);
                        const res = await fetch('/api/kyc/verify-pan', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            pan: formData.panCard,
                            name: formData.fullName,
                            dob: formData.dateOfBirth,
                          })
                        });
                        const json = await res.json();
                        if (!json?.success) {
                          throw new Error(json?.message || 'PAN verification failed');
                        }
                        const nameMatch = !!json?.data?.match?.nameMatch;
                        const dobMatch = !!json?.data?.match?.dobMatch;
                        setPanVerifyDetails({
                          nameOnCard: json?.data?.nameOnCard,
                          dobOnCard: json?.data?.dobOnCard,
                          match: json?.data?.match,
                          provider: json?.data?.provider
                        });
                        if (nameMatch && dobMatch) {
                          setPanVerified(true);
                          setPanVerifyMsg('PAN Verified.');
                        } else {
                          setPanVerified(false);
                          setPanVerifyErr('PAN details do not match. Please ensure your name and DOB match the PAN records.');
                        }
                      } catch (e: any) {
                        setPanVerified(false);
                        setPanVerifyErr(e?.message || 'PAN verification failed');
                      } finally {
                        setPanVerifyLoading(false);
                      }
                    }}
                  >
                    {panVerifyLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>) : 'Verify PAN'}
                  </Button>
                  {panVerified && (
                    <span className="inline-flex items-center text-green-700 text-xs"><CheckCircle className="w-4 h-4 mr-1"/>Verified</span>
                  )}
                </div>
                {panVerifyMsg && (
                  <p className="text-xs text-green-700 mt-1">{panVerifyMsg}</p>
                )}
                {panVerifyErr && (
                  <p className="text-xs text-red-600 mt-1">{panVerifyErr}</p>
                )}
                {panVerifyDetails && (
                  <div className="mt-3 rounded-md border border-border bg-white/50 p-3 text-sm">
                    <div className="mt-0 flex flex-wrap gap-2 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${panVerifyDetails.match?.nameMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Name {panVerifyDetails.match?.nameMatch ? 'match' : 'mismatch'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${panVerifyDetails.match?.dobMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <CheckCircle className="w-3 h-3 mr-1" /> DOB {panVerifyDetails.match?.dobMatch ? 'match' : 'mismatch'}
                      </span>
                      {typeof panVerifyDetails.provider?.panStatus === 'string' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">PAN Status: {String(panVerifyDetails.provider.panStatus)}</span>
                      )}
                      {typeof panVerifyDetails.provider?.aadhaarSeedingStatus === 'boolean' && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${panVerifyDetails.provider.aadhaarSeedingStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          Aadhaar seeding: {panVerifyDetails.provider.aadhaarSeedingStatus ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="mt-2">
                {/* PAN card image upload removed: IDfy verification is used instead */}
              </div>
            </div>

            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">🎓 Education & Credentials</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Highest Qualification *</Label>
                <ReactSelect
                  instanceId="tr-qualification"
                  options={[
                    { value: "phd", label: "PhD" },
                    { value: "masters", label: "Master's Degree" },
                    { value: "bachelors", label: "Bachelor's Degree" },
                    { value: "diploma", label: "Diploma" },
                    { value: "certificate", label: "Professional Certificate" },
                  ]}
                  value={[
                    { value: "phd", label: "PhD" },
                    { value: "masters", label: "Master's Degree" },
                    { value: "bachelors", label: "Bachelor's Degree" },
                    { value: "diploma", label: "Diploma" },
                    { value: "certificate", label: "Professional Certificate" },
                  ].find(opt => opt.value === formData.qualification) || null}
                  onChange={selected => handleInputChange("qualification", selected ? selected.value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select qualification"
                  isClearable
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">* University/Institute Name *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                  placeholder="Enter university/institute name"
                />
              </div>

              <div className="space-y-2">
                <Label>Year of Graduation *</Label>
                <ReactSelect
                  instanceId="tr-grad-year"
                  options={Array.from({ length: 50 }, (_, i) => 2024 - i).map(year => ({ value: year.toString(), label: year.toString() }))}
                  value={Array.from({ length: 50 }, (_, i) => 2024 - i).map(year => ({ value: year.toString(), label: year.toString() })).find(opt => opt.value === formData.graduationYear) || null}
                  onChange={selected => handleInputChange("graduationYear", selected ? selected.value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select year"
                  isClearable
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Licensing/Registration Number (Respected council) *</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  placeholder="Enter license/registration number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload Documents</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors relative">
                  <input multiple type="file" accept="application/pdf,image/png,image/jpeg" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e)=> { const files = Array.from(e.target.files||[]); files.forEach(f=> uploadToCloud(f, url => setFormData(p=>({...p, qualificationCertUrls:[...p.qualificationCertUrls, url]})), 'qualification')); }} />
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Qualification Certificate(s) *</p>
                  <p className="text-xs text-muted-foreground">PDF / Image (Max 5MB each)</p>
                  {formData.qualificationCertUrls.length>0 && <p className="text-xs text-green-600 mt-2">{formData.qualificationCertUrls.length} uploaded</p>}
                  {uploadProgress.qualification>0 && uploadProgress.qualification<100 && (
                    <div className='mt-3'><Progress value={uploadProgress.qualification} className='h-1' /></div>
                  )}
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors relative">
                  <input type="file" accept="application/pdf,image/png,image/jpeg" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e)=> { const f = e.target.files?.[0]; if (f) uploadToCloud(f, url => setFormData(p=>({...p, licenseDocumentUrl:url})), 'license'); }} />
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Professional License *</p>
                  <p className="text-xs text-muted-foreground">PDF / Image (Max 5MB)</p>
                  {formData.licenseDocumentUrl && <p className="text-xs text-green-600 mt-2">Uploaded ✓</p>}
                  {uploadProgress.license>0 && uploadProgress.license<100 && (
                    <div className='mt-3'><Progress value={uploadProgress.license} className='h-1' /></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">🧠 Specialization & Experience</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Professional Designation(s) * [Multi-select]</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {designations.map((designation) => (
                    <div key={designation} className="flex items-center space-x-2">
                      <Checkbox
                        id={designation}
                        checked={formData.designations.includes(designation)}
                        onCheckedChange={() => handleArrayToggle("designations", designation)}
                      />
                      <Label htmlFor={designation} className="text-sm">{designation}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Primary Conditions You Work With [Choose Any 5 best describing your practice, add more later]</Label>
                {conditionCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <h4 className="font-medium text-blue-600">{category.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                      {category.conditions.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={condition}
                            checked={formData.primaryConditions.includes(condition)}
                            onCheckedChange={() => handleArrayToggle("primaryConditions", condition)}
                          />
                          <Label htmlFor={condition} className="text-sm">{condition}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <ReactSelect
                    instanceId="tr-experience-level"
                    options={[
                      { value: "0-1", label: "0-1 years" },
                      { value: "2-5", label: "2-5 years" },
                      { value: "6-10", label: "6-10 years" },
                      { value: "11-15", label: "11-15 years" },
                      { value: "16-20", label: "16-20 years" },
                      { value: "20+", label: "20+ years" },
                    ]}
                    value={[
                      { value: "0-1", label: "0-1 years" },
                      { value: "2-5", label: "2-5 years" },
                      { value: "6-10", label: "6-10 years" },
                      { value: "11-15", label: "11-15 years" },
                      { value: "16-20", label: "16-20 years" },
                      { value: "20+", label: "20+ years" },
                    ].find(opt => opt.value === formData.experience) || null}
                    onChange={selected => handleInputChange("experience", selected ? selected.value : "")}
                    classNamePrefix="react-select"
                    placeholder="Select experience"
                    isClearable
                  />
                </div>

                <div className="space-y-2">
                  <Label>Do you have experience conducting online therapy? *</Label>
                  <RadioGroup 
                    value={formData.onlineExperience ? "yes" : "no"}
                    onValueChange={(value) => handleInputChange("onlineExperience", value === "yes")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="online-yes" />
                      <Label htmlFor="online-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="online-no" />
                      <Label htmlFor="online-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workplaces">Previous Workplaces / Affiliations</Label>
                <Textarea
                  id="workplaces"
                  value={formData.workplaces}
                  onChange={(e) => handleInputChange("workplaces", e.target.value)}
                  placeholder="List your previous workplaces and affiliations..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Resume/CV *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors relative">
                  <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e)=> { const f = e.target.files?.[0]; if (f) uploadToCloud(f, url => setFormData(p=>({...p, resumeUrl:url})), 'resume'); }} />
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PDF (Max 5MB)</p>
                  {formData.resumeUrl && <p className="text-xs text-green-600 mt-2">Uploaded ✓</p>}
                  {uploadProgress.resume>0 && uploadProgress.resume<100 && (
                    <div className='mt-3'><Progress value={uploadProgress.resume} className='h-1' /></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">🕒 Availability & Scheduling</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Preferred Days * [Multi-select]</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {days.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.preferredDays.includes(day)}
                        onCheckedChange={() => handleArrayToggle("preferredDays", day)}
                      />
                      <Label htmlFor={day} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Preferred Time Slots * [Multi-select]</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox
                        id={slot}
                        checked={formData.preferredTimeSlots.includes(slot)}
                        onCheckedChange={() => handleArrayToggle("preferredTimeSlots", slot)}
                      />
                      <Label htmlFor={slot} className="text-sm">{slot}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Weekly Sessions Capacity *</Label>
                  <ReactSelect
                    instanceId="tr-days-available"
                    options={[
                      { value: "1-5", label: "1-5 sessions/week" },
                      { value: "6-10", label: "6-10 sessions/week" },
                      { value: "11-20", label: "11-20 sessions/week" },
                      { value: "21-30", label: "21-30 sessions/week" },
                      { value: "30+", label: "30+ sessions/week" },
                    ]}
                    value={[
                      { value: "1-5", label: "1-5 sessions/week" },
                      { value: "6-10", label: "6-10 sessions/week" },
                      { value: "11-20", label: "11-20 sessions/week" },
                      { value: "21-30", label: "21-30 sessions/week" },
                      { value: "30+", label: "30+ sessions/week" },
                    ].find(opt => opt.value === formData.weeklySessions) || null}
                    onChange={selected => handleInputChange("weeklySessions", selected ? selected.value : "")}
                    classNamePrefix="react-select"
                    placeholder="Select weekly capacity"
                    isClearable
                  />
                </div>

                <div className="space-y-3">
                  <Label>Session Duration Options * [Multi-select]</Label>
                  <div className="space-y-2">
                    {sessionDurations.map((duration) => (
                      <div key={duration} className="flex items-center space-x-2">
                        <Checkbox
                          id={duration}
                          checked={formData.sessionDurations.includes(duration)}
                          onCheckedChange={() => handleArrayToggle("sessionDurations", duration)}
                        />
                        <Label htmlFor={duration} className="text-sm">{duration}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">💰 Session Charges & Payment</h3>
            </div>

            <div className="space-y-6">
              {/* Session Modes & Individual Pricing */}
              <div className="space-y-3">
                <Label>Session Modes & Pricing *</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { id: 'video', label: 'Video Session' },
                    { id: 'audio', label: 'Audio Session' },
                    { id: 'inHome', label: 'In-Home Session' }
                  ].map(mode => {
                    const checked = formData.sessionModesOffered.includes(mode.id === 'inHome' ? 'in-home' : mode.id);
                    const storageKey = mode.id === 'inHome' ? 'inHome' : mode.id;
                    return (
                      <div key={mode.id} className="flex items-end gap-3 border rounded p-3 bg-white/50 dark:bg-neutral-900/40">
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            id={`mode-${mode.id}`}
                            checked={checked}
                            onCheckedChange={() => {
                              handleArrayToggle('sessionModesOffered', mode.id === 'inHome' ? 'in-home' : mode.id);
                            }}
                          />
                          <Label htmlFor={`mode-${mode.id}`} className="text-sm">{mode.label}</Label>
                        </div>
                        <div className="w-40">
                          <Input
                            type="number"
                            min="0"
                            placeholder="₹ Price"
                            value={formData.sessionModePrices[storageKey as keyof typeof formData.sessionModePrices]}
                            disabled={!checked}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                sessionModePrices: { ...prev.sessionModePrices, [storageKey]: val }
                              }));
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formData.sessionModesOffered.length === 0 && (
                  <p className="text-xs text-amber-600">Select at least one mode and add a price.</p>
                )}
                {/* In-Home address/contact details are collected during booking, not registration */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Payment Mode Preference *</Label>
                  <ReactSelect
                    instanceId="tr-session-durations"
                    options={[
                      { value: "bank-transfer", label: "Bank Transfer" },
                      { value: "upi", label: "UPI" },
                      { value: "both", label: "Both" },
                    ]}
                    value={[
                      { value: "bank-transfer", label: "Bank Transfer" },
                      { value: "upi", label: "UPI" },
                      { value: "both", label: "Both" },
                    ].find(opt => opt.value === formData.paymentMode) || null}
                    onChange={selected => handleInputChange("paymentMode", selected ? selected.value : "")}
                    classNamePrefix="react-select"
                    placeholder="Select payment mode"
                    isClearable
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dynamicPricing"
                    checked={formData.dynamicPricing}
                    onCheckedChange={(checked) => handleInputChange("dynamicPricing", checked)}
                  />
                  <Label htmlFor="dynamicPricing">Enable dynamic pricing based on demand</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeFirstSession"
                    checked={formData.freeFirstSession}
                    onCheckedChange={(checked) => handleInputChange("freeFirstSession", checked)}
                  />
                  <Label htmlFor="freeFirstSession">Offer free first session</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-blue-600">Bank Details for Payments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name *</Label>
                    <Input
                      id="accountHolder"
                      value={formData.bankDetails.accountHolder}
                      onChange={(e) => handleNestedInputChange("bankDetails", "accountHolder", e.target.value)}
                      placeholder="Enter account holder name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankDetails.bankName}
                      onChange={(e) => handleNestedInputChange("bankDetails", "bankName", e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) => handleNestedInputChange("bankDetails", "accountNumber", e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                    <Input
                      id="ifscCode"
                      value={formData.bankDetails.ifscCode}
                      onChange={(e) => handleNestedInputChange("bankDetails", "ifscCode", e.target.value)}
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID (Optional)</Label>
                    <Input
                      id="upiId"
                      value={formData.bankDetails.upiId}
                      onChange={(e) => handleNestedInputChange("bankDetails", "upiId", e.target.value)}
                      placeholder="Enter UPI ID"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">🏥 Clinic/Offline Setup</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Do you have a physical clinic/practice location? *</Label>
                <RadioGroup 
                  value={formData.hasClinic ? "yes" : "no"}
                  onValueChange={(value) => handleInputChange("hasClinic", value === "yes")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="clinic-yes" />
                    <Label htmlFor="clinic-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="clinic-no" />
                    <Label htmlFor="clinic-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.hasClinic && (
                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    Clinic setup details will be collected in a separate onboarding flow after registration completion.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Note: You can always add clinic details later through your dashboard settings.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">👤 Profile Details</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Profile Photo *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors relative">
                  <input type="file" accept="image/png,image/jpeg" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e)=> { const f = e.target.files?.[0]; if (f) uploadToCloud(f, url => setFormData(p=>({...p, profilePhotoUrl:url, profilePhoto:f})), 'profile'); }} />
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">JPG / PNG (Max 2MB)</p>
                  {formData.profilePhotoUrl && <p className="text-xs text-green-600 mt-2">Uploaded ✓</p>}
                  {uploadProgress.profile>0 && uploadProgress.profile<100 && (
                    <div className='mt-3'><Progress value={uploadProgress.profile} className='h-1' /></div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Write a brief professional bio (200-500 words)"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn Profile (Optional)</Label>
                  <Input
                    id="linkedIn"
                    value={formData.linkedIn}
                    onChange={(e) => handleInputChange("linkedIn", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Professional Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Profile (Optional)</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Therapy Languages * [Multi-select]</Label>
                <ReactSelect
                  instanceId="tr-payment-mode"
                  isMulti
                  options={languages.map(lang => ({ value: lang, label: lang }))}
                  value={formData.therapyLanguages.map(lang => ({ value: lang, label: lang }))}
                  onChange={selected => handleInputChange("therapyLanguages", selected.map(opt => opt.value))}
                  classNamePrefix="react-select"
                  placeholder="Select therapy language(s)"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">📋 Agreements & Consent</h3>
            </div>

            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Please read and accept all agreements below to complete your registration.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="accuracy"
                    checked={formData.agreements.accuracy}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "accuracy", checked)}
                  />
                  <Label htmlFor="accuracy" className="text-sm">
                    I confirm that all information provided is accurate and up-to-date *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="verification"
                    checked={formData.agreements.verification}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "verification", checked)}
                  />
                  <Label htmlFor="verification" className="text-sm">
                    I agree to verification of my credentials and documents *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="guidelines"
                    checked={formData.agreements.guidelines}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "guidelines", checked)}
                  />
                  <Label htmlFor="guidelines" className="text-sm">
                    I agree to follow TheraTreat's <a href="/privacy">professional guidelines and code of conduct.</a> *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="confidentiality"
                    checked={formData.agreements.confidentiality}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "confidentiality", checked)}
                  />
                  <Label htmlFor="confidentiality" className="text-sm">
                    I agree to maintain patient confidentiality as per medical ethics *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="independent"
                    checked={formData.agreements.independent}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "independent", checked)}
                  />
                  <Label htmlFor="independent" className="text-sm">
                    I understand that I am an independent practitioner, not an employee of TheraTreat *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="norms"
                    checked={formData.agreements.norms}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "norms", checked)}
                  />
                  <Label htmlFor="norms" className="text-sm">
                    I agree to adhere to professional norms and therapy session standards *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="conduct"
                    checked={formData.agreements.conduct}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "conduct", checked)}
                  />
                  <Label htmlFor="conduct" className="text-sm">
                    I agree to maintain professional conduct during all interactions *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreements.terms}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "terms", checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I have read and agree to the Terms of Service *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="digitalConsent"
                    checked={formData.agreements.digitalConsent}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "digitalConsent", checked)}
                  />
                  <Label htmlFor="digitalConsent" className="text-sm">
                    I consent to digital record keeping and data processing *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="secureDelivery"
                    checked={formData.agreements.secureDelivery}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "secureDelivery", checked)}
                  />
                  <Label htmlFor="secureDelivery" className="text-sm">
                    I agree to secure delivery of therapy services through the platform *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="declaration"
                    checked={formData.agreements.declaration}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "declaration", checked)}
                  />
                  <Label htmlFor="declaration" className="text-sm">
                    I declare that I am mentally and physically fit to provide therapy services *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="serviceAgreement"
                    checked={formData.agreements.serviceAgreement}
                    onCheckedChange={(checked) => handleNestedInputChange("agreements", "serviceAgreement", checked)}
                  />
                  <Label htmlFor="serviceAgreement" className="text-sm">
                    I agree to the Service Agreement and understand the payment terms *
                  </Label>
                </div>
              </div>

              {!isFormValid() && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete all required fields and accept all agreements to proceed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Join TheraTreat as a Therapist</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete your comprehensive registration to start connecting with patients and growing your practice
            </p>
          </motion.div>
        </div>

        {/* Why Register as a Therapist - Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-green-600 mb-2">
                Why Register as a Therapist?
              </CardTitle>
              <p className="text-muted-foreground">
                Join thousands of healthcare professionals transforming lives through TheraTreat
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-600">👩‍⚕️ Expand Your Reach</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-13">
                    Connect with thousands of patients actively seeking therapy across India.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-600">💵 Boost Your Income</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-13">
                    Earn more with flexible session pricing and transparent payouts.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-600">🗓️ Smart Scheduling</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-13">
                    Easily manage availability, bookings, and reschedules with one dashboard.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-orange-600">🤖 AI-Powered Tools</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-13">
                    Get intelligent insights, reminders, and support to improve efficiency and client outcomes.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-yellow-600">🌟 Build Your Reputation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-13">
                    Gain visibility through verified profiles, patient reviews, and featured listings.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Network className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-teal-600">🤝 Community & Support</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-13">
                    Access training, workshops, and peer networking.
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mt-8 text-center"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-200">
                  <p className="text-green-700 font-medium">
                    💡 Ready to transform your practice? Complete the registration below to get started!
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-600">Step {currentStep} of {totalSteps}</h2>
            <Badge variant="outline" className="px-3 py-1">
              Therapist Registration
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main registration form card */}
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-600">Step {currentStep}: {stepTitles[currentStep - 1]}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline"
            disabled={currentStep === 1}
            onClick={handlePrevious}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          
          {currentStep === totalSteps ? (
            <Button 
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? 'Completing Registration...' : 'Complete Registration'}
              <CheckCircle className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TherapistRegistration;
