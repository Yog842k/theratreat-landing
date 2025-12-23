"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Clock, Calendar, Award, BookOpen, Users, CheckCircle, ArrowLeft, Share2, Languages, Stethoscope, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface TherapistProfileProps {}

type ApiResponse = {
  success: boolean;
  therapist?: any;
  message?: string;
};

type StatsResponse = {
  success?: boolean;
  stats?: {
    totalSessions?: number;
    rating?: number;
    reviewCount?: number;
  };
  therapist?: { isVerified?: boolean };
  message?: string;
};

type Booking = {
  _id?: string;
  sessionTime?: { startTime?: string; endTime?: string };
  sessionDate?: string;
  date?: string;
};

export default function TherapistProfilePage({}: TherapistProfileProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [therapist, setTherapist] = useState<any>(null);
  const [stats, setStats] = useState<{ rating: number; reviewCount: number; totalSessions: number }>({ rating: 0, reviewCount: 0, totalSessions: 0 });
  const [scheduledSessions, setScheduledSessions] = useState<Booking[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const routeParams = useParams();
  const id = Array.isArray(routeParams?.id) ? (routeParams?.id?.[0] as string) : ((routeParams?.id as string) || "");

  const DISPLAY_TZ = 'Asia/Kolkata';
  const formatDate = (value?: Date | string | number): string => {
    const d = value instanceof Date ? value : new Date(value ?? Date.now());
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: DISPLAY_TZ }).format(d);
  };
  const formatTime = (value?: Date | string | number): string => {
    if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) return value;
    const d = value instanceof Date ? value : new Date(value ?? Date.now());
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: DISPLAY_TZ }).format(d);
  };

  useEffect(() => {
    setMounted(true);

    let active = true;

    const fetchTherapist = async () => {
      const res = await fetch(`/api/therapists/${id}`);
      const json: ApiResponse = await res.json();
      if (!res.ok || !json.success || !json.therapist) throw new Error(json.message || "Therapist not found");
      return json.therapist;
    };

    const fetchStats = async () => {
      const res = await fetch(`/api/dashboard/therapist/stats?therapistId=${id}`);
      const json: StatsResponse = await res.json().catch(() => ({} as StatsResponse));
      if (!res.ok || !json?.stats) throw new Error(json?.message || 'Stats not available');
      const s = json.stats;
      return {
        rating: Number(s?.rating ?? 0),
        reviewCount: Number(s?.reviewCount ?? 0),
        totalSessions: Number(s?.totalSessions ?? 0)
      };
    };

    const fetchScheduled = async () => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const res = await fetch(`/api/dashboard/therapist/scheduled-sessions?therapistId=${id}&date=${yyyy}-${mm}-${dd}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error('Scheduled sessions not available');
      const payload = Array.isArray(json) ? json : (Array.isArray(json.sessions) ? json.sessions : (Array.isArray(json.data) ? json.data : []));
      return Array.isArray(payload) ? payload : [];
    };

    const fetchBookings = async () => {
      const res = await fetch(`/api/bookings/therapist-bookings?therapistId=${id}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error('Bookings not available');
      const payload = Array.isArray(json.data) ? json.data : [];
      return payload;
    };

    (async () => {
      setLoading(true); setError(null);
      try {
        if (!id) throw new Error("Therapist id missing");
        const results = await Promise.allSettled([
          fetchTherapist(),
          fetchStats(),
          fetchScheduled(),
          fetchBookings()
        ]);

        if (!active) return;

        const therapistResult = results[0];
        if (therapistResult.status === 'fulfilled') setTherapist(therapistResult.value);
        else setError(therapistResult.reason?.message || "Failed to load therapist");

        const statsResult = results[1];
        if (statsResult.status === 'fulfilled') setStats(statsResult.value);

        const scheduledResult = results[2];
        if (scheduledResult.status === 'fulfilled') setScheduledSessions(scheduledResult.value as Booking[]);

        const bookingsResult = results[3];
        if (bookingsResult.status === 'fulfilled') setBookings(bookingsResult.value as Booking[]);
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load therapist");
      } finally { if (active) setLoading(false); }
    })();

    return () => { active = false };
  }, [id]);

  const display = useMemo(() => {
    const t = therapist || {};
    const name = t.displayName || t.name || "Therapist";
    const title = t.title || (Array.isArray(t.designations) ? t.designations[0] : "Licensed Therapist");
    const languages = Array.isArray(t.languages) ? t.languages : [];
    const specs = Array.isArray(t.specializations) ? t.specializations : [];
    const conditions = Array.isArray(t.primaryConditions) ? t.primaryConditions : [];
    const rating = stats.rating || t.rating || 0;
    const reviewCount = stats.reviewCount || t.reviewCount || t.reviewsCount || 0;
    const sessions = stats.totalSessions || t.totalSessions || t.sessions || 0;
    const experienceText = typeof t.experience === 'number'
      ? `${t.experience}+ years`
      : (typeof t.experience === 'string' ? t.experience : "");
    const location = t.location || "Online";
    const price = t.consultationFee ?? t.sessionFee ?? t.price ?? 0;
    const image = t.image || t.photo || "/api/placeholder/150/150";
    const bio = t.bio || "";
    const education = Array.isArray(t.education) && t.education.length && typeof t.education[0] === 'string'
      ? t.education
      : (Array.isArray(t.education) ? t.education.map((e: any) => `${e.degree || ''}${e.institution ? ' - ' + e.institution : ''}${e.year ? ' (' + e.year + ')' : ''}`.trim()).filter(Boolean) : []);
    const certifications = Array.isArray(t.certifications) ? t.certifications.map((c: any) => `${c.name || ''}${c.issuer ? ' - ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}`.trim()).filter(Boolean) : [];
    const sessionTypes = Array.isArray(t.sessionTypes) ? t.sessionTypes : [];
    const now = Date.now();
    const nextSlot = [...scheduledSessions, ...bookings]
      .map(s => s.sessionTime?.startTime || s.sessionDate || s.date)
      .filter(Boolean)
      .map((val) => new Date(val as string))
      .filter((d) => !Number.isNaN(d.getTime()) && d.getTime() >= now)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    const nextAvailable = nextSlot ? `${formatDate(nextSlot)} • ${formatTime(nextSlot)}` : "";
    const weeklySlots = Array.isArray(t.availability)
      ? t.availability.reduce((acc: number, d: any) => acc + (Array.isArray(d.slots) ? d.slots.filter((s: any) => s?.isAvailable).length : 0), 0)
      : (scheduledSessions?.length || 0);
    return { name, title, languages, specs, conditions, rating, reviewCount, sessions, experienceText, location, price, image, bio, education, certifications, sessionTypes, nextAvailable, weeklySlots };
  }, [therapist, stats, scheduledSessions, bookings]);

  if (!mounted) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium">Loading profile...</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">Error</h2>
            <p className="text-red-500 mt-2">{error}</p>
            <Link href="/therabook/therapists">
                <Button variant="outline" className="mt-4">Go Back</Button>
            </Link>
        </div>
    </div>
  );

  if (!therapist) return <div className="min-h-screen flex items-center justify-center text-slate-600">No therapist found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/therabook/therapists">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 rounded-full">
                <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Profile Header Card */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Avatar Column */}
            <div className="flex flex-col items-center lg:items-start flex-shrink-0">
                <div className="relative">
                  <Avatar className="w-32 h-32 lg:w-40 lg:h-40 border-4 border-white shadow-lg bg-white ring-1 ring-slate-100">
                    <AvatarImage src={display.image} alt={display.name} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 font-bold">
                      {display.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-white" title="Verified Therapist">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                
                {/* Mobile: Rating below avatar */}
                <div className="mt-4 flex flex-col items-center lg:items-start lg:hidden">
                    <h1 className="text-2xl font-bold text-slate-900 text-center">{display.name}</h1>
                    <p className="text-slate-500 font-medium mb-3">{display.title}</p>
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-slate-800 text-sm">{display.rating}</span>
                        <span className="text-slate-400 text-xs">({display.reviewCount})</span>
                    </div>
                </div>
            </div>

            {/* Info Column */}
            <div className="flex-1 flex flex-col">
                <div className="hidden lg:block">
                     <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{display.name}</h1>
                            <p className="text-lg text-slate-500 font-medium mt-1">{display.title}</p>
                        </div>
                        <div className="text-right">
                             <div className="text-2xl font-bold text-blue-600">₹{Number(display.price).toLocaleString('en-IN')}</div>
                             <p className="text-sm text-slate-400">per session</p>
                        </div>
                     </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 lg:mt-6 lg:mb-8">
                    <div className="hidden lg:flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500" /> Rating
                        </div>
                        <div className="text-lg font-bold text-slate-900">{display.rating} <span className="text-xs font-normal text-slate-400">({display.reviewCount})</span></div>
                    </div>
                     <div className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" /> Experience
                        </div>
                        <div className="text-lg font-bold text-slate-900">{display.experienceText}</div>
                    </div>
                    <div className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                            <Users className="w-3.5 h-3.5 text-emerald-500" /> Sessions
                        </div>
                        <div className="text-lg font-bold text-slate-900">{display.sessions}+</div>
                    </div>
                     <div className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                            <MapPin className="w-3.5 h-3.5 text-purple-500" /> Location
                        </div>
                        <div className="text-lg font-bold text-slate-900 truncate">{display.location}</div>
                    </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Focus Areas</h3>
                    <div className="flex flex-wrap gap-2">
                        {(display.conditions?.length ? display.conditions : display.specs).slice(0, 5).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 rounded-lg text-sm font-medium">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                     <Link href={`/therabook/therapists/${id}/book/confirm-therapist`} className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-semibold shadow-md shadow-blue-200">
                            Book Session Now
                        </Button>
                     </Link>
                     <div className="text-sm text-slate-500 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Next available: <span className="font-medium text-slate-900">{display.nextAvailable || 'Check calendar'}</span>
                     </div>
                </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="about" className="w-full">
            
            {/* Scrollable Tabs List for Mobile */}
            <div className="sticky top-16 z-30 bg-slate-50 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="w-full justify-start h-auto p-1 bg-white border border-slate-200 rounded-full overflow-x-auto flex-nowrap no-scrollbar shadow-sm">
                  <TabsTrigger value="about" className="rounded-full px-5 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">About</TabsTrigger>
                  <TabsTrigger value="qualifications" className="rounded-full px-5 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Credentials</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-full px-5 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Reviews</TabsTrigger>
                  <TabsTrigger value="availability" className="rounded-full px-5 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Availability</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="about" className="mt-6 space-y-6">
              <Card className="border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">Biography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{display.bio || 'No bio provided yet.'}</p>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                        <Languages className="w-4 h-4 text-slate-400" />
                        Languages Spoken
                    </h4>
                    {display.languages.length ? (
                      <div className="flex gap-2 flex-wrap">
                        {display.languages.map((lang: string) => (
                          <Badge key={lang} variant="outline" className="text-slate-600 border-slate-200 px-3 py-1">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Not specified</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qualifications" className="mt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg text-slate-800">
                      <BookOpen className="w-5 h-5 mr-2.5 text-blue-500" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {display.education.length > 0 ? display.education.map((edu: string, index: number) => (
                        <li key={index} className="flex gap-3">
                          <div className="flex-col items-center hidden sm:flex">
                             <div className="w-1.5 h-1.5 bg-blue-200 rounded-full mt-2"></div>
                             <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                          </div>
                          <span className="text-slate-700 font-medium">{edu}</span>
                        </li>
                      )) : <p className="text-slate-400 text-sm">No education listed</p>}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg text-slate-800">
                      <Award className="w-5 h-5 mr-2.5 text-emerald-500" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {display.certifications.length > 0 ? display.certifications.map((cert: string, index: number) => (
                        <li key={index} className="flex gap-3">
                          <div className="mt-0.5">
                             <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-slate-700">{cert}</span>
                        </li>
                      )) : <p className="text-slate-400 text-sm">No certifications listed</p>}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">Patient Reviews</CardTitle>
                  <CardDescription>
                    Based on {display.reviewCount} verified sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(therapist?.reviews || []).length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-slate-400">No reviews have been written yet.</p>
                    </div>
                  )}
                  {(therapist?.reviews || []).map((review: any) => (
                    <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                             <Avatar className="w-8 h-8">
                                 <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
                                     {review.user?.name?.charAt(0) || 'A'}
                                 </AvatarFallback>
                             </Avatar>
                             <span className="font-semibold text-slate-900 text-sm">{review.user?.name || 'Anonymous'}</span>
                         </div>
                         <span className="text-xs text-slate-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (review.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="mt-6">
              <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                   <div className="bg-blue-50/50 p-8 text-center border-b border-blue-100">
                        <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          Next Available Slot
                        </h3>
                        <p className="text-2xl font-bold text-blue-600 my-2">
                          {display.nextAvailable || 'Check Full Schedule'}
                        </p>
                        <p className="text-slate-500 text-sm mb-6">
                          {display.weeklySlots} total slots available this week
                        </p>
                        <Link href={`/therabook/therapists/${id}/book/confirm-therapist`}>
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 px-8">
                            View Full Schedule
                          </Button>
                        </Link>
                   </div>
                   <div className="p-6 bg-white">
                        <p className="text-center text-sm text-slate-400">
                            Bookings are instant and secure. Cancellation policies apply.
                        </p>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}