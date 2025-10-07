"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User,
  Settings,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  GraduationCap,
  HelpCircle,
  FileText,
  Video,
  Phone,
  MapPin,
  Home,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
  Edit,
  Save,
  Bell,
  Shield,
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  Bookmark,
  Award,
  Globe,
  LogOut,
  UserCog,
  PlusCircle,
  Trash2,
  Eye,
  RefreshCw,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface TherapistData {
  profile: {
    name: string;
    gender: string;
    bio: string;
    languages: string[];
    degrees: string[];
    certifications: string[];
    experience: string;
    specializations: string[];
    clinicAddress: string;
    avatar: string;
  };
  verification: {
    kyc: string;
    degree: string;
    license: string;
    overall: string;
  };
  services: {
    modes: string[];
    sessionTypes: string[];
    pricing: number;
    duration: number;
    platforms: string[];
  };
  earnings: {
    thisMonth: number;
    lastMonth: number;
    totalEarnings: number;
    pendingWithdrawal: number;
    sessionsThisMonth: number;
  };
  appointments: {
    upcoming: Array<{
      id: number;
      patient: string;
      time: string;
      date: string;
      type: string;
    }>;
    total: number;
    rating: number;
    reviews: number;
  };
}

interface DashboardStats {
  totalSessions: number;
  thisMonthSessions: number;
  averageRating: number;
  totalReviews: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  totalEarnings: number;
  pendingWithdrawal: number;
  verificationPercentage: number;
}

interface TodaySession {
  id: string;
  patientName: string;
  patientEmail: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  status: string;
  amount: number;
}

