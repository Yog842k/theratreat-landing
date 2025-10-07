"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';
import { bookingService } from '@/lib/booking-service';
import { useAuth } from '@/components/auth/NewAuthContext';

interface ClinicProfile {
  _id: string;
  name: string;
  description?: string;
  specialties?: string[];
  yearsOfPractice?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  contactNumber?: string;
  email?: string;
  logoUrl?: string;
  bannerUrl?: string;
  operatingHours?: Record<string,{ open: string; close: string; closed?: boolean }>;
  holidays?: string[];
  branches?: Array<{ _id: string; name: string; address: string; city?: string; state?: string; geo?: { lat: number; lng: number } }>; 
  rating?: number;
  totalReviews?: number;
}

interface TherapistSummary {
  _id: string;
  displayName: string;
  specializations?: string[];
  experience?: number;
  consultationFee?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
}

interface BookingDraft {
  therapistId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  sessionType: string; // in-clinic / video
}

interface AvailabilitySlot { time: string; available: boolean; }

export default function ClinicProfileClient({ clinicId }: { clinicId: string }) {
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [therapists, setTherapists] = useState<TherapistSummary[]>([]);
  const [activeTab, setActiveTab] = useState('about');

  // Booking state
  const today = new Date();
  const defaultDate = today.toISOString().slice(0,10);
  const [draft, setDraft] = useState<BookingDraft>({ therapistId: '', date: defaultDate, time: '', sessionType: 'in-clinic' });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [creating, setCreating] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // For now reuse owner API if public endpoint not built; fallback mock
        const res = await fetch(`/api/clinics/me?override=${clinicId}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.clinic && mounted) {
            setClinic({ ...json.data.clinic, _id: json.data.clinic._id || clinicId });
            setTherapists(json.data.therapists || []);
          } else if (mounted) {
            setError('Clinic not found');
          }
        } else if (mounted) {
          setError('Unable to load clinic');
        }
      } catch (e:any) {
        if (mounted) setError(e.message);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [clinicId]);

  // Load availability when therapist/date changes
  useEffect(() => {
    if (!draft.therapistId || !draft.date) return;
    (async () => {
      const avail = await bookingService.getTherapistAvailability(draft.therapistId, { date: draft.date });
      setAvailability(avail.availability);
    })();
  }, [draft.therapistId, draft.date]);

  const handleCreateBooking = async () => {
    if (!isAuthenticated) {
      setError('Please log in to book');
      return;
    }
    if (!draft.therapistId || !draft.date || !draft.time) return;
    setCreating(true);
    setError(null);
    try {
      const booking = await bookingService.createBooking({
        therapistId: draft.therapistId,
        appointmentDate: draft.date,
        appointmentTime: draft.time,
        sessionType: draft.sessionType,
        notes: ''
      }, token || undefined);
      setConfirmation(booking);
    } catch (e:any) {
      setError(e.message || 'Booking failed');
    } finally {
      setCreating(false);
    }
  };

  const feeDisplay = (t: TherapistSummary) => `₹${t.consultationFee || 500}`;

  if (loading) return <div className="p-8 text-sm">Loading clinic...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;
  if (!clinic) return <div className="p-8 text-sm">Not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Banner */}
      <div className="rounded-xl overflow-hidden mb-8 relative h-48 bg-gradient-to-r from-indigo-100 to-blue-50 flex items-end">
        {clinic.bannerUrl && <img src={clinic.bannerUrl} alt={clinic.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
        <div className="relative p-6">
          <h1 className="text-3xl font-bold mb-2">{clinic.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {clinic.specialties?.length && <span>{clinic.specialties.slice(0,3).join(', ')}</span>}
            {clinic.city && <span>• {clinic.city}</span>}
            {clinic.rating != null && <span className="flex items-center gap-1">★ {clinic.rating} <span className="text-xs text-slate-500">({clinic.totalReviews||0})</span></span>}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="therapists">Therapists</TabsTrigger>
            <TabsTrigger value="book">Book</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card><CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">About the Clinic</h2>
                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{clinic.description || 'No description provided yet.'}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {clinic.specialties?.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </CardContent></Card>

              <Card><CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Operating Hours</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {clinic.operatingHours ? Object.entries(clinic.operatingHours).map(([day, val]) => (
                    <div key={day} className="p-2 rounded border bg-white">
                      <div className="font-medium capitalize">{day}</div>
                      {val.closed ? <div className="text-red-500">Closed</div> : <div>{val.open} - {val.close}</div>}
                    </div>
                  )) : <div className="text-xs text-slate-500">Not provided</div>}
                </div>
              </CardContent></Card>

              <Card><CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Holidays</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {clinic.holidays?.length ? clinic.holidays.map(h => <Badge key={h} variant="outline">{h}</Badge>) : <span className="text-slate-500">No holidays listed</span>}
                </div>
              </CardContent></Card>

              {clinic.branches?.length ? (
                <Card><CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Branches</h3>
                  <div className="space-y-3 text-sm">
                    {clinic.branches.map(b => (
                      <div key={b._id} className="p-3 rounded border">
                        <div className="font-medium">{b.name}</div>
                        <div className="text-xs text-slate-600">{b.address}</div>
                      </div>
                    ))}
                  </div>
                </CardContent></Card>
              ) : null}
            </div>
            <div className="space-y-6">
              <Card><CardContent className="p-6 space-y-3 text-sm">
                <h3 className="font-semibold">Contact</h3>
                <div><span className="text-slate-500">Phone:</span> <span>{clinic.contactNumber ? clinic.contactNumber.replace(/\d(?=\d{4})/g,'*') : '—'}</span></div>
                <div><span className="text-slate-500">Email:</span> <span>{clinic.email ? clinic.email.replace(/^[^@]+/, m => '*'.repeat(Math.max(2, Math.min(6,m.length)))) : '—'}</span></div>
                <div><span className="text-slate-500">Address:</span> <span>{clinic.address || clinic.city || '—'}</span></div>
                <Button size="sm" className="mt-2">Request Full Contact</Button>
              </CardContent></Card>
              <Card><CardContent className="p-6 space-y-3 text-sm">
                <h3 className="font-semibold">Map</h3>
                <div className="aspect-video w-full rounded bg-slate-100 flex items-center justify-center text-xs text-slate-500">Map integration placeholder</div>
              </CardContent></Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="therapists">
          <div className="grid md:grid-cols-3 gap-6">
            {therapists.map(t => (
              <Card key={t._id} className="overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                      {t.image ? <img src={t.image} alt={t.displayName} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-sm">{t.displayName.charAt(0)}</div>}
                    </div>
                    <div>
                      <div className="font-medium leading-tight">{t.displayName}</div>
                      <div className="text-xs text-slate-500">{t.specializations?.slice(0,2).join(', ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>{t.experience || 0} yrs exp</span>
                    <span>{feeDisplay(t)}</span>
                    {t.rating != null && <span>★ {t.rating}</span>}
                  </div>
                  <Button size="sm" className="w-full" variant={draft.therapistId===t._id? 'secondary':'default'} onClick={() => setDraft(d => ({ ...d, therapistId: t._id }))}>{draft.therapistId===t._id? 'Selected' : 'Select'}</Button>
                </CardContent>
              </Card>
            ))}
            {!therapists.length && <div className="text-sm text-slate-500">No therapists listed.</div>}
          </div>
        </TabsContent>

        <TabsContent value="book">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card><CardContent className="p-6 space-y-4 text-sm">
                <h3 className="font-semibold">1. Choose Consultation Type</h3>
                <div className="flex gap-3">
                  {['in-clinic','video'].map(mode => <Button key={mode} size="sm" variant={draft.sessionType===mode? 'default':'outline'} onClick={() => setDraft(d => ({ ...d, sessionType: mode }))}>{mode==='in-clinic'? 'In-Clinic (₹500)' : 'Video'}</Button>)}
                </div>
                <h3 className="font-semibold pt-4">2. Select Therapist</h3>
                <div className="flex flex-wrap gap-2">
                  {therapists.map(t => <Button key={t._id} size="sm" variant={draft.therapistId===t._id? 'secondary':'outline'} onClick={() => setDraft(d => ({ ...d, therapistId: t._id }))}>{t.displayName}</Button>)}
                </div>
                <h3 className="font-semibold pt-4">3. Pick Date</h3>
                <input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} className="border rounded px-2 py-1 text-xs" />
                <h3 className="font-semibold pt-4">4. Pick Time Slot</h3>
                <div className="flex flex-wrap gap-2">
                  {availability.map(s => <Button key={s.time} size="sm" variant={draft.time===s.time? 'default':'outline'} disabled={!s.available} onClick={() => setDraft(d => ({ ...d, time: s.time }))}>{s.time}</Button>)}
                  {!availability.length && <div className="text-xs text-slate-500">Select therapist & date to load slots.</div>}
                </div>
                <h3 className="font-semibold pt-4">5. Confirm & Pay</h3>
                <Button disabled={creating || !draft.time || !draft.therapistId} onClick={handleCreateBooking}>{creating? 'Processing...' : 'Confirm Booking'}</Button>
                {error && <div className="text-xs text-red-600">{error}</div>}
              </CardContent></Card>

              {confirmation && (
                <Card><CardContent className="p-6 text-sm space-y-2">
                  <h3 className="font-semibold text-green-600">Booking Confirmed</h3>
                  <div>Reference: <span className="font-mono">{confirmation._id}</span></div>
                  <div>Date: {draft.date} at {draft.time}</div>
                  <div>Session: {draft.sessionType}</div>
                  <div>Therapist: {therapists.find(t => t._id===draft.therapistId)?.displayName}</div>
                  <div className="pt-2"><Button size="sm" variant="outline">Download Receipt</Button></div>
                </CardContent></Card>
              )}
            </div>
            <div className="space-y-6">
              <Card><CardContent className="p-6 text-sm space-y-2">
                <h3 className="font-semibold">Pricing</h3>
                <div>In-Clinic: ₹500 base (therapist specific fees may vary)</div>
                <div>Video: Same or discounted as per therapist policy.</div>
              </CardContent></Card>
              <Card><CardContent className="p-6 text-sm space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" /> Reminder</h3>
                <div>Reminder emails/SMS are sent 24h & 1h before the session.</div>
              </CardContent></Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <Card><CardContent className="p-6 text-sm space-y-4">
            <h3 className="font-semibold">Clinic Reviews</h3>
            <div className="text-xs text-slate-500">Feedback & aggregated ratings will appear here once implemented.</div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
