import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, Building2, MapPin, Phone, Mail, Calendar, Clock, Briefcase, Globe, Instagram, FileText, Shield, Sparkles, ArrowRight, Check, AlertCircle, Heart, Award, Users, Zap } from "lucide-react";

interface ClinicRegistrationProps {
  setCurrentView?: (view: any) => void;
}

interface ClinicFormData {
  clinicName: string;
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
  numTherapists: string;
  website: string;
  instagram: string;
  profilePhoto: File | null;
  agreements: {
    accuracy: boolean;
    terms: boolean;
    consent: boolean;
  };
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const servicesList = [
  "Speech Therapy", "Occupational Therapy", "Physiotherapy", "Psychology", "Special Education", "Counseling", "Other"
];

const indianStates = [
  "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Telangana", "Gujarat", 
  "West Bengal", "Rajasthan", "Uttar Pradesh", "Kerala", "Punjab", "Haryana"
];

export default function ClinicRegistration({ setCurrentView }: ClinicRegistrationProps) {
  const [gstRegistered, setGstRegistered] = useState<string>("");
  const [gstin, setGstin] = useState<string>("");
  const [gstBusinessName, setGstBusinessName] = useState<string>("");
  const [gstCertificate, setGstCertificate] = useState<File | null>(null);
  const [gstStatus, setGstStatus] = useState<string>("");
  const [gstState, setGstState] = useState<string>("");
  const [gstDeclarationAgreed, setGstDeclarationAgreed] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  
  const [formData, setFormData] = useState<ClinicFormData>({
    clinicName: "",
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
    numTherapists: "",
    website: "",
    instagram: "",
    profilePhoto: null,
    agreements: {
      accuracy: false,
      terms: false,
      consent: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (field: keyof ClinicFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof ClinicFormData, value: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      const newArr = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
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
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Clinic registration submitted successfully!");
      if (setCurrentView) setCurrentView("success");
    }, 1500);
  };

  const steps = [
    { num: 1, title: "GST Info", icon: Shield },
    { num: 2, title: "Clinic Details", icon: Building2 },
    { num: 3, title: "Services", icon: Briefcase },
    { num: 4, title: "Review", icon: CheckCircle2 }
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
              
              {/* GST Registration Section */}
              <div className="space-y-6">
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
                      onClick={() => setGstRegistered("yes")}
                      className={`py-4 px-6 rounded-xl font-bold transition-all duration-300 border-2 ${
                        gstRegistered === "yes"
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/50 scale-105'
                          : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <Check className={`w-5 h-5 mx-auto mb-1 ${gstRegistered === "yes" ? 'opacity-100' : 'opacity-0'}`} />
                      Yes, I have GST
                    </button>
                    <button
                      type="button"
                      onClick={() => setGstRegistered("no")}
                      className={`py-4 px-6 rounded-xl font-bold transition-all duration-300 border-2 ${
                        gstRegistered === "no"
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/50 scale-105'
                          : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <Check className={`w-5 h-5 mx-auto mb-1 ${gstRegistered === "no" ? 'opacity-100' : 'opacity-0'}`} />
                      No GST
                    </button>
                  </div>
                </div>

                {gstRegistered === "yes" && (
                  <div className="space-y-6 bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-sm">
                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">GSTIN (15-digit Number)</Label>
                      <Input 
                        value={gstin} 
                        onChange={e => setGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))} 
                        placeholder="27ABCDE1234F1Z4" 
                        maxLength={15}
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">Registered Business Name</Label>
                      <Input 
                        value={gstBusinessName} 
                        onChange={e => setGstBusinessName(e.target.value)} 
                        placeholder="As per GST certificate"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-slate-900"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-700 font-semibold mb-2 block">Upload GST Certificate</Label>
                      <div className="relative">
                        <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                          <Input 
                            type="file" 
                            accept=".pdf,.jpeg,.jpg,.png" 
                            onChange={e => setGstCertificate(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="text-center">
                            <Upload className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-500 mt-1">PDF, JPEG, PNG (max 5MB)</p>
                          </div>
                        </div>
                        {gstCertificate && (
                          <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-semibold">{gstCertificate.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-700 font-semibold mb-3 block">GST Status</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setGstStatus("active")}
                          className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                            gstStatus === "active"
                              ? 'bg-green-500 text-white border-green-600 shadow-lg'
                              : 'bg-white text-slate-700 border-blue-200 hover:border-green-400'
                          }`}
                        >
                          ✓ Active
                        </button>
                        <button
                          type="button"
                          onClick={() => setGstStatus("inactive")}
                          className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                            gstStatus === "inactive"
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
                        value={gstState} 
                        onChange={e => setGstState(e.target.value)}
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

                {gstRegistered === "no" && (
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
                              checked={gstDeclarationAgreed} 
                              onChange={e => setGstDeclarationAgreed(e.target.checked)}
                              className="w-6 h-6 rounded-lg border-2 border-amber-400 appearance-none checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
                            />
                            {gstDeclarationAgreed && (
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
              </div>

              {/* Clinic Details Section */}
              <div className="space-y-6">
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
                      Clinic Name
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
                    <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Registration Number
                    </Label>
                    <Input 
                      value={formData.registrationNumber} 
                      onChange={e => handleInputChange("registrationNumber", e.target.value)}
                      placeholder="Clinic registration number"
                      className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Complete Address
                  </Label>
                  <Input 
                    value={formData.address} 
                    onChange={e => handleInputChange("address", e.target.value)}
                    placeholder="Street, Area, Landmark"
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-700 font-semibold mb-2 block">City</Label>
                    <Input 
                      value={formData.city} 
                      onChange={e => handleInputChange("city", e.target.value)}
                      placeholder="Mumbai"
                      className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold mb-2 block">State</Label>
                    <select 
                      value={formData.state} 
                      onChange={e => handleInputChange("state", e.target.value)}
                      className="w-full h-12 border-2 border-blue-200 rounded-xl px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                      required
                    >
                      <option value="">Select</option>
                      {indianStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold mb-2 block">Pincode</Label>
                    <Input 
                      value={formData.pincode} 
                      onChange={e => handleInputChange("pincode", e.target.value)}
                      placeholder="400001"
                      maxLength={6}
                      className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Contact Email
                    </Label>
                    <Input 
                      type="email"
                      value={formData.contactEmail} 
                      onChange={e => handleInputChange("contactEmail", e.target.value)}
                      placeholder="clinic@example.com"
                      className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      Contact Phone
                    </Label>
                    <Input 
                      value={formData.contactPhone} 
                      onChange={e => handleInputChange("contactPhone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Services Section */}
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
                  <Input 
                    value={formData.operatingHours} 
                    onChange={e => handleInputChange("operatingHours", e.target.value)}
                    placeholder="e.g. 9:00 AM - 6:00 PM"
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold mb-3 block">Services Offered</Label>
                  <div className="flex flex-wrap gap-3">
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

              {/* Agreements Section */}
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

              {/* Submit Button */}
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
              </div>
            </form>
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