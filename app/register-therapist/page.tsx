"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Calendar,
  Bot,
  Star,
  Network,
  FileText,
  ChevronDown,
} from "lucide-react";

type ViewType = "home" | "register" | "book";

interface FormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
  };
  professionalInfo: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: string;
    primarySpecialty: string;
    yearsOfExperience: string;
    currentEmployment: string;
    workplaceName: string;
    workplaceAddress: string;
  };
  education: {
    highestDegree: string;
    institution: string;
    graduationYear: string;
    continuingEducation: string;
  };
  practiceDetails: {
    practiceType: string;
    serviceTypes: string[];
    sessionFormats: string[];
    languages: string[];
    ageGroups: string[];
  };
  availability: {
    workingDays: string[];
    preferredHours: string[];
    timeZone: string;
    consultationFees: {
      videoCall: string;
      audioCall: string;
      inPerson: string;
      chatConsultation: string;
    };
    emergencyAvailability: boolean;
  };
  location: {
    primaryAddress: string;
    city: string;
    state: string;
    pincode: string;
    onlineOnly: boolean;
    clinicVisits: boolean;
    homeVisits: boolean;
  };
  documents: {
    profilePicture: string;
  };
  agreements: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    professionalConduct: boolean;
    serviceAgreement: boolean;
  };
}

