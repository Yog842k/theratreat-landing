"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/NewAuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Monitor, Building, Languages } from "lucide-react";

interface TherapistProfileData {
  name?: string;
  avatar?: string;
  therapistProfile?: any;
  followers?: number;
  following?: number;
  languages?: string[];
  location?: string;
}

export default function TherapistProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<TherapistProfileData | null>(null);
  const [fullProfile, setFullProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const tabs = ["Profile", "Portfolio", "Accounts", "Let's Connect"];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.userType !== "therapist") return;
      setLoading(true);
      setError(null);
      try {
  const res = await fetch(`/api/therapists/${user._id}`);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to load profile");
  setProfile(data.data.therapist);
  setFullProfile(data.data.fullProfile || null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchProfile();
  }, [user?._id, isAuthenticated]);

  if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading therapist profile...</div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center text-slate-600">Please log in to view your therapist profile.</div>;
  if (user && user.userType !== "therapist") return <div className="min-h-screen flex items-center justify-center text-slate-600">This page is only for therapist accounts.</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  const missingCoreProfile = !profile || !((profile as any).therapistProfile || (profile as any).consultationFee || (profile as any).specializations);

  // Normalize shape (API may return flattened fields OR nested therapistProfile)
  const raw = profile || {} as any;
  const tpSource = (raw.therapistProfile && typeof raw.therapistProfile === 'object') ? raw.therapistProfile : raw;
  const name = (fullProfile?.personalInfo ? `${fullProfile.personalInfo.firstName} ${fullProfile.personalInfo.lastName}`.trim() : '') || raw.displayName || raw.name || user?.name || 'Your Name';
  const title = fullProfile?.professionalInfo?.primarySpecialty || tpSource.title || raw.title || 'Therapist';
  const bio = tpSource.bio || raw.bio || '';
  const consultationFee = fullProfile?.consultationFees?.amount ?? tpSource.consultationFee ?? raw.consultationFee ?? 0;
  const experienceYears = fullProfile?.professionalInfo?.yearsOfExperience ?? (tpSource.experience ?? raw.experience);
  const experienceText = experienceYears !== undefined && experienceYears !== null && experienceYears !== ''
    ? `${experienceYears}+ years experience`
    : '';
  const languagesArr = (fullProfile?.practiceDetails?.languages) || tpSource.languages || raw.languages || [];
  const sessionTypesArr = (fullProfile?.practiceDetails?.sessionFormats) || tpSource.sessionTypes || raw.sessionTypes || ['Online'];
  const specializationsArr = tpSource.specializations || raw.specializations || [];
  const ratingVal = tpSource.rating ?? raw.rating ?? 0;
  const reviewCountVal = tpSource.reviewCount ?? raw.reviewCount ?? 0;
  const locationVal = fullProfile?.location?.city || tpSource.location || raw.location || '';
  const duration = tpSource.sessionDuration || raw.sessionDuration || '50-minute session';
  const collaborationsArr = tpSource.collaborations || raw.collaborations || [];

  const display = {
    name,
    title,
    image: raw.avatar || raw.photo || '/api/placeholder/150/150',
    rating: ratingVal,
    totalReviews: reviewCountVal,
    languages: Array.isArray(languagesArr) ? languagesArr : String(languagesArr).split(',').map(l=>l.trim()).filter(Boolean),
    location: locationVal,
    sessionTypes: sessionTypesArr,
    pricing: { amount: consultationFee, duration },
    followers: raw.followers || 0,
    following: raw.following || 0,
    experience: experienceText,
    bio,
    collaborations: collaborationsArr,
    specialties: specializationsArr
  };

  // Own profile if therapist record _id == user _id (legacy) OR therapist.userId matches user._id
  const isOwnProfile = !!(user?._id && profile && (user._id === (profile as any)._id || user._id === (profile as any).userId?.toString()));

  return (
      <div className="min-h-screen bg-white">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="flex items-start gap-12">
              <Avatar className="w-32 h-32 shadow-xl">
                <AvatarImage src={display.image} alt={display.name} />
                <AvatarFallback className="text-3xl bg-blue-50 text-blue-600 font-semibold">{display.name.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-2">
                <h1 className="text-4xl font-light text-slate-900 mb-2">{display.name}</h1>
                <p className="text-xl text-blue-600 mb-4 font-medium">{display.title}</p>
                {display.experience && (
                  <p className="text-slate-600 mb-4">{display.experience}</p>
                )}
                <div className="flex items-center gap-2 text-slate-500 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>{display.location}</span>
                </div>
                <div className="flex items-center gap-12 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-900">{display.followers}</span> Followers</div>
                  <div><span className="font-semibold text-slate-900">{display.following}</span> Following</div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-semibold text-slate-900">{display.rating.toFixed(1)}</span>
                    <span>({display.totalReviews})</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                {!isOwnProfile && (
                  <Button 
                    variant="outline" 
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 rounded-full font-medium"
                  >
                    Follow
                  </Button>
                )}
                {isOwnProfile ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => window.location.href = '/therabook/onboarding/therapist?mode=edit'}
                      className="px-6 rounded-full font-medium bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {missingCoreProfile ? 'Complete Profile' : 'Edit Profile'}
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/therabook/onboarding/therapist?section=availability'}
                      variant="outline"
                      className="px-6 rounded-full font-medium border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Availability
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="px-6 rounded-full font-medium bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Book Session
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-b border-slate-100">
            <div className="max-w-5xl mx-auto px-8">
              <div className="flex gap-12">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 font-medium transition-colors relative ${
                      activeTab === tab 
                        ? 'text-blue-600' 
                        : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div>
                <h2 className="text-2xl font-light text-slate-900 mb-6">About</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {display.bio || 'Add an about section to describe your therapeutic approach, areas of expertise, and philosophy.'}
                  </p>
                </div>
              </div>

              {/* Professional Details (from fullProfile) */}
              {fullProfile && (
                <div className="grid gap-6">
                  <div>
                    <h2 className="text-2xl font-light text-slate-900 mb-4">Professional Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                      <div><span className="text-slate-500">Primary Specialty:</span> {fullProfile.professionalInfo?.primarySpecialty || '-'}</div>
                      <div><span className="text-slate-500">Experience:</span> {fullProfile.professionalInfo?.yearsOfExperience || experienceYears || '-'} years</div>
                      <div><span className="text-slate-500">License No.:</span> {fullProfile.professionalInfo?.licenseNumber || '-'}</div>
                      <div><span className="text-slate-500">License State:</span> {fullProfile.professionalInfo?.licenseState || '-'}</div>
                      <div><span className="text-slate-500">License Expiry:</span> {fullProfile.professionalInfo?.licenseExpiry || '-'}</div>
                      <div><span className="text-slate-500">Employment:</span> {fullProfile.professionalInfo?.currentEmployment || '-'}</div>
                      <div className="md:col-span-2"><span className="text-slate-500">Workplace:</span> {fullProfile.professionalInfo?.workplaceName || '-'}{fullProfile.professionalInfo?.workplaceAddress ? `, ${fullProfile.professionalInfo?.workplaceAddress}` : ''}</div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-light text-slate-900 mb-4">Practice Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                      <div><span className="text-slate-500">Practice Type:</span> {fullProfile.practiceDetails?.practiceType || '-'}</div>
                      <div><span className="text-slate-500">Session Formats:</span> {(fullProfile.practiceDetails?.sessionFormats || []).join(', ') || '-'}</div>
                      <div><span className="text-slate-500">Services:</span> {(fullProfile.practiceDetails?.serviceTypes || []).join(', ') || '-'}</div>
                      <div><span className="text-slate-500">Languages:</span> {(fullProfile.practiceDetails?.languages || []).join(', ') || '-'}</div>
                      <div><span className="text-slate-500">Age Groups:</span> {(fullProfile.practiceDetails?.ageGroups || []).join(', ') || '-'}</div>
                      <div className="md:col-span-2"><span className="text-slate-500">Availability:</span> {(fullProfile.practiceDetails?.availability?.workingDays || []).join(', ')} • {(fullProfile.practiceDetails?.availability?.preferredHours || []).join(', ')} • {fullProfile.practiceDetails?.availability?.timeZone || 'IST'}</div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-light text-slate-900 mb-4">Fees & Policies</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                      <div><span className="text-slate-500">Consultation Fee:</span> ₹{fullProfile.consultationFees?.amount ?? consultationFee} {fullProfile.consultationFees?.currency || 'INR'}</div>
                      <div><span className="text-slate-500">Emergency Availability:</span> {fullProfile.emergencyAvailability ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-light text-slate-900 mb-4">Location</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                      <div className="md:col-span-2"><span className="text-slate-500">Address:</span> {fullProfile.location?.primaryAddress || '-'}</div>
                      <div><span className="text-slate-500">City:</span> {fullProfile.location?.city || '-'}</div>
                      <div><span className="text-slate-500">State:</span> {fullProfile.location?.state || '-'}</div>
                      <div><span className="text-slate-500">Pincode:</span> {fullProfile.location?.pincode || '-'}</div>
                      <div><span className="text-slate-500">Online Only:</span> {fullProfile.location?.onlineOnly ? 'Yes' : 'No'}</div>
                      <div><span className="text-slate-500">Clinic Visits:</span> {fullProfile.location?.clinicVisits ? 'Yes' : 'No'}</div>
                      <div><span className="text-slate-500">Home Visits:</span> {fullProfile.location?.homeVisits ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Specializations */}
              {display.specialties.length > 0 && (
                <div>
                  <h2 className="text-2xl font-light text-slate-900 mb-6">Specializations</h2>
                  <div className="flex flex-wrap gap-2">
                    {display.specialties.map((s: string, i: number) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-full font-normal border-0"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaborations */}
              {display.collaborations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-light text-slate-900 mb-6">Collaborated With</h2>
                  <div className="flex flex-wrap gap-2">
                    {display.collaborations.map((c: string, i: number) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="bg-slate-50 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-full font-normal border-0"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card className="border border-slate-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-light text-slate-900 mb-1">₹{fullProfile?.consultationFees?.amount ?? display.pricing.amount}</div>
                    <div className="text-sm text-slate-500">{display.pricing.duration}</div>
                  </div>
                  
                  {!isOwnProfile && (
                    <div className="space-y-3">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium py-3">
                        Book Session
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium py-3"
                      >
                        View Full Profile
                      </Button>
                    </div>
                  )}
                  
                  {isOwnProfile && (
                    <div className="space-y-3">
                      <Button 
                        onClick={() => window.location.href='/therabook/onboarding/therapist?mode=edit'} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium py-3"
                      >
                        {missingCoreProfile ? 'Complete Profile' : 'Edit Profile'}
                      </Button>
                      <Button 
                        onClick={() => window.location.href='/therabook/onboarding/therapist?section=availability'} 
                        variant="outline"
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium py-3"
                      >
                        Availability
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Options */}
              <Card className="border border-slate-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-medium text-slate-900 mb-4">Session Options</h3>
                  <div className="space-y-4">
                    {display.sessionTypes.includes('Online') && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Monitor className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-slate-700">Online Sessions</span>
                      </div>
                    )}
                    {display.sessionTypes.some((s: string) => /clinic|in[- ]?person/i.test(s)) && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Building className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-slate-700">In-Clinic Sessions</span>
                      </div>
                    )}
                    {display.languages.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Languages className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-slate-700">{display.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <Avatar className="w-24 h-24 mx-auto mb-4 shadow-lg">
                <AvatarImage src={display.image} alt={display.name} />
                <AvatarFallback className="text-xl bg-blue-50 text-blue-600 font-semibold">{display.name.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-light text-slate-900 mb-2">{display.name}</h1>
              <p className="text-lg text-blue-600 mb-3 font-medium">{display.title}</p>
              {display.experience && (
                <p className="text-slate-600 mb-4">{display.experience}</p>
              )}
              
              <div className="flex items-center justify-center gap-6 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-semibold text-slate-900">{display.rating.toFixed(1)}</span>
                  <span>({display.totalReviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{display.location}</span>
                </div>
              </div>

              {display.languages.length > 0 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Languages className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-medium text-sm">{display.languages.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Mobile Pricing */}
            <Card className="border border-slate-100 shadow-sm mb-6">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-light text-slate-900 mb-1">₹{display.pricing.amount}</div>
                <div className="text-sm text-slate-500 mb-6">{display.pricing.duration}</div>
                
                <div className="grid grid-cols-2 gap-3">
                  {!isOwnProfile && (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                      >
                        Follow
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                        Book Now
                      </Button>
                    </>
                  )}
                  {isOwnProfile && (
                    <>
                      <Button 
                        onClick={() => window.location.href='/therabook/onboarding/therapist?mode=edit'} 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                      >
                        {missingCoreProfile ? 'Complete Profile' : 'Edit'}
                      </Button>
                      <Button 
                        onClick={() => window.location.href='/therabook/onboarding/therapist?section=availability'} 
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                      >
                        Availability
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mobile Tabs */}
            <div className="flex overflow-x-auto gap-1 mb-8 bg-slate-50 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile Content */}
            <div className="space-y-6">
              {/* About */}
              <div>
                <h2 className="text-xl font-medium text-slate-900 mb-4">About</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {display.bio || 'Add an about section to describe your therapeutic approach, areas of expertise, and philosophy.'}
                </p>
              </div>

              {/* Specializations */}
              {display.specialties.length > 0 && (
                <div>
                  <h2 className="text-xl font-medium text-slate-900 mb-4">Specializations</h2>
                  <div className="flex flex-wrap gap-2">
                    {display.specialties.map((s: string, i: number) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-normal border-0"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaborations */}
              {display.collaborations.length > 0 && (
                <div>
                  <h2 className="text-xl font-medium text-slate-900 mb-4">Collaborated With</h2>
                  <div className="flex flex-wrap gap-2">
                    {display.collaborations.map((c: string, i: number) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="bg-slate-50 text-slate-700 px-3 py-1 rounded-full text-sm font-normal border-0"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Options */}
              <div>
                <h2 className="text-xl font-medium text-slate-900 mb-4">Session Options</h2>
                <div className="space-y-3">
                  {display.sessionTypes.includes('Online') && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-slate-700">Online Sessions</span>
                    </div>
                  )}
                  {display.sessionTypes.some((s: string) => /clinic|in[- ]?person/i.test(s)) && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-slate-700">In-Clinic Sessions</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}