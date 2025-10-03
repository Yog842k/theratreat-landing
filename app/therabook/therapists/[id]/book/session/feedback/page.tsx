'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface FeedbackPageProps {}

const mockSession = {
  therapist: {
    name: "Dr. Sarah Johnson",
    title: "Clinical Psychologist",
    image: "/api/placeholder/100/100",
  },
  session: {
    date: "December 18, 2023",
    duration: "50 minutes",
    type: "Video Call",
  }
};

export default function FeedbackPage({}: FeedbackPageProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const routeParams = useParams();
  const id = Array.isArray(routeParams?.id) ? (routeParams?.id?.[0] as string) : ((routeParams?.id as string) || "");

  const handleSubmit = () => {
    // Submit feedback logic
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your feedback has been submitted successfully
          </p>

          <div className="space-y-4">
            <Link href={`/therabook/therapists/${id}/book/follow-up`}>
              <Button size="lg" className="w-full max-w-sm">
                Book Follow-up Session
              </Button>
            </Link>
            <Link href="/therabook">
              <Button variant="outline" size="lg" className="w-full max-w-sm">
                Back to TheraBook
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Feedback</h1>
        <p className="text-gray-600">
          Help us improve by sharing your experience
        </p>
      </div>

      {/* Session Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={mockSession.therapist.image} alt={mockSession.therapist.name} />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{mockSession.therapist.name}</h3>
              <p className="text-gray-600">{mockSession.therapist.title}</p>
              <p className="text-sm text-gray-500">
                {mockSession.session.date} • {mockSession.session.duration} • {mockSession.session.type}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <div className="space-y-6">
        {/* Rating */}
        <Card>
          <CardHeader>
            <CardTitle>How was your session?</CardTitle>
            <CardDescription>Rate your overall experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 5 && "Excellent! We're glad you had a great experience."}
                {rating === 4 && "Very good! Thanks for the positive feedback."}
                {rating === 3 && "Good! We appreciate your feedback."}
                {rating === 2 && "We'll work to improve your experience."}
                {rating === 1 && "We're sorry to hear that. Please let us know how we can improve."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle>Would you recommend Dr. Johnson?</CardTitle>
            <CardDescription>Help other patients make informed decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={recommend === true ? "default" : "outline"}
                onClick={() => setRecommend(true)}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Yes, I&apos;d recommend
              </Button>
              <Button
                variant={recommend === false ? "destructive" : "outline"}
                onClick={() => setRecommend(false)}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                No, I wouldn&apos;t
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Written Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Comments</CardTitle>
            <CardDescription>
              Share more details about your experience (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What went well? What could be improved? Any specific feedback for your therapist?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Link href="/therabook" className="flex-1">
            <Button variant="outline" className="w-full">
              Skip Feedback
            </Button>
          </Link>
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={rating === 0}
          >
            Submit Feedback
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Your feedback is anonymous by default. Only aggregate ratings are shown publicly.
        </p>
      </div>
    </div>
  );
}
