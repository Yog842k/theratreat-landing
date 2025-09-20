"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import ReactSelect from "react-select";
import "./react-select-custom.css";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Brain,
  Clock,
  DollarSign,
  Building2,
  Camera,
  Shield,
  Upload,
  Calendar,
  UserCheck,
  TrendingUp,
  Bot,
  Star,
  Network,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface FormData {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  password: string;
  residentialAddress: string;
  currentCity: string;
  preferredLanguages: string[];
  panCard: string;
  aadhaar: string;
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
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
  hasClinic: boolean;
  profilePhoto: File | null;
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

export default function RegisterTherapistPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formInitial: FormData = {
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    password: "",
    residentialAddress: "",
    currentCity: "",
    preferredLanguages: [],
    panCard: "",
    aadhaar: "",
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
    bankDetails: {
      accountHolder: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
    },
    hasClinic: false,
    profilePhoto: null,
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
      serviceAgreement: false,
    },
  };
  const [formData, setFormData] = useState<FormData>(formInitial);

  const languages = [
    "English",
    "Hindi",
    "Marathi",
    "Tamil",
    "Telugu",
    "Bengali",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Punjabi",
    "Odia",
    "Urdu",
    "Assamese",
    "Nepali",
    "Spanish",
    "French",
    "Other",
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Late Night"];
  const sessionDurations = ["30 min sessions", "45 min sessions", "60 min sessions"];

  const designations = [
    "Behavioural Therapist",
    "Cognitive Behavioural Therapist",
    "Neuro-Developmental Therapist",
    "Occupational Therapist",
    "Physiotherapist",
    "Special Educator",
    "Speech and Language Pathologist",
    "Sports Therapist",
    "ABA Therapist",
    "Acupuncture/Acupressure Therapist",
    "Animal-Assisted Therapist",
    "Aqua Therapist",
    "Aromatherapist",
    "Art Therapist",
    "Chiropractor / Osteopath",
    "Clinical Psychologist",
    "Cupping Therapist",
    "Dance Movement Therapist",
    "Dietician",
    "Fitness Instructor",
    "Hand Therapist",
    "Holistic/Hypnotherapist",
    "Horticultural Therapist",
    "Massage Therapist",
    "Music Therapist",
    "Naturopathic Therapist",
    "Neonatal Therapist",
    "Orthotistician",
    "Prosthetist",
    "Panchakarma Therapist",
    "Play Therapist",
    "Psychotherapist",
    "Recreational Therapist",
    "Rehabilitation Therapist",
    "Yoga Therapist",
  ];

  const conditionCategories = [
    { id: "neurological", title: "🧠 Neurological & Neurodevelopmental Conditions", conditions: [
      "Autism Spectrum Disorder (ASD)",
      "Attention Deficit Hyperactivity Disorder (ADHD)",
      "Cerebral Palsy",
      "Down Syndrome",
      "Developmental Delays",
      "Sensory Processing Disorder",
      "Intellectual Disabilities",
      "Traumatic Brain Injury (TBI)",
      "Stroke (Post-Stroke Rehabilitation)",
      "Epilepsy",
      "Multiple Sclerosis",
      "Parkinson's Disease",
      "Alzheimer's Disease",
      "Huntington's Disease",
      "Guillain-Barré Syndrome",
    ] },
    { id: "orthopedic", title: "🦴 Orthopedic & Musculoskeletal Conditions", conditions: [
      "Fractures and Dislocations",
      "Arthritis (Rheumatoid, Osteoarthritis)",
      "Scoliosis",
      "Frozen Shoulder",
      "Sports Injuries",
      "Sprains and Strains",
      "Post-Surgical Rehabilitation (e.g. joint replacements)",
      "Back and Neck Pain",
      "Postural Deformities",
      "Carpal Tunnel Syndrome",
      "Plantar Fasciitis",
      "Tendonitis",
      "Spinal Cord Injury",
    ] },
    { id: "cardiovascular", title: "❤️ Cardiovascular & Pulmonary Conditions", conditions: [
      "Post-Heart Attack (MI) Rehabilitation",
      "Hypertension",
      "Coronary Artery Disease",
      "Chronic Obstructive Pulmonary Disease (COPD)",
      "Asthma",
      "Congestive Heart Failure",
      "Post-CABG (Bypass Surgery) Recovery",
      "Post-COVID Rehabilitation",
      "Deep Vein Thrombosis (DVT)",
      "Pulmonary Fibrosis",
    ] },
    { id: "psychological", title: "🧘‍♀️ Psychological & Psychiatric Conditions", conditions: [
      "Depression",
      "Anxiety Disorders",
      "Obsessive-Compulsive Disorder (OCD)",
      "Bipolar Disorder",
      "Schizophrenia",
      "Post-Traumatic Stress Disorder (PTSD)",
      "Eating Disorders (Anorexia, Bulimia, Binge Eating)",
      "Personality Disorders",
      "Sleep Disorders (Insomnia, Sleep Apnea)",
      "Substance Use/Addiction",
      "Self-Harm & Suicidal Ideation",
      "Panic Disorder",
      "Phobias",
    ] },
    { id: "pediatric", title: "🧒 Pediatric Conditions", conditions: [
      "Learning Disabilities (Dyslexia, Dysgraphia, Dyscalculia)",
      "Speech and Language Delays",
      "Motor Coordination Disorders (Dyspraxia)",
      "Feeding Difficulties",
      "Behavioral Challenges",
      "Autism & ADHD (covered above)",
      "Premature Birth Complications",
      "Developmental Apraxia of Speech",
      "Visual-Motor Integration Issues",
    ] },
    { id: "geriatric", title: "👩‍🦳 Geriatric Conditions", conditions: [
      "Dementia & Alzheimer's",
      "Fall Risk & Balance Issues",
      "Parkinson's (covered above)",
      "Arthritis (covered above)",
      "Post-Surgery Rehab (Hip, Knee replacements)",
      "Osteoporosis",
      "Age-related Hearing/Vision Loss",
      "Incontinence",
      "Social Isolation & Depression",
      "Polypharmacy Side Effects",
    ] },
    { id: "womens-health", title: "💕 Women's Health Conditions", conditions: [
      "Postpartum Depression",
      "PCOS & Hormonal Imbalance Support",
      "Infertility Counseling",
      "Menopause Management",
      "Prenatal & Postnatal Physiotherapy",
      "Pelvic Floor Dysfunction",
      "Sexual Health Issues",
      "Breast Cancer Rehab",
    ] },
    { id: "surgical-recovery", title: "🧑‍⚕️ Surgical & Medical Recovery", conditions: [
      "Post-Orthopedic Surgeries",
      "Post-Neurosurgeries",
      "Post-Cardiac Surgeries",
      "Post-Cancer Therapy (Chemo/Radiation Recovery)",
      "Scar Management",
      "Lymphedema",
      "Wound Healing Support",
      "Amputation & Prosthesis Training",
    ] },
    { id: "speech-language", title: "🗣️ Speech & Language Conditions", conditions: [
      "Aphasia",
      "Stuttering",
      "Articulation Disorders",
      "Voice Disorders",
      "Language Delay",
      "Auditory Processing Disorders",
      "Mutism",
      "Resonance Disorders",
    ] },
    { id: "sensory-perceptual", title: "👁️ Sensory & Perceptual Disorders", conditions: [
      "Sensory Integration Disorder",
      "Visual Processing Disorder",
      "Auditory Processing Disorder",
      "Tactile Defensiveness",
      "Body Awareness Challenges",
      "Proprioception & Vestibular Dysfunction",
    ] },
    { id: "occupational-therapy", title: "👩‍⚕️ Occupational Therapy Specific Concerns", conditions: [
      "Activities of Daily Living (ADL) Difficulties",
      "Handwriting Issues",
      "Fine Motor Skill Delay",
      "Time Management/Executive Function",
      "Vocational Rehabilitation",
      "Social Skills Training",
      "Assistive Device Training",
    ] },
    { id: "community-lifestyle", title: "🌍 Community & Lifestyle Disorders", conditions: [
      "Work Stress & Burnout",
      "Internet/Game Addiction",
      "Anger Management",
      "Career Confusion",
      "Relationship Issues",
      "Parenting Challenges",
      "Grief & Loss",
      "Low Self-Esteem",
      "Screen Time Addiction",
    ] },
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = <K extends keyof FormData, S extends keyof FormData[K]>(
    parent: K,
    field: S,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [field]: value },
    }));
  };

  const handleArrayToggle = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const current = (prev[field] as any[]) || [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleNext = () => setCurrentStep((s) => Math.min(totalSteps, s + 1));
  const handlePrevious = () => setCurrentStep((s) => Math.max(1, s - 1));

  function isFormValid() {
    return (
      Object.values(formData.agreements).every(Boolean) &&
      !!formData.fullName &&
      !!formData.email &&
      !!formData.phoneNumber &&
      !!formData.password &&
      formData.password.length >= 8
    );
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Map the flat UI form into the backend expected nested schema
      const payload = {
        personalInfo: {
          firstName: formData.fullName.split(" ")[0] || formData.fullName,
          lastName: formData.fullName.split(" ").slice(1).join(" ") || "",
          email: formData.email,
          phone: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        },
        professionalInfo: {
          licenseNumber: formData.licenseNumber,
          licenseState: "",
          licenseExpiry: "",
          primarySpecialty: formData.designations[0] || "",
          yearsOfExperience: formData.experience,
          currentEmployment: "",
          workplaceName: "",
          workplaceAddress: formData.workplaces,
        },
        education: {
          highestDegree: formData.qualification,
          institution: formData.university,
          graduationYear: formData.graduationYear,
          continuingEducation: "",
        },
        practiceDetails: {
          practiceType: "",
          serviceTypes: formData.primaryConditions,
          sessionFormats: [
            ...(formData.preferredTimeSlots.includes("Morning") ? ["Video Call"] : []),
            ...(formData.preferredTimeSlots.includes("Afternoon") ? ["Audio Call"] : []),
          ],
          languages: formData.therapyLanguages.length ? formData.therapyLanguages : formData.preferredLanguages,
          ageGroups: [],
        },
        availability: {
          workingDays: formData.preferredDays,
          preferredHours: formData.preferredTimeSlots,
          timeZone: "IST",
          consultationFees: {
            videoCall: formData.sessionFee,
            audioCall: "",
            inPerson: "",
            chatConsultation: "",
          },
          emergencyAvailability: false,
        },
        location: {
          primaryAddress: formData.residentialAddress,
          city: formData.currentCity,
          state: "",
          pincode: "",
          onlineOnly: !formData.hasClinic,
          clinicVisits: formData.hasClinic,
          homeVisits: false,
        },
        documents: { profilePicture: "" },
        agreements: {
          termsOfService: formData.agreements.terms,
          privacyPolicy: formData.agreements.digitalConsent,
          professionalConduct: formData.agreements.conduct,
          serviceAgreement: formData.agreements.serviceAgreement,
        },
      };

      // Minimal validation to satisfy backend route
      if (!payload.professionalInfo.primarySpecialty) {
        throw new Error("Please select at least one designation (primary specialty)");
      }
      if (!payload.practiceDetails.serviceTypes?.length) {
        throw new Error("Please select at least one primary condition");
      }
      if (!payload.availability.workingDays?.length) {
        throw new Error("Please select working days");
      }

      const res = await fetch("/api/therapists/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Registration failed");

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <ReactSelect
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
                  ].find((o) => o.value === formData.gender) || null}
                  onChange={(opt) => handleInputChange("gender", opt ? (opt as any).value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select gender"
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input id="dob" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" value={formData.phoneNumber} onChange={(e) => handleInputChange("phoneNumber", e.target.value)} placeholder="+91 " />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password * (min 8 characters)</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Current City *</Label>
                <Input id="city" value={formData.currentCity} onChange={(e) => handleInputChange("currentCity", e.target.value)} placeholder="Your city" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Residential Address *</Label>
              <Textarea id="address" rows={3} value={formData.residentialAddress} onChange={(e) => handleInputChange("residentialAddress", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Preferred Communication Language(s) *</Label>
              <ReactSelect
                isMulti
                options={languages.map((l) => ({ value: l, label: l }))}
                value={formData.preferredLanguages.map((l) => ({ value: l, label: l }))}
                onChange={(vals) => handleInputChange("preferredLanguages", (vals as any[]).map((v) => v.value))}
                classNamePrefix="react-select"
                placeholder="Select language(s)"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Highest Qualification *</Label>
                <ReactSelect
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
                  ].find((o) => o.value === formData.qualification) || null}
                  onChange={(opt) => handleInputChange("qualification", opt ? (opt as any).value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select qualification"
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="univ">University/Institute *</Label>
                <Input id="univ" value={formData.university} onChange={(e) => handleInputChange("university", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Graduation Year *</Label>
                <ReactSelect
                  options={Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => ({ value: String(y), label: String(y) }))}
                  value={Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)
                    .map((y) => ({ value: String(y), label: String(y) }))
                    .find((o) => o.value === formData.graduationYear) || null}
                  onChange={(opt) => handleInputChange("graduationYear", opt ? (opt as any).value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select year"
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">Licensing/Registration Number *</Label>
                <Input id="license" value={formData.licenseNumber} onChange={(e) => handleInputChange("licenseNumber", e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Professional Designation(s) *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                {designations.map((d) => (
                  <div key={d} className="flex items-center space-x-2">
                    <Checkbox id={d} checked={formData.designations.includes(d)} onCheckedChange={() => handleArrayToggle("designations", d)} />
                    <Label htmlFor={d} className="text-sm">
                      {d}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Label>Primary Conditions You Work With</Label>
              {conditionCategories.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <h4 className="font-medium text-blue-600">{cat.title}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                    {cat.conditions.map((c) => (
                      <div key={c} className="flex items-center space-x-2">
                        <Checkbox id={c} checked={formData.primaryConditions.includes(c)} onCheckedChange={() => handleArrayToggle("primaryConditions", c)} />
                        <Label htmlFor={c} className="text-sm">
                          {c}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Years of Experience *</Label>
                <ReactSelect
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
                  ].find((o) => o.value === formData.experience) || null}
                  onChange={(opt) => handleInputChange("experience", opt ? (opt as any).value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select experience"
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workplaces">Previous Workplaces / Affiliations</Label>
                <Textarea id="workplaces" rows={3} value={formData.workplaces} onChange={(e) => handleInputChange("workplaces", e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Preferred Days *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {days.map((d) => (
                  <div key={d} className="flex items-center space-x-2">
                    <Checkbox id={d} checked={formData.preferredDays.includes(d)} onCheckedChange={() => handleArrayToggle("preferredDays", d)} />
                    <Label htmlFor={d} className="text-sm">
                      {d}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Preferred Time Slots *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {timeSlots.map((t) => (
                  <div key={t} className="flex items-center space-x-2">
                    <Checkbox id={t} checked={formData.preferredTimeSlots.includes(t)} onCheckedChange={() => handleArrayToggle("preferredTimeSlots", t)} />
                    <Label htmlFor={t} className="text-sm">
                      {t}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Weekly Sessions Capacity *</Label>
                <ReactSelect
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
                  ].find((o) => o.value === formData.weeklySessions) || null}
                  onChange={(opt) => handleInputChange("weeklySessions", opt ? (opt as any).value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select weekly capacity"
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label>Session Duration Options *</Label>
                <div className="space-y-2">
                  {sessionDurations.map((d) => (
                    <div key={d} className="flex items-center space-x-2">
                      <Checkbox id={d} checked={formData.sessionDurations.includes(d)} onCheckedChange={() => handleArrayToggle("sessionDurations", d)} />
                      <Label htmlFor={d} className="text-sm">
                        {d}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sessionFee">Session Fee (₹) *</Label>
                <Input id="sessionFee" type="number" value={formData.sessionFee} onChange={(e) => handleInputChange("sessionFee", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode Preference *</Label>
                <ReactSelect
                  options={[
                    { value: "bank-transfer", label: "Bank Transfer" },
                    { value: "upi", label: "UPI" },
                    { value: "both", label: "Both" },
                  ]}
                  value={[
                    { value: "bank-transfer", label: "Bank Transfer" },
                    { value: "upi", label: "UPI" },
                    { value: "both", label: "Both" },
                  ].find((o) => o.value === formData.paymentMode) || null}
                  onChange={(opt) => handleInputChange("paymentMode", opt ? (opt as any).value : "")}
                  classNamePrefix="react-select"
                  placeholder="Select payment mode"
                  isClearable
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="dynamicPricing" checked={formData.dynamicPricing} onCheckedChange={(v) => handleInputChange("dynamicPricing", v)} />
                <Label htmlFor="dynamicPricing">Enable dynamic pricing based on demand</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="freeFirstSession" checked={formData.freeFirstSession} onCheckedChange={(v) => handleInputChange("freeFirstSession", v)} />
                <Label htmlFor="freeFirstSession">Offer free first session</Label>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600">Bank Details for Payments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name *</Label>
                  <Input id="accountHolder" value={formData.bankDetails.accountHolder} onChange={(e) => handleNestedInputChange("bankDetails", "accountHolder", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input id="bankName" value={formData.bankDetails.bankName} onChange={(e) => handleNestedInputChange("bankDetails", "bankName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input id="accountNumber" value={formData.bankDetails.accountNumber} onChange={(e) => handleNestedInputChange("bankDetails", "accountNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code *</Label>
                  <Input id="ifsc" value={formData.bankDetails.ifscCode} onChange={(e) => handleNestedInputChange("bankDetails", "ifscCode", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upi">UPI ID (optional)</Label>
                  <Input id="upi" value={formData.bankDetails.upiId} onChange={(e) => handleNestedInputChange("bankDetails", "upiId", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Do you have a physical clinic/practice location? *</Label>
              <RadioGroup value={formData.hasClinic ? "yes" : "no"} onValueChange={(v) => handleInputChange("hasClinic", v === "yes")}> 
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
            <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-yellow-800 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <p>Note: You can always add clinic details later through your dashboard settings.</p>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Photo *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-600">Upload Profile Photo (JPG, PNG)</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea id="bio" rows={5} value={formData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn</Label>
                <Input id="linkedIn" value={formData.linkedIn} onChange={(e) => handleInputChange("linkedIn", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={formData.instagram} onChange={(e) => handleInputChange("instagram", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Therapy Languages *</Label>
              <ReactSelect
                isMulti
                options={languages.map((l) => ({ value: l, label: l }))}
                value={formData.therapyLanguages.map((l) => ({ value: l, label: l }))}
                onChange={(vals) => handleInputChange("therapyLanguages", (vals as any[]).map((v) => v.value))}
                classNamePrefix="react-select"
                placeholder="Select therapy language(s)"
              />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-600">Terms and Agreements</h3>
            <div className="grid grid-cols-1 gap-3">
              {([
                ["accuracy", "I confirm that all information provided is accurate and up-to-date *"],
                ["verification", "I agree to verification of my credentials and documents *"],
                ["guidelines", "I agree to follow TheraTreat's professional guidelines and code of conduct *"],
                ["confidentiality", "I agree to maintain patient confidentiality as per medical ethics *"],
                ["independent", "I understand that I am an independent practitioner, not an employee of TheraTreat *"],
                ["norms", "I agree to adhere to professional norms and therapy session standards *"],
                ["conduct", "I agree to maintain professional conduct during all interactions *"],
                ["terms", "I have read and agree to the Terms of Service *"],
                ["digitalConsent", "I consent to digital record keeping and data processing *"],
                ["secureDelivery", "I agree to secure delivery of therapy services through the platform *"],
                ["declaration", "I declare that I am mentally and physically fit to provide therapy services *"],
                ["serviceAgreement", "I agree to the Service Agreement and understand the payment terms *"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-start space-x-2">
                  <Checkbox
                    id={key}
                    checked={(formData.agreements as any)[key]}
                    onCheckedChange={(v) => handleNestedInputChange("agreements", key as any, v)}
                  />
                  <Label htmlFor={key} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
            {!isFormValid() && (
              <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-yellow-800 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <p>Please complete all required fields and accept all agreements to proceed.</p>
              </div>
            )}
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Join TheraTreat as a Therapist</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Complete your comprehensive registration to start connecting with patients and growing your practice</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-12">
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-green-600 mb-2">Why Register as a Therapist?</CardTitle>
              <p className="text-gray-600">Join thousands of healthcare professionals transforming lives through TheraTreat</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-600">Expand Your Reach</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-13">Connect with thousands of patients actively seeking therapy across India.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-600">Boost Your Income</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-13">Earn more with flexible session pricing and transparent payouts.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-600">Smart Scheduling</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-13">Manage availability, bookings, and reschedules with one dashboard.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-orange-600">AI-Powered Tools</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-13">Get intelligent insights, reminders, and support to improve efficiency and client outcomes.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-yellow-600">Build Your Reputation</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-13">Gain visibility through verified profiles, patient reviews, and featured listings.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Network className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-teal-600">Community & Support</h3>
                  </div>
                  <p className="text-sm text-gray-600 pl-13">Access training, workshops, and peer networking.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-600">Step {currentStep} of {totalSteps}</h2>
            <Badge variant="outline" className="px-3 py-1">Therapist Registration</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-600">Step {currentStep}: {[
              "Personal & Contact Information",
              "Education & Credentials",
              "Specialization & Experience",
              "Availability & Scheduling",
              "Session Charges & Payment",
              "Clinic/Offline Setup",
              "Profile Details",
              "Agreements & Consent",
            ][currentStep - 1]}</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold">Registration submitted successfully!</h3>
                <p className="text-gray-600 mt-2">We'll review your application and get back to you within 2-3 business days.</p>
              </div>
            ) : (
              renderStepContent()
            )}
            {submitError && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{submitError}</div>
            )}
          </CardContent>
        </Card>

        {!submitted && (
          <div className="flex justify-between mt-8">
            <Button className="border border-gray-300 bg-white text-gray-800" disabled={currentStep === 1 || isSubmitting} onClick={handlePrevious}>
              <ArrowLeft className="mr-2 w-4 h-4" /> Previous
            </Button>
            {currentStep === totalSteps ? (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" disabled={!isFormValid() || isSubmitting}>
                {isSubmitting ? "Completing Registration..." : "Complete Registration"}
                <CheckCircle className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
