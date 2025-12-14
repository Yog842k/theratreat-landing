"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  User, Settings, Calendar as CalendarIcon, Clock, DollarSign, GraduationCap,
  HelpCircle, FileText, Video, Phone, MapPin, Home, Star, CheckCircle, XCircle,
  AlertTriangle, Upload, Download, Edit, Save, Bell, Shield, BarChart3, TrendingUp,
  Users, MessageCircle, LogOut, UserCog, PlusCircle,
  Eye, RefreshCw, Mail, Loader2, AlertCircle, Filter, X, ChevronRight, MoreHorizontal
} from 'lucide-react';
import { PRIMARY_FILTERS, CATEGORY_FILTERS, THERAPY_TYPES } from '@/constants/therabook-filters';

// --- Interfaces (Kept identical to preserve logic) ---
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

interface ScheduledSession {
    id: string;
    patientName: string;
    patientEmail?: string;
    startTime: string;
    endTime: string;
    sessionType: string;
    status: string;
    amount?: number;
}

export default function TherapistDashboardPage() {
  // --- State Logic (Identical to original) ---
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [pricing, setPricing] = useState<number>(0);
  const [duration, setDuration] = useState<number>(50);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(true);
  const [publicProfile, setPublicProfile] = useState<boolean>(true);
  const weekDays = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const [weeklySlots, setWeeklySlots] = useState(() =>
    weekDays.map(day => ({ day, start: "09:00", end: "17:00", enabled: true }))
  );

  const handleServiceTypesChange = (value: string[]) => { setServiceTypes(value); };
  const handleWeeklySlotChange = (day: string, field: 'start' | 'end' | 'enabled', value: string | boolean) => {
    setWeeklySlots(prev => prev.map(slot => (slot.day === day ? { ...slot, [field]: value } : slot)));
  };
  const handleUpdateServiceOptions = () => {
    setTherapistData(prev => ({ ...prev, services: { ...prev.services, sessionTypes: serviceTypes, pricing, duration } }));
  };
  const handleUpdateAvailability = () => { console.log('Saving availability slots', weeklySlots); };
  const handleUpdatePrivacySettings = () => { };
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingFilters, setIsEditingFilters] = useState(false);
  const [filterFields, setFilterFields] = useState({ therapyTypes: [] as string[], primaryFilters: [] as string[], conditions: [] as string[] });
  const [editProfileFields, setEditProfileFields] = useState({ name: '', gender: '', experience: '', languages: '', clinicAddress: '', bio: '' });
  const [resolvedTherapistId, setResolvedTherapistId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [therapistData, setTherapistData] = useState<TherapistData>({
    profile: { name: '', gender: '', bio: '', languages: [], degrees: [], certifications: [], experience: '', specializations: [], clinicAddress: '', avatar: '' },
    verification: { kyc: "Pending", degree: "Pending", license: "Pending", overall: "Pending" },
    services: { modes: [], sessionTypes: [], pricing: 0, duration: 50, platforms: ["TheraBook Video"] },
    earnings: { thisMonth: 4800, lastMonth: 5200, totalEarnings: 48000, pendingWithdrawal: 1200, sessionsThisMonth: 40 },
    appointments: { upcoming: [], total: 0, rating: 0, reviews: 0 }
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSessions: 0, thisMonthSessions: 0, averageRating: 0, totalReviews: 0, thisMonthEarnings: 0, lastMonthEarnings: 0, totalEarnings: 0, pendingWithdrawal: 0, verificationPercentage: 0
  });
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
    const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);

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

  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const toNumber = (v: unknown, def = 0): number => { const n = typeof v === 'number' ? v : Number((v as any)); return Number.isFinite(n) ? n : def; };
  const formatFixed = (v: unknown, digits = 1): string => toNumber(v, 0).toFixed(digits);
  const formatCurrency = (v: unknown): string => `₹${toNumber(v, 0).toLocaleString('en-IN')}`;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

    // --- API Handlers (Connected to backend) ---
    const handleSaveProfile = async () => {
        if (!resolvedTherapistId) { setError('Therapist ID not found'); return; }
        try {
            setError(null);
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
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Failed to update profile');
            setIsEditingProfile(false);
            await fetchTherapistFullProfile();
        } catch (e: any) {
            setError(e?.message || 'Failed to save profile');
            console.error('Error saving profile:', e);
        }
    };

    const fetchTherapistFullProfile = async () => {
        try {
            if (!resolvedTherapistId) return;
            const res = await fetch(`/api/therapists/${resolvedTherapistId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json?.success) {
                console.error('Profile API error:', json);
                if (!json?.error?.includes('MongoDB') && !json?.error?.includes('connect')) {
                    setError('Unable to load profile information. Please try again later.');
                }
                return;
            }
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
            const pricingVal = t.consultationFee ?? 0;
            const durationVal = t.sessionDuration || 50;

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
                services: { ...prev.services, modes, sessionTypes, pricing: pricingVal, duration: durationVal },
                appointments: { ...prev.appointments, rating: t.rating ?? 0, reviews: t.reviewCount ?? 0 }
            }));
        } catch (e: any) {
            console.error('Error loading fullProfile:', e);
            const errorMsg = e?.message || String(e);
            if (!errorMsg.includes('MongoDB') && !errorMsg.includes('connect')) {
                setError('Unable to load profile information. Please try again later.');
            }
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const idQuery = resolvedTherapistId ? `therapistId=${resolvedTherapistId}` : (user?._id ? `userId=${user._id}` : '');
            const response = await fetch(`${API_BASE}/api/dashboard/therapist/stats${idQuery ? `?${idQuery}` : ''}` , {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                console.error('Stats API error:', result);
                if (!result.error?.includes('MongoDB') && !result.error?.includes('connect')) {
                    setError('Unable to load statistics. Please try again later.');
                }
                return;
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
                if (!result.error?.includes('MongoDB') && !result.error?.includes('connect')) {
                    setError(result.message || 'Unable to load statistics');
                }
            }
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error);
            const errorMsg = error?.message || String(error);
            if (!errorMsg.includes('MongoDB') && !errorMsg.includes('connect')) {
                setError('Unable to load statistics. Please try again later.');
            }
        }
    };

    const fetchTodaySessions = async () => {
        try {
            const idQuery = resolvedTherapistId ? `therapistId=${resolvedTherapistId}` : (user?._id ? `userId=${user._id}` : '');
            const response = await fetch(`${API_BASE}/api/dashboard/therapist/today-sessions${idQuery ? `?${idQuery}` : ''}` , {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                console.error("Today's sessions API error:", result);
                if (!result.error?.includes('MongoDB') && !result.error?.includes('connect')) {
                    setError('Unable to load today\'s sessions. Please try again later.');
                }
                setTodaySessions([]);
                return;
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
                setTodaySessions([]);
                if (!result.error?.includes('MongoDB') && !result.error?.includes('connect')) {
                    setError(result.message || 'Unable to load today\'s sessions');
                }
            }
        } catch (error: any) {
            console.error('Error fetching today\'s sessions:', error);
            setTodaySessions([]);
            const errorMsg = error?.message || String(error);
            if (!errorMsg.includes('MongoDB') && !errorMsg.includes('connect')) {
                setError('Unable to load today\'s sessions. Please try again later.');
            }
        }
    };

    const fetchTherapistBookings = async () => {
        try {
            const idQuery = resolvedTherapistId ? `therapistId=${resolvedTherapistId}` : (user?._id ? `userId=${user._id}` : '');
            const response = await fetch(`${API_BASE}/api/bookings/therapist-bookings${idQuery ? `?${idQuery}` : ''}` , {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                console.error('Bookings API error:', result);
                if (!result.error?.includes('MongoDB') && !result.error?.includes('connect')) {
                    setError('Unable to load appointments. Please try again later.');
                }
                setTherapistData(prev => ({ ...prev, appointments: { ...prev.appointments, upcoming: [] } }));
                return;
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
                setTherapistData(prev => ({ ...prev, appointments: { ...prev.appointments, upcoming: [] } }));
                if (!result.error?.includes('MongoDB') && !result.error?.includes('connect')) {
                    setError(result.message || 'Unable to load appointments');
                }
            }
        } catch (error: any) {
            console.error('Error fetching bookings:', error);
            setTherapistData(prev => ({ ...prev, appointments: { ...prev.appointments, upcoming: [] } }));
            const errorMsg = error?.message || String(error);
            if (!errorMsg.includes('MongoDB') && !errorMsg.includes('connect')) {
                setError('Unable to load appointments. Please try again later.');
            }
        }
    };

    const fetchScheduledSessions = async (date?: Date) => {
        try {
            const idQuery = resolvedTherapistId ? `therapistId=${resolvedTherapistId}` : (user?._id ? `userId=${user._id}` : '');
            const day = date || selectedDate || new Date();
            // Many APIs expect a date-only string; prefer YYYY-MM-DD
            const yyyyMmDd = (() => {
                const d = new Date(day);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${dd}`;
            })();
            const url = `${API_BASE}/api/dashboard/therapist/scheduled-sessions${idQuery ? `?${idQuery}&` : '?' }date=${encodeURIComponent(yyyyMmDd)}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                console.warn('Scheduled sessions API non-OK:', { url, status: response.status, result });
                // Soft-fail: keep UI usable without noisy errors on empty payloads
                if (result?.error && !result.error.includes('MongoDB') && !result.error.includes('connect')) {
                    setError('Unable to load scheduled sessions. Please try again later.');
                }
                setScheduledSessions([]);
                return;
            }
            // Handle different payload shapes: {sessions}, {data}, direct array
            const payload = Array.isArray(result)
                ? result
                : (Array.isArray(result.sessions) ? result.sessions : (Array.isArray(result.data) ? result.data : []));
            if (!Array.isArray(payload) || payload.length === 0) {
                setScheduledSessions([]);
                return;
            }
            const sessions = payload.map((b: any) => ({
                id: b._id || b.id,
                patientName: b.clientId?.name || b.userId?.name || b.patientName || 'Patient',
                patientEmail: b.clientId?.email || b.userId?.email || b.patientEmail || '',
                startTime: b.sessionTime?.startTime || b.startTime || b.sessionDate || b.date,
                endTime: b.sessionTime?.endTime || b.endTime || b.sessionDate || b.date,
                sessionType: b.sessionType || b.type || 'video',
                status: b.status || 'scheduled',
            }));
            setScheduledSessions(sessions);
        } catch (error: any) {
            console.error('Error fetching scheduled sessions:', error);
            setScheduledSessions([]);
            const errorMsg = error?.message || String(error);
            if (!errorMsg.includes('MongoDB') && !errorMsg.includes('connect')) {
                setError('Unable to load scheduled sessions. Please try again later.');
            }
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
                    if (therapist?._id) setResolvedTherapistId(therapist._id);
                    const experience = typeof therapist?.experience === 'number' ? `${therapist.experience} years` : undefined;
                    setTherapistData(prev => ({ ...prev, profile: { ...prev.profile, experience: experience || prev.profile.experience } }));
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
            setIsLoadingData(true);
            setError(null);
            try {
                const results = await Promise.allSettled([
                    fetchDashboardStats(),
                    fetchTodaySessions(),
                    fetchScheduledSessions(selectedDate),
                    fetchTherapistBookings(),
                    fetchTherapistFullProfile()
                ]);
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        const apiNames = ['Stats', 'Today Sessions', 'Bookings', 'Profile'];
                        console.error(`Error loading ${apiNames[index]}:`, result.reason);
                    }
                });
            } catch (error: any) {
                console.error('Error loading dashboard data:', error);
                const errorMsg = error?.message || String(error);
                if (!errorMsg.includes('MongoDB') && !errorMsg.includes('connect')) {
                    setError('Some data could not be loaded. Please try refreshing.');
                }
            } finally {
                setIsLoadingData(false);
            }
        };

        (async () => { await ensureTherapistId(); await loadAll(); })();
    }, [isAuthenticated, token, user?._id, resolvedTherapistId]);

    const refreshData = async () => {
        if (!resolvedTherapistId && !user?._id) return;
        setIsLoadingData(true);
        setError(null);
        try {
            const results = await Promise.allSettled([
                fetchDashboardStats(),
                fetchTodaySessions(),
                fetchScheduledSessions(selectedDate),
                fetchTherapistBookings(),
                fetchTherapistFullProfile()
            ]);
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const apiNames = ['Stats', 'Today Sessions', 'Bookings', 'Profile'];
                    console.error(`Error refreshing ${apiNames[index]}:`, result.reason);
                }
            });
        } catch (error: any) {
            console.error('Error refreshing data:', error);
            const errorMsg = error?.message || String(error);
            if (!errorMsg.includes('MongoDB') && !errorMsg.includes('connect')) {
                setError('Some data could not be refreshed. Please try again.');
            }
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || !token || !user?._id) return;
        (async () => {
            await fetchScheduledSessions(selectedDate);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

  // --- UI Render ---

  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-slate-50'>
        <Loader2 className='w-12 h-12 animate-spin text-blue-600 mb-4' />
        <p className='text-slate-500 font-medium'>Preparing your dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'therapist') {
    // Handling unauth/wrong user type (Keep simpler for this view)
    return null; 
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Left: User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-blue-100 ring-2 ring-blue-50">
                <AvatarImage src={therapistData.profile.avatar} className="object-cover" />
                <AvatarFallback className="bg-blue-600 text-white font-bold">
                  {user?.name?.charAt(0) || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  {therapistData.profile.name || user?.name}
                </h1>
                <p className="text-sm text-slate-500">Therapist Dashboard</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={refreshData} className="text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                <RefreshCw className={`w-5 h-5 ${isLoadingData ? 'animate-spin' : ''}`} />
              </Button>
              
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:flex border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => router.push('/therabook/dashboard/patient')}
              >
                <UserCog className="w-4 h-4 mr-2" />
                Patient View
              </Button>

              <Button 
                 variant="ghost" 
                 size="icon"
                 className="text-red-500 hover:text-red-600 hover:bg-red-50"
                 onClick={() => { logout(); router.push('/'); }}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Alert */}
        {error && !error.includes('MongoDB') && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatsCard 
                title="Today's Sessions" 
                value={dashboardStats.thisMonthSessions} 
                icon={Users} 
                color="blue" 
                loading={isLoadingData} 
            />
            <StatsCard 
                title="Average Rating" 
                value={formatFixed(dashboardStats.averageRating, 1)} 
                icon={Star} 
                color="yellow" 
                loading={isLoadingData} 
            />
            <StatsCard 
                title="Month Earnings" 
                value={formatCurrency(dashboardStats.thisMonthEarnings)} 
                icon={DollarSign} 
                color="green" 
                loading={isLoadingData} 
            />
            <StatsCard 
                title="Verification" 
                value={`${toNumber(dashboardStats.verificationPercentage, 0)}%`} 
                icon={Shield} 
                color="indigo" 
                loading={isLoadingData} 
            />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          
          {/* Scrollable Tab List for Mobile */}
          <div className="sticky top-16 z-20 bg-slate-50 pt-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
            <TabsList className="h-auto p-1 bg-white border border-slate-200 shadow-sm rounded-xl inline-flex w-auto min-w-full sm:min-w-0">
                <TabItem value="profile" icon={User} label="Profile" />
                <TabItem value="settings" icon={Settings} label="Settings" />
                <TabItem value="appointments" icon={CalendarIcon} label="Schedule" />
                <TabItem value="verification" icon={Shield} label="Verify" />
                <TabItem value="earnings" icon={DollarSign} label="Wallet" />
                <TabItem value="support" icon={HelpCircle} label="Support" />
            </TabsList>
          </div>

          {/* --- Tab: Profile --- */}
          <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 duration-300">
             <div className="flex flex-col md:flex-row gap-6">
                
                {/* Left Column: Avatar & Basic Info */}
                <Card className="md:w-1/3 h-fit border-slate-200 shadow-sm">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="relative mb-4 group">
                            <Avatar className="w-32 h-32 border-4 border-white shadow-xl ring-1 ring-slate-100">
                                <AvatarImage src={therapistData.profile.avatar} className="object-cover" />
                                <AvatarFallback className="bg-slate-100 text-slate-400 text-4xl font-bold">
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {isEditingProfile && (
                                <Button size="icon" className="absolute bottom-0 right-0 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white">
                                    <Upload className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        
                        <h2 className="text-xl font-bold text-slate-900">{therapistData.profile.name}</h2>
                        <div className="mt-2 flex flex-wrap justify-center gap-2">
                            {toNumber(dashboardStats.verificationPercentage,0) >= 100 ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Pending
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-slate-600 border-slate-200">
                                {therapistData.profile.experience || '0'} Years Exp.
                            </Badge>
                        </div>
                        
                        <Separator className="my-6" />
                        
                        <div className="w-full space-y-4 text-left">
                           <div className="space-y-1">
                               <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Address</Label>
                               {isEditingProfile ? (
                                   <Textarea 
                                     value={editProfileFields.clinicAddress} 
                                     onChange={e => setEditProfileFields({...editProfileFields, clinicAddress: e.target.value})}
                                     className="bg-slate-50 resize-none"
                                   />
                               ) : (
                                   <p className="text-sm text-slate-700 font-medium">{therapistData.profile.clinicAddress || 'No address set'}</p>
                               )}
                           </div>
                           <div className="space-y-1">
                               <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Bio</Label>
                               {isEditingProfile ? (
                                   <Textarea 
                                     value={editProfileFields.bio} 
                                     onChange={e => setEditProfileFields({...editProfileFields, bio: e.target.value})}
                                     className="bg-slate-50 min-h-[100px]"
                                   />
                               ) : (
                                   <p className="text-sm text-slate-600 leading-relaxed line-clamp-6">{therapistData.profile.bio || 'No bio available'}</p>
                               )}
                           </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Details & Edit */}
                <Card className="flex-1 border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold text-slate-800">Professional Details</CardTitle>
                        {isEditingProfile ? (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveProfile}>Save</Button>
                            </div>
                        ) : (
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => setIsEditingProfile(true)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6 grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileField 
                                label="Full Name" 
                                value={isEditingProfile ? editProfileFields.name : therapistData.profile.name} 
                                isEditing={isEditingProfile} 
                                onChange={(val: string) => setEditProfileFields({...editProfileFields, name: val})}
                            />
                            <ProfileField 
                                label="Gender" 
                                value={isEditingProfile ? editProfileFields.gender : therapistData.profile.gender} 
                                isEditing={isEditingProfile}
                                onChange={(val: string) => setEditProfileFields({...editProfileFields, gender: val})}
                                type="select"
                                options={["Male", "Female", "Other", "Prefer not to say"]}
                            />
                            <ProfileField 
                                label="Experience (Years)" 
                                value={isEditingProfile ? editProfileFields.experience : therapistData.profile.experience} 
                                isEditing={isEditingProfile}
                                onChange={(val: string) => setEditProfileFields({...editProfileFields, experience: val})}
                            />
                            <ProfileField 
                                label="Languages" 
                                value={isEditingProfile ? editProfileFields.languages : therapistData.profile.languages.join(', ')} 
                                isEditing={isEditingProfile}
                                onChange={(val: string) => setEditProfileFields({...editProfileFields, languages: val})}
                                placeholder="English, Hindi, etc."
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-semibold text-slate-700 mb-2 block">Service Modes</Label>
                            <div className="flex flex-wrap gap-2">
                                {therapistData.services.modes.length > 0 ? therapistData.services.modes.map(mode => (
                                    <Badge key={mode} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
                                        {mode}
                                    </Badge>
                                )) : <span className="text-sm text-slate-400">No modes selected</span>}
                            </div>
                        </div>

                        {/* Filter Settings Block */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-2">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="font-semibold text-slate-900">Search Filters</h4>
                                    <p className="text-xs text-slate-500">How patients find you</p>
                                </div>
                                <Button variant="outline" size="sm" className="h-8 text-xs bg-white" onClick={() => setIsEditingFilters(!isEditingFilters)}>
                                    <Filter className="w-3 h-3 mr-2" /> {isEditingFilters ? 'Done' : 'Manage'}
                                </Button>
                            </div>
                            
                            {isEditingFilters && (
                                <div className="space-y-4 mb-4 animate-in slide-in-from-top-2">
                                     <div className="grid grid-cols-2 gap-2">
                                        {PRIMARY_FILTERS.map(f => (
                                            <div key={f.id} 
                                                onClick={() => {
                                                    const newFilters = filterFields.primaryFilters.includes(f.id) 
                                                        ? filterFields.primaryFilters.filter(id => id !== f.id) 
                                                        : [...filterFields.primaryFilters, f.id];
                                                    setFilterFields({...filterFields, primaryFilters: newFilters});
                                                }}
                                                className={`cursor-pointer p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${filterFields.primaryFilters.includes(f.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                                            >
                                                <span>{f.icon}</span> {f.label}
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                                {filterFields.therapyTypes.map(t => <Badge key={t} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-transparent text-[10px]">{t}</Badge>)}
                                {filterFields.conditions.map(c => <Badge key={c} className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-transparent text-[10px]">{c}</Badge>)}
                                {filterFields.therapyTypes.length === 0 && !isEditingFilters && <span className="text-xs text-slate-400 italic">No filters active</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
          </TabsContent>

          {/* --- Tab: Settings --- */}
          <TabsContent value="settings" className="space-y-6">
             <div className="grid md:grid-cols-3 gap-6">
                
                {/* Availability Column */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-blue-600" /> Availability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                             {weeklySlots.map((slot) => (
                                <div key={slot.day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Switch checked={slot.enabled} onCheckedChange={(c) => handleWeeklySlotChange(slot.day, 'enabled', c)} />
                                        <span className={`text-sm font-medium ${slot.enabled ? 'text-slate-900' : 'text-slate-400'}`}>{slot.day}</span>
                                    </div>
                                    {slot.enabled && (
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                type="time" 
                                                value={slot.start} 
                                                onChange={(e) => handleWeeklySlotChange(slot.day, 'start', e.target.value)}
                                                className="w-24 h-8 text-xs bg-white"
                                            />
                                            <span className="text-slate-400 text-xs">-</span>
                                            <Input 
                                                type="time" 
                                                value={slot.end} 
                                                onChange={(e) => handleWeeklySlotChange(slot.day, 'end', e.target.value)}
                                                className="w-24 h-8 text-xs bg-white"
                                            />
                                        </div>
                                    )}
                                </div>
                             ))}
                             <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleUpdateAvailability}>Save Availability</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Side Options */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                             <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" /> Service Rates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Standard Fee (₹)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                                    <Input 
                                        type="number" 
                                        value={pricing} 
                                        onChange={e => setPricing(Number(e.target.value))} 
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (Min)</Label>
                                <Input 
                                    type="number" 
                                    value={duration} 
                                    onChange={e => setDuration(Number(e.target.value))} 
                                />
                            </div>
                            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleUpdateServiceOptions}>
                                Update Rates
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                         <CardHeader className="border-b border-slate-100 pb-4">
                             <CardTitle className="text-lg flex items-center gap-2">
                                <Bell className="w-5 h-5 text-purple-600" /> Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer" htmlFor="email-notif">Email Alerts</Label>
                                <Switch id="email-notif" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer" htmlFor="sms-notif">SMS Alerts</Label>
                                <Switch id="sms-notif" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer" htmlFor="pub-profile">Public Profile</Label>
                                <Switch id="pub-profile" checked={publicProfile} onCheckedChange={setPublicProfile} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
             </div>
          </TabsContent>

          {/* --- Tab: Appointments --- */}
          <TabsContent value="appointments" className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Appointment Schedule</h2>
                <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoadingData}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} /> Refresh
                </Button>
             </div>

             {/* Scheduled Sessions Date Picker */}
             <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                            <p className="text-sm text-slate-600">Select date to view scheduled sessions</p>
                        </div>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker 
                                value={selectedDate}
                                onChange={(v: Date | null) => setSelectedDate(v ?? new Date())}
                                slotProps={{ textField: { size: 'small' } }}
                            />
                        </LocalizationProvider>
                    </div>
                </CardContent>
             </Card>

             {/* Today's High Priority */}
             {todaySessions.length > 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="text-blue-700 flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Today's Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {todaySessions.map(session => (
                            <div key={session.id} className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                                <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{session.patientName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-slate-900">{session.patientName}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            <span>•</span>
                                            <span className="capitalize">{session.sessionType}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-full">
                                    <Video className="w-4 h-4 mr-2" /> Join Session
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
             )}

             {/* Main Appointment List (Responsive Table/Card) */}
             <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {/* Scheduled Sessions for Selected Date */}
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Scheduled Sessions ({selectedDate ? new Date(selectedDate).toLocaleDateString() : ''})
                        </h3>
                        {scheduledSessions.length === 0 ? (
                            <p className="text-sm text-slate-500">No sessions scheduled for the selected date.</p>
                        ) : (
                            <div className="space-y-3">
                                {scheduledSessions.map((s) => (
                                    <div key={s.id} className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                        <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-slate-100 text-slate-700 font-bold">{s.patientName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-slate-900">{s.patientName}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span>{new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{s.sessionType}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{s.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="w-full sm:w-auto border-blue-200 text-blue-700">View Details</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {therapistData.appointments.upcoming.length === 0 ? (
                        <div className="text-center py-12">
                            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No upcoming appointments found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {therapistData.appointments.upcoming.map((apt) => (
                                            <TableRow key={apt.id}>
                                                <TableCell className="font-medium">{apt.patient}</TableCell>
                                                <TableCell>{apt.date} at {apt.time}</TableCell>
                                                <TableCell><Badge variant="outline" className="capitalize">{apt.type}</Badge></TableCell>
                                                <TableCell><Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Confirmed</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-blue-600">Details</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {therapistData.appointments.upcoming.map((apt) => (
                                    <div key={apt.id} className="p-4 bg-white space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-slate-900">{apt.patient}</p>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <CalendarIcon className="w-3 h-3" /> {apt.date} • {apt.time}
                                                </p>
                                            </div>
                                            <Badge className="bg-green-50 text-green-700 border-green-100">Confirmed</Badge>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">{apt.type}</Badge>
                                            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-600">View Details</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
             </Card>
          </TabsContent>

          {/* --- Other Tabs (Verification, Earnings, Support) - Simplified Views --- */}
          <TabsContent value="verification">
             <Card>
                <CardHeader>
                    <CardTitle>Verification Steps</CardTitle>
                    <CardDescription>Complete these steps to unlock full features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Simplified verification list */}
                    {['Identity (KYC)', 'Degree Certificate', 'Medical License'].map((step, i) => (
                        <div key={step} className="flex items-center justify-between p-4 border rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {i === 0 ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{i+1}</span>}
                                </div>
                                <span className={i === 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}>{step}</span>
                            </div>
                            <Button variant={i === 0 ? "ghost" : "outline"} size="sm">
                                {i === 0 ? 'View' : 'Upload'}
                            </Button>
                        </div>
                    ))}
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="earnings">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-slate-900 text-white border-0">
                        <CardContent className="p-8">
                            <p className="text-slate-400 font-medium mb-1">Total Balance</p>
                            <h2 className="text-4xl font-bold mb-6">{formatCurrency(dashboardStats.pendingWithdrawal)}</h2>
                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-11">
                                Request Withdrawal
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Earnings History</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm font-medium text-slate-600">This Month</span>
                                    <span className="text-lg font-bold text-green-600">+{formatCurrency(dashboardStats.thisMonthEarnings)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm font-medium text-slate-600">Last Month</span>
                                    <span className="text-lg font-bold text-slate-700">{formatCurrency(dashboardStats.lastMonthEarnings)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
          </TabsContent>

          <TabsContent value="support">
             <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Submit a Ticket</h3>
                        <p className="text-slate-500 text-sm mb-4">Facing technical issues? Let our team know.</p>
                        <Button variant="outline" className="border-blue-200 text-blue-700">Create Ticket</Button>
                    </CardContent>
                </Card>
                <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Help Center</h3>
                        <p className="text-slate-500 text-sm mb-4">Browse guides and FAQs.</p>
                        <Button variant="outline" className="border-blue-200 text-blue-700">Read Articles</Button>
                    </CardContent>
                </Card>
             </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}

// --- Sub-Components for cleaner code ---

const StatsCard = ({ title, value, icon: Icon, color, loading }: { title: string, value: string | number, icon: any, color: string, loading: boolean }) => {
    // Mapping for colors to Tailwind classes
    const colors: Record<string, string> = {
        blue: "text-blue-600 bg-blue-50",
        yellow: "text-amber-500 bg-amber-50",
        green: "text-emerald-600 bg-emerald-50",
        indigo: "text-indigo-600 bg-indigo-50",
    };
    const colorClass = colors[color] || colors.blue;

    return (
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : value}
                    </div>
                </div>
                <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </CardContent>
        </Card>
    );
};

const TabItem = ({ value, icon: Icon, label }: { value: string, icon: any, label: string }) => (
    <TabsTrigger 
        value={value} 
        className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
    >
        <Icon className="w-4 h-4" />
        <span className="text-xs sm:text-sm font-medium">{label}</span>
    </TabsTrigger>
);

const ProfileField = ({ label, value, isEditing, onChange, type = 'text', options = [], placeholder = '' }: any) => (
    <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</Label>
        {isEditing ? (
            type === 'select' ? (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {options.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            ) : (
                <Input 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    placeholder={placeholder}
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 transition-all"
                />
            )
        ) : (
            <p className="text-base font-medium text-slate-800 py-1">{value || 'Not set'}</p>
        )}
    </div>
);