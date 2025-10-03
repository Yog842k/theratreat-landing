import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowLeft } from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: "single" | "multiple";
  options: string[];
  category: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "Are you experiencing challenges with movement, vibration, or brain-related functioning?",
    type: "single",
    options: ["Yes", "No", "Not sure"],
    category: "Movement & Cognitive"
  },
  {
    id: 2,
    text: "Do you have joint, bone, or muscle pain or injury-related concerns?",
    type: "single", 
    options: ["Yes", "No", "Sometimes"],
    category: "Physical Health"
  },
  {
    id: 3,
    text: "Do you feel less with stress, anxiety, depression, or emotional wellness?",
    type: "single",
    options: ["Yes", "No", "Occasionally"],
    category: "Mental Health"
  },
  {
    id: 4,
    text: "Are you seeking support for your child's development, learning, or behavior?",
    type: "single",
    options: ["Yes", "No", "Considering"],
    category: "Child Development"
  },
  {
    id: 5,
    text: "Are you recovering from a heart or lung condition and need cardiovascular support?",
    type: "single",
    options: ["Yes", "No", "Prevention focused"],
    category: "Cardiovascular"
  }
];

export function AssessmentFlow() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (answer: string) => {
    const questionId = questions[currentQuestion].id;
    setAnswers((prev: Record<number, string[]>) => ({
      ...prev,
      [questionId]: [answer]
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev: number) => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev: number) => prev - 1);
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsComplete(false);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (isComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span>Assessment Complete</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-4">Based on your responses, we recommend the following services:</p>
          </div>
          
          <div className="grid gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900">Recommended Services</h3>
              <ul className="mt-2 space-y-1 text-blue-800">
                <li>• Mental Health Counseling</li>
                <li>• Physical Therapy</li>
                <li>• Wellness Coaching</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900">Next Steps</h3>
              <ul className="mt-2 space-y-1 text-green-800">
                <li>• Schedule a consultation</li>
                <li>• Download our wellness guide</li>
                <li>• Join our support community</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={resetAssessment} variant="outline" className="flex-1">
              Retake Assessment
            </Button>
            <Button className="flex-1">
              Schedule Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium">{question.category}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
        <CardTitle className="text-lg">{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start p-4 h-auto"
              onClick={() => handleAnswer(option)}
            >
              <Circle className="w-4 h-4 mr-3" />
              <span>{option}</span>
            </Button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {questions.length} answered
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
