'use client'
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Globe, Lightbulb } from "lucide-react";

export function VisionMissionSection() {
  return (
    <div className="px-6 lg:px-12 py-8 lg:py-12">
      <section className="grid lg:grid-cols-2 gap-12 mx-4 lg:mx-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
        <Card className="h-full border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-600">🌍 Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              To make therapy accessible, affordable, trustworthy, and stigma-free across India and beyond.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Card className="h-full border-2 border-purple-200 hover:border-purple-300 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-purple-600">💡 Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              Empower individuals, therapists, and clinics with tools that create a healthier, happier society.
            </p>
          </CardContent>
        </Card>
      </motion.div>
      </section>
    </div>
  );
}