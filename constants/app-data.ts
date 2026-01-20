import { 
  Calendar,
  Brain,
  ShoppingCart,
  BookOpen,
  CheckCircle,
  Users,
  Award,
  Video,
  Stethoscope,
  Home,
  FileText,
  LayoutDashboard
} from "lucide-react";

export const navigationTabs = [
  { key: "home", label: "Home", url: "/", icon: Home },
  { key: "book", label: "TheraBook", url: "/therabook", icon: Calendar },
  { key: "self-test", label: "TheraSelf", url: "/theraself", icon: Brain },
  { key: "store", label: "TheraStore", url: "/therastore", icon: ShoppingCart },
  { key: "learn", label: "TheraLearn", url: "/theralearn", icon: BookOpen },
  { key: "therapists", label: "Therapists", url: "/therapists", icon: Stethoscope },
  { key: "blog", label: "TheraBlogs", url: "/therablogs", icon: FileText },
  // Optionally show Admin in navigation via env flag
  ...(process.env.NEXT_PUBLIC_SHOW_ADMIN === "true"
    ? [{ key: "admin", label: "Admin", url: "/admin", icon: LayoutDashboard }]
    : [])
];

export const coreModules = [
  {
    id: "book",
    icon: Calendar,
    title: "TheraBook",
    subtitle: "Booking & Consultation Engine",
    features: [
      "Video/Audio/In-Clinic consultations",
      "Smart therapist matching",
      "Integrated calendar booking",
      "Secure payment processing"
    ],
    cta: "Explore TheraBook"
  },
  {
    id: "self-test",
    icon: Brain,
    title: "TheraSelf",
    subtitle: "AI-Driven Self Assessment",
    features: [
      "Multiple health categories",
      "AI-powered analysis",
      "Personalized recommendations",
      "Downloadable reports"
    ],
    cta: "Try TheraSelf"
  },
  {
    id: "store",
    icon: ShoppingCart,
    title: "TheraStore",
    subtitle: "Medical Equipment & Supplies",
    features: [
      "Professional medical equipment",
      "Multiple payment options",
      "Fast delivery & tracking",
      "Quality assurance"
    ],
    cta: "Shop Now"
  },
  {
    id: "learn",
    icon: BookOpen,
    title: "TheraLearn",
    subtitle: "Learning & Certification Hub",
    features: [
      "Expert-led courses & workshops",
      "Professional certifications",
      "Live sessions & webinars",
      "Career advancement"
    ],
    cta: "Start Learning"
  }
];

export const platformBenefits = [
  {
    icon: CheckCircle,
    title: "Integrated Ecosystem",
    description: "All your healthcare needs in one platform - from consultations to learning and equipment procurement."
  },
  {
    icon: Users,
    title: "Expert Network",
    description: "Access to verified healthcare professionals, instructors, and suppliers across multiple specialties."
  },
  {
    icon: Award,
    title: "Evidence-Based Care",
    description: "AI-powered assessments, research-backed treatments, and measurable health outcomes."
  }
];

export const platformStats = [
  { number: "50,000+", label: "Patients Served", icon: Users },
  { number: "2,500+", label: "Healthcare Providers", icon: Stethoscope },
  { number: "10,000+", label: "Consultations Completed", icon: Video },
  { number: "500+", label: "Learning Resources", icon: BookOpen }
];

export const footerSections = {
  coreModules: [
    { label: "TheraBook - Consultations", href: "/therabook" },
    { label: "TheraSelf - Assessments", href: "/theraself" },
    { label: "TheraStore - Equipment", href: "/therastore" },
    { label: "TheraLearn - Education", href: "/theralearn" }
  ],
  forProviders: [
    { label: "Join Our Network", href: "#" },
    { label: "Provider Dashboard", href: "#" },
    { label: "Teaching Opportunities", href: "#" },
    { label: "Commission Structure", href: "#" }
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Healthcare Compliance", href: "#" }
  ],
  legal: [
    { label: "Privacy", href: "/policies#privacy" },
    { label: "Cancellation", href: "/policies#cancellation" },
    { label: "Conduct", href: "/policies#conduct" },
    { label: "Security", href: "/policies#data-security" },
    { label: "Liability", href: "/policies#liability" },
    { label: "Accessibility", href: "/policies#accessibility" },
    { label: "Misuse", href: "/policies#misuse" },
    { label: "Disclaimer", href: "/policies#disclaimer" },
    { label: "Copyright", href: "/policies#copyright" },
    { label: "Disputes", href: "/policies#disputes" },
    { label: "Cookies", href: "/policies#cookies" },
    { label: "Account Deletion", href: "/policies#account-deletion" }
  ]
};

