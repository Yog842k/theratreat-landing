"use client";

import { Calendar, ShoppingCart, Target, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";

const platformFeatures = [
  {
    icon: Calendar,
    iconColor: "text-blue-600",
    text: "Book therapy sessions"
  },
  {
    icon: ShoppingCart,
    iconColor: "text-green-600",
    text: "Shop trusted therapy products"
  },
  {
    icon: Target,
    iconColor: "text-purple-600",
    text: "Take self-assessments"
  },
  {
    icon: BookOpen,
    iconColor: "text-orange-600",
    text: "Learn through workshops"
  }
];

export default function HeroAboutPage() {
  return (
    <div className="px-6 lg:px-12 pt-8 lg:pt-12">
      <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 py-16 px-6 lg:px-12 rounded-2xl overflow-hidden mx-4 lg:mx-8 mt-6 lg:mt-8">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #3b82f6 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <motion.h1 
          className="text-5xl font-bold text-blue-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Empowering Therapy For All
        </motion.h1>
        
        <motion.p 
          className="text-xl text-blue-700 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Making it Accessible, Affordable, Trustworthy, and Effective for Everyone
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6"
        >
          <p className="text-lg leading-relaxed text-foreground max-w-3xl mx-auto">
            At TheraTreat, we believe that therapy is not a luxury—it's a necessity. Our mission is to bridge the gap between people seeking care and certified professionals who can help.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {platformFeatures.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="text-center p-4 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-4">
                    <item.icon className={`w-8 h-8 ${item.iconColor} mx-auto mb-3`} />
                    <p className="text-sm">{item.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p 
            className="text-lg leading-relaxed text-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            TheraTreat isn't just another platform—it's an ecosystem designed to remove stigma, simplify access, and empower people to prioritize their well-being.
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
    </div>
  );
}
