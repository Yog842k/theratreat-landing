import {
  BookOpen,
  Brain,
  ShoppingCart,
  HeartHandshake,
  Globe,
  UserCheck,
  Lightbulb,
  Heart
} from "lucide-react";

export const coreModules = [
  {
    id: "therabook",
    title: "TheraBook",
    subtitle: "Find and book top therapists",
    icon: BookOpen,
    features: [
      "Verified professionals",
      "Easy scheduling",
      "Personalized matching",
      "Secure payments"
    ],
    cta: "Book Now"
  },
  {
    id: "theraself",
    title: "TheraSelf",
    subtitle: "Self-guided mental wellness",
    icon: Brain,
    features: [
      "Interactive exercises",
      "Progress tracking",
      "Expert resources",
      "Daily check-ins"
    ],
    cta: "Start Self-Test"
  },
  {
    id: "therastore",
    title: "TheraStore",
    subtitle: "Shop wellness products",
    icon: ShoppingCart,
    features: [
      "Curated products",
      "Fast delivery",
      "Exclusive deals",
      "Trusted brands"
    ],
    cta: "Shop Now"
  },
  {
    id: "theralearn",
    title: "TheraLearn",
    subtitle: "Learn about mental health",
    icon: HeartHandshake,
    features: [
      "Expert articles",
      "Video courses",
      "Community Q&A",
      "Live webinars"
    ],
    cta: "Start Learning"
  }
];

// High-level benefits used by components/BenefitsGrid.tsx
export const platformBenefits = [
  {
    id: "hub",
    title: "One-Stop Therapy Hub",
    description:
      "From booking therapy sessions to self-help tools — get everything for well-being in one trusted place.",
    icon: Globe
  },
  {
    id: "verified",
    title: "Verified Professionals",
    description:
      "Every therapist and healthcare expert is certified and verified so you receive quality care.",
    icon: UserCheck
  },
  {
    id: "personalized",
    title: "Personalized Care",
    description:
      "Flexible therapy options, transparent pricing, and tailored recommendations for your needs.",
    icon: Lightbulb
  },
  {
    id: "compassion",
    title: "Compassionate Support",
    description:
      "Built with empathy at its core, providing a safe and supportive environment for your journey.",
    icon: Heart
  }
];
