import { useState } from "react";
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

export function TheraSelf() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTest, setCurrentTest] = useState<TestCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [savedTests, setSavedTests] = useState<TestResult[]>([]);

  const startTest = (category: TestCategory) => {
    setCurrentTest(category);
    setSelectedCategory(category.id);
    setCurrentQuestion(0);
    setAnswers({});
    setIsComplete(false);
    setTestResults(null);
  };

  const handleAnswer = (answer: string) => {
    const questions = sampleQuestions[selectedCategory!] || [];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    const questions = sampleQuestions[selectedCategory!] || [];
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer && question.points) {
        totalScore += question.points[answer] || 0;
        maxScore += Math.max(...Object.values(question.points));
      }
    });

    const percentage = Math.round((totalScore / maxScore) * 100);
    const result: TestResult = {
      category: currentTest?.name || "Unknown",
      score: totalScore,
      maxScore,
      percentage,
      level: percentage < 30 ? "Low Risk" : percentage < 60 ? "Moderate Risk" : "High Risk",
      date: new Date().toLocaleDateString(),
      recommendations: generateRecommendations(percentage, selectedCategory!)
    };

    setTestResults(result);
    setIsComplete(true);
    setSavedTests(prev => [...prev, result]);
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

  if (isComplete && testResults) {
    return (
      <TestResults 
        results={testResults} 
        onRetake={() => {
          setIsComplete(false);
          setCurrentQuestion(0);
          setAnswers({});
        }}
        onNewTest={() => {
          setCurrentTest(null);
          setSelectedCategory(null);
          setIsComplete(false);
        }}
      />
    );
  }

  if (currentTest && selectedCategory) {
    const questions = sampleQuestions[selectedCategory] || [];
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentTest(null)}>
            ← Back to Tests
          </Button>
          <Badge variant="outline">{currentTest.name}</Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{question?.text}</h3>
              
              <div className="space-y-2">
                {question?.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start p-4 h-auto text-left"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Category: {question?.category}</span>
              <span>{Object.keys(answers).length} of {questions.length} answered</span>
            </div>
          </CardContent>
        </Card>
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
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Your Test History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {savedTests.slice(-3).map((test, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{test.category}</p>
                      <p className="text-sm text-muted-foreground">{test.date}</p>
                    </div>
                    <Badge 
                      variant={test.level === "Low Risk" ? "secondary" : 
                              test.level === "Moderate Risk" ? "outline" : "destructive"}
                    >
                      {test.level}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Score: {test.score}/{test.maxScore}</span>
                      <span>{test.percentage}%</span>
                    </div>
                    <Progress value={test.percentage} className="h-2 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testCategories.map((category) => (
          <Card key={category.id} className={`${category.color} hover:shadow-lg transition-all cursor-pointer`}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  {category.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex space-x-2 text-sm text-muted-foreground">
                    <span>{category.duration}</span>
                    <span>•</span>
                    <span>{category.questions} questions</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{category.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium">What you&apos;ll get:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Detailed assessment report</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Personalized recommendations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Professional referrals if needed</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full" onClick={() => startTest(category)}>
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-primary">Why Use TheraSelf?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">AI-Powered Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Advanced algorithms analyze your responses for accurate insights
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">Comprehensive Reports</h3>
            <p className="text-sm text-muted-foreground">
              Detailed PDF reports you can share with healthcare providers
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your health over time with regular assessments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestResults({ results, onRetake, onNewTest }: { 
  results: TestResult; 
  onRetake: () => void; 
  onNewTest: () => void; 
}) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low Risk": return "text-green-600 bg-green-100";
      case "Moderate Risk": return "text-yellow-600 bg-yellow-100";
      case "High Risk": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold text-primary">Assessment Complete</h1>
        <p className="text-lg text-muted-foreground">
          Here are your {results.category} assessment results
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={`px-6 py-3 rounded-full ${getRiskColor(results.level)}`}>
                <span className="font-semibold text-lg">{results.level}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold">{results.percentage}%</div>
              <div className="text-muted-foreground">
                Score: {results.score} out of {results.maxScore}
              </div>
              <Progress value={results.percentage} className="w-full max-w-md mx-auto" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Recommendations</span>
            </h3>
            <ul className="space-y-2">
              {results.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={onRetake} variant="outline" className="flex-1">
              Retake Assessment
            </Button>
            <Button onClick={onNewTest} variant="outline" className="flex-1">
              Take Different Test
            </Button>
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
            <Button className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Book Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
