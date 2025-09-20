"use client";

import HeroAboutPage from "@/components/about/HeroSection";
import { motion } from "framer-motion";
import { ContactSection } from "@/components/about/Contact";
import { VisionMissionSection } from "@/components/about/VisionMission";
import { TheraBookSection } from "@/components/about/TherabookSection";
export default function AboutPage() {
  return (
 <>
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-16"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <HeroAboutPage />
      </motion.div>
      {/* Vision & Mission */}
      <VisionMissionSection />

      {/* Contact Us Section */}
      <ContactSection />

      {/* Careers Section */}
      {/* <CareersSection /> */}

      {/* About TheraBook Section */}
      <TheraBookSection  />

      {/* Core Values */}
      {/* <CoreValuesSection /> */}
    </motion.div>
 </>
  );
}
