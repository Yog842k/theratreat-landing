'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Users, Zap, ChevronRight, ArrowLeft, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface Option {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  color?: string;
}

const therapyTypes = [
  {
    id: "anxiety",
    title: "Anxiety & Stress",
    description: "Feeling overwhelmed, worried, or stressed about daily life",
    icon: Brain,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "depression",
    title: "Depression & Mood",
    description: "Persistent sadness, loss of interest, or mood changes",
    icon: Heart,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "relationships",
    title: "Relationship Issues",
    description: "Problems with romantic relationships, family, or friendships",
    icon: Users,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "trauma",
    title: "Trauma & PTSD",
    description: "Dealing with past traumatic experiences or PTSD symptoms",
    icon: Zap,
    color: "bg-red-100 text-red-600",
  },
];

const questions = [
  {
    id: 0,
    question: "What type of support are you looking for?",
    options: therapyTypes as Option[],
  },
  {
    id: 1,
    question: "How would you prefer to meet with your therapist?",
    options: [
      { id: "video", title: "Video Call", description: "Face-to-face online session", icon: Users, color: "bg-blue-100 text-blue-600" },
      { id: "audio", title: "Audio Call", description: "Voice-only session", icon: Phone, color: "bg-blue-50 text-blue-700" },
      { id: "clinic", title: "In-Person", description: "Visit therapist's clinic", icon: MapPin, color: "bg-blue-100 text-blue-500" },
    ] as Option[],
  },
];

export default function SmartSelectorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (questionId: number, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Redirect to filtered therapists page with preferences
      const params = new URLSearchParams();
      Object.entries(answers).forEach(([key, value]) => {
        params.set(`q${key}`, value);
      });
      params.set(`q${questionId}`, answerId);
      router.push(`/therabook/therapists?${params.toString()}`);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={goBack} className="mr-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Link href="/therabook">
              <Button variant="outline" size="sm" className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300">
                Exit Selector
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mr-4">Help Me Choose Therapy</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-lg">
              Step {currentStep + 1} of {questions.length}
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="bg-white rounded-xl shadow-lg border-0">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-bold text-gray-800">{currentQuestion.question}</CardTitle>
            <CardDescription className="text-lg text-gray-600 font-medium">
              Select the option that best describes your situation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="grid gap-4">
              {currentQuestion.options.map((option: Option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="p-6 h-auto text-left justify-start hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                  >
                    <div className="flex items-center w-full">
                      {IconComponent && (
                        <div className={`p-3 rounded-xl mr-4 ${option.color || 'bg-gray-100 text-gray-600'}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1 text-lg">{option.title}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600">{option.description}</div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-500" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="font-medium">Your responses help us match you with the most suitable therapists</p>
        </div>
      </div>
    </div>
  );
}
