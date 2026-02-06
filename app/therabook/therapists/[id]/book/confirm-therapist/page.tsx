'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, MapPin, Shield, ArrowRight, Check, Sparkles } from 'lucide-react';
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

  // --- Loading State ---
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Preparing details...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-red-100 shadow-lg">
          <CardContent className="pt-8 text-center pb-8">
            <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-xl font-bold">!</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-slate-500 mb-6">{error || 'Therapist not found'}</p>
            <Link href="/therabook/therapists">
              <Button variant="outline" className="w-full">Back to Directory</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Decorative Bar - now inside stacking context for header */}
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute inset-0 h-48 bg-blue-600 w-full z-0 rounded-b-3xl" />
        <div className="relative z-10 container mx-auto px-4 pt-8 max-w-3xl">
          {/* Navigation & Progress */}
          <div className="mb-8 text-white">
            <Link href={`/therabook/therapists/${therapistId}`} className="inline-flex items-center text-blue-100 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
            <div className="flex items-end justify-between mb-2">
              <h1 className="text-3xl font-bold">Confirm Selection</h1>
              <span className="text-blue-200 font-medium">Step 1 of 6</span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 bg-blue-800/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: '16.66%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 relative z-10 max-w-3xl">
        {/* Main Card */}
        <Card className="shadow-xl border-0 ring-1 ring-slate-200/60 overflow-hidden">
          <CardContent className="p-0">
            
            {/* 1. Therapist Snapshot Section */}
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar Column */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <Avatar className="w-28 h-28 ring-4 ring-white shadow-lg">
                    <AvatarImage src={therapist.image} alt={therapist.name} className="object-cover" />
                    <AvatarFallback className="text-3xl bg-blue-100 text-blue-700 font-bold">
                      {therapist.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Details Column */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{therapist.name}</h2>
                    <p className="text-slate-500 font-medium">{therapist.title}</p>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-4 text-sm">
                    {therapist.rating > 0 && (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md text-amber-700 border border-amber-100">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-semibold">{therapist.rating}</span>
                        <span className="text-amber-600/70">({therapist.reviews})</span>
                      </div>
                    )}
                    {therapist.location && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{therapist.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Specializations Pills */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                    {therapist.specializations?.slice(0, 4).map((spec: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal border border-slate-200">
                        {spec}
                      </Badge>
                    ))}
                    {therapist.specializations?.length > 4 && (
                      <Badge variant="outline" className="text-slate-400 border-slate-200">+{therapist.specializations.length - 4}</Badge>
                    )}
                  </div>
                </div>

                {/* Price Column (Desktop) */}
                <div className="hidden sm:flex flex-col items-end justify-start border-l border-slate-100 pl-6">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Consultation</span>
                  <span className="text-2xl font-bold text-blue-700">₹{therapist.price}</span>
                  <span className="text-xs text-slate-500">per session</span>
                </div>
              </div>

               {/* Price Row (Mobile Only) */}
               <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between sm:hidden">
                  <span className="text-slate-600 font-medium">Session Fee</span>
                  <div className="text-right">
                    <span className="block text-xl font-bold text-blue-700">₹{therapist.price}</span>
                  </div>
               </div>
            </div>

            {/* 2. Context & Action Section */}
            <div className="p-6 sm:p-8 bg-slate-50/50 space-y-6">
              
              {/* Value Prop / Message */}
              <div className="flex gap-4 bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Excellent Choice</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    You've selected a highly rated professional. Proceed to schedule your session time and customize your appointment details next.
                  </p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5" />
                <span>256-bit SSL Secure Booking</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:grid sm:grid-cols-3 gap-3">
                <Link href={`/therabook/therapists/${therapistId}`} className="sm:col-span-1">
                  <Button variant="outline" className="w-full h-12 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  onClick={handleContinue}
                  className="sm:col-span-2 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span className="mr-2">Continue to Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Bottom Help Text */}
        <p className="text-center text-slate-400 text-sm mt-8">
          Need help choosing? <Link href="/support" className="text-blue-600 hover:underline">Chat with support</Link>
        </p>
      </div>
    </div>
  );
}