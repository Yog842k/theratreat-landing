import { BookOpen, Brain, ShoppingCart, HeartHandshake } from "lucide-react";

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
