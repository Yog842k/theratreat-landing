"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useAuth } from '@/components/auth/NewAuthContext';
import { bookingService } from '@/lib/booking-service';
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, XCircle, MapPin } from "lucide-react";

import { Card, CardContent } from '@/components/ui/card';

export default function BookingDetailsPage() {
  const params = useParams();
  let id: string | undefined = undefined;
  if (params && typeof params.id === 'string' && !!params.id) {
    id = params.id;
  } else if (Array.isArray(params?.id)) {
    const first = params.id[0];
    if (typeof first === 'string' && !!first) {
      id = first;
    }
  }
  const { token } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      setError("");
      try {
        if (id) {
          const data = await bookingService.getBooking(id, token ?? undefined);
          setBooking(data);
        } else {
          setError("No booking ID provided.");
        }
      } catch (e: any) {
        setError(e.message || "Could not load booking details");
      } finally {
        setLoading(false);
      }
    }
    if (typeof id === 'string') fetchBooking();
  }, [id, token]);

  if (loading) return (
    <div className="flex flex-col items-center py-20">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
      <span className="text-slate-500 font-medium">Loading booking details...</span>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center py-20 text-red-600">
      <AlertCircle className="w-10 h-10 mb-2" />
      <span className="font-semibold">{error}</span>
    </div>
  );
  if (!booking) return <div className="py-20 text-center text-slate-500">No booking found.</div>;

  // Parse notes if stringified
  let notes = booking.notes;
  if (typeof notes === 'string') {
    try { notes = JSON.parse(notes); } catch {}
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-7 h-7 text-blue-600" /> Booking Details
      </h1>
      <Card className="rounded-2xl shadow-lg border-blue-100">
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-lg">{notes?.fullName || booking.patientFullName || '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <span>{notes?.email || booking.patientEmail || '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400" />
              <span>{notes?.phone || booking.patientPhone || '-'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{booking.appointmentDate}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{booking.appointmentTime}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="font-medium capitalize">{booking.sessionType}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="font-medium">Amount:</span>
              <span className="text-green-700 font-bold text-lg">₹{booking.amount || booking.totalAmount || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              {booking.status === 'confirmed' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-amber-500" />}
              <span className="font-medium">Status:</span>
              <span className="capitalize">{booking.status}</span>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-700 flex items-center gap-2"><FileText className="w-5 h-5" /> Patient Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
              <div><span className="font-medium">Age:</span> {notes?.age || booking.patientAge || '-'}</div>
              <div><span className="font-medium">Language:</span> {notes?.language || booking.patientLanguage || '-'}</div>
              <div className="md:col-span-2"><span className="font-medium">Concerns:</span> {notes?.concerns || booking.patientConcerns || '-'}</div>
              <div className="md:col-span-2"><span className="font-medium">Emergency Contact:</span> {notes?.emergency || booking.patientEmergency || '-'}</div>
              <div className="md:col-span-2"><span className="font-medium">Has had therapy before:</span> {notes?.hasTherapyBefore !== undefined ? (notes.hasTherapyBefore ? 'Yes' : 'No') : (booking.hasTherapyBefore ? 'Yes' : 'No')}</div>
            </div>
          </div>
          {booking.sessionType === 'home' && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2 text-blue-700 flex items-center gap-2"><MapPin className="w-5 h-5" /> Home Visit Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                <div><span className="font-medium">Address Line 1:</span> {notes?.inHomeDetails?.addressLine1 || booking.inHomeAddressLine1 || '-'}</div>
                <div><span className="font-medium">Address Line 2:</span> {notes?.inHomeDetails?.addressLine2 || booking.inHomeAddressLine2 || '-'}</div>
                <div><span className="font-medium">City:</span> {notes?.inHomeDetails?.city || booking.inHomeCity || '-'}</div>
                <div><span className="font-medium">Pincode:</span> {notes?.inHomeDetails?.pincode || booking.inHomePincode || '-'}</div>
                <div><span className="font-medium">Contact Name:</span> {notes?.inHomeDetails?.contactName || booking.inHomeContactName || '-'}</div>
                <div><span className="font-medium">Contact Phone:</span> {notes?.inHomeDetails?.contactPhone || booking.inHomeContactPhone || '-'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