export default function TherapistDashboardPage() {
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  // Resolve therapistId from server (therapist document) because user._id != therapist._id
  const [resolvedTherapistId, setResolvedTherapistId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helpers: safe number coercion/formatting to avoid runtime errors
  const toNumber = (v: unknown, def = 0): number => {
    const n = typeof v === 'number' ? v : Number((v as any));
    return Number.isFinite(n) ? n : def;
  };
  const formatFixed = (v: unknown, digits = 1): string => toNumber(v, 0).toFixed(digits);
  // Display currency in INR with symbol ₹ as requested
  const formatCurrency = (v: unknown): string => `₹${toNumber(v, 0).toLocaleString('en-IN')}`;
  // Use same-origin API by default; allow override via env if explicitly set
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

  // State for real data from backend
  const [therapistData, setTherapistData] = useState<TherapistData>({
    profile: {
      name: user?.name || "",
      gender: "",
      bio: "",
      languages: [],
      degrees: [],
      certifications: [],
      experience: "",
      specializations: [],
      clinicAddress: "",
      avatar: ""
    },
    verification: {
      kyc: "Pending",
      degree: "Pending", 
      license: "Pending",
      overall: "Pending"
    },
    services: {
      modes: [],
      sessionTypes: [],
      pricing: 0,
      duration: 50,
      platforms: ["TheraBook Video"]
    },
    earnings: {
      thisMonth: 4800,
      lastMonth: 5200,
      totalEarnings: 48000,
      pendingWithdrawal: 1200,
      sessionsThisMonth: 40
    },
    appointments: {
      upcoming: [],
      total: 0,
      rating: 0,
      reviews: 0
    }
  });

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSessions: 0,
    thisMonthSessions: 0,
    averageRating: 0,
    totalReviews: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    totalEarnings: 0,
    pendingWithdrawal: 0,
    verificationPercentage: 0
  });

  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);

  // Load comprehensive therapist profile (fullProfile)
  const fetchTherapistFullProfile = async () => {
    try {
      const idToUse = resolvedTherapistId || user?._id;
      if (!idToUse) return;
      const res = await fetch(`/api/therapists/${idToUse}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load therapist');
      const t = json.data?.therapist || {};
      const fp = json.data?.fullProfile || {};
      const name = `${fp?.personalInfo?.firstName || t.displayName || user?.name || ''} ${fp?.personalInfo?.lastName || ''}`.trim();
      const gender = (fp?.personalInfo?.gender || '').toString();
      const bio = t.bio || '';
      const languages = fp?.practiceDetails?.languages || t.languages || [];
      const degrees = Array.isArray(t.education) && t.education.length && typeof t.education[0] === 'string'
        ? t.education
        : (Array.isArray(t.education) ? t.education.map((e: any) => `${e.degree || ''}${e.institution ? ' - ' + e.institution : ''}${e.year ? ' (' + e.year + ')' : ''}`.trim()).filter(Boolean) : []);
      const certifications = Array.isArray(t.certifications) ? t.certifications.map((c: any) => `${c.name || ''}${c.issuer ? ' - ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}`.trim()).filter(Boolean) : [];
      const experience = (fp?.professionalInfo?.yearsOfExperience || (t.experience != null ? `${t.experience}+ years` : '')).toString();
      const specializations = t.specializations || (fp?.professionalInfo?.primarySpecialty ? [fp.professionalInfo.primarySpecialty] : []);
      const clinicAddress = fp?.location?.primaryAddress || '';
      const avatar = t.image || '';
      const modes = (fp?.practiceDetails?.sessionFormats || t.sessionTypes || []).map((s: string) => s.replace(/-/g, ' '));
      const sessionTypes = fp?.practiceDetails?.serviceTypes || [];
      const pricing = fp?.consultationFees?.amount ?? t.consultationFee ?? 0;
      const duration = t.sessionDuration || 50;

      setTherapistData(prev => ({
        ...prev,
        profile: { name, gender, bio, languages, degrees, certifications, experience, specializations, clinicAddress, avatar },
        services: { ...prev.services, modes, sessionTypes, pricing, duration },
        appointments: { ...prev.appointments, rating: t.rating ?? 0, reviews: t.reviewCount ?? 0 }
      }));
    } catch (e) {
      console.error('Error loading fullProfile:', e);
    }
  };

  // Fetch dashboard statistics from backend
  const fetchDashboardStats = async () => {
    try {
      const idQuery = resolvedTherapistId ? `therapistId=${resolvedTherapistId}` : (user?._id ? `userId=${user._id}` : '');
      const response = await fetch(`${API_BASE}/api/dashboard/therapist/stats${idQuery ? `?${idQuery}` : ''}` , {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Stats API error:', result);
        throw new Error('Failed to fetch dashboard stats');
      }
      if (result.success && result.stats) {
        const s = result.stats || {};
        // Verification heuristic: if isVerified flag present use 100 else ratio of completed vs total
        const verifiedFlag = result.therapist?.isVerified;
        const totalSessions = toNumber(s.totalSessions,0);
        const completedSessions = toNumber(s.completedSessions,0);
        const verificationPct = verifiedFlag ? 100 : (totalSessions > 0 ? Math.min(100, Math.round((completedSessions / totalSessions) * 60 + 40)) : 0);
        setDashboardStats({
          totalSessions: totalSessions,
          thisMonthSessions: toNumber(s.upcomingSessions, 0),
          averageRating: toNumber(s.rating, 0),
          totalReviews: toNumber(s.reviewCount, 0),
          thisMonthEarnings: toNumber(s.last30DaysEarnings,0),
          lastMonthEarnings: 0, // placeholder until dedicated endpoint
          totalEarnings: toNumber(s.totalEarnings,0),
          pendingWithdrawal: toNumber(s.availableEarnings,0),
          verificationPercentage: verificationPct
        });
      } else {
        setError(result.message || 'Failed to load dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  // Fetch today's sessions from backend
  const fetchTodaySessions = async () => {
    try {
      const idQuery = resolvedTherapistId ? `therapistId=${resolvedTherapistId}` : (user?._id ? `userId=${user._id}` : '');
      const response = await fetch(`${API_BASE}/api/dashboard/therapist/today-sessions${idQuery ? `?${idQuery}` : ''}` , {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Today's sessions API error:", result);
        throw new Error('Failed to fetch today\'s sessions');
      }
      if (result.success && Array.isArray(result.sessions)) {
        const sessions = result.sessions.map((b: any) => ({
          id: b._id,
          patientName: b.clientId?.name || 'Patient',
          patientEmail: b.clientId?.email || '',
          startTime: b.sessionTime?.startTime || b.sessionDate,
          endTime: b.sessionTime?.endTime || b.sessionDate,
          sessionType: b.sessionType || 'video',
          status: b.status || 'pending',
          amount: toNumber(b.amount, 0),
        }));
        setTodaySessions(sessions);
      } else {
        setError(result.message || 'Failed to load today\'s sessions');
      }
    } catch (error) {
      console.error('Error fetching today\'s sessions:', error);
      setError('Failed to load today\'s sessions');
    }
  };

  // Fetch therapist bookings from backend
  const fetchTherapistBookings = async () => {
    try {
      const idQuery = resolvedTherapistId ? `therapistId=${resolvedTherapistId}` : (user?._id ? `userId=${user._id}` : '');
      const response = await fetch(`${API_BASE}/api/bookings/therapist-bookings${idQuery ? `?${idQuery}` : ''}` , {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Bookings API error:', result);
        throw new Error('Failed to fetch bookings');
      }
      if (result.success && result.bookings) {
        setTherapistData(prev => ({
          ...prev,
          appointments: {
            ...prev.appointments,
            upcoming: result.bookings.slice(0, 5).map((booking: any, index: number) => ({
              id: booking._id || index + 1,
              patient: booking.clientId?.name || `Patient ${index + 1}`,
              time: booking.sessionTime?.startTime || new Date(booking.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(booking.sessionDate).toLocaleDateString(),
              type: (booking.sessionType || 'video').replace('-', ' ')
            }))
          }
        }));
      } else {
        setError(result.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Refresh bookings after update
      await fetchTherapistBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  };

  // Load all data on component mount
  useEffect(() => {
    if (!isAuthenticated || !token || !user?._id) return;

    // First resolve therapistId from userId if not already cached
    const ensureTherapistId = async () => {
      try {
        if (resolvedTherapistId) return; // already resolved
        // Resolve therapist by current user
        const [therapistRes, userRes] = await Promise.all([
          fetch(`/api/therapists/by-user?userId=${user?._id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        if (therapistRes.ok) {
          const tData = await therapistRes.json();
          const therapist = tData?.therapist;
          if (therapist?._id) {
            setResolvedTherapistId(therapist._id);
          }
          const experience = typeof therapist?.experience === 'number' ? `${therapist.experience} years` : undefined;
          setTherapistData(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              experience: experience || prev.profile.experience,
            }
          }));
        }
        if (userRes.ok) {
          const uData = await userRes.json();
          const userProfile = uData?.user;
          const apiGender = userProfile?.gender;
          setTherapistData(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              gender: (apiGender ? (apiGender.charAt(0).toUpperCase() + apiGender.slice(1)) : prev.profile.gender),
              name: userProfile?.name || prev.profile.name,
              avatar: userProfile?.profileImage || prev.profile.avatar,
            }
          }));
        }
      } catch (e) {
        console.warn('Could not resolve therapistId from userId:', e);
      }
    };

    const loadAll = async () => {
      const loadData = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          await Promise.all([
            fetchDashboardStats(),
            fetchTodaySessions(),
            fetchTherapistBookings(),
            fetchTherapistFullProfile()
          ]);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          setError('Failed to load dashboard data');
        } finally {
          setIsLoadingData(false);
        }
      };
      await ensureTherapistId();
      await loadData();
    };

    loadAll();
  }, [isAuthenticated, token, user?._id, resolvedTherapistId]);

  // Refresh all data
  const refreshData = async () => {
    if (!resolvedTherapistId && !user?._id) return;
    setIsLoadingData(true);
    setError(null);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchTodaySessions(),
        fetchTherapistBookings(),
        fetchTherapistFullProfile()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-600'>Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (user?.userType !== 'therapist') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='text-center'>
          <XCircle className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <p className='text-gray-600'>This dashboard is for therapist accounts only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Therapist Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'Therapist'}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isLoadingData}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Persist original role so user can come back quickly (optional)
              sessionStorage.setItem('originalUserType', user?.userType || 'therapist');
              // Switch to consumer / patient dashboard (or homepage fallback)
              router.push('/therabook/dashboard/patient');
            }}
            title="Use Mode lets you act like a regular user to book sessions or buy items"
          >
            <UserCog className="w-4 h-4 mr-2" />
            Use Mode
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/theralearn')}
            title="Switch to instructor (learning) workspace"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Instructor Mode
          </Button>
          <Button
            variant="outline"
            onClick={() => { logout(); router.push('/'); }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : dashboardStats.thisMonthSessions}
            </div>
            <p className="text-sm text-muted-foreground">Today's Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatFixed(dashboardStats.averageRating, 1)}
            </div>
            <p className="text-sm text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatCurrency(dashboardStats.thisMonthEarnings)}
            </div>
            <p className="text-sm text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : `${toNumber(dashboardStats.verificationPercentage, 0)}%`}
            </div>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="profile" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Verification</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Earnings</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Articles</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-blue-600">Profile Management</h3>
              <Button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                variant={isEditingProfile ? "outline" : "default"}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isEditingProfile ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Profile Photo */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Avatar className="w-32 h-32 mx-auto">
                        <AvatarImage src={therapistData.profile.avatar} />
                        <AvatarFallback>{user?.name?.charAt(0) || 'T'}</AvatarFallback>
                      </Avatar>
                      {isEditingProfile && (
                        <Button size="sm" className="absolute bottom-0 right-1/4 rounded-full">
                          <Upload className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Only show Verified badge if backend % >= 100 */}
                        {toNumber(dashboardStats.verificationPercentage,0) >= 100 ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Not Fully Verified
                          </Badge>
                        )}
                        {toNumber(dashboardStats.averageRating,0) > 0 && (
                          <Badge className="bg-blue-100 text-blue-800">Top Rated</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      {isEditingProfile ? (
                        <Input defaultValue={therapistData.profile.name} />
                      ) : (
                        <p className="mt-1">{therapistData.profile.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Gender</Label>
                      {isEditingProfile ? (
                        <Select defaultValue={therapistData.profile.gender.toLowerCase()}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1">{therapistData.profile.gender}</p>
                      )}
                    </div>

                    <div>
                      <Label>Experience</Label>
                      {isEditingProfile ? (
                        <Input defaultValue={therapistData.profile.experience} />
                      ) : (
                        <p className="mt-1">{therapistData.profile.experience}</p>
                      )}
                    </div>

                    <div>
                      <Label>Languages</Label>
                      {isEditingProfile ? (
                        <Input defaultValue={therapistData.profile.languages.join(", ")} />
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {therapistData.profile.languages.map((lang, index) => (
                            <Badge key={index} variant="secondary">{lang}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="space-y-4">
                    <div>
                      <Label>Clinic Address</Label>
                      {isEditingProfile ? (
                        <Textarea defaultValue={therapistData.profile.clinicAddress} />
                      ) : (
                        <p className="mt-1 text-sm">{therapistData.profile.clinicAddress}</p>
                      )}
                    </div>

                    <div>
                      <Label>Service Modes</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {therapistData.services.modes.map((mode, index) => {
                          const icons = {
                            Video: <Video className="w-3 h-3" />,
                            Audio: <Phone className="w-3 h-3" />,
                            "In-Clinic": <MapPin className="w-3 h-3" />,
                            "Home Visit": <Home className="w-3 h-3" />
                          };
                          return (
                            <Badge key={index} className="bg-blue-100 text-blue-800">
                              {icons[mode as keyof typeof icons]}
                              <span className="ml-1">{mode}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Bio */}
                <div className="space-y-2">
                  <Label>Professional Bio</Label>
                  {isEditingProfile ? (
                    <Textarea defaultValue={therapistData.profile.bio} rows={4} />
                  ) : (
                    <p className="text-muted-foreground">{therapistData.profile.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-blue-600">Settings</h3>
            
            {/* Availability Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Availability Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Time Slots</h4>
                    <div className="space-y-3">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                        <div key={day} className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">{day}</span>
                          <div className="flex items-center space-x-2">
                            <Input placeholder="9:00 AM" className="w-24" />
                            <span>to</span>
                            <Input placeholder="5:00 PM" className="w-24" />
                            <Switch />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">Update Availability</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-blue-600">Verification Status</h3>
            {/* Simplified dynamic verification view pulling real statuses when wired */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Current Verification Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {['KYC','Degrees','License'].map(item => {
                    const percent = toNumber(dashboardStats.verificationPercentage,0);
                    const status = percent >= 100 ? 'Verified' : (percent >= 60 ? 'In Review' : 'Pending');
                    const color = status==='Verified' ? 'bg-green-100 text-green-800' : status==='In Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
                    return (
                      <div key={item} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{item}</span>
                          <Badge className={color}>{status}</Badge>
                        </div>
                        <Progress value={Math.min(100, percent)} />
                        <Button size="sm" variant="outline" className="w-full">{status==='Verified' ? 'View' : 'Upload'}</Button>
                      </div>
                    );
                  })}
                </div>
                <Alert className="mt-2">
                  {toNumber(dashboardStats.verificationPercentage,0) >= 100 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertDescription>
                    {toNumber(dashboardStats.verificationPercentage,0) >= 100 ? 'All verification steps complete.' : 'Complete pending steps to unlock full platform functionality.'}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-blue-600">Appointments</h3>
              <Button 
                className="bg-blue-600 text-white"
                onClick={refreshData}
                disabled={isLoadingData}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : toNumber(dashboardStats.totalSessions, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : toNumber(dashboardStats.thisMonthSessions, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold">
                      {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatFixed(dashboardStats.averageRating, 1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : toNumber(dashboardStats.totalReviews, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Sessions */}
            {todaySessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Today's Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {todaySessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{session.patientName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{session.patientName}</p>
                            <p className="text-sm text-muted-foreground">{session.patientEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <Badge variant="outline">{session.sessionType}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {therapistData.appointments.upcoming.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.patient}</TableCell>
                          <TableCell>{`${appointment.date} at ${appointment.time}`}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{appointment.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileText className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-blue-600">Earnings Dashboard</h3>
            
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatCurrency(dashboardStats.thisMonthEarnings)}
                  </div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatCurrency(dashboardStats.lastMonthEarnings)}
                  </div>
                  <p className="text-sm text-muted-foreground">Last Month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatCurrency(dashboardStats.totalEarnings)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {isLoadingData ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatCurrency(dashboardStats.pendingWithdrawal)}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending Withdrawal</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Withdrawal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Available Balance</Label>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardStats.pendingWithdrawal)}</p>
                  </div>
                  <div>
                    <Label>Withdrawal Amount</Label>
                    <Input type="number" placeholder="Enter amount" />
                  </div>
                  <div>
                    <Label>Bank Account</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account1">Account ending in 1234</SelectItem>
                        <SelectItem value="account2">Account ending in 5678</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-green-600 text-white">Request Withdrawal</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-blue-600">Courses & Certifications</h3>
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Course tracking and certificates will appear here once you enroll via TheraLearn. No course data yet.
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-blue-600">Help & Support</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Raise New Ticket
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Grievance Box</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Submit Grievance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="articles">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-blue-600">Write Articles</h3>
            <Card>
              <CardHeader>
                <CardTitle>Blog Submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Article Title</Label>
                  <Input placeholder="Enter article title" />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea placeholder="Write your article content..." rows={10} />
                </div>
                <Button className="w-full">Submit Article</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
