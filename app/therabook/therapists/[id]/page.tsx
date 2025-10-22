"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Clock, Calendar, Award, BookOpen, Users, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
interface TherapistProfileProps {}

type ApiResponse = {
  success: boolean;
  data?: { therapist?: any; fullProfile?: any; reviews?: any[] };
  message?: string;
}

export default function TherapistProfilePage({}: TherapistProfileProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<{ therapist?: any; fullProfile?: any; reviews?: any[] }>({});
  const routeParams = useParams();
  const id = Array.isArray(routeParams?.id) ? (routeParams?.id?.[0] as string) : ((routeParams?.id as string) || "");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setError(null);
      try {
  const res = await fetch(`/api/therapists/${id}`);
        const json: ApiResponse = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Failed to load therapist");
        if (active) setApi(json.data || {});
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load therapist");
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false };
  }, [id]);

  const display = useMemo(() => {
    const t = api.therapist || {};
    const fp = api.fullProfile || {};
    const name = `${fp?.personalInfo?.firstName || t.displayName || t.name || ""} ${fp?.personalInfo?.lastName || ""}`.trim() || "Therapist";
    const title = fp?.professionalInfo?.primarySpecialty || t.title || "Therapist";
    const languages = fp?.practiceDetails?.languages || t.languages || [];
    const specs = t.specializations || (fp?.professionalInfo?.primarySpecialty ? [fp.professionalInfo.primarySpecialty] : []);
    const conditions = Array.isArray(t.primaryConditions) ? t.primaryConditions : [];
    const rating = t.rating ?? 0;
    const reviewCount = t.reviewCount ?? 0;
    const sessions = t.totalSessions ?? 0;
    const experienceText = fp?.professionalInfo?.yearsOfExperience || (t.experience != null ? `${t.experience}+ years` : "");
    const location = fp?.location?.city || t.location || "";
    const price = fp?.consultationFees?.amount ?? t.consultationFee ?? 0;
    const image = (api.therapist?.image) || "/api/placeholder/150/150";
    const bio = t.bio || "";
    const education = Array.isArray(t.education) && t.education.length && typeof t.education[0] === 'string'
      ? t.education
      : (Array.isArray(t.education) ? t.education.map((e: any) => `${e.degree || ''}${e.institution ? ' - ' + e.institution : ''}${e.year ? ' (' + e.year + ')' : ''}`.trim()).filter(Boolean) : []);
    const certifications = Array.isArray(t.certifications) ? t.certifications.map((c: any) => `${c.name || ''}${c.issuer ? ' - ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}`.trim()).filter(Boolean) : [];
    const sessionTypes = fp?.practiceDetails?.sessionFormats || t.sessionTypes || [];
    const nextAvailable = ""; // unknown for now
    const weeklySlots = Array.isArray(t.availability) ? t.availability.reduce((acc: number, d: any) => acc + (Array.isArray(d.slots) ? d.slots.filter((s: any) => s?.isAvailable).length : 0), 0) : 0;
    return { name, title, languages, specs, conditions, rating, reviewCount, sessions, experienceText, location, price, image, bio, education, certifications, sessionTypes, nextAvailable, weeklySlots };
  }, [api]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading therapist…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <Link href="/therabook/therapists">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Therapists
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Avatar className="w-40 h-40 ring-4 ring-blue-100">
                    <AvatarImage src={display.image} alt={display.name} className="object-cover" />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {display.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full"
                >
                  <CheckCircle className="w-6 h-6" />
                </motion.div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3"
                  >
                    {display.name}
                  </motion.h1>
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-gray-600 mb-6"
                  >
                    {display.title}
                  </motion.p>
                </div>

                {/* Key Stats */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{display.rating}</div>
                    <div className="text-sm text-gray-600">{display.reviewCount} reviews</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{display.sessions}</div>
                    <div className="text-sm text-gray-600">sessions</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{display.experienceText}</div>
                    <div className="text-sm text-gray-600">experience</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-center mb-2">
                      <MapPin className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="text-xl font-bold text-gray-800">₹{display.price}</div>
                    <div className="text-sm text-gray-600">per session</div>
                  </div>
                </motion.div>

                {/* Conditions treated (preferred) or Specializations (fallback) */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <h3 className="text-lg font-semibold text-gray-800">Conditions treated</h3>
                  <div className="flex flex-wrap gap-2">
                    {(display.conditions?.length ? display.conditions : display.specs).map((tag: string, index: number) => (
                      <motion.div
                        key={`${tag}-${index}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <Badge variant="secondary" className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0 rounded-full">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                    {(!display.conditions || display.conditions.length === 0) && display.specs.length === 0 && (
                      <span className="text-sm text-gray-500">Anxiety • Autism • Pain</span>
                    )}
                  </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="pt-4"
                >
                  <Link href={`/therabook/therapists/${id}/book`}>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Calendar className="w-5 h-5 mr-3" />
                      Book Session Now
                    </Button>
                  </Link>
                  <div className="mt-2 text-sm text-gray-500">
                    Next available: <span className="font-medium text-green-600">{display.nextAvailable || '—'}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <div className="container mx-auto px-4">
          <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About {display.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{display.bio}</p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Languages Spoken</h4>
                <div className="flex gap-2">
                  {display.languages.map((lang: string) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>

              {/* Approaches section removed per requirement */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {display.education.map((edu: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{edu}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Certifications & Licenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {display.certifications.map((cert: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Reviews</CardTitle>
              <CardDescription>
                {display.reviewCount} verified reviews • {display.rating} average rating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(api.reviews || []).map((review: any, idx: number) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500">— {review.user?.name || 'Anonymous'}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Availability</CardTitle>
              <CardDescription>
                Book your session at a time that works for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Next Available: {display.nextAvailable || '—'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {display.weeklySlots} slots available this week
                </p>
                <Link href={`/therabook/therapists/${id}/book`}>
                  <Button size="lg">
                    View Available Times
                  </Button>
                </Link>
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
