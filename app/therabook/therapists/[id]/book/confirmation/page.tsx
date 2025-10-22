'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Calendar, Clock, Video, Download, Phone, Building, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from '@/components/auth/NewAuthContext';
import { bookingService, type Booking } from "@/lib/booking-service";

// Avoid strict param typing to satisfy generated Next.js PageProps diff validation.


const therapistFallback = {
  name: 'Therapist',
  title: 'Licensed Professional',
  image: '/api/placeholder/100/100'
};

export default function ConfirmationPage(_props: any) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [therapist, setTherapist] = useState<any>(therapistFallback);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [unlockAt, setUnlockAt] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID not found');
      setIsLoading(false);
      return;
    }
    // Wait for auth context to finish loading
    if (authLoading) return;
    if (!isAuthenticated) {
      // Still attempt fetch without token? Usually returns 401, so just show message.
      setError('Login required to view booking confirmation');
      setIsLoading(false);
      return;
    }
    loadBooking();
  }, [bookingId, authLoading, isAuthenticated]);

  const loadBooking = async () => {
    if (!bookingId) return;
    try {
      const bookingData = await bookingService.getBooking(bookingId, token || undefined);
      setBooking(bookingData);
      // Compute unlock time: T-10 minutes from session start
      try {
        const d = new Date(bookingData.appointmentDate);
        const [hh, mm] = String(bookingData.appointmentTime || '00:00').split(':').map((s: string) => parseInt(s, 10));
        if (!Number.isNaN(hh)) d.setHours(hh);
        if (!Number.isNaN(mm)) d.setMinutes(mm);
        d.setSeconds(0, 0);
        const unlock = d.getTime() - 10 * 60 * 1000; // 10 minutes before
        setUnlockAt(unlock);
      } catch {}
      // Fetch therapist details (best effort)
      try {
        const res = await fetch(`/api/therapists/${bookingData.therapistId}`);
        if (res.ok) {
          const data = await res.json();
          const t = data?.data?.therapist || data?.therapist;
          if (t) {
            setTherapist({
              name: t.displayName || t.name || therapistFallback.name,
              title: t.title || t.specializations?.[0] || therapistFallback.title,
              image: t.photo || t.image || therapistFallback.image
            });
          }
        }
      } catch {}
    } catch (error: any) {
      setError(error.message || 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  // Tick timer every 15 seconds to update countdown and button enabled state
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "audio": return Phone;
      case "in-person": return Building;
      default: return Video;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The booking details could not be loaded.'}</p>
          {!isAuthenticated && (
            <p className="text-sm text-orange-600 mb-4">You are not logged in. Please sign in and reopen this confirmation page.</p>
          )}
          <Link href="/therabook">
            <Button>Back to TheraBook</Button>
          </Link>
        </div>
      </div>
    );
  }

  const SessionIcon = getSessionIcon(booking.sessionType);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <span className="inline-flex items-center text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Step 6 of 6</span>
        </div>
        <p className="text-xl text-gray-600">Your session has been successfully scheduled</p>
        <p className="text-sm text-gray-500 mt-2">
          Booking ID: <span className="font-mono font-medium">{booking._id}</span>
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Your upcoming therapy session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <SessionIcon className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium capitalize">{booking.sessionType} Session</p>
                <p className="text-sm text-gray-600">50 minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium">
                  {new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-600">{booking.appointmentTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-gray-600">50 minutes</p>
              </div>
            </div>

    {/* Optional meeting link if backend provides it */}
    {/* Join gating: unlock button 10 minutes before session start */}
    {((booking as any).meetingUrl || (booking as any).meetingLink) && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Join Your Session</h4>
                {unlockAt && now < unlockAt ? (
                  <div className="mb-3 text-sm text-blue-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Join button unlocks 10 minutes before your session.
                  </div>
                ) : (
                  <p className="text-sm text-blue-700 mb-3">Use this link to join your video/audio session:</p>
                )}
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                  disabled={Boolean(unlockAt && now < unlockAt)}
                  onClick={() => {
                    const url = (booking as any).meetingUrl || (booking as any).meetingLink;
                    if (url) window.open(url, '_blank');
                  }}
                >
                  Join Session
                </Button>
              </div>
            )}
            {!((booking as any).meetingUrl || (booking as any).meetingLink) && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-2">Join Now (Demo Link)</h4>
                <p className="text-sm text-indigo-700 mb-3">Use this demo RoomKit link to enter the session immediately. Share it with the participant.</p>
                <Button
                  variant="outline"
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  onClick={() => window.open('https://therabook.app.100ms.live/meeting/ceu-ftar-xyj', '_blank')}
                >
                  Open Session (Room Code ceu-ftar-xyj)
                </Button>
                <p className="text-[11px] mt-2 text-indigo-500 break-all">https://therabook.app.100ms.live/meeting/ceu-ftar-xyj</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Therapist Information */}
        <Card>
          <CardHeader>
      <CardTitle>Your Therapist</CardTitle>
      <CardDescription>{therapist.name} {therapist.title && `- ${therapist.title}`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
        <AvatarImage src={therapist.image} alt={therapist.name} />
                <AvatarFallback>{therapist.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}</AvatarFallback>
              </Avatar>
              <div>
        <h3 className="font-semibold text-lg">{therapist.name}</h3>
        <p className="text-gray-600">{therapist.title}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Paid:</span>
        <span className="text-xl font-bold text-green-600">₹{booking.totalAmount || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Contact information and support</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Contact Your Therapist</h4>
              <p className="text-sm text-gray-600 mb-1">Email: therapist@therabook.com</p>
              <p className="text-sm text-gray-600">Phone: +1 (555) 123-4567</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Technical Support</h4>
              <p className="text-sm text-gray-600 mb-1">Email: support@therabook.com</p>
              <p className="text-sm text-gray-600">Phone: +1 (555) 987-6543</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center mt-8 space-x-4">
        <Link href="/therabook">
          <Button variant="outline">
            Back to TheraBook
          </Button>
        </Link>
        <Button 
          onClick={() => window.print()}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Print Confirmation
        </Button>
      </div>
    </div>
  );
}
