'use client'
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, Quote, ArrowRight, ShoppingBag, Clipboard, GraduationCap } from "lucide-react";

// Define data directly in the component
const theraBookMissionPoints = [
  "Remove barriers to accessing therapy",
  "Ensure transparency in pricing and credentials",
  "Connect verified therapists with those who need them",
  "Make booking therapy as easy as any other service"
];

const therapistProblems = [
  "Difficulty finding clients",
  "Complex appointment management",
  "Payment processing issues",
  "Limited online presence",
  "Administrative overhead"
];

const clientProblems = [
  "Hard to find qualified therapists",
  "Unclear pricing and credentials",
  "Inconvenient booking processes",
  "Lack of transparency",
  "Limited availability information"
];

const ecosystemModules = [
  {
    icon: ShoppingBag,
    title: "TheraStore",
    description: "Curated therapy products and tools"
  },
  {
    icon: Clipboard,
    title: "TheraAssess",
    description: "Professional assessment tools"
  },
  {
    icon: GraduationCap,
    title: "TheraLearn",
    description: "Educational workshops and courses"
  }
];

interface TheraBookSectionProps {
  setCurrentView?: (view: string) => void;
}

export function TheraBookSection({ setCurrentView }: TheraBookSectionProps) {
  return (
    <div className="px-6 lg:px-12 py-8 lg:py-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-6 lg:px-12 rounded-2xl mx-4 lg:mx-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto space-y-12"
        >
        <div className="text-center">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">About TheraBook</h2>
          <p className="text-2xl text-blue-700 mb-6">Empowering Therapists. Connecting Care. Transforming Lives.</p>
        </div>

        {/* What is TheraBook */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">What is TheraBook?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed">
              TheraBook is the dedicated consultation and appointment booking module of TheraTreat – India's first all-in-one therapy platform that bridges the gap between therapists and those who need them.
            </p>
            <p className="text-lg leading-relaxed">
              We believe that finding the right therapist should be as easy, safe, and stress-free as booking a movie ticket – but with the trust, confidentiality, and professionalism that healthcare deserves.
            </p>
            <p className="text-lg leading-relaxed">
              Whether it's occupational therapy, physiotherapy, psychology, speech therapy, or any other form of care, TheraBook is built to simplify booking, ensure transparency in fees, and provide a smooth, secure consultation experience – in clinic, at home, or online.
            </p>
          </CardContent>
        </Card>

        {/* Mission & Vision Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">Our Mission</CardTitle>
              <p className="text-lg text-green-700">"To make quality therapy accessible, affordable, and stigma-free for everyone."</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {theraBookMissionPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-600">Our Vision</CardTitle>
              <p className="text-lg text-purple-700">"A world where therapy is not an afterthought, but a natural step towards a better life."</p>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                We envision TheraBook becoming India's most trusted therapy booking platform, recognized for its integrity, user experience, and meaningful impact on mental, physical, and emotional well-being.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why We Created TheraBook */}
        <Card className="border-2 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-600">Why We Created TheraBook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-red-600 mb-3">Therapists struggle with:</h4>
                <div className="space-y-2">
                  {therapistProblems.map((point, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-600 mb-3">Clients struggle with:</h4>
                <div className="space-y-2">
                  {clientProblems.map((point, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-lg leading-relaxed mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-l-green-400">
              TheraBook was designed to solve both sides of the problem – giving therapists a reliable practice management tool and clients a seamless, private, and safe way to get the help they need.
            </p>
          </CardContent>
        </Card>

        {/* Ecosystem Integration */}
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-600">How TheraBook Fits into TheraTreat</CardTitle>
            <p className="text-lg">TheraBook is just one part of the TheraTreat ecosystem – alongside:</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {ecosystemModules.map((module, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-white border border-indigo-200">
                  <module.icon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">{module.title}</h4>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-center font-medium text-indigo-700 p-4 bg-indigo-50 rounded-lg">
              Together, they form India's most comprehensive therapy platform – where care meets technology, and access meets trust.
            </p>
          </CardContent>
        </Card>

        {/* Founder's Note */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <Quote className="w-12 h-12 mx-auto opacity-75" />
              <h3 className="text-2xl font-semibold">A Note from Our Founder</h3>
              <blockquote className="text-lg leading-relaxed italic max-w-4xl mx-auto">
                "As an occupational therapist myself, I've seen the challenges both therapists and clients face – from searching for credible help to managing appointments and payments. TheraBook was born out of the belief that therapy should be easy to find, simple to book, and empowering for everyone involved. This is more than a platform; it's a movement to make therapy a part of everyday wellness."
              </blockquote>
              <p className="text-xl font-semibold">— Yogesh, Founder & CEO, TheraTreat</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center bg-white p-8 rounded-2xl border-2 border-blue-200"
        >
          <h3 className="text-3xl font-bold text-blue-600 mb-4">Join Us in Making Therapy Accessible</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Whether you're a therapist ready to expand your reach or a client looking for trusted care, TheraBook is here to make your therapy journey smoother, faster, and more reliable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setCurrentView?.("book")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                size="lg"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="/register-therapist"
                className="inline-flex items-center justify-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent px-8 py-3 rounded-md"
              >
                Join as Therapist
              </a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      </section>
    </div>
  );
}