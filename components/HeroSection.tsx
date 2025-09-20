import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaHref: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ headline, subtext, ctaText, ctaHref }) => {
  const router = useRouter();
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-white py-20 px-4 text-center rounded-2xl shadow mb-12"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">{headline}</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{subtext}</p>
      <Button size="lg" className="bg-blue-600 text-white rounded-full px-8 py-3 shadow-lg" onClick={() => router.push(ctaHref)}>
        {ctaText}
      </Button>
    </motion.section>
  );
};
