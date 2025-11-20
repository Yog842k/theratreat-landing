'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Star, MapPin, Clock, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/NewAuthContext';

export default function ConfirmTherapistPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const therapistId = Array.isArray(params?.id) ? params.id[0] : (params?.id || '');
  
  const [therapist, setTherapist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!therapistId) {
      setError('Invalid therapist ID');
      setLoading(false);
      return;
    }

    async function loadTherapist() {
      try {
        const res = await fetch(`/api/therapists/${therapistId}`);
        if (!res.ok) throw new Error('Failed to load therapist');
        const data = await res.json();
        const t = data?.data?.therapist || data?.therapist;
        if (t) {
          setTherapist({
            name: t.displayName || t.name || 'Therapist',
            title: t.title || t.specializations?.[0] || 'Licensed Therapist',
            image: t.photo || t.image || '/api/placeholder/100/100',
            rating: t.rating || 0,
            reviews: t.reviewsCount || 0,
            location: t.location || '',
            price: t.consultationFee || t.price || 0,
            specializations: t.specializations || []
          });
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load therapist');
      } finally {
        setLoading(false);
      }
    }

    loadTherapist();
  }, [therapistId]);

  const handleContinue = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/therabook/therapists/${therapistId}/book/confirm-therapist`)}`);
      return;
    }
    router.push(`/therabook/therapists/${therapistId}/book`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Therapist not found'}</p>
            <Link href="/therabook/therapists">
              <Button variant="outline">Back to Therapists</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/therabook/therapists/${therapistId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-600">Step 1 of 6</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '16.66%' }}></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Confirm Your Therapist
            </CardTitle>
            <CardDescription className="text-lg">
              Review your selected therapist before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {/* Therapist Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 ring-4 ring-blue-100">
                  <AvatarImage src={therapist.image} alt={therapist.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {therapist.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{therapist.name}</h3>
                    <p className="text-lg text-gray-600 mb-3">{therapist.title}</p>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      {therapist.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-semibold">{therapist.rating}</span>
                          <span className="text-sm text-gray-500">({therapist.reviews} reviews)</span>
                        </div>
                      )}
                      {therapist.location && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{therapist.location}</span>
                        </div>
                      )}
                      {therapist.price > 0 && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <span className="text-sm">Starting at</span>
                          <span className="font-bold text-blue-600">₹{therapist.price}</span>
                        </div>
                      )}
                    </div>

                    {/* Specializations */}
                    {therapist.specializations && therapist.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {therapist.specializations.slice(0, 5).map((spec: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Ready to book with {therapist.name}?</h4>
                  <p className="text-sm text-blue-800">
                    You're about to start the booking process. You'll be able to select your preferred date, time, and session type next.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mb-6">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Secure & Private</p>
                <p>Your booking information is encrypted and secure. We never share your personal details with third parties.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/therabook/therapists/${therapistId}`} className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
              <Button 
                onClick={handleContinue}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                Yes, Continue Booking
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



