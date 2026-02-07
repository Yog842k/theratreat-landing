"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Baby, 
  Bone, 
  Heart, 
  Users, 
  Download, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Calendar
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: "single" | "multiple" | "scale";
  options?: string[];
  category: string;
  points?: { [key: string]: number };
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  options?: string[];
}

interface TestCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  duration: string;
  questions: number;
  color: string;
}

interface TestResult {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
  date: string;
  recommendations: string[];
}

const testCategories: TestCategory[] = [
  {
    id: "neuro",
    name: "Neurological Assessment",
    icon: <Brain className="w-6 h-6" />,
    description: "Evaluate cognitive function, memory, and neurological health",
    duration: "15-20 min",
    questions: 25,
    color: "bg-purple-50 border-purple-200"
  },
  {
    id: "pediatric",
    name: "Pediatric Development",
    icon: <Baby className="w-6 h-6" />,
    description: "Child development milestones and behavioral assessment",
    duration: "10-15 min",
    questions: 20,
    color: "bg-pink-50 border-pink-200"
  },
  {
    id: "ortho",
    name: "Orthopedic Screening",
    icon: <Bone className="w-6 h-6" />,
    description: "Joint, bone, and muscle health evaluation",
    duration: "8-12 min",
    questions: 18,
    color: "bg-green-50 border-green-200"
  },
  {
    id: "psych",
    name: "Psychological Wellness",
    icon: <Heart className="w-6 h-6" />,
    description: "Mental health, stress, and emotional wellbeing assessment",
    duration: "12-18 min",
    questions: 30,
    color: "bg-blue-50 border-blue-200"
  },
  {
    id: "geriatric",
    name: "Geriatric Health",
    icon: <Users className="w-6 h-6" />,
    description: "Age-related health concerns and mobility assessment",
    duration: "10-15 min",
    questions: 22,
    color: "bg-orange-50 border-orange-200"
  }
];

const sampleQuestions: { [key: string]: Question[] } = {
  psych: [
    {
      id: 1,
      text: "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?",
      type: "single",
      category: "Depression",
      options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
      points: { "Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3 }
    },
    {
      id: 2,
      text: "How often do you feel nervous, anxious, or on edge?",
      type: "single",
      category: "Anxiety",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      points: { "Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3, "Always": 4 }
    },
    {
      id: 3,
      text: "On a scale of 1-10, how would you rate your current stress level?",
      type: "scale",
      category: "Stress",
      options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    }
  ],
  neuro: [
    {
      id: 1,
      text: "Do you experience frequent headaches or migraines?",
      type: "single",
      category: "Neurological",
      options: ["Never", "Rarely", "Sometimes", "Often"],
      points: { "Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3 }
    },
    {
      id: 2,
      text: "Have you noticed any changes in your memory or concentration?",
      type: "single",
      category: "Cognitive",
      options: ["No changes", "Mild changes", "Moderate changes", "Significant changes"],
      points: { "No changes": 0, "Mild changes": 1, "Moderate changes": 2, "Significant changes": 3 }
    }
  ]
};

export default function TheraSelf() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTest, setCurrentTest] = useState<TestCategory | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [savedTests, setSavedTests] = useState<TestResult[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, typing]);

  const startTest = (category: TestCategory) => {
    setCurrentTest(category);
    setSelectedCategory(category.id);
    setAnswers({});
    setIsComplete(false);
    setTestResults(null);
    // Start chat with intro and first question
    const questions = sampleQuestions[category.id] || [];
    setChat([
      {
        id: "intro",
        sender: "ai",
        text: `Welcome to the ${category.name} assessment! Let's begin.`,
      },
      {
        id: `q-0`,
        sender: "ai",
        text: questions[0]?.text || "First question...",
        options: questions[0]?.options || [],
      },
    ]);
  };

  const generateRecommendations = (percentage: number, category: string) => {
    const baseRecommendations = {
      psych: {
        low: ["Continue maintaining good mental health habits", "Regular exercise and meditation"],
        moderate: ["Consider stress management techniques", "Speak with a counselor if symptoms persist"],
        high: ["Seek professional mental health support", "Consider therapy or counseling sessions"]
      },
      neuro: {
        low: ["Maintain current lifestyle habits", "Regular brain exercises"],
        moderate: ["Monitor symptoms closely", "Consider neurological screening"],
        high: ["Consult with a neurologist", "Comprehensive neurological evaluation recommended"]
      }
    };

    const level = percentage < 30 ? "low" : percentage < 60 ? "moderate" : "high";
    return baseRecommendations[category as keyof typeof baseRecommendations]?.[level] || ["Consult with a healthcare professional"];
  };

  const handleUserAnswer = (answer: string) => {
    if (!selectedCategory) return;
    const questions = sampleQuestions[selectedCategory] || [];
    const nextIndex = Object.keys(answers).length;
    const nextQuestion = questions[nextIndex + 1];

    setAnswers((prev) => ({ ...prev, [nextIndex]: answer }));
    setChat((prev) => {
      const next: ChatMessage[] = [
        ...prev,
        { id: `u-${nextIndex}-${Date.now()}`, sender: "user", text: answer },
      ];
      if (nextQuestion) {
        next.push({
          id: `q-${nextIndex + 1}`,
          sender: "ai",
          text: nextQuestion.text || "Next question...",
          options: nextQuestion.options || [],
        });
      }
      return next;
    });

    if (!nextQuestion) {
      setIsComplete(true);
    }
  };


  if (currentTest && selectedCategory) {
    const questions = sampleQuestions[selectedCategory] || [];
    const progress = (Object.keys(answers).length / questions.length) * 100;
    return (
      <div>
        <div className="max-w-2xl mx-auto py-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={() => setCurrentTest(null)}>
              ← Back to Tests
            </Button>
            <Badge variant="outline">{currentTest.name}</Badge>
          </div>
          <Card className="h-[500px] overflow-y-auto flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI Chat Assessment</CardTitle>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2 overflow-y-auto">
              <div className="flex flex-col gap-3 pb-2">
                {chat.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}> 
                    <div className={`rounded-2xl px-4 py-2 max-w-[75%] text-sm shadow-sm ${msg.sender === "ai" ? "bg-blue-100 text-blue-900" : "bg-violet-600 text-white"}`}>
                      {msg.text}
                      {msg.options && (
                        <div className="mt-2 flex flex-col gap-2">
                          {msg.options.map((opt, idx) => (
                            <Button key={idx} size="sm" variant="outline" className="w-full text-left" onClick={() => handleUserAnswer(opt)}>{opt}</Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-2 bg-blue-100 text-blue-900 max-w-[75%] text-sm shadow-sm flex items-center gap-2">
                      <span>AI is typing</span>
                      <span className="animate-bounce">...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">TheraSelf - AI-Driven Self Assessment</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Take comprehensive health assessments powered by AI to understand your wellbeing 
          and get personalized recommendations from healthcare professionals.
        </p>
      </div>

      {/* Saved Tests Dashboard */}
      {savedTests.length > 0 && (
        <Card>
          <CardHeader>
            {/* ...existing code... */}
          </CardHeader>
          {/* ...existing code... */}
        </Card>
      )}
      {/* ...existing code... */}
    </div>
  );
}
