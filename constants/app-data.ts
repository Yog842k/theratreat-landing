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
  { key: "blog", label: "TheraBlogs", url: "/blog", icon: FileText }
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
    { label: "TheraBook - Consultations", href: "#" },
    { label: "TheraSelf - Assessments", href: "#" },
    { label: "TheraStore - Equipment", href: "#" },
    { label: "TheraLearn - Education", href: "#" }
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
  | "blog";