"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, DollarSign, Globe, Award, TrendingUp, Heart, Users, 
  ArrowRight, Upload, X, Plus, CheckCircle, User, Mail, Phone, 
  Briefcase, BookOpen, Clock, Video, MonitorPlay, Mic, ChevronLeft
} from "lucide-react";
import { ViewType } from "@/constants/app-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/client-utils";

interface InstructorRegistrationProps {
  setCurrentView?: (view: ViewType) => void;
  onComplete?: () => void;
}

export function InstructorRegistration({ setCurrentView, onComplete }: InstructorRegistrationProps) {
  const otpTemporarilyDisabled = true; // TODO: flip to false when OTP service is restored
  const [currentStep, setCurrentStep] = useState(1);
  const [instructorData, setInstructorData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    bio: "",
    profileImage: "",
    existingTherapist: false,
    qualifications: "",
    experience: "",
    specializations: [] as string[],
    certifications: "",
    currentPosition: "",
    institution: "",
    courseTitle: "",
    courseDescription: "",
    courseCategory: "",
    courseDuration: "",
    courseLevel: "",
    coursePrice: "",
    courseLanguage: "",
    courseOutline: [""],
    courseBenefits: [""],
    courseRequirements: [""],
    courseChapters: [{ title: "", videoUrl: "" }],
    courseNotes: [{ title: "", url: "" }],
    teachingMode: "hybrid",
    maxStudents: "",
    sessionDuration: "",
    availability: "",
    timeZone: "",
    webinarTitle: "",
    webinarDateTime: "",
    webinarIsPaid: false,
    webinarPrice: "",
    termsAccepted: false,
    marketingConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [therapistAuth, setTherapistAuth] = useState({ email: "", password: "" });
  const [therapistVerified, setTherapistVerified] = useState(false);
  const [therapistChecking, setTherapistChecking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Data Constants
  const specializations = [
    "Clinical Psychology", "Physiotherapy", "Occupational Therapy", "Speech Therapy",
    "Mental Health", "Rehabilitation Medicine", "Pediatric Therapy", "Geriatric Care",
    "Sports Medicine", "Neurotherapy", "CBT", "Family Therapy",
  ];

  const courseCategories = [
    "Clinical Skills", "Therapeutic Techniques", "Assessment Methods", "Research & Evidence",
    "Patient Care", "Professional Development", "Certification Prep", "Specialized Therapy", "Health Tech",
  ];

  const teachingModes = [
    { id: "recorded", label: "Recorded", icon: Video, desc: "Self-paced video content" },
    { id: "live", label: "Live Sessions", icon: Mic, desc: "Real-time interaction" },
    { id: "hybrid", label: "Hybrid", icon: MonitorPlay, desc: "Mix of both formats" },
  ];

  const normalizePhone = (value: string) => {
    const raw = value.trim();
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    if (raw.startsWith("+")) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    if (digits.startsWith("91") && digits.length > 10) return `+${digits}`;
    if (digits.length > 10) return `+${digits}`;
    return `+91${digits}`;
  };

  // Handlers
  const addArrayItem = (field: keyof typeof instructorData, value = "") => {
    const arr = instructorData[field] as string[];
    setInstructorData({ ...instructorData, [field]: [...arr, value] });
  };

  const removeArrayItem = (field: keyof typeof instructorData, index: number) => {
    const arr = instructorData[field] as string[];
    setInstructorData({ ...instructorData, [field]: arr.filter((_, i) => i !== index) });
  };

  const updateArrayItem = (field: keyof typeof instructorData, index: number, value: string) => {
    const arr = instructorData[field] as string[];
    setInstructorData({ ...instructorData, [field]: arr.map((item, i) => (i === index ? value : item)) });
  };

  const addChapter = () => {
    setInstructorData((prev) => ({
      ...prev,
      courseChapters: [...prev.courseChapters, { title: "", videoUrl: "" }],
    }));
  };

  const updateChapter = (index: number, key: "title" | "videoUrl", value: string) => {
    setInstructorData((prev) => ({
      ...prev,
      courseChapters: prev.courseChapters.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    }));
  };

  const removeChapter = (index: number) => {
    setInstructorData((prev) => ({
      ...prev,
      courseChapters: prev.courseChapters.filter((_, i) => i !== index),
    }));
  };

  const addNote = () => {
    setInstructorData((prev) => ({
      ...prev,
      courseNotes: [...prev.courseNotes, { title: "", url: "" }],
    }));
  };

  const updateNote = (index: number, key: "title" | "url", value: string) => {
    setInstructorData((prev) => ({
      ...prev,
      courseNotes: prev.courseNotes.map((n, i) => (i === index ? { ...n, [key]: value } : n)),
    }));
  };

  const removeNote = (index: number) => {
    setInstructorData((prev) => ({
      ...prev,
      courseNotes: prev.courseNotes.filter((_, i) => i !== index),
    }));
  };

  const toggleSpecialization = (spec: string) => {
    const current = instructorData.specializations;
    if (current.includes(spec)) {
      setInstructorData({ ...instructorData, specializations: current.filter(s => s !== spec) });
    } else {
      setInstructorData({ ...instructorData, specializations: [...current, spec] });
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMb = 4;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Image too large. Max ${maxMb}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setInstructorData({ ...instructorData, profileImage: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const requestOtp = async () => {
    if (otpTemporarilyDisabled) {
      toast.info("OTP verification temporarily disabled");
      setOtpSent(true);
      setOtpVerified(true);
      setOtp("000000");
      return;
    }
    if (!instructorData.phone) {
      toast.error("Enter your phone number first");
      return;
    }
    setOtpSending(true);
    setOtpVerified(false);
    try {
      const phone = normalizePhone(instructorData.phone);
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "signup:instructor" }),
      });
      const data = await res.json();
      if (res.ok && data?.success && data?.data?.otpSent) {
        setOtpSent(true);
        setOtp("");
        setResendSeconds(data?.data?.nextSendSeconds || 60);
        toast.success("OTP sent to your phone");
      } else {
        toast.error(data?.message || "Could not send OTP");
      }
    } catch (err) {
      console.error("[otp request]", err);
      toast.error("Could not send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (otpTemporarilyDisabled) {
      setOtpVerified(true);
      setOtp("000000");
      toast.info("OTP check bypassed");
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setOtpVerifying(true);
    try {
      const phone = normalizePhone(instructorData.phone);
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp, purpose: "signup:instructor" }),
      });
      const data = await res.json();
      if (res.ok && data?.success && data?.data?.verified) {
        setOtpVerified(true);
        toast.success("Phone verified");
      } else {
        setOtpVerified(false);
        toast.error(data?.message || "Invalid OTP, please try again");
      }
    } catch (err) {
      console.error("[otp verify]", err);
      toast.error("OTP verification failed");
    } finally {
      setOtpVerifying(false);
    }
  };

  const confirmTherapistAccount = async () => {
    if (!instructorData.existingTherapist) return;
    if (!therapistAuth.email || !therapistAuth.password) {
      toast.error("Enter your therapist email and password");
      return;
    }
    if (!otpTemporarilyDisabled && !otpVerified) {
      toast.error("Verify the OTP to continue");
      return;
    }
    setTherapistChecking(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: therapistAuth.email, password: therapistAuth.password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setTherapistVerified(false);
        toast.error(data?.message || "Could not confirm therapist account");
        return;
      }

      const userType = data?.data?.user?.userType;
      if (userType !== "therapist") {
        setTherapistVerified(false);
        toast.error("Account is not registered as therapist");
        return;
      }

      setTherapistVerified(true);
      setInstructorData((prev) => {
        if (prev.email) return prev;
        return { ...prev, email: therapistAuth.email };
      });
      toast.success("Therapist account confirmed. You can proceed as instructor.");
    } catch (err) {
      console.error("[therapist confirm]", err);
      setTherapistVerified(false);
      toast.error("Therapist confirmation failed");
    } finally {
      setTherapistChecking(false);
    }
  };

  const fillDummyInstructor = () => {
    const upcomingWebinar = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);

    setInstructorData((prev) => ({
      ...prev,
      fullName: "Dr. Demo Instructor",
      email: "instructor.demo+001@theralearn.test",
      password: "DemoPass123!",
      confirmPassword: "DemoPass123!",
      phone: "+91 9876543210",
      bio: "Senior clinician sharing practical rehab frameworks and live case breakdowns for new instructors.",
      profileImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=512&q=80",
      existingTherapist: false,
      qualifications: "MPT, Fellowship in Manual Therapy",
      experience: "5-10",
      specializations: ["Physiotherapy", "Sports Medicine", "CBT"],
      certifications: "Dry Needling Level 1 - Kinesio Taping Certified",
      currentPosition: "Senior Physiotherapist",
      institution: "TheraCare Rehab Centre",
      courseTitle: "Evidence-Based Rehab Protocols",
      courseDescription: "Design safe, progressive rehab plans with measurable outcomes for MSK cases.",
      courseCategory: "Therapeutic Techniques",
      courseDuration: "6 weeks",
      courseLevel: "Intermediate",
      coursePrice: "3499",
      courseLanguage: "english",
      courseOutline: [
        "Assessment frameworks and baselines",
        "Manual therapy and mobility progressions",
        "Home program design with adherence",
      ],
      courseBenefits: [
        "Confidently triage and assess MSK cases",
        "Plan progressive protocols with safety checks",
        "Communicate rehab goals to patients effectively",
      ],
      courseRequirements: [
        "Basic clinical experience",
        "Willingness to complete weekly assignments",
      ],
      courseChapters: [
        { title: "Intro and red flags", videoUrl: "https://videos.example.com/intro.mp4" },
        { title: "Shoulder protocol demo", videoUrl: "https://videos.example.com/shoulder.mp4" },
      ],
      courseNotes: [
        { title: "Week 1 slides", url: "https://files.example.com/week1.pdf" },
        { title: "Exercise handouts", url: "https://files.example.com/handouts.pdf" },
      ],
      teachingMode: "hybrid",
      maxStudents: "30",
      sessionDuration: "1hr",
      availability: "Sat-Sun, 10am-1pm IST",
      timeZone: "Asia/Kolkata",
      webinarTitle: "Live Case Demo: Shoulder Rehab",
      webinarDateTime: upcomingWebinar,
      webinarIsPaid: true,
      webinarPrice: "299",
      termsAccepted: true,
      marketingConsent: true,
    }));

    setOtpSent(true);
    setOtpVerified(true);
    setOtp("000000");
    setTherapistVerified(false);
    setCurrentStep(4);
    toast.success("Dummy instructor details filled (OTP mocked)");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorData.termsAccepted) {
      toast.error("Please accept the terms to continue");
      return;
    }
    if (!otpTemporarilyDisabled && !otpVerified) {
      toast.error("Verify your phone with OTP to continue");
      return;
    }
    if (instructorData.existingTherapist && !therapistVerified) {
      toast.error("Confirm your therapist account with email, password, and OTP");
      return;
    }
    if (instructorData.password !== instructorData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const phone = normalizePhone(instructorData.phone);
      const payload = {
        name: instructorData.fullName,
        email: instructorData.email,
        password: instructorData.password,
        userType: "instructor",
        phone,
        profileImageUrl: instructorData.profileImage || undefined,
        existingTherapist: instructorData.existingTherapist,
        profile: {
          bio: instructorData.bio,
          qualifications: instructorData.qualifications,
          experience: instructorData.experience,
          specializations: instructorData.specializations,
          certifications: instructorData.certifications,
          currentPosition: instructorData.currentPosition,
          institution: instructorData.institution,
          teachingMode: instructorData.teachingMode,
          courseLanguage: instructorData.courseLanguage,
          availability: instructorData.availability,
          sessionDuration: instructorData.sessionDuration,
          timeZone: instructorData.timeZone,
        },
        courseDraft: {
          title: instructorData.courseTitle,
          description: instructorData.courseDescription,
          category: instructorData.courseCategory,
          duration: instructorData.courseDuration,
          level: instructorData.courseLevel,
          price: instructorData.coursePrice,
          outline: instructorData.courseOutline,
          benefits: instructorData.courseBenefits,
          requirements: instructorData.courseRequirements,
          chapters: instructorData.courseChapters,
          notes: instructorData.courseNotes,
        },
        webinarDraft: instructorData.webinarTitle
          ? {
              title: instructorData.webinarTitle,
              scheduledAt: instructorData.webinarDateTime || null,
              isPaid: instructorData.webinarIsPaid,
              price: instructorData.webinarIsPaid ? instructorData.webinarPrice : "0",
              platform: "razorpay",
            }
          : undefined,
        marketingConsent: instructorData.marketingConsent,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data?.success) {
        toast.error(data?.message || "Registration failed");
        return;
      }

      toast.success("Instructor account created");
      onComplete?.();
      setCurrentView?.("dashboard");
    } catch (err: any) {
      console.error("[instructor registration]", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep((s) => Math.min(4, s + 1));
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  useEffect(() => {
    if (resendSeconds > 0) {
      const timer = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendSeconds]);

  useEffect(() => {
    if (otpTemporarilyDisabled) {
      setOtpSent(true);
      setOtpVerified(true);
      setOtp("000000");
    }
  }, [otpTemporarilyDisabled]);

  useEffect(() => {
    if (!instructorData.existingTherapist) {
      setTherapistVerified(false);
      setTherapistAuth((prev) => ({ ...prev, password: "" }));
    } else if (!therapistAuth.email && instructorData.email) {
      setTherapistAuth((prev) => ({ ...prev, email: instructorData.email }));
    }
  }, [instructorData.existingTherapist, instructorData.email, therapistAuth.email]);

  useEffect(() => {
    if (therapistVerified) {
      setTherapistVerified(false);
    }
  }, [therapistAuth.email, therapistAuth.password]);

  // --- Components ---

  const StepIndicator = () => (
    <div className="flex justify-between items-center mb-10 px-4 max-w-2xl mx-auto">
      {[1, 2, 3, 4].map((step) => {
        const isActive = currentStep >= step;
        const isCurrent = currentStep === step;
        return (
          <div key={step} className="flex flex-col items-center relative z-10">
            <motion.div 
              initial={false}
              animate={{
                backgroundColor: isActive ? "#ea580c" : "#e5e7eb",
                scale: isCurrent ? 1.1 : 1,
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                isActive ? "text-white shadow-lg shadow-orange-200" : "text-gray-500"
              }`}
            >
              {isActive ? <CheckCircle className="w-5 h-5" /> : step}
            </motion.div>
            <span className={`text-xs mt-2 font-medium ${isCurrent ? "text-orange-600" : "text-gray-400"}`}>
              {step === 1 && "Profile"}
              {step === 2 && "Expertise"}
              {step === 3 && "Course"}
              {step === 4 && "Terms"}
            </span>
          </div>
        );
      })}
      {/* Progress Line */}
      <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0 hidden md:block max-w-2xl mx-auto right-0" />
      <motion.div 
        className="absolute top-5 left-0 h-0.5 bg-orange-500 -z-0 hidden md:block max-w-2xl mx-auto right-0 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: (currentStep - 1) / 3 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header Banner */}
      <div className="bg-orange-600 text-white pt-20 pb-32 px-6 rounded-b-[3rem] shadow-xl">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-1.5 backdrop-blur-md">
            Instructor Portal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Begin Your Teaching Journey</h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">
            Join TheraLearn to shape the future of healthcare education. Create courses, mentor students, and earn passive income.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-20">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="flex justify-end mb-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDummyInstructor}
                className="border-dashed border-slate-300 text-slate-700 hover:text-orange-700"
              >
                Create dummy instructor
              </Button>
            </div>
            
            <StepIndicator />

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Personal Info */}
                {currentStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800">Who are you?</h3>
                      <p className="text-slate-500">Let's start with your basic professional details.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Image Upload Area */}
                      <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
                        <div className="w-40 h-40 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-slate-200 transition-colors">
                           {instructorData.profileImage ? (
                             <img src={instructorData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <User className="w-16 h-16 text-slate-300" />
                           )}
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Upload className="w-8 h-8 text-white" />
                           </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Upload photo
                          </Button>
                          <Input
                            type="url"
                            placeholder="Paste image URL"
                            value={instructorData.profileImage}
                            onChange={(e) => setInstructorData({ ...instructorData, profileImage: e.target.value })}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">JPEG/PNG/GIF, up to 4MB.</p>
                      </div>

                      {/* Inputs */}
                      <div className="w-full md:w-2/3 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                              <Input className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="Dr. Jane Doe" value={instructorData.fullName} onChange={(e) => setInstructorData({ ...instructorData, fullName: e.target.value })} required />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Phone</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                              <Input
                                type="tel"
                                inputMode="tel"
                                pattern="[0-9+\-() ]*"
                                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                placeholder="+91 98765 43210"
                                value={instructorData.phone}
                                onChange={(e) => {
                                  setInstructorData({ ...instructorData, phone: e.target.value });
                                  setOtpVerified(false);
                                  setOtpSent(false);
                                  setOtp("");
                                  setTherapistVerified(false);
                                }}
                                required
                              />
                            </div>
                            <div className="space-y-2 pt-2">
                              <div className="flex flex-col gap-3 w-full">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={requestOtp}
                                  disabled={otpSending}
                                  className="border-dashed border-slate-300 text-slate-700 w-full"
                                >
                                  {otpSending ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                                </Button>
                                <div className="flex flex-col gap-2 w-full">
                                  <Input
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="h-11 bg-white w-full"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    maxLength={6}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                                    disabled={!otpSent || otpVerified}
                                  />
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={verifyOtp}
                                    disabled={!otpSent || otpVerified || otp.length !== 6 || otpVerifying}
                                    className="w-full"
                                  >
                                    {otpVerified ? "Verified" : otpVerifying ? "Verifying..." : "Verify"}
                                  </Button>
                                </div>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-2">
                                {otpTemporarilyDisabled ? (
                                  <span className="text-orange-600 font-semibold">OTP check is temporarily bypassed.</span>
                                ) : otpVerified ? (
                                  <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Phone verified</span>
                                ) : otpSent ? (
                                  <span>{resendSeconds > 0 ? `Resend available in ${resendSeconds}s` : "You can resend the OTP if needed."}</span>
                                ) : (
                                  <span>We use OTP to verify your phone for instructor onboarding.</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                              type="email"
                              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                              placeholder="doctor@hospital.com"
                              value={instructorData.email}
                              onChange={(e) => {
                                setInstructorData({ ...instructorData, email: e.target.value });
                                if (instructorData.existingTherapist) {
                                  setTherapistAuth((prev) => ({ ...prev, email: e.target.value }));
                                  setTherapistVerified(false);
                                }
                              }}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <Checkbox
                            id="existing-therapist"
                            checked={instructorData.existingTherapist}
                            onCheckedChange={(checked) => setInstructorData({ ...instructorData, existingTherapist: Boolean(checked) })}
                            className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                          />
                          <label htmlFor="existing-therapist" className="text-sm text-slate-700 cursor-pointer">
                            I’m already registered as a therapist — make me an instructor too.
                          </label>
                        </div>

                        {instructorData.existingTherapist && (
                          <div className="border border-orange-100 bg-orange-50/60 rounded-xl p-4 space-y-4 mt-2">
                            <div className="flex items-start justify-between gap-3 flex-col sm:flex-row sm:items-center">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">Confirm your therapist account</p>
                                <p className="text-xs text-slate-600">Enter your therapist login email, password, and complete the OTP check to continue as an instructor.</p>
                              </div>
                              <Badge className={cn("text-xs", therapistVerified ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700")}>{therapistVerified ? "Therapist verified" : "Verification needed"}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Therapist account email</label>
                                <Input
                                  type="email"
                                  className="h-11 bg-white"
                                  placeholder="therapist@clinic.com"
                                  value={therapistAuth.email}
                                  onChange={(e) => setTherapistAuth((prev) => ({ ...prev, email: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Therapist password</label>
                                <Input
                                  type="password"
                                  className="h-11 bg-white"
                                  placeholder="Enter therapist login password"
                                  value={therapistAuth.password}
                                  onChange={(e) => setTherapistAuth((prev) => ({ ...prev, password: e.target.value }))}
                                />
                              </div>
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                              <div className="flex flex-col gap-1 text-sm">
                                <span className={cn("font-semibold", otpVerified ? "text-green-700" : "text-orange-700")}>{otpVerified ? "OTP verified" : "OTP required"}</span>
                                <span className="text-xs text-slate-600">Use the OTP section above to verify your phone before confirming.</span>
                              </div>
                              <Button
                                type="button"
                                onClick={confirmTherapistAccount}
                                disabled={therapistChecking || !therapistAuth.email || !therapistAuth.password}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                {therapistChecking ? "Checking..." : therapistVerified ? "Therapist confirmed" : "Confirm therapist account"}
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <Input
                              type="password"
                              className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                              placeholder="Create a secure password"
                              value={instructorData.password}
                              onChange={(e) => setInstructorData({ ...instructorData, password: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                            <Input
                              type="password"
                              className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                              placeholder="Re-enter password"
                              value={instructorData.confirmPassword}
                              onChange={(e) => setInstructorData({ ...instructorData, confirmPassword: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Professional Bio</label>
                          <Textarea placeholder="Tell students about your journey, expertise, and what makes you passionate about teaching..." value={instructorData.bio} onChange={(e) => setInstructorData({ ...instructorData, bio: e.target.value })} className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white" required />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Professional Details */}
                {currentStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800">Your Expertise</h3>
                      <p className="text-slate-500">Highlight your qualifications and areas of specialization.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Current Position</label>
                         <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input className="pl-10 h-11 bg-slate-50" placeholder="e.g. Senior Physiotherapist" value={instructorData.currentPosition} onChange={(e) => setInstructorData({ ...instructorData, currentPosition: e.target.value })} />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Institution/Hospital</label>
                         <Input className="h-11 bg-slate-50" placeholder="e.g. Apollo Hospitals" value={instructorData.institution} onChange={(e) => setInstructorData({ ...instructorData, institution: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Highest Qualification</label>
                         <Input className="h-11 bg-slate-50" placeholder="e.g. PhD, MD, Masters" value={instructorData.qualifications} onChange={(e) => setInstructorData({ ...instructorData, qualifications: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Experience (Years)</label>
                         <Select onValueChange={(value) => setInstructorData({ ...instructorData, experience: value })}>
                            <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Select range" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2-5">2-5 years</SelectItem>
                              <SelectItem value="5-10">5-10 years</SelectItem>
                              <SelectItem value="10-15">10-15 years</SelectItem>
                              <SelectItem value="15+">15+ years</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700">Specializations</label>
                      <div className="flex flex-wrap gap-2">
                        {specializations.map((spec) => {
                          const isSelected = instructorData.specializations.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSpecialization(spec)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                isSelected 
                                  ? "bg-orange-100 border-orange-200 text-orange-700 shadow-sm" 
                                  : "bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-orange-50"
                              }`}
                            >
                              {spec}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Certifications & Awards</label>
                      <Textarea placeholder="List key certifications..." value={instructorData.certifications} onChange={(e) => setInstructorData({ ...instructorData, certifications: e.target.value })} className="bg-slate-50" />
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Course Creation */}
                {currentStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800">Draft Your Course</h3>
                      <p className="text-slate-500">Outline the course you intend to launch first.</p>
                    </div>

                    <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700">Course Title</label>
                           <Input className="h-12 text-lg font-medium bg-white" placeholder="e.g. Advanced CBT Techniques for Anxiety" value={instructorData.courseTitle} onChange={(e) => setInstructorData({ ...instructorData, courseTitle: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Category</label>
                              <Select onValueChange={(value) => setInstructorData({ ...instructorData, courseCategory: value })}>
                                <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent>
                                    {courseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Course Price (₹)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  className="pl-8 h-11 bg-white"
                                  placeholder="2999"
                                  value={instructorData.coursePrice}
                                  onChange={(e) => setInstructorData({ ...instructorData, coursePrice: e.target.value })}
                                />
                              </div>
                           </div>
                        </div>

                        <div className="mt-6 space-y-3 border border-slate-200 rounded-xl p-4 bg-white">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">Webinar Setup (optional)</p>
                              <p className="text-xs text-slate-500">Schedule your first webinar and choose if it’s paid or free. Payments go through Razorpay.</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="webinar-paid"
                                checked={instructorData.webinarIsPaid}
                                onCheckedChange={(checked) => setInstructorData({ ...instructorData, webinarIsPaid: Boolean(checked) })}
                                className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                              />
                              <label htmlFor="webinar-paid" className="text-sm text-slate-700 cursor-pointer">Paid webinar</label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Webinar Title</label>
                              <Input
                                type="text"
                                placeholder="e.g. Live Case Demo on CBT"
                                value={instructorData.webinarTitle}
                                onChange={(e) => setInstructorData({ ...instructorData, webinarTitle: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Date & Time</label>
                              <Input
                                type="datetime-local"
                                value={instructorData.webinarDateTime}
                                onChange={(e) => setInstructorData({ ...instructorData, webinarDateTime: e.target.value })}
                              />
                            </div>
                          </div>

                          {instructorData.webinarIsPaid && (
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Webinar Price (₹)</label>
                              <div className="relative max-w-xs">
                                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  className="pl-8 h-11 bg-white"
                                  placeholder="499"
                                  value={instructorData.webinarPrice}
                                  onChange={(e) => setInstructorData({ ...instructorData, webinarPrice: e.target.value })}
                                />
                              </div>
                              <p className="text-xs text-slate-500">Students will pay via Razorpay to join this webinar.</p>
                            </div>
                          )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">Course Outline</label>
                            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Draft Mode</span>
                        </div>
                        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                            {instructorData.courseOutline.map((outline, index) => (
                                <div key={index} className="relative group">
                                    <div className="absolute -left-[25px] top-3 w-4 h-4 rounded-full bg-slate-200 border-2 border-white group-focus-within:bg-orange-500 transition-colors" />
                                    <div className="flex gap-2">
                                        <Input 
                                            className="h-11 bg-slate-50 focus:bg-white transition-colors"
                                            placeholder={`Module ${index + 1} Title`} 
                                            value={outline} 
                                            onChange={(e) => updateArrayItem("courseOutline", index, e.target.value)} 
                                        />
                                        {instructorData.courseOutline.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("courseOutline", index)} className="text-slate-400 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" onClick={() => addArrayItem("courseOutline")} className="ml-4 border-dashed border-slate-300 text-slate-600 hover:text-orange-600 hover:border-orange-200">
                           <Plus className="w-4 h-4 mr-2" /> Add Module
                        </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">Course Chapters (videos)</label>
                        <span className="text-xs text-slate-500">Add title and video link</span>
                      </div>
                      <div className="space-y-3">
                        {instructorData.courseChapters.map((chapter, index) => (
                          <div key={index} className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-500">Chapter {index + 1}</span>
                              {instructorData.courseChapters.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeChapter(index)} className="text-slate-400 hover:text-red-500">
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                className="h-11 bg-slate-50"
                                placeholder="Chapter title"
                                value={chapter.title}
                                onChange={(e) => updateChapter(index, "title", e.target.value)}
                              />
                              <Input
                                className="h-11 bg-slate-50"
                                placeholder="Video URL (mp4 / hosted link)"
                                value={chapter.videoUrl}
                                onChange={(e) => updateChapter(index, "videoUrl", e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" onClick={addChapter} className="border-dashed border-slate-300 text-slate-600 hover:text-orange-600 hover:border-orange-200">
                        <Plus className="w-4 h-4 mr-2" /> Add Chapter Video
                      </Button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Learning Benefits (What will they learn?)</label>
                        <div className="grid grid-cols-1 gap-3">
                            {instructorData.courseBenefits.map((benefit, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <Input className="h-10 bg-slate-50" placeholder="Enter a key benefit..." value={benefit} onChange={(e) => updateArrayItem("courseBenefits", index, e.target.value)} />
                                    {instructorData.courseBenefits.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("courseBenefits", index)} className="text-slate-400 hover:text-red-500">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem("courseBenefits")} className="w-fit text-orange-600 hover:bg-orange-50">
                                <Plus className="w-3 h-3 mr-1" /> Add Benefit
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700">Course Notes (PDF links)</label>
                      <div className="space-y-3">
                        {instructorData.courseNotes.map((note, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                            <Input
                              className="h-11 bg-slate-50"
                              placeholder="Notes title (e.g., Week 1 handout)"
                              value={note.title}
                              onChange={(e) => updateNote(index, "title", e.target.value)}
                            />
                            <div className="flex gap-2 items-center">
                              <Input
                                className="h-11 bg-slate-50"
                                placeholder="PDF link"
                                value={note.url}
                                onChange={(e) => updateNote(index, "url", e.target.value)}
                              />
                              {instructorData.courseNotes.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeNote(index)} className="text-slate-400 hover:text-red-500">
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" onClick={addNote} className="border-dashed border-slate-300 text-slate-600 hover:text-orange-600 hover:border-orange-200">
                        <Plus className="w-4 h-4 mr-2" /> Add Notes PDF
                      </Button>
                      <p className="text-xs text-slate-500">Paste a public PDF link (Drive/Dropbox/S3). Upload flow can be added later.</p>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Preferences & Terms */}
                {currentStep === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                     <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800">Final Steps</h3>
                      <p className="text-slate-500">Set your teaching style and agree to terms.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Preferred Teaching Mode</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {teachingModes.map((mode) => (
                                <div 
                                    key={mode.id}
                                    onClick={() => setInstructorData({ ...instructorData, teachingMode: mode.id })}
                                    className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 ${
                                        instructorData.teachingMode === mode.id 
                                        ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" 
                                        : "border-slate-200 hover:border-orange-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <mode.icon className={`w-6 h-6 mb-3 ${instructorData.teachingMode === mode.id ? "text-orange-600" : "text-slate-500"}`} />
                                    <h4 className="font-semibold text-sm text-slate-900">{mode.label}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{mode.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <label className="text-sm font-semibold text-slate-700">Availability</label>
                             <Textarea placeholder="e.g. Weekends, Evenings IST..." value={instructorData.availability} onChange={(e) => setInstructorData({ ...instructorData, availability: e.target.value })} className="bg-slate-50 min-h-[100px]" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Course Language</label>
                                <Select onValueChange={(value) => setInstructorData({ ...instructorData, courseLanguage: value })}>
                                    <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Primary Language" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="hindi">Hindi</SelectItem>
                                        <SelectItem value="bilingual">Hinglish</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Session Duration</label>
                                <Select onValueChange={(value) => setInstructorData({ ...instructorData, sessionDuration: value })}>
                                    <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Standard Length" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1hr">1 Hour</SelectItem>
                                        <SelectItem value="2hr">2 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex items-start space-x-3">
                            <Checkbox 
                                id="terms" 
                                checked={instructorData.termsAccepted}
                                onCheckedChange={(checked) => setInstructorData({ ...instructorData, termsAccepted: Boolean(checked) })}
                                className="mt-1 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                            />
                            <label htmlFor="terms" className="text-sm text-slate-600 leading-tight cursor-pointer">
                                I confirm that the information provided is accurate and I agree to the <span className="text-orange-600 hover:underline">Instructor Terms & Conditions</span>.
                            </label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Checkbox 
                                id="marketing"
                                checked={instructorData.marketingConsent}
                                onCheckedChange={(checked) => setInstructorData({ ...instructorData, marketingConsent: Boolean(checked) })}
                                className="mt-1 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                            />
                            <label htmlFor="marketing" className="text-sm text-slate-600 leading-tight cursor-pointer">
                                I consent to receive communications about teaching opportunities and platform updates.
                            </label>
                        </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={prevStep} 
                    disabled={currentStep === 1} 
                    className="text-slate-500 hover:text-slate-800 disabled:opacity-30"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>

                {currentStep < 4 ? (
                    <Button 
                        type="button" 
                        onClick={nextStep} 
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 h-11 rounded-full shadow-lg shadow-orange-200"
                    >
                        Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                ) : (
                    <Button 
                        type="submit" 
                      disabled={!instructorData.termsAccepted || submitting}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 h-11 rounded-full shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit Application"} <CheckCircle className="ml-2 w-4 h-4" />
                    </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8 text-slate-400 text-sm">
        <p>© 2025 TheraLearn Inc. All rights reserved.</p>
      </div>
    </motion.div>
  );
}