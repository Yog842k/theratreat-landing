import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
// Updated to new motion package entrypoint as per smart selector spec
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Activity,
  Baby,
  Shield,
  Users,
  Home,
  MessageCircle,
  Brain,
  Briefcase,
  Sparkles,
  HelpCircle,
  CheckCircle,
  User
} from "lucide-react";
import { ViewType } from "@/constants/app-data";
import { useRouter } from 'next/navigation';
import { helpMeChooseCategoryToSearch } from '@/constants/helpmechoose-mapping';

interface HelpMeChooseProps {
  setCurrentView: (view: ViewType) => void;
}

export function HelpMeChoose({ setCurrentView }: HelpMeChooseProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const healthCategories = [
    {
      id: "mind-emotions",
      icon: Heart,
      title: "Mind & Emotions",
      description: "For anxiety, depression, stress, mood changes, emotional imbalance, grief, trauma, burnout, etc.",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700"
    },
    {
      id: "pain-injury",
      icon: Activity,
      title: "Pain, Injury or Recovery",
      description: "For muscle, joint, back, or nerve pain, post-injury rehabilitation, sports injuries, or physical recovery needs.",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700"
    },
    {
      id: "child-growth",
      icon: Baby,
      title: "Child Growth & Learning",
      description: "For speech delay, handwriting issues, behavior concerns, autism, ADHD, developmental delays, learning difficulties, etc.",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700"
    },
    {
      id: "health-recovery",
      icon: Shield,
      title: "Health Recovery & Rehab",
      description: "For recovery after stroke, accident, surgery, paralysis, neurological issues, ICU stays, etc.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    },
    {
      id: "womens-health",
      icon: Users,
      title: "Women's Health & Life Stages",
      description: "For pregnancy/postpartum care, menstrual issues, PCOD/PCOS, menopause, sexual health, body changes, and emotional health in women.",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700"
    },
    {
      id: "daily-life-support",
      icon: Home,
      title: "Daily Life, Support & Special Needs",
      description: "For challenges in daily tasks, senior care, disability support, mobility aids, caregiver help, home therapy support, etc.",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      textColor: "text-teal-700"
    },
    {
      id: "behavioral-relationship",
      icon: MessageCircle,
      title: "Behavioural & Relationship Wellness",
      description: "For relationship problems, anger, aggression, social difficulties, family conflicts, parenting stress, addiction, etc.",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700"
    },
    {
      id: "cognitive-brain",
      icon: Brain,
      title: "Cognitive & Brain Functioning",
      description: "For memory loss, attention/focus issues, slow thinking, brain fog, dementia, head injury effects, neuro rehab, etc.",
      color: "from-slate-500 to-gray-500",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      textColor: "text-slate-700"
    },
    {
      id: "occupational-work",
      icon: Briefcase,
      title: "Occupational & Work-Life Stress",
      description: "For professional burnout, low motivation, workplace anxiety, poor performance, return-to-work issues, or job-related rehab.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700"
    },
    {
      id: "lifestyle-habits",
      icon: Sparkles,
      title: "Lifestyle, Habits & Holistic Care",
      description: "For poor sleep, unhealthy habits, low energy, self-care, obesity, fatigue, post-COVID recovery, and building a better routine.",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700"
    },
    {
      id: "not-sure",
      icon: HelpCircle,
      title: "Not Sure / I Need Help to Understand",
      description: "Select this option if you're unsure or can't identify your concern. We'll help you figure it out.",
      color: "from-gray-500 to-slate-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      textColor: "text-gray-700",
      special: true
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleContinue = () => {
    if (!selectedCategory) return;
    const keyword = helpMeChooseCategoryToSearch[selectedCategory] || '';
    // Push to the real therapists listing with a search query param (reuse existing logic in therapists page)
    const params = new URLSearchParams();
    if (keyword) params.set('search', keyword);
    params.set('source', 'helpmechoose');
    params.set('category', selectedCategory);
    router.push(`/therabook/therapists?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50"
    >
      {/* Header */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-lg">
              Smart Therapist Matching
            </Badge>
            
            <h1 className="text-4xl font-bold text-blue-600 leading-tight">
              Help Me Choose the Right Therapist
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tell us about your health concern, and we'll match you with the most suitable 
              therapists and specialists for your specific needs.
            </p>

            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>100% confidential</span>
              <span>•</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Evidence-based matching</span>
              <span>•</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Verified professionals</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Selection */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              Which area best describes your concern?
            </h2>
            <p className="text-muted-foreground">
              Select the category that most closely matches what you're looking for
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Card 
                  className={`h-full cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                    selectedCategory === category.id 
                      ? `${category.borderColor} bg-white shadow-lg` 
                      : category.special 
                        ? "border-yellow-300 bg-yellow-50" 
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <motion.div 
                          className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white`}
                          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                          <category.icon className="w-6 h-6" />
                        </motion.div>
                        
                        {selectedCategory === category.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          </motion.div>
                        )}

                        {category.special && (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          selectedCategory === category.id ? category.textColor : "text-slate-800"
                        }`}>
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      {selectedCategory && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="py-8 px-6"
        >
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-700">Ready to find your therapist?</h3>
                    <p className="text-sm text-blue-600">
                      We'll show you specialists who can help with{" "}
                      <span className="font-medium">
                        {healthCategories.find(cat => cat.id === selectedCategory)?.title}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(null)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                  
                  <Button
                    onClick={handleContinue}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Find Therapists
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>
      )}

      {/* Alternative Actions */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => setCurrentView("therapists")}>\n                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-800">Browse All Therapists</h4>
                    <p className="text-sm text-muted-foreground">Explore our complete directory</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Card>

              <Card className="p-4 border-gray-200 hover:border-purple-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => setCurrentView("self-test")}>\n                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-800">Take Self-Assessment</h4>
                    <p className="text-sm text-muted-foreground">Get personalized insights first</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Card>
            </div>

            <Button
              variant="ghost"
              onClick={() => setCurrentView("book")}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to TheraBook
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