export default function RegisterTherapistPage() {
  // India States and Union Territories
  const INDIA_STATES: string[] = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];
  const INDIA_UTS: string[] = [
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
  const INDIA_STATES_AND_UTS = [...INDIA_STATES, ...INDIA_UTS];

  // Categorized Conditions (used instead of Service Types Offered)
  const conditionCategories: { id: string; title: string; conditions: string[] }[] = [
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

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
    },
    professionalInfo: {
      licenseNumber: "",
      licenseState: "",
      licenseExpiry: "",
      primarySpecialty: "",
      yearsOfExperience: "",
      currentEmployment: "",
      workplaceName: "",
      workplaceAddress: "",
    },
    education: {
      highestDegree: "",
      institution: "",
      graduationYear: "",
      continuingEducation: "",
    },
    practiceDetails: {
      practiceType: "",
      serviceTypes: [],
      sessionFormats: [],
      languages: [],
      ageGroups: [],
    },
    availability: {
      workingDays: [],
      preferredHours: [],
      timeZone: "",
      consultationFees: {
        videoCall: "",
        audioCall: "",
        inPerson: "",
        chatConsultation: "",
      },
      emergencyAvailability: false,
    },
    location: {
      primaryAddress: "",
      city: "",
      state: "",
      pincode: "",
      onlineOnly: false,
      clinicVisits: false,
      homeVisits: false,
    },
    documents: {
      profilePicture: "",
    },
    agreements: {
      termsOfService: false,
      privacyPolicy: false,
      professionalConduct: false,
      serviceAgreement: false,
    },
  });

  const stepTitles = [
    "Personal Information",
    "Professional Information",
    "Education & Certifications",
    "Practice Details",
    "Availability & Pricing",
    "Location & Service Areas",
    "Documents & Verification",
    "Terms & Agreements",
  ];

  function handleInputChange(section: keyof FormData, field: string, value: any) {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }
  function handleNestedInputChange(section: keyof FormData, subsection: string, field: string, value: any) {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev as any)[section][subsection],
          [field]: value,
        },
      },
    }));
  }
  function handleArrayToggle(section: keyof FormData, field: string, value: string) {
    setFormData((prev) => {
      const arr = (prev as any)[section][field] as string[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [section]: { ...(prev as any)[section], [field]: next } } as FormData;
    });
  }

  function isFormValid(): boolean {
    const { personalInfo, professionalInfo, education, practiceDetails, availability, location, documents, agreements } = formData;
    switch (currentStep) {
      case 1:
        return !!(personalInfo.firstName && personalInfo.lastName && personalInfo.email && personalInfo.phone && personalInfo.dateOfBirth && personalInfo.gender);
      case 2:
        return !!(professionalInfo.licenseNumber && professionalInfo.licenseState && professionalInfo.primarySpecialty && professionalInfo.yearsOfExperience);
      case 3:
        return !!(education.highestDegree && education.institution && education.graduationYear);
      case 4:
        return !!(practiceDetails.serviceTypes.length > 0 && practiceDetails.sessionFormats.length > 0);
      case 5:
        return !!(availability.workingDays.length > 0 && availability.consultationFees.videoCall && availability.timeZone);
      case 6:
        return !!(location.primaryAddress && location.city && location.state && location.pincode);
      case 7:
        return true; // documents optional except basic profile picture, which we’ll make optional too
      case 8:
        return !!(agreements.termsOfService && agreements.privacyPolicy && agreements.professionalConduct && agreements.serviceAgreement);
      default:
        return false;
    }
  }

  async function handleSubmitAll() {
    setSubmitError(null);
    if (!isFormValid()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/therapists/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit");
      setSubmitted(true);
    } catch (e: any) {
      setSubmitError(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // Simple animated custom select
  function AnimatedSelect({
    value,
    onChange,
    options,
    placeholder = "Select",
  }: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder?: string;
  }) {
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState<string | null>(null);

    return (
      <div className="relative" onBlur={(e) => {
        // Close if focus leaves the container
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}>
        <button
          type="button"
          className="w-full border rounded px-3 py-2 flex items-center justify-between hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`truncate ${!value ? "text-gray-400" : ""}`}>{value || placeholder}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </motion.span>
        </button>
        <motion.div
          initial={false}
          animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.98 }}
          style={{ pointerEvents: open ? "auto" : "none" }}
          transition={{ duration: 0.15 }}
          className="absolute z-20 mt-2 w-full origin-top"
        >
          <div className="rounded-lg border border-blue-200 shadow-lg bg-white overflow-hidden">
            <div className="max-h-64 overflow-auto">
              {[...options, "Other"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onMouseEnter={() => setHighlight(opt)}
                  onMouseLeave={() => setHighlight(null)}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    (value === opt || highlight === opt) ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Animated multi-select for Preferred Working Hours
  function AnimatedMultiSelect({
    values,
    onChange,
    options,
    placeholder = "Select",
  }: {
    values: string[];
    onChange: (v: string[]) => void;
    options: string[];
    placeholder?: string;
  }) {
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState<string | null>(null);

    const toggle = (opt: string) => {
      const next = values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt];
      onChange(next);
    };

    const label = values.length ? values.join(", ") : placeholder;

    return (
      <div className="relative" onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}>
        <button
          type="button"
          className="w-full border rounded px-3 py-2 flex items-center justify-between hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`truncate ${values.length === 0 ? "text-gray-400" : ""}`}>{label}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </motion.span>
        </button>
        <motion.div
          initial={false}
          animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.98 }}
          style={{ pointerEvents: open ? "auto" : "none" }}
          transition={{ duration: 0.15 }}
          className="absolute z-20 mt-2 w-full origin-top"
        >
          <div className="rounded-lg border border-blue-200 shadow-lg bg-white overflow-hidden">
            <div className="max-h-64 overflow-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onMouseEnter={() => setHighlight(opt)}
                  onMouseLeave={() => setHighlight(null)}
                  onClick={() => toggle(opt)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${
                    (values.includes(opt) || highlight === opt) ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                  }`}
                >
                  <span>{opt}</span>
                  {values.includes(opt) && <span className="ml-3 inline-block w-2 h-2 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2">First Name *</label>
                <input className="w-full border rounded px-3 py-2" value={formData.personalInfo.firstName} onChange={(e) => handleInputChange("personalInfo", "firstName", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">Last Name *</label>
                <input className="w-full border rounded px-3 py-2" value={formData.personalInfo.lastName} onChange={(e) => handleInputChange("personalInfo", "lastName", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">Email *</label>
                <input type="email" className="w-full border rounded px-3 py-2" value={formData.personalInfo.email} onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">Phone *</label>
                <input type="tel" className="w-full border rounded px-3 py-2" value={formData.personalInfo.phone} onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">Date of Birth *</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={formData.personalInfo.dateOfBirth} onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">Gender *</label>
                <select className="w-full border rounded px-3 py-2" value={formData.personalInfo.gender} onChange={(e) => handleInputChange("personalInfo", "gender", e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2">License Number *</label>
                <input className="w-full border rounded px-3 py-2" value={formData.professionalInfo.licenseNumber} onChange={(e) => handleInputChange("professionalInfo", "licenseNumber", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">License State/Authority *</label>
                <AnimatedSelect
                  value={formData.professionalInfo.licenseState}
                  onChange={(v) => handleInputChange("professionalInfo", "licenseState", v)}
                  options={INDIA_STATES_AND_UTS}
                  placeholder="Select State/UT"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">License Expiry</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={formData.professionalInfo.licenseExpiry} onChange={(e) => handleInputChange("professionalInfo", "licenseExpiry", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">Primary Specialty *</label>
                <select className="w-full border rounded px-3 py-2" value={formData.professionalInfo.primarySpecialty} onChange={(e) => handleInputChange("professionalInfo", "primarySpecialty", e.target.value)}>
                  
        

                  {/* Added specialties */}
                  <option value="behavioural-therapist">Behavioural Therapist</option>
                  <option value="cognitive-behavioural-therapist">Cognitive Behavioural Therapist</option>
                  <option value="neuro-developmental-therapist">Neuro-Developmental Therapist</option>
                  <option value="occupational-therapist">Occupational Therapist</option>
                  <option value="physiotherapist">Physiotherapist</option>
                  <option value="special-educator">Special Educator</option>
                  <option value="speech-language-pathologist">Speech and Language Pathologist</option>
                  <option value="sports-therapist">Sports Therapist</option>
                  <option value="aba-therapist">ABA Therapist</option>
                  <option value="acupuncture-acupressure-therapist">Acupuncture/Acupressure Therapist</option>
                  <option value="animal-assisted-therapist">Animal-Assisted Therapist</option>
                  <option value="aqua-therapist">Aqua Therapist</option>
                  <option value="aromatherapist">Aromatherapist</option>
                  <option value="art-therapist">Art Therapist</option>
                  <option value="chiropractor-osteopath">Chiropractor / Osteopath</option>
                  <option value="clinical-psychologist">Clinical Psychologist</option>
                  <option value="cupping-therapist">Cupping Therapist</option>
                  <option value="dance-movement-therapist">Dance Movement Therapist</option>
                  <option value="dietician">Dietician</option>
                  <option value="fitness-instructor">Fitness Instructor</option>
                  <option value="hand-therapist">Hand Therapist</option>
                  <option value="holistic-hypnotherapist">Holistic/Hypnotherapist</option>
                  <option value="horticultural-therapist">Horticultural Therapist</option>
                  <option value="massage-therapist">Massage Therapist</option>
                  <option value="music-therapist">Music Therapist</option>
                  <option value="naturopathic-therapist">Naturopathic Therapist</option>
                  <option value="neonatal-therapist">Neonatal Therapist</option>
                  <option value="orthotistician">Orthotistician</option>
                  <option value="prosthetist">Prosthetist</option>
                  <option value="panchakarma-therapist">Panchakarma Therapist</option>
                  <option value="play-therapist">Play Therapist</option>
                  <option value="psychotherapist">Psychotherapist</option>
                  <option value="recreational-therapist">Recreational Therapist</option>
                  <option value="rehabilitation-therapist">Rehabilitation Therapist</option>
                  <option value="yoga-therapist">Yoga Therapist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Years of Experience *</label>
                <select className="w-full border rounded px-3 py-2" value={formData.professionalInfo.yearsOfExperience} onChange={(e) => handleInputChange("professionalInfo", "yearsOfExperience", e.target.value)}>
                  <option value="">Select</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="11-15">11-15 years</option>
                  <option value="16-20">16-20 years</option>
                  <option value="20+">20+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Current Employment</label>
                <select className="w-full border rounded px-3 py-2" value={formData.professionalInfo.currentEmployment} onChange={(e) => handleInputChange("professionalInfo", "currentEmployment", e.target.value)}>
                  <option value="">Select</option>
                  <option value="private-practice">Private Practice</option>
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="freelance">Freelance</option>
                  <option value="unemployed">Currently Unemployed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Current Workplace Name</label>
              <input className="w-full border rounded px-3 py-2" value={formData.professionalInfo.workplaceName} onChange={(e) => handleInputChange("professionalInfo", "workplaceName", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-2">Workplace Address</label>
              <textarea className="w-full border rounded px-3 py-2" rows={3} value={formData.professionalInfo.workplaceAddress} onChange={(e) => handleInputChange("professionalInfo", "workplaceAddress", e.target.value)} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2">Highest Degree *</label>
                <select className="w-full border rounded px-3 py-2" value={formData.education.highestDegree} onChange={(e) => handleInputChange("education", "highestDegree", e.target.value)}>
                  <option value="">Select</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="doctorate">Doctorate/PhD</option>
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Professional Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Institution *</label>
                <input className="w-full border rounded px-3 py-2" value={formData.education.institution} onChange={(e) => handleInputChange("education", "institution", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">Graduation Year *</label>
                <input type="number" min={1980} max={new Date().getFullYear()} className="w-full border rounded px-3 py-2" value={formData.education.graduationYear} onChange={(e) => handleInputChange("education", "graduationYear", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Continuing Education & Training</label>
              <textarea className="w-full border rounded px-3 py-2" rows={4} value={formData.education.continuingEducation} onChange={(e) => handleInputChange("education", "continuingEducation", e.target.value)} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Conditions Treated *</label>
              <div className="space-y-5">
                {conditionCategories.map((cat) => (
                  <div key={cat.id}>
                    <div className="font-medium text-gray-700 mb-2">{cat.title}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {cat.conditions.map((cond) => (
                        <label key={cond} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.practiceDetails.serviceTypes.includes(cond)}
                            onChange={() => handleArrayToggle("practiceDetails", "serviceTypes", cond)}
                          />
                          {cond}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Session Formats *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Video Call","Audio Call","In-Person","Chat/Messaging"].map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.practiceDetails.sessionFormats.includes(s)} onChange={() => handleArrayToggle("practiceDetails","sessionFormats",s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Languages</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["English","Hindi","Bengali","Telugu","Marathi","Tamil","Gujarati","Kannada","Malayalam","Punjabi","Urdu","Other"].map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.practiceDetails.languages.includes(s)} onChange={() => handleArrayToggle("practiceDetails","languages",s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Age Groups</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Children (5-12)","Adolescents (13-17)","Adults (18-64)","Seniors (65+)"].map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.practiceDetails.ageGroups.includes(s)} onChange={() => handleArrayToggle("practiceDetails","ageGroups",s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Working Days *</label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.availability.workingDays.includes(s)} onChange={() => handleArrayToggle("availability","workingDays",s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2">Preferred Working Hours</label>
                <AnimatedMultiSelect
                  values={formData.availability.preferredHours}
                  onChange={(vals) => handleInputChange("availability","preferredHours", vals)}
                  options={[
                    "Morning (6 AM - 12 PM)",
                    "Afternoon (12 PM - 6 PM)",
                    "Evening (6 PM - 10 PM)",
                    "Flexible",
                  ]}
                  placeholder="Select one or more"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Time Zone *</label>
                <select className="w-full border rounded px-3 py-2" value={formData.availability.timeZone} onChange={(e) => handleInputChange("availability","timeZone", e.target.value)}>
                  <option value="">Select</option>
                  <option value="IST">IST (Indian Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="GMT">GMT (Greenwich Mean Time)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Consultation Fees (INR) *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  ["videoCall","Video Call Consultation *"],
                  ["audioCall","Audio Call Consultation"],
                  ["inPerson","In-Person Consultation"],
                  ["chatConsultation","Chat Consultation"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm mb-2">{label}</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={(formData.availability.consultationFees as any)[key]} onChange={(e) => handleNestedInputChange("availability","consultationFees", key, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.availability.emergencyAvailability} onChange={(e) => handleInputChange("availability","emergencyAvailability", e.target.checked)} />
              Available for emergency consultations (after hours)
            </label>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2">City *</label>
                <input className="w-full border rounded px-3 py-2" value={formData.location.city} onChange={(e) => handleInputChange("location","city", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-2">State *</label>
                <AnimatedSelect
                  value={formData.location.state}
                  onChange={(v) => handleInputChange("location", "state", v)}
                  options={INDIA_STATES_AND_UTS}
                  placeholder="Select State/UT"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">PIN Code *</label>
                <input className="w-full border rounded px-3 py-2" value={formData.location.pincode} onChange={(e) => handleInputChange("location","pincode", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Primary Practice Address *</label>
              <textarea className="w-full border rounded px-3 py-2" rows={3} value={formData.location.primaryAddress} onChange={(e) => handleInputChange("location","primaryAddress", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm mb-2">Service Delivery Options</label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.location.onlineOnly} onChange={(e) => handleInputChange("location","onlineOnly", e.target.checked)} />
                Online consultations only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.location.clinicVisits} onChange={(e) => handleInputChange("location","clinicVisits", e.target.checked)} />
                In-clinic consultations
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.location.homeVisits} onChange={(e) => handleInputChange("location","homeVisits", e.target.checked)} />
                Home visits (additional charges may apply)
              </label>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Professional Profile Picture (optional)</label>
              <input type="file" accept=".jpg,.jpeg,.png" className="w-full border rounded px-3 py-2" onChange={(e) => handleInputChange("documents","profilePicture", (e.target as HTMLInputElement).value)} />
              <p className="text-sm text-gray-500 mt-1">Upload a professional headshot (JPG, PNG)</p>
            </div>
            <div className="rounded border border-blue-200 bg-blue-50 p-4 text-blue-700 text-sm flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5" />
              <p>All documents will be securely stored and verified by our team. Only verified therapists can receive patient bookings.</p>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-600">Terms and Agreements</h3>
            <p className="text-gray-600">Please read and accept the following terms to complete your registration:</p>
            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={formData.agreements.termsOfService} onChange={(e) => handleInputChange("agreements","termsOfService", e.target.checked)} />
                I agree to the Terms of Service and understand my responsibilities as a healthcare provider on TheraTreat *
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={formData.agreements.privacyPolicy} onChange={(e) => handleInputChange("agreements","privacyPolicy", e.target.checked)} />
                I agree to the Privacy Policy and consent to data processing for platform operations *
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={formData.agreements.professionalConduct} onChange={(e) => handleInputChange("agreements","professionalConduct", e.target.checked)} />
                I agree to maintain professional conduct, patient confidentiality, and ethical standards *
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={formData.agreements.serviceAgreement} onChange={(e) => handleInputChange("agreements","serviceAgreement", e.target.checked)} />
                I agree to the Service Agreement and understand the payment terms *
              </label>
            </div>
            {!isFormValid() && (
              <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-yellow-800 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <p>Please complete all required fields and accept all agreements to proceed.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Join TheraTreat as a Therapist</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Complete your comprehensive registration to start connecting with patients and growing your practice.</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-12">
          <div className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-600">Expand Your Reach</h3>
                </div>
                <p className="text-sm text-gray-600 pl-13">Connect with thousands of patients actively seeking therapy across India.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-600">Boost Your Income</h3>
                </div>
                <p className="text-sm text-gray-600 pl-13">Earn more with flexible session pricing and transparent payouts.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-purple-600">Smart Scheduling</h3>
                </div>
                <p className="text-sm text-gray-600 pl-13">Manage availability, bookings, and reschedules with one dashboard.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-orange-600">AI-Powered Tools</h3>
                </div>
                <p className="text-sm text-gray-600 pl-13">Get intelligent insights, reminders, and support to improve efficiency and client outcomes.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-yellow-600">Build Your Reputation</h3>
                </div>
                <p className="text-sm text-gray-600 pl-13">Gain visibility through verified profiles, patient reviews, and featured listings.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Network className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-teal-600">Community & Support</h3>
                </div>
                <p className="text-sm text-gray-600 pl-13">Access training, workshops, and peer networking.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-600">Step {currentStep} of {totalSteps}</h2>
            <span className="px-3 py-1 border rounded-full text-sm">Therapist Registration</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="border-2 border-blue-200 rounded-xl bg-white shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-blue-600 font-semibold">Step {currentStep}: {stepTitles[currentStep - 1]}</h3>
          </div>
          <div className="p-6">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold">Registration submitted successfully!</h3>
                <p className="text-gray-600 mt-2">We'll review your application and get back to you within 2-3 business days.</p>
                <div className="mt-6">
                  <Link className="text-blue-600 underline" href="/">Return to homepage</Link>
                </div>
              </div>
            ) : (
              renderStepContent()
            )}
            {submitError && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{submitError}</div>
            )}
          </div>
        </div>

        {!submitted && (
          <div className="flex justify-between mt-8">
            <button className="px-4 py-2 border rounded disabled:opacity-50" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} disabled={currentStep === 1 || submitting}>
              <ArrowLeft className="inline w-4 h-4 mr-2" /> Previous
            </button>
            {currentStep === totalSteps ? (
              <button className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50" onClick={handleSubmitAll} disabled={!isFormValid() || submitting}>
                {submitting ? "Submitting..." : "Complete Registration"}
                <CheckCircle className="inline w-4 h-4 ml-2" />
              </button>
            ) : (
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}>
                Next <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
