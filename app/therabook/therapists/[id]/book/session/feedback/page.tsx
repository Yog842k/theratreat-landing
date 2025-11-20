'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, ThumbsUp, ThumbsDown, Heart, MessageSquare, Calendar, Clock, Video, ArrowLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/components/auth/NewAuthContext";
import Link from "next/link";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const routeParams = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const id = Array.isArray(routeParams?.id) ? (routeParams?.id?.[0] as string) : ((routeParams?.id as string) || "");
  const bookingId = searchParams?.get('bookingId');

  useEffect(() => {
    if (bookingId && token) {
      fetchBookingData();
    } else {
      setLoading(false);
    }
  }, [bookingId, token]);

  const fetchBookingData = async () => {
    try {
      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(`/api/bookings/${bookingId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setBookingData(data.booking || data.data?.booking || data);
      }
    } catch (err) {
      console.error('Failed to fetch booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setSubmitting(true);
    
    try {
      // TODO: Submit feedback to API
      // await fetch('/api/feedback', { ... });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error: any) {
      toast.error("Failed to submit feedback", { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-4">
        <Card className="max-w-2xl w-full text-center border-2 border-green-200 shadow-xl">
          <CardContent className="pt-12 pb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your feedback has been submitted successfully. We appreciate you taking the time to share your experience.
            </p>

            <div className="space-y-4 max-w-md mx-auto">
              <Link href={`/therabook/therapists/${id}/book`}>
                <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  Book Another Session
                </Button>
              </Link>
              <Link href="/therabook">
                <Button variant="outline" size="lg" className="w-full">
                  Back to TheraBook
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  const therapist = bookingData?.therapist || {};
  const sessionDate = bookingData?.appointmentDate ? new Date(bookingData.appointmentDate) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <Heart className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Session Feedback</h1>
          <p className="text-lg text-gray-600">Help us improve by sharing your experience</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Session Summary Card */}
          <Card className="md:col-span-2 border-2 border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20 border-2 border-blue-200">
                  <AvatarImage src={therapist.image} alt={therapist.name} />
                  <AvatarFallback className="text-xl">
                    {therapist.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-1">{therapist.name || 'Therapist'}</h3>
                  <p className="text-gray-600 mb-2">{therapist.title || 'Licensed Professional'}</p>
                  <div className="flex flex-wrap gap-2">
                    {sessionDate && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {sessionDate.toLocaleDateString()}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {bookingData?.duration || 50} min
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Video className="w-3 h-3 mr-1" />
                      {bookingData?.sessionType || 'Video'} Session
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm">Session Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-purple-600 mb-1">
                    {bookingData?.duration || 50}
                  </p>
                  <p className="text-xs text-gray-600">Minutes</p>
                </div>
                <div className="pt-4 border-t border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">Your feedback helps:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Improve our services</li>
                    <li>• Help other patients</li>
                    <li>• Support your therapist</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Form */}
        <div className="space-y-6">
          {/* Rating */}
          <Card className="border-2 border-yellow-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                How was your session?
              </CardTitle>
              <CardDescription>Rate your overall experience (required)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transform transition-transform hover:scale-110"
                    type="button"
                  >
                    <Star
                      className={`w-12 h-12 transition-all ${
                        star <= rating 
                          ? 'text-yellow-400 fill-current drop-shadow-lg' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-900">
                    {rating === 5 && "🌟 Excellent! We're thrilled you had a great experience."}
                    {rating === 4 && "👍 Very good! Thanks for the positive feedback."}
                    {rating === 3 && "😊 Good! We appreciate your feedback."}
                    {rating === 2 && "😐 We'll work to improve your experience."}
                    {rating === 1 && "😔 We're sorry to hear that. Please let us know how we can improve."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="border-2 border-green-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                Would you recommend this therapist?
              </CardTitle>
              <CardDescription>Help other patients make informed decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={recommend === true ? "default" : "outline"}
                  onClick={() => setRecommend(true)}
                  className={`flex-1 h-16 text-lg ${
                    recommend === true 
                      ? 'bg-green-600 hover:bg-green-700 shadow-lg' 
                      : 'hover:bg-green-50'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Yes, I&apos;d recommend
                </Button>
                <Button
                  variant={recommend === false ? "destructive" : "outline"}
                  onClick={() => setRecommend(false)}
                  className={`flex-1 h-16 text-lg ${
                    recommend === false 
                      ? 'shadow-lg' 
                      : 'hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5 mr-2" />
                  No, I wouldn&apos;t
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Written Feedback */}
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Additional Comments
              </CardTitle>
              <CardDescription>
                Share more details about your experience (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What went well? What could be improved? Any specific feedback for your therapist? Your comments are valuable and help us provide better care."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[150px] text-base"
              />
              <p className="text-xs text-gray-500 mt-2">
                {feedback.length} characters
              </p>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Link href="/therabook" className="flex-1">
              <Button variant="outline" className="w-full h-12" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Skip Feedback
              </Button>
            </Link>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              size="lg"
              disabled={rating === 0 || submitting}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            🔒 Your feedback is confidential. Only aggregate ratings are shown publicly.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