// Added new view types: therapist-search (used by EnhancedSearch & HelpMeChoose redirect)
// and help-me-choose (dedicated UI flow for guided therapist selection)
export type ViewType = 
  | "home"
  | "book"
  | "self-test"
  | "store"
  | "learn"
  | "services"
  | "assessment"
  | "dashboard"
  | "therapists"
  | "therapist-search"
  | "help-me-choose"
  | "patient-register"
  | "register"
  | "instructor-register"
  | "reviews"
  | "blog";

// TheraStore Category System
export type TherastoreCategory = {
  key: string;
  label: string;
  subcategories: { key: string; label: string }[];
};

export const therastoreCategories: TherastoreCategory[] = [
  {
    key: "physiotherapy-equipment",
    label: "Physiotherapy Equipment",
    subcategories: [
      { key: "knee-back-joint-supports", label: "Knee, Back & Joint Supports" },
      { key: "elastic-bands-strength", label: "Elastic Bands & Strength Training" },
      { key: "therapy-balls-balance", label: "Therapy Balls & Balance Tools" },
      { key: "electrotherapy-devices", label: "Electrotherapy Devices (TENS/IFC/US)" },
      { key: "hot-cold-therapy", label: "Hot & Cold Therapy" },
      { key: "pain-relief-tools", label: "Pain Relief Tools" },
      { key: "traction-mobility", label: "Traction & Mobility Solutions" },
      { key: "massage-tools", label: "Massage Tools" },
      { key: "physio-consumables", label: "Physio Consumables (tapes, gel, pads)" }
    ]
  },
  {
    key: "occupational-therapy",
    label: "Occupational Therapy (OT)",
    subcategories: [
      { key: "sensory-tools", label: "Sensory Tools (Tactile/Proprioceptive)" },
      { key: "fine-motor-tools", label: "Fine Motor Tools" },
      { key: "pencil-grips-handwriting", label: "Pencil Grips & Handwriting Tools" },
      { key: "weighted-therapy-products", label: "Weighted Therapy Products" },
      { key: "fidget-tools", label: "Fidget Tools" },
      { key: "visual-auditory-sensory", label: "Visual/Auditory Sensory Tools" },
      { key: "adl-tools", label: "ADL (Daily Living) Tools" },
      { key: "seating-posture-tools", label: "Seating & Posture Tools" }
    ]
  },
  {
    key: "pediatric-therapy-special-needs",
    label: "Pediatric Therapy & Special Needs",
    subcategories: [
      { key: "sensory-kits", label: "Sensory Kits" },
      { key: "chewy-tubes-oral-motor", label: "Chewy Tubes / Oral Motor Tools" },
      { key: "pediatric-balance-toys", label: "Pediatric Balance Toys" },
      { key: "swings-hammocks", label: "Swings / Hammocks (Certified only)" },
      { key: "ot-toys", label: "OT Toys (Blocks, Peg Boards, Stacking)" },
      { key: "special-needs-feeding", label: "Special Needs Feeding Tools" },
      { key: "social-skill-tools", label: "Social Skill Tools" },
      { key: "learning-cognitive-tools", label: "Learning & Cognitive Tools" }
    ]
  },
  {
    key: "mobility-assistive-devices",
    label: "Mobility & Assistive Devices",
    subcategories: [
      { key: "walkers", label: "Walkers" },
      { key: "rollators", label: "Rollators" },
      { key: "crutches-canes", label: "Crutches & Canes" },
      { key: "wheelchairs", label: "Wheelchairs" },
      { key: "mobility-safety-aids", label: "Mobility Safety Aids" },
      { key: "transfer-aids", label: "Transfer Aids" },
      { key: "bathroom-safety-aids", label: "Bathroom Safety Aids" },
      { key: "bed-safety-supports", label: "Bed Safety & Supports" }
    ]
  },
  {
    key: "rehab-clinical-equipment",
    label: "Rehab & Clinical Equipment",
    subcategories: [
      { key: "splints-braces", label: "Splints & Braces (Regulated items only)" },
      { key: "cpm-machines", label: "CPM Machines" },
      { key: "gait-training-equipment", label: "Gait Training Equipment" },
      { key: "clinic-essentials", label: "Clinic Essentials (stethoscope, BP, pulse ox)" },
      { key: "treatment-tables-stools", label: "Treatment Tables & Stools" },
      { key: "exercise-rehab-machines", label: "Exercise & Rehab Machines" },
      { key: "clinic-sanitizing-safety", label: "Clinic Sanitizing / Safety" },
      { key: "weighing-measurement-tools", label: "Weighing & Measurement Tools" }
    ]
  },
  {
    key: "wellness-home-recovery",
    label: "Wellness & Home Recovery",
    subcategories: [
      { key: "posture-correctors", label: "Posture Correctors" },
      { key: "yoga-mats-blocks", label: "Yoga Mats & Blocks" },
      { key: "heat-therapy", label: "Heat Therapy" },
      { key: "recovery-relaxation", label: "Recovery & Relaxation" },
      { key: "sleep-stress-tools", label: "Sleep & Stress Tools" },
      { key: "daily-health-devices", label: "Daily Health Devices (BP, glucometer, thermometers)" }
    ]
  },
  {
    key: "brands",
    label: "Brands",
    subcategories: [
      { key: "accusure", label: "AccuSure" },
      { key: "easycare", label: "EasyCare" },
      { key: "tynor", label: "Tynor" },
      { key: "pedigree-ot-tools", label: "Pedigree OT Tools" },
      { key: "sensory-wise", label: "Sensory Wise" },
      { key: "flamingo", label: "Flamingo" },
      { key: "mediva", label: "Mediva" },
      { key: "theraball", label: "TheraBall" },
      { key: "theraband", label: "Theraband" },
      { key: "comfo-aid", label: "Comfo Aid" },
      { key: "local-verified", label: "Local verified manufacturers" }
    ]
  },
  {
    key: "collections",
    label: "Collections",
    subcategories: [
      { key: "trending-physio", label: "Trending in Physio" },
      { key: "new-launches", label: "New Launches" },
      { key: "clinic-starter-pack", label: "Clinic Starter Pack" },
      { key: "pediatric-ot-essentials", label: "Pediatric OT Essentials" },
      { key: "affordable-therapy-tools", label: "Affordable Therapy Tools" },
      { key: "bestsellers-ot", label: "Bestsellers in OT" },
      { key: "back-pain-relief", label: "Back Pain Relief Tools" },
      { key: "under-500", label: "Therapy Under ₹500" },
      { key: "under-999", label: "Therapy Under ₹999" },
      { key: "sensory-kits-collection", label: "Sensory Kits" },
      { key: "recovery-rehab-combos", label: "Recovery + Rehab Combo Packs" }
    ]
  }
];

// Global Filters for TheraStore
export const therastoreFilters = {
  priceRange: { key: "price", label: "Price Range" },
  category: { key: "category", label: "Category" },
  subcategory: { key: "subcategory", label: "Sub-category" },
  brand: { key: "brand", label: "Brand" },
  condition: { key: "condition", label: "Condition", values: ["new"] },
  material: { key: "material", label: "Material" },
  size: { key: "size", label: "Size / Variant" },
  ageGroup: { key: "ageGroup", label: "Age Group" },
  therapyType: { key: "therapyType", label: "Therapy Type" },
  rating: { key: "rating", label: "Rating" },
  offers: { key: "offers", label: "Offers/Discounts" }
} as const;

// Sort System v1.0
export const therastoreSortOptions = [
  { key: "price-asc", label: "Price — Low to High" },
  { key: "price-desc", label: "Price — High to Low" },
  { key: "newest", label: "Newest First" },
  { key: "bestsellers", label: "Bestsellers" },
  { key: "rating", label: "Customer Rating" },
  // Phase 2 / optional
  { key: "recommended", label: "Recommended for You" },
  { key: "therapist-recommended", label: "Therapist Recommended" }
];