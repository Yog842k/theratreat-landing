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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Settings, Calendar as CalendarIcon, Clock, DollarSign, GraduationCap,
  HelpCircle, FileText, Video, Phone, MapPin, Home, Star, CheckCircle, XCircle,
  AlertTriangle, Upload, Download, Edit, Save, Bell, Shield, BarChart3, TrendingUp,
  Users, MessageCircle, Bookmark, Award, Globe, LogOut, UserCog, PlusCircle,
  Trash2, Eye, RefreshCw, Mail, Loader2, AlertCircle
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
    qualificationCertUrls?: string[];
    licenseDocumentUrl?: string;
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
      qualificationCertUrls?: string[];
      licenseDocumentUrl?: string;
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
  // State declarations (must be at the top)
  // Service Options State
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [pricing, setPricing] = useState<number>(0);
  const [duration, setDuration] = useState<number>(50);
  // Privacy & Notification State
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(true);
  const [publicProfile, setPublicProfile] = useState<boolean>(true);

  // Handlers for Service Options
  const handleServiceTypesChange = (value: string[]) => {
    setServiceTypes(value);
  };
  const handleUpdateServiceOptions = () => {
    // TODO: Integrate with backend API
    setTherapistData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        sessionTypes: serviceTypes,
        pricing,
        duration
      }
    }));
  };

  // Handlers for Privacy & Notification
  const handleUpdatePrivacySettings = () => {
    // TODO: Integrate with backend API
    // Example: Save privacy/notification settings
  };
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileFields, setEditProfileFields] = useState({
    name: '',
    gender: '',
    experience: '',
    languages: '',
    clinicAddress: '',
    bio: ''
  });
  const [resolvedTherapistId, setResolvedTherapistId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [therapistData, setTherapistData] = useState<TherapistData>({
    profile: {
      name: '',
      gender: '',
      bio: '',
      languages: [],
      degrees: [],
      certifications: [],
      experience: '',
      specializations: [],
      clinicAddress: '',
      avatar: ''
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

  // Now useEffect can safely reference these
  useEffect(() => {
    if (isEditingProfile) {
      setEditProfileFields({
        name: therapistData.profile.name || '',
        gender: therapistData.profile.gender || '',
        experience: therapistData.profile.experience || '',
        languages: therapistData.profile.languages.join(', '),
        clinicAddress: therapistData.profile.clinicAddress || '',
        bio: therapistData.profile.bio || ''
      });
    }
  }, [isEditingProfile, therapistData]);

  // Save profile handler
  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: editProfileFields.name,
        gender: editProfileFields.gender,
        experience: editProfileFields.experience,
        languages: editProfileFields.languages.split(',').map(l => l.trim()).filter(Boolean),
        clinicAddress: editProfileFields.clinicAddress,
        bio: editProfileFields.bio
      };
      const res = await fetch(`/api/therapists/${resolvedTherapistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setIsEditingProfile(false);
      await fetchTherapistFullProfile();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    }
  };
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  // ...existing code...
  const toNumber = (v: unknown, def = 0): number => {
    const n = typeof v === 'number' ? v : Number((v as any));
    return Number.isFinite(n) ? n : def;
  };
  const formatFixed = (v: unknown, digits = 1): string => toNumber(v, 0).toFixed(digits);
  const formatCurrency = (v: unknown): string => `₹${toNumber(v, 0).toLocaleString('en-IN')}`;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

  const fetchTherapistFullProfile = async () => {
    try {
      if (!resolvedTherapistId) return;
      const res = await fetch(`/api/therapists/${resolvedTherapistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load therapist');
      const t = json.therapist || {};
      const name = t.displayName || user?.name || '';
      const gender = t.gender || '';
      const bio = t.bio || '';
      const languages = t.languages || [];
      const degrees = Array.isArray(t.education) && t.education.length && typeof t.education[0] === 'string'
        ? t.education
        : (Array.isArray(t.education) ? t.education.map((e: any) => `${e.degree || ''}${e.institution ? ' - ' + e.institution : ''}${e.year ? ' (' + e.year + ')' : ''}`.trim()).filter(Boolean) : []);
      const certifications = Array.isArray(t.certifications) ? t.certifications.map((c: any) => `${c.name || ''}${c.issuer ? ' - ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}`.trim()).filter(Boolean) : [];
      const experience = t.experience != null ? `${t.experience}+ years` : '';
      const specializations = t.specializations || [];
      const clinicAddress = t.location || '';
      const avatar = t.image || '';
      const modes = t.sessionTypes || [];
      const sessionTypes = t.serviceTypes || [];
      const pricing = t.consultationFee ?? 0;
      const duration = t.sessionDuration || 50;

      setTherapistData(prev => ({
        ...prev,
        profile: {
          name,
          gender,
          bio,
          languages,
          degrees,
          certifications,
          experience,
          specializations,
          clinicAddress,
          avatar,
          qualificationCertUrls: t.qualificationCertUrls || [],
          licenseDocumentUrl: t.licenseDocumentUrl || ''
        },
        services: { ...prev.services, modes, sessionTypes, pricing, duration },
        appointments: { ...prev.appointments, rating: t.rating ?? 0, reviews: t.reviewCount ?? 0 }
      }));
    } catch (e) {
      console.error('Error loading fullProfile:', e);
    }
  };

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
          lastMonthEarnings: 0,
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
      if (result.success && Array.isArray(result.data)) {
        setTherapistData(prev => ({
          ...prev,
          appointments: {
            ...prev.appointments,
            upcoming: result.data.slice(0, 5).map((booking: any, index: number) => ({
              id: booking._id || index + 1,
              patient: booking.userId?.name || booking.clientId?.name || `Patient ${index + 1}`,
              time: booking.timeSlot || booking.sessionTime?.startTime || new Date(booking.date || booking.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(booking.date || booking.sessionDate).toLocaleDateString(),
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

      await fetchTherapistBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token || !user?._id) return;

    const ensureTherapistId = async () => {
      try {
        if (resolvedTherapistId) return;
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
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50'>
        <div className='text-center'>
          <Loader2 className='w-16 h-16 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600 font-medium'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50'>
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertCircle className='w-16 h-16 text-blue-400 mx-auto mb-4' />
            <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
            <p className='text-gray-600'>Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.userType !== 'therapist') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50'>
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center">
            <XCircle className='w-16 h-16 text-red-400 mx-auto mb-4' />
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className='text-gray-600'>This dashboard is for therapist accounts only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <Alert className="mb-6 border-red-300 bg-red-50 shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full lg:w-auto">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-100 shadow-md flex-shrink-0">
                <AvatarImage src={therapistData.profile.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg sm:text-xl font-bold">
                  {user?.name?.charAt(0) || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-900 mb-1 sm:mb-2 truncate">
                  Welcome, {therapistData.profile.name || user?.name || 'Therapist'}!
                </h1>
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-600">Therapist Dashboard</h2>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={isLoadingData}
                size="sm"
                className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  sessionStorage.setItem('originalUserType', user?.userType || 'therapist');
                  router.push('/therabook/dashboard/patient');
                }}
                size="sm"
                className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <UserCog className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Use Mode</span>
                <span className="sm:hidden">Mode</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/theralearn')}
                size="sm"
                className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Instructor</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => { logout(); router.push('/'); }}
                size="sm"
                className="border-red-200 hover:bg-red-50 hover:border-red-300 transition-all text-red-600 text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Log Out</span>
                <span className="sm:hidden">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-10 opacity-80" />
                <div className="bg-white/20 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold">Today</div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                {isLoadingData ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : dashboardStats.thisMonthSessions}
              </div>
              <p className="text-blue-100 text-[10px] sm:text-xs lg:text-sm font-medium">Today's Sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Star className="w-6 h-6 sm:w-8 sm:h-10 opacity-80" />
                <div className="bg-white/20 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold">Rating</div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                {isLoadingData ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : formatFixed(dashboardStats.averageRating, 1)}
              </div>
              <p className="text-yellow-100 text-[10px] sm:text-xs lg:text-sm font-medium">Average Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-10 opacity-80" />
                <div className="bg-white/20 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold">Month</div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                {isLoadingData ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : formatCurrency(dashboardStats.thisMonthEarnings)}
              </div>
              <p className="text-green-100 text-[10px] sm:text-xs lg:text-sm font-medium">This Month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-10 opacity-80" />
                <div className="bg-white/20 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold">Status</div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                {isLoadingData ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : `${toNumber(dashboardStats.verificationPercentage, 0)}%`}
              </div>
              <p className="text-indigo-100 text-[10px] sm:text-xs lg:text-sm font-medium">Verified</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-1 sm:p-2 border border-blue-100 overflow-x-auto">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full min-w-max bg-gray-50 rounded-xl p-0.5 sm:p-1">
              {[
                { value: "profile", icon: User, label: "Profile" },
                { value: "settings", icon: Settings, label: "Settings" },
                { value: "verification", icon: Shield, label: "Verification" },
                { value: "appointments", icon: CalendarIcon, label: "Appointments" },
                { value: "earnings", icon: DollarSign, label: "Earnings" },
                { value: "courses", icon: GraduationCap, label: "Courses" },
                { value: "support", icon: HelpCircle, label: "Support" },
                { value: "articles", icon: FileText, label: "Articles" }
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger 
                  key={value}
                  value={value}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden text-[9px] leading-tight text-center">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="profile">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Profile Management</h3>
                <Button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  size="sm"
                  className={`${
                    isEditingProfile 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  } text-white shadow-md transition-all duration-200 w-full sm:w-auto`}
                >
                  {isEditingProfile ? (
                    <span onClick={handleSaveProfile} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Save Changes</span>
                    </span>
                  ) : (
                    <>
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Edit Profile</span>
                    </>
                  )}
                </Button>
              </div>

              <Card className="shadow-lg border-blue-100">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    <div className="space-y-4 flex flex-col items-center md:items-start">
                      <div className="relative">
                        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto border-4 border-blue-200 shadow-xl">
                          <AvatarImage src={therapistData.profile.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl sm:text-3xl md:text-4xl font-bold">
                            {user?.name?.charAt(0) || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        {isEditingProfile && (
                          <Button size="sm" className="absolute bottom-0 right-0 sm:bottom-2 sm:right-1/4 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg">
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center flex-wrap gap-2">
                          {toNumber(dashboardStats.verificationPercentage,0) >= 100 ? (
                            <Badge className="bg-green-100 text-green-800 border border-green-200 shadow-sm">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {toNumber(dashboardStats.averageRating,0) > 0 && (
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                              <Star className="w-3 h-3 mr-1 fill-blue-600" />
                              Top Rated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-5 w-full">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-gray-700">Full Name</Label>
                        {isEditingProfile ? (
                          <Input value={editProfileFields.name} onChange={e => setEditProfileFields(f => ({ ...f, name: e.target.value }))} className="border-blue-200 focus:border-blue-500 text-sm" />
                        ) : (
                          <p className="text-gray-900 font-medium bg-gray-50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">{therapistData.profile.name}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-gray-700">Gender</Label>
                        {isEditingProfile ? (
                          <Select value={editProfileFields.gender.toLowerCase()} onValueChange={val => setEditProfileFields(f => ({ ...f, gender: val }))}>
                            <SelectTrigger className="border-blue-200 focus:border-blue-500 text-sm">
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
                          <p className="text-gray-900 font-medium bg-gray-50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">{therapistData.profile.gender}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-gray-700">Experience</Label>
                        {isEditingProfile ? (
                          <Input value={editProfileFields.experience} onChange={e => setEditProfileFields(f => ({ ...f, experience: e.target.value }))} className="border-blue-200 focus:border-blue-500 text-sm" />
                        ) : (
                          <p className="text-gray-900 font-medium bg-gray-50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">{therapistData.profile.experience}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-gray-700">Languages</Label>
                        {isEditingProfile ? (
                          <Input value={editProfileFields.languages} onChange={e => setEditProfileFields(f => ({ ...f, languages: e.target.value }))} className="border-blue-200 focus:border-blue-500 text-sm" />
                        ) : (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {therapistData.profile.languages.map((lang, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-5 w-full">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-gray-700">Clinic Address</Label>
                        {isEditingProfile ? (
                          <Textarea value={editProfileFields.clinicAddress} onChange={e => setEditProfileFields(f => ({ ...f, clinicAddress: e.target.value }))} className="border-blue-200 focus:border-blue-500 text-sm" />
                        ) : (
                          <p className="text-gray-900 text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded-lg">{therapistData.profile.clinicAddress}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-gray-700">Service Modes</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {therapistData.services.modes.map((mode, index) => {
                            const icons = {
                              Video: <Video className="w-3 h-3" />,
                              Audio: <Phone className="w-3 h-3" />,
                              "In-Clinic": <MapPin className="w-3 h-3" />,
                              "Home Visit": <Home className="w-3 h-3" />
                            };
                            return (
                              <Badge key={index} className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                                {icons[mode as keyof typeof icons]}
                                <span className="ml-1">{mode}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6 sm:my-8 bg-blue-100" />

                  <div className="space-y-3">
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Professional Bio</Label>
                    {isEditingProfile ? (
                      <Textarea value={editProfileFields.bio} onChange={e => setEditProfileFields(f => ({ ...f, bio: e.target.value }))} rows={5} className="border-blue-200 focus:border-blue-500 text-sm" />
                    ) : (
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">{therapistData.profile.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Settings & Availability</h3>
              {/* Availability Calendar */}
              <Card className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                  <CardTitle className="flex items-center text-blue-800 text-base sm:text-lg">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Availability Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex justify-center">
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Select date"
                          value={selectedDate}
                          onChange={(newValue) => setSelectedDate(newValue ?? undefined)}
                          disablePast
                          slots={{ textField: TextField }}
                          enableAccessibleFieldDOMStructure={false}
                        />
                      </LocalizationProvider>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">Weekly Time Slots</h4>
                      <div className="space-y-3">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                          <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border-2 border-blue-100 rounded-xl hover:border-blue-300 transition-colors bg-white shadow-sm">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{day}</span>
                            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                              <Input placeholder="9:00 AM" className="w-20 sm:w-24 border-blue-200 text-xs sm:text-sm" />
                              <span className="text-gray-500 text-xs sm:text-sm">to</span>
                              <Input placeholder="5:00 PM" className="w-20 sm:w-24 border-blue-200 text-xs sm:text-sm" />
                              <Switch className="data-[state=checked]:bg-blue-600" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md text-sm sm:text-base">
                        Update Availability
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Options Settings */}
              <Card className="shadow-lg border-green-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-4 sm:p-6">
                  <CardTitle className="flex items-center text-green-800 text-base sm:text-lg">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Service Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Session Type</Label>
                      <Select value={serviceTypes[0] || ""} onValueChange={v => setServiceTypes([v])}>
                        <SelectTrigger className="border-green-200 text-sm">
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="In-Clinic">In-Clinic</SelectItem>
                          <SelectItem value="Home Visit">Home Visit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Pricing per Session (₹)</Label>
                      <Input type="number" min={0} value={pricing} onChange={e => setPricing(Number(e.target.value))} className="border-green-200 text-sm" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Session Duration (minutes)</Label>
                      <Input type="number" min={15} max={120} value={duration} onChange={e => setDuration(Number(e.target.value))} className="border-green-200 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md text-sm sm:text-base" onClick={handleUpdateServiceOptions}>
                    Update Service Options
                  </Button>
                </CardContent>
              </Card>

              {/* Privacy & Notification Settings */}
              <Card className="shadow-lg border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-4 sm:p-6">
                  <CardTitle className="flex items-center text-purple-800 text-base sm:text-lg">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Privacy & Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Receive Email Notifications</Label>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} className="data-[state=checked]:bg-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Receive SMS/WhatsApp Notifications</Label>
                      <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} className="data-[state=checked]:bg-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Show Profile Publicly</Label>
                      <Switch checked={publicProfile} onCheckedChange={setPublicProfile} className="data-[state=checked]:bg-purple-600" />
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md text-sm sm:text-base" onClick={handleUpdatePrivacySettings}>
                    Update Privacy & Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Verification Status</h3>
              
              <Card className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-blue-800 text-base sm:text-lg">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    Current Verification Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Use therapist data object keys for document URLs */}
                    {[{
                      key: 'Degrees',
                      label: 'Qualification Certificate',
                      url: therapistData.profile.qualificationCertUrls && therapistData.profile.qualificationCertUrls.length > 0 ? therapistData.profile.qualificationCertUrls[0] : null
                    }, {
                      key: 'License',
                      label: 'Professional License',
                      url: therapistData.profile.licenseDocumentUrl || null
                    }].map(item => (
                      <div key={item.key} className="p-4 sm:p-6 border-2 border-blue-100 rounded-xl space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow bg-white">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{item.label}</span>
                          <Badge className={`bg-blue-100 text-blue-800 border-blue-200 border shadow-sm text-xs`}>{item.url ? 'Uploaded' : 'Missing'}</Badge>
                        </div>
                        <Progress value={item.url ? 100 : 0} className="h-2" />
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs sm:text-sm">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />View Document
                            </Button>
                          </a>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs sm:text-sm">
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />Upload
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Alert className={`${toNumber(dashboardStats.verificationPercentage,0) >= 100 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    {toNumber(dashboardStats.verificationPercentage,0) >= 100 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <AlertDescription className="font-medium">
                      {toNumber(dashboardStats.verificationPercentage,0) >= 100 
                        ? 'All verification steps complete. Your profile is fully verified!' 
                        : 'Complete pending verification steps to unlock full platform functionality.'}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Appointments</h3>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md w-full sm:w-auto text-sm sm:text-base"
                  onClick={refreshData}
                  disabled={isLoadingData}
                  size="sm"
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {isLoadingData ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /> : toNumber(dashboardStats.totalSessions, 0)}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Total Sessions</p>
                  </CardContent>
                </Card>
                <Card className="shadow-lg border-green-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {isLoadingData ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : toNumber(dashboardStats.thisMonthSessions, 0)}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">This Month</p>
                  </CardContent>
                </Card>
                <Card className="shadow-lg border-yellow-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-yellow-600 fill-yellow-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {isLoadingData ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-yellow-600" /> : formatFixed(dashboardStats.averageRating, 1)}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Average Rating</p>
                  </CardContent>
                </Card>
                <Card className="shadow-lg border-purple-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {isLoadingData ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : toNumber(dashboardStats.totalReviews, 0)}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Reviews</p>
                  </CardContent>
                </Card>
              </div>

              {todaySessions.length > 0 && (
                <Card className="shadow-lg border-blue-100">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                    <CardTitle className="text-blue-800 text-base sm:text-lg">Today's Sessions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid gap-3 sm:gap-4">
                      {todaySessions.map((session) => (
                        <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 border-2 border-blue-100 rounded-xl hover:shadow-md transition-all bg-white">
                          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-blue-200 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm sm:text-base">
                                {session.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{session.patientName}</p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{session.patientEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 mt-1 text-xs">{session.sessionType}</Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-blue-200 hover:bg-blue-50 p-2">
                                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-blue-200 hover:bg-blue-50 p-2">
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                  <CardTitle className="text-blue-800 text-base sm:text-lg">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {isLoadingData ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-blue-600" />
                    </div>
                  ) : therapistData.appointments.upcoming.length > 0 ? (
                    <>
                      {/* Mobile Card View */}
                      <div className="block sm:hidden space-y-3">
                        {therapistData.appointments.upcoming.map((appointment) => (
                          <div key={appointment.id} className="p-4 border-2 border-blue-100 rounded-xl bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900 text-sm">{appointment.patient}</p>
                              <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">
                                <CheckCircle className="w-2 h-2 mr-1" />
                                Confirmed
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-gray-600">
                                <CalendarIcon className="w-3 h-3 inline mr-1" />
                                {appointment.date} at {appointment.time}
                              </p>
                              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                                {appointment.type}
                              </Badge>
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <Button size="sm" variant="outline" className="border-blue-200 hover:bg-blue-50 flex-1 text-xs">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Message
                              </Button>
                              <Button size="sm" variant="outline" className="border-blue-200 hover:bg-blue-50 flex-1 text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-blue-100 hover:bg-blue-50/50">
                              <TableHead className="font-semibold text-gray-700 text-sm">Patient</TableHead>
                              <TableHead className="font-semibold text-gray-700 text-sm">Date & Time</TableHead>
                              <TableHead className="font-semibold text-gray-700 text-sm">Type</TableHead>
                              <TableHead className="font-semibold text-gray-700 text-sm">Status</TableHead>
                              <TableHead className="font-semibold text-gray-700 text-sm">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {therapistData.appointments.upcoming.map((appointment) => (
                              <TableRow key={appointment.id} className="border-blue-50 hover:bg-blue-50/30">
                                <TableCell className="font-medium text-gray-900 text-sm">{appointment.patient}</TableCell>
                                <TableCell className="text-gray-700 text-sm">{`${appointment.date} at ${appointment.time}`}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                                    {appointment.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirmed
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" className="border-blue-200 hover:bg-blue-50">
                                      <MessageCircle className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-blue-200 hover:bg-blue-50">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium text-sm sm:text-base">No upcoming appointments</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Earnings Dashboard</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card className="shadow-lg border-green-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">
                      {isLoadingData ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto" /> : formatCurrency(dashboardStats.thisMonthEarnings)}
                    </div>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 font-medium">This Month</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                      {isLoadingData ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto text-blue-600" /> : formatCurrency(dashboardStats.lastMonthEarnings)}
                    </div>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 font-medium">Last Month</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg border-purple-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1">
                      {isLoadingData ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto" /> : formatCurrency(dashboardStats.totalEarnings)}
                    </div>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 font-medium">Total Earnings</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg border-orange-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="bg-orange-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1">
                      {isLoadingData ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto" /> : formatCurrency(dashboardStats.pendingWithdrawal)}
                    </div>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 font-medium">Available</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="shadow-lg border-blue-100">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                    <CardTitle className="text-blue-800 text-base sm:text-lg">Request Withdrawal</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Available Balance</Label>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mt-1">{formatCurrency(dashboardStats.pendingWithdrawal)}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Withdrawal Amount</Label>
                      <Input type="number" placeholder="Enter amount" className="border-blue-200 focus:border-blue-500 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Bank Account</Label>
                      <Select>
                        <SelectTrigger className="border-blue-200 text-sm">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account1">Account ending in 1234</SelectItem>
                          <SelectItem value="account2">Account ending in 5678</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md text-sm sm:text-base">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Request Withdrawal
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg border-blue-100">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                    <CardTitle className="text-blue-800 text-base sm:text-lg">Earnings Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="text-gray-700 font-medium text-xs sm:text-sm">Sessions Completed</span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">{toNumber(dashboardStats.totalSessions, 0)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                      <span className="text-gray-700 font-medium text-xs sm:text-sm">Average per Session</span>
                      <span className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatCurrency(
                          toNumber(dashboardStats.totalSessions, 0) > 0 
                            ? toNumber(dashboardStats.totalEarnings, 0) / toNumber(dashboardStats.totalSessions, 0) 
                            : 0
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-gray-700 font-medium text-xs sm:text-sm">This Month Sessions</span>
                      <span className="text-xl sm:text-2xl font-bold text-purple-600">{toNumber(dashboardStats.thisMonthSessions, 0)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Courses & Certifications</h3>
              <Card className="shadow-lg border-blue-100">
                <CardContent className="p-6 sm:p-12 text-center">
                  <GraduationCap className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Courses Yet</h4>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Course tracking and certificates will appear here once you enroll via TheraLearn.
                  </p>
                  <Button 
                    onClick={() => router.push('/theralearn')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md text-sm sm:text-base"
                  >
                    <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Help & Support</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                    <CardTitle className="flex items-center text-blue-800 text-base sm:text-lg">
                      <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Support Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Need help? Submit a support ticket and our team will assist you.
                    </p>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md text-sm sm:text-base">
                      <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Raise New Ticket
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                    <CardTitle className="flex items-center text-blue-800 text-base sm:text-lg">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Grievance Box
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Have a concern or complaint? We're here to listen and help resolve it.
                    </p>
                    <Button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm sm:text-base" variant="outline">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Submit Grievance
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                  <CardTitle className="text-blue-800 text-base sm:text-lg">Quick Help Resources</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 border-2 border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2 sm:mb-3" />
                      <h5 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Documentation</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Browse our help guides</p>
                    </div>
                    <div className="p-3 sm:p-4 border-2 border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                      <Video className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2 sm:mb-3" />
                      <h5 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Video Tutorials</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Learn with videos</p>
                    </div>
                    <div className="p-3 sm:p-4 border-2 border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                      <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2 sm:mb-3" />
                      <h5 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Live Chat</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Chat with support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="articles">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Write & Publish Articles</h3>
              <Card className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                  <CardTitle className="text-blue-800 text-base sm:text-lg">Blog Submissions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Article Title</Label>
                    <Input placeholder="Enter article title" className="border-blue-200 focus:border-blue-500 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Category</Label>
                    <Select>
                      <SelectTrigger className="border-blue-200 text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mental-health">Mental Health</SelectItem>
                        <SelectItem value="therapy">Therapy Techniques</SelectItem>
                        <SelectItem value="wellness">Wellness</SelectItem>
                        <SelectItem value="self-care">Self Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Content</Label>
                    <Textarea placeholder="Write your article content..." rows={8} className="border-blue-200 focus:border-blue-500 text-sm" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md text-sm sm:text-base">
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Publish Article
                    </Button>
                    <Button variant="outline" className="border-blue-200 hover:bg-blue-50 text-sm sm:text-base">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}