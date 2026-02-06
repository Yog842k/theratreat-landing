"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancedSearch } from "@/components/EnhancedSearch";
import { SearchResultsComponent, TherapistData } from "@/components/therabook/SearchResultsComponent";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Video,
  Phone,
  MessageCircle,
  Building,
  Home,
  Users,
  Heart,
  Activity,
  Baby,
  Stethoscope,
  Eye,
  Hand,
  Globe,
  Brain,
} from "lucide-react";

type ViewType = string;

interface AdvancedTherapistSearchProps {
  setCurrentView?: (view: ViewType) => void;
  initialFilters?: {
    conditions?: string[];
    therapyTypes?: string[];
    sessionFormats?: string[];
    ageGroups?: string[];
    searchQuery?: string;
    city?: string;
    area?: string;
  };
  therapists?: TherapistData[]; // If not provided, uses internal mock
  onBookSession?: (therapistId: string) => void;
  onViewProfile?: (therapistId: string) => void;
}

export function AdvancedTherapistSearch({ setCurrentView, initialFilters, therapists, onBookSession, onViewProfile }: AdvancedTherapistSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");
  const [selectedConditions, setSelectedConditions] = useState<string[]>(initialFilters?.conditions || []);
  const [selectedTherapyTypes, setSelectedTherapyTypes] = useState<string[]>(initialFilters?.therapyTypes || []);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(initialFilters?.sessionFormats || []);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(initialFilters?.ageGroups || []);
  const [selectedCity, setSelectedCity] = useState(initialFilters?.city || "");
  const [selectedArea, setSelectedArea] = useState(initialFilters?.area || "");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false); // Hidden by default on mobile
  const [isLarge, setIsLarge] = useState(false);
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const [openCategories, setOpenCategories] = useState<string[]>(
    initialFilters?.conditions?.length ? ["conditions"] : initialFilters?.therapyTypes?.length ? ["therapy-types"] : ["conditions"]
  );

  useEffect(() => {
    const update = () => {
      const isLargeScreen = window.matchMedia("(min-width: 1024px)").matches;
      setIsLarge(isLargeScreen);
      // Auto-show filters on large screens, hide on mobile
      if (isLargeScreen) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const conditionCategories = [
    {
      id: "neurological",
      title: "🧠 Neurological & Neurodevelopmental Conditions",
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      conditions: [
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
      ],
    },
    {
      id: "orthopedic",
      title: "🦴 Orthopedic & Musculoskeletal Conditions",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
      conditions: [
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
      ],
    },
    {
      id: "cardiovascular",
      title: "❤️ Cardiovascular & Pulmonary Conditions",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      conditions: [
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
      ],
    },
    {
      id: "psychological",
      title: "🧘‍♀️ Psychological & Psychiatric Conditions",
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      conditions: [
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
      ],
    },
    {
      id: "pediatric",
      title: "🧒 Pediatric Conditions",
      icon: Baby,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      conditions: [
        "Learning Disabilities (Dyslexia, Dysgraphia, Dyscalculia)",
        "Speech and Language Delays",
        "Motor Coordination Disorders (Dyspraxia)",
        "Feeding Difficulties",
        "Behavioral Challenges",
        "Autism & ADHD (covered above)",
        "Premature Birth Complications",
        "Developmental Apraxia of Speech",
        "Visual-Motor Integration Issues",
      ],
    },
    {
      id: "geriatric",
      title: "👩‍🦳 Geriatric Conditions",
      icon: Users,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      conditions: [
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
      ],
    },
    {
      id: "womens-health",
      title: "💕 Women's Health Conditions",
      icon: Heart,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      conditions: [
        "Postpartum Depression",
        "PCOS & Hormonal Imbalance Support",
        "Infertility Counseling",
        "Menopause Management",
        "Prenatal & Postnatal Physiotherapy",
        "Pelvic Floor Dysfunction",
        "Sexual Health Issues",
        "Breast Cancer Rehab",
      ],
    },
    {
      id: "surgical-recovery",
      title: "🧑‍⚕️ Surgical & Medical Recovery",
      icon: Stethoscope,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      conditions: [
        "Post-Orthopedic Surgeries",
        "Post-Neurosurgeries",
        "Post-Cardiac Surgeries",
        "Post-Cancer Therapy (Chemo/Radiation Recovery)",
        "Scar Management",
        "Lymphedema",
        "Wound Healing Support",
        "Amputation & Prosthesis Training",
      ],
    },
    {
      id: "speech-language",
      title: "🗣️ Speech & Language Conditions",
      icon: MessageCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      conditions: [
        "Aphasia",
        "Stuttering",
        "Articulation Disorders",
        "Voice Disorders",
        "Language Delay",
        "Auditory Processing Disorders",
        "Mutism",
        "Resonance Disorders",
      ],
    },
    {
      id: "sensory-perceptual",
      title: "👁️ Sensory & Perceptual Disorders",
      icon: Eye,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      conditions: [
        "Sensory Integration Disorder",
        "Visual Processing Disorder",
        "Auditory Processing Disorder",
        "Tactile Defensiveness",
        "Body Awareness Challenges",
        "Proprioception & Vestibular Dysfunction",
      ],
    },
    {
      id: "occupational-therapy",
      title: "👩‍⚕️ Occupational Therapy Specific Concerns",
      icon: Hand,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      conditions: [
        "Activities of Daily Living (ADL) Difficulties",
        "Handwriting Issues",
        "Fine Motor Skill Delay",
        "Time Management/Executive Function",
        "Vocational Rehabilitation",
        "Social Skills Training",
        "Assistive Device Training",
      ],
    },
    {
      id: "community-lifestyle",
      title: "🌍 Community & Lifestyle Disorders",
      icon: Globe,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      conditions: [
        "Work Stress & Burnout",
        "Internet/Game Addiction",
        "Anger Management",
        "Career Confusion",
        "Relationship Issues",
        "Parenting Challenges",
        "Grief & Loss",
        "Low Self-Esteem",
        "Screen Time Addiction",
      ],
    },
  ];

  const therapyTypes = [
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

  const sessionFormats = [
    { id: "in-clinic", label: "In-Clinic", icon: Building },
    { id: "at-home", label: "At-Home", icon: Home },
    { id: "video", label: "Video Consultation", icon: Video },
    { id: "audio", label: "Audio Consultation", icon: Phone },
  ];

  const ageGroups = [
    "Infant (0–2 years)",
    "Toddler (2–5 years)",
    "Child (5–12 years)",
    "Teen (13–18 years)",
    "Adult (18–60 years)",
    "Senior (60+ years)",
  ];

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Pune",
    "Hyderabad",
    "Ahmedabad",
    "Surat",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Pimpri-Chinchwad",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
    "Meerut",
    "Rajkot",
    "Kalyan-Dombivli",
    "Vasai-Virar",
    "Varanasi",
    "Srinagar",
    "Dhanbad",
    "Jodhpur",
    "Amritsar",
    "Raipur",
    "Allahabad",
    "Coimbatore",
    "Jabalpur",
    "Gwalior",
    "Vijayawada",
    "Madurai",
    "Gurgaon",
  ];

  // Sorting options removed from UI as requested

  const mockTherapists: TherapistData[] = [
    {
      id: "1",
      name: "Dr. Priya Sharma",
      specialty: "Clinical Psychology",
      therapyTypes: ["Clinical Psychologist", "Cognitive Behavioural Therapist"],
      conditions: ["Depression", "Anxiety Disorders", "Post-Traumatic Stress Disorder (PTSD)"],
      experience: 8,
      rating: 4.9,
      reviews: 156,
      price: 1200,
      sessionFormats: ["video", "audio", "in-clinic"],
      ageGroups: ["Adult (18–60 years)", "Teen (13–18 years)"],
      location: { city: "Mumbai", area: "Bandra" },
      availability: "Today 2:00 PM",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=face",
      isOnline: true,
      verified: true,
      languages: ["English", "Hindi"],
    },
  ];

  const sourceTherapists = therapists && therapists.length > 0 ? therapists : mockTherapists;
  const normalizeText = (value: string) => value.toLowerCase().trim();
  const normalizeSpecialty = (value: string) => {
    const map: Record<string, string> = {
      "clinical-psychology": "Clinical Psychology",
      physiotherapy: "Physiotherapy",
      "speech-therapy": "Speech Therapy",
      "occupational-therapy": "Occupational Therapy",
      "aba-therapy": "ABA Therapy",
      "special-education": "Special Education",
    };
    return map[value] || value;
  };
  const applyLocation = (location: string) => {
    const raw = String(location || "").trim();
    if (!raw || normalizeText(raw) === "all") {
      setSelectedCity("");
      setSelectedArea("");
      return;
    }
    if (normalizeText(raw).replace(/\s+/g, "-") === "near-me") {
      setSelectedCity("near-me");
      setSelectedArea("");
      return;
    }
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    setSelectedCity(parts[0] || raw);
    setSelectedArea(parts.length > 1 ? parts.slice(1).join(", ") : "");
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) => (prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]));
  };

  const toggleTherapyType = (type: string) => {
    setSelectedTherapyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats((prev) => (prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]));
  };

  const toggleAgeGroup = (ageGroup: string) => {
    setSelectedAgeGroups((prev) => (prev.includes(ageGroup) ? prev.filter((a) => a !== ageGroup) : [...prev, ageGroup]));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedConditions([]);
    setSelectedTherapyTypes([]);
    setSelectedFormats([]);
    setSelectedAgeGroups([]);
    setSelectedCity("");
    setSelectedArea("");
    setSearchResetSignal((prev) => prev + 1);
  };

  const getActiveFilterCount = () => {
    return (
      selectedConditions.length +
      selectedTherapyTypes.length +
      selectedFormats.length +
      selectedAgeGroups.length +
      (selectedCity ? 1 : 0) +
      (selectedArea ? 1 : 0)
    );
  };

  const handleEnhancedSearch = (searchParams: any) => {
    const query = searchParams?.search ?? searchParams?.query ?? searchParams?.searchQuery ?? "";
    if (query !== undefined) setSearchQuery(String(query || ""));
    if (searchParams?.location !== undefined) applyLocation(searchParams.location);
    if (searchParams?.specialty) {
      const normalized = normalizeSpecialty(String(searchParams.specialty));
      setSelectedTherapyTypes((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    }
    if (searchParams?.sessionType) {
      const normalized = String(searchParams.sessionType);
      setSelectedFormats((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    }
  };

  const handleBookSession = (therapistId: string) => {
    if (typeof onBookSession === "function") return onBookSession(therapistId);
    // Default: route to booking flow
    router.push(`/therabook/therapists/${therapistId}/book`);
  };

  const handleViewProfile = (therapistId: string) => {
    if (typeof onViewProfile === "function") return onViewProfile(therapistId);
    router.push(`/therabook/therapists/${therapistId}`);
  };

  const filteredTherapists = useMemo(() => {
    let filtered = sourceTherapists.filter((therapist) => {
      if (searchQuery) {
        const query = searchQuery.trim().toLowerCase();
        const searchableText = [
          therapist.name,
          therapist.specialty,
          ...therapist.therapyTypes,
          ...therapist.conditions,
          therapist.location.city,
          therapist.location.area,
          ...therapist.languages,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      const matchesAny = (selected: string[], values: string[]) => {
        if (selected.length === 0) return true;
        const normalizedValues = values.map((v) => normalizeText(v));
        const stopwords = new Set(["therapist", "therapy", "pathologist", "specialist"]);
        const toTokens = (value: string) =>
          normalizeText(value)
            .split(/\s+/)
            .filter((t) => t && !stopwords.has(t));
        const valueTokens = values.map((v) => toTokens(v));
        return selected.some((sel) => {
          const needle = normalizeText(sel);
          const selTokens = toTokens(sel);
          return normalizedValues.some((val, idx) => {
            if (val === needle || val.includes(needle) || needle.includes(val)) return true;
            if (selTokens.length === 0) return false;
            return valueTokens[idx].some((token) => selTokens.includes(token));
          });
        });
      };
      if (selectedConditions.length > 0 && !matchesAny(selectedConditions, therapist.conditions)) return false;
      if (selectedTherapyTypes.length > 0 && !matchesAny(selectedTherapyTypes, therapist.therapyTypes)) return false;
      if (selectedFormats.length > 0) {
        const normalizedFormats = therapist.sessionFormats.map((f) => normalizeText(f));
        const formatMatch = selectedFormats.some((f) => normalizedFormats.includes(normalizeText(f)));
        if (!formatMatch) return false;
      }
      if (selectedAgeGroups.length > 0 && !matchesAny(selectedAgeGroups, therapist.ageGroups)) return false;
      const locationText = [therapist.location.area, therapist.location.city].filter(Boolean).join(" ").toLowerCase();
      if (selectedCity && normalizeText(selectedCity).replace(/\s+/g, "-") !== "near-me") {
        if (!locationText.includes(normalizeText(selectedCity))) return false;
      }
      if (selectedArea && !locationText.includes(normalizeText(selectedArea))) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.experience - a.experience;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "reviews":
          return b.reviews - a.reviews;
        case "verified":
          if (a.verified !== b.verified) return a.verified ? -1 : 1;
          return b.rating - a.rating;
        case "online":
          if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
          return b.rating - a.rating;
        case "distance":
          return a.location.city.localeCompare(b.location.city);
        default:
          return b.rating - a.rating;
      }
    });

    return filtered;
  }, [
    searchQuery,
    selectedConditions,
    selectedTherapyTypes,
    selectedFormats,
    selectedAgeGroups,
    selectedCity,
    selectedArea,
    sortBy,
    sourceTherapists,
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-white via-slate-50 to-blue-50">
        <div className="absolute -top-24 right-[-10%] h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-5%] h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">TheraBook Search</p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 mt-2">Find care that fits your life</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-2">
                  Search by specialty, condition, session type, or location. Compare verified professionals and book in minutes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-white/80 text-slate-700 border border-slate-200/70">
                  {filteredTherapists.length} results
                </Badge>
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    {getActiveFilterCount()} filters
                  </Badge>
                )}
              </div>
            </div>

            <Card className="border border-slate-200/70 bg-white/90 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="flex-1 min-w-0">
                    <EnhancedSearch
                      onSearch={handleEnhancedSearch}
                      variant="compact"
                      placeholder="Search by name, specialty, condition, or location..."
                      showFilters={false}
                      initialQuery={searchQuery}
                      resetSignal={searchResetSignal}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 lg:items-center">
                    <div className="w-full sm:w-56">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-10 text-sm border-slate-200 bg-white">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Highest Rating</SelectItem>
                          <SelectItem value="experience">Most Experienced</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="reviews">Most Reviews</SelectItem>
                          <SelectItem value="verified">Verified First</SelectItem>
                          <SelectItem value="online">Available Now</SelectItem>
                          <SelectItem value="distance">Nearest (City)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="w-full sm:w-auto lg:hidden border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {showFilters ? "Hide" : "Show"} Filters
                      {getActiveFilterCount() > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                          {getActiveFilterCount()}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
                {(searchQuery || getActiveFilterCount() > 0) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500">
                    {searchQuery && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        Search: {searchQuery}
                      </Badge>
                    )}
                    {selectedCity && (
                      <Badge variant="secondary" className="bg-slate-50 text-slate-700">
                        City: {selectedCity}
                      </Badge>
                    )}
                    {selectedArea && (
                      <Badge variant="secondary" className="bg-slate-50 text-slate-700">
                        Area: {selectedArea}
                      </Badge>
                    )}
                    {selectedTherapyTypes.length > 0 && (
                      <Badge variant="secondary" className="bg-slate-50 text-slate-700">
                        Therapy: {selectedTherapyTypes.length}
                      </Badge>
                    )}
                    {selectedConditions.length > 0 && (
                      <Badge variant="secondary" className="bg-slate-50 text-slate-700">
                        Conditions: {selectedConditions.length}
                      </Badge>
                    )}
                    {selectedFormats.length > 0 && (
                      <Badge variant="secondary" className="bg-slate-50 text-slate-700">
                        Formats: {selectedFormats.length}
                      </Badge>
                    )}
                    {selectedAgeGroups.length > 0 && (
                      <Badge variant="secondary" className="bg-slate-50 text-slate-700">
                        Age: {selectedAgeGroups.length}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-7 px-2 text-[11px] sm:text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 lg:gap-8">
          <AnimatePresence>
            {(showFilters || isLarge) && (
              <motion.div
                initial={{ opacity: 0, x: -50, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: -50, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Card className="lg:sticky lg:top-6 border border-slate-200/70 bg-white/90 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Filters</h2>
                        {getActiveFilterCount() > 0 && (
                          <Badge variant="secondary" className="text-[10px] sm:text-xs bg-blue-100 text-blue-700">
                            {getActiveFilterCount()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getActiveFilterCount() > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-500 hover:text-red-600 h-8 px-2 text-xs sm:text-sm">
                            <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">Clear All</span>
                            <span className="sm:hidden">Clear</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilters(false)}
                          className="lg:hidden h-8 px-2"
                          aria-label="Close filters"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 max-h-[calc(100vh-220px)] lg:max-h-none overflow-y-auto lg:overflow-visible">
                      <Collapsible open={openCategories.includes("conditions")} onOpenChange={() => toggleCategory("conditions")}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-slate-700 hover:bg-white transition-colors">
                          <span className="font-medium text-sm sm:text-base">Health Conditions</span>
                          {openCategories.includes("conditions") ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                          {conditionCategories.map((category) => (
                            <Collapsible key={category.id} open={openCategories.includes(category.id)} onOpenChange={() => toggleCategory(category.id)}>
                              <CollapsibleTrigger className={`flex items-center justify-between w-full p-2.5 sm:p-3 ${category.bgColor} rounded-lg border border-transparent hover:border-slate-200/60 transition-colors`}>
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <category.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${category.color} flex-shrink-0`} />
                                  <span className="text-xs sm:text-sm font-medium truncate">{category.title}</span>
                                </div>
                                {openCategories.includes(category.id) ? <ChevronUp className="w-3 h-3 flex-shrink-0 ml-2" /> : <ChevronDown className="w-3 h-3 flex-shrink-0 ml-2" />}
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pl-3 sm:pl-4 pt-2 space-y-1.5 sm:space-y-2 max-h-56 overflow-y-auto">
                                {category.conditions.map((condition) => {
                                  const isActive = selectedConditions.includes(condition);
                                  return (
                                    <div key={condition} className={`flex items-start space-x-2 rounded-lg px-2 py-1 ${isActive ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                                      <Checkbox id={condition} checked={isActive} onCheckedChange={() => toggleCondition(condition)} className="mt-0.5" />
                                      <label htmlFor={condition} className={`text-xs sm:text-sm cursor-pointer leading-relaxed ${isActive ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`}>
                                        {condition}
                                      </label>
                                    </div>
                                  );
                                })}
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>

                      <Separator />

                      <Collapsible open={openCategories.includes("therapy-types")} onOpenChange={() => toggleCategory("therapy-types")}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-slate-700 hover:bg-white transition-colors">
                          <span className="font-medium text-sm sm:text-base">Therapy Types</span>
                          {openCategories.includes("therapy-types") ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3 sm:pt-4 space-y-1.5 sm:space-y-2 max-h-56 overflow-y-auto">
                          {therapyTypes.map((type) => {
                            const isActive = selectedTherapyTypes.includes(type);
                            return (
                              <div key={type} className={`flex items-start space-x-2 rounded-lg px-2 py-1 ${isActive ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                                <Checkbox id={type} checked={isActive} onCheckedChange={() => toggleTherapyType(type)} className="mt-0.5" />
                                <label htmlFor={type} className={`text-xs sm:text-sm cursor-pointer leading-relaxed ${isActive ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`}>
                                  {type}
                                </label>
                              </div>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Session Format</h4>
                        <div className="space-y-1.5 sm:space-y-2">
                          {sessionFormats.map((format) => {
                            const isActive = selectedFormats.includes(format.id);
                            return (
                              <div key={format.id} className={`flex items-center space-x-2 rounded-lg px-2 py-1 ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"}`}>
                                <Checkbox id={format.id} checked={isActive} onCheckedChange={() => toggleFormat(format.id)} />
                                <format.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <label htmlFor={format.id} className="text-xs sm:text-sm cursor-pointer">
                                  {format.label}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Location</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger className="h-10 text-sm rounded-lg border-slate-200 bg-white">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="near-me">Near Me</SelectItem>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Enter locality or area"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="h-10 text-sm rounded-lg border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Age Group</h4>
                        <div className="space-y-1.5 sm:space-y-2">
                          {ageGroups.map((ageGroup) => {
                            const isActive = selectedAgeGroups.includes(ageGroup);
                            return (
                              <div key={ageGroup} className={`flex items-center space-x-2 rounded-lg px-2 py-1 ${isActive ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                                <Checkbox id={ageGroup} checked={isActive} onCheckedChange={() => toggleAgeGroup(ageGroup)} />
                                <label htmlFor={ageGroup} className={`text-xs sm:text-sm cursor-pointer ${isActive ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`}>
                                  {ageGroup}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full">
            <SearchResultsComponent
              therapists={filteredTherapists}
              searchQuery={searchQuery}
              onBookSession={handleBookSession}
              onViewProfile={handleViewProfile}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

