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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  User, Settings, Calendar as CalendarIcon, Clock, DollarSign,
  HelpCircle, FileText, Video, MapPin, Star, CheckCircle, 
  AlertTriangle, Upload, Edit, Bell, Shield, 
  Users, LogOut, UserCog,
  RefreshCw, Mail, Loader2, AlertCircle, Filter, ChevronRight
} from 'lucide-react';
import { PRIMARY_FILTERS } from '@/constants/therabook-filters';

// --- Interfaces ---
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
        pricing: { video: number; audio: number; home: number };
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
  // --- State Logic ---
    const [serviceTypes, setServiceTypes] = useState<string[]>([]);
    const [pricing, setPricing] = useState<{ video: number; audio: number; home: number }>({ video: 0, audio: 0, home: 0 });
  const [duration, setDuration] = useState<number>(50);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(true);
  const [publicProfile, setPublicProfile] = useState<boolean>(true);
  const weekDays = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
    const [weeklySlots, setWeeklySlots] = useState(() =>
        weekDays.map(day => ({ day, start: "09:00", end: "17:00", enabled: true }))
    );
    const [unavailability, setUnavailability] = useState<Array<{ id: string; startDate: string; endDate: string; time: string; note: string; allDay: boolean }>>([]);
    const [blockStartDate, setBlockStartDate] = useState('');
    const [blockEndDate, setBlockEndDate] = useState('');
    const [blockTime, setBlockTime] = useState('');
    const [blockNote, setBlockNote] = useState('');
    const [blockAllDay, setBlockAllDay] = useState(true);

  const handleServiceTypesChange = (value: string[]) => { setServiceTypes(value); };
  const handleWeeklySlotChange = (day: string, field: 'start' | 'end' | 'enabled', value: string | boolean) => {
    setWeeklySlots(prev => prev.map(slot => (slot.day === day ? { ...slot, [field]: value } : slot)));
  };
    const handleUpdateServiceOptions = () => {
        setTherapistData(prev => ({ ...prev, services: { ...prev.services, sessionTypes: serviceTypes, modes: serviceTypes, pricing, duration } }));
    };
        const handleUpdateAvailability = async () => {
        if (!resolvedTherapistId && !user?._id) { setError('Therapist ID not found'); return; }
        try {
            setError(null);
                        const expandRanges = () => {
                            const out: Array<{ date: string; time: string; note?: string }> = [];
                            for (const r of unavailability) {
                                if (!r.startDate || !r.endDate) continue;
                                const start = new Date(r.startDate);
                                const end = new Date(r.endDate);
                                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
                                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                    const dateKey = d.toISOString().split('T')[0];
                                    out.push({ date: dateKey, time: r.allDay ? 'ALL_DAY' : (r.time || '00:00'), note: r.note });
                                }
                            }
                            return out;
                        };
            const payload = {
                weekly: weeklySlots.map(s => ({ day: s.day.toLowerCase(), start: s.start, end: s.end, enabled: s.enabled })),
                timezone: 'Asia/Kolkata',
                blocks: expandRanges()
            };
            const targetId = resolvedTherapistId || user?._id;
            const res = await fetch(`/api/therapists/${targetId}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                body: JSON.stringify(payload)
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to save availability');
            }
            console.log('[dashboard] availability saved', json?.data);
            // Clear block inputs on success
            setBlockStartDate('');
            setBlockEndDate('');
            setBlockTime('');
            setBlockNote('');
            setBlockAllDay(true);
        } catch (e: any) {
            console.error('Error saving availability:', e);
            setError(e?.message || 'Failed to save availability');
        }
    };
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
    services: { modes: [], sessionTypes: [], pricing: { video: 0, audio: 0, home: 0 }, duration: 50, platforms: ["TheraBook Video"] },
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
    const DISPLAY_TZ = 'Asia/Kolkata';
    const formatDate = (value?: Date | string | number): string => {
        const d = value instanceof Date ? value : new Date(value ?? Date.now());
        if (Number.isNaN(d.getTime())) return '';
        return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: DISPLAY_TZ }).format(d);
    };
    const formatTime = (value?: Date | string | number): string => {
        if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) return value; // already a clock string like 09:00
        const d = value instanceof Date ? value : new Date(value ?? Date.now());
        if (Number.isNaN(d.getTime())) return '';
        return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: DISPLAY_TZ }).format(d);
    };

    // --- API Handlers ---
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
            setServiceTypes(sessionTypes.length ? sessionTypes : modes);
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
                            time: booking.timeSlot || booking.sessionTime?.startTime || formatTime(booking.date || booking.sessionDate),
                            date: formatDate(booking.date || booking.sessionDate),
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
                if (result?.error && !result.error.includes('MongoDB') && !result.error.includes('connect')) {
                    setError('Unable to load scheduled sessions. Please try again later.');
                }
                setScheduledSessions([]);
                return;
            }
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
                        const apiNames = ['Stats', 'Today Sessions', 'Scheduled', 'Bookings', 'Profile'];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, token, user?._id, resolvedTherapistId]);

    const refreshData = async () => {
        if (!resolvedTherapistId && !user?._id) return;
        setIsLoadingData(true);
        setError(null);
        try {
            await Promise.allSettled([
                fetchDashboardStats(),
                fetchTodaySessions(),
                fetchScheduledSessions(selectedDate),
                fetchTherapistBookings(),
                fetchTherapistFullProfile()
            ]);
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

    // Refetch schedule when date changes
    useEffect(() => {
        if (!isAuthenticated || !token || !user?._id) return;
        (async () => {
            await fetchScheduledSessions(selectedDate);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);


  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-slate-50'>
        <Loader2 className='w-12 h-12 animate-spin text-blue-600 mb-4' />
        <p className='text-slate-500 font-medium'>Preparing workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'therapist') {
    return null; 
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Sticky Header --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand / User */}
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-white ring-2 ring-blue-50 shadow-sm transition-transform hover:scale-105">
                    <AvatarImage src={therapistData.profile.avatar} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs sm:text-sm">
                      {user?.name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
               </div>
               <div className="hidden sm:block">
                  <h1 className="text-sm font-bold text-slate-800 leading-tight">
                    {therapistData.profile.name || user?.name}
                  </h1>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Therapist Panel</p>
               </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={refreshData} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:flex border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 rounded-full h-8 text-xs font-medium"
                onClick={() => router.push('/therabook/dashboard/patient')}
              >
                <UserCog className="w-3 h-3 mr-1.5" />
                Patient View
              </Button>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

              <Button 
                 variant="ghost" 
                 size="icon"
                 className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                 onClick={() => { logout(); router.push('/'); }}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Alert */}
        {error && !error.includes('MongoDB') && (
          <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-800 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Alert</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatsCard 
                title="Sessions" 
                subtitle="This Month"
                value={dashboardStats.thisMonthSessions} 
                icon={Users} 
                color="blue" 
                loading={isLoadingData} 
            />
            <StatsCard 
                title="Rating" 
                subtitle="Average"
                value={formatFixed(dashboardStats.averageRating, 1)} 
                icon={Star} 
                color="yellow" 
                loading={isLoadingData} 
            />
            <StatsCard 
                title="Earnings" 
                subtitle="Last 30 Days"
                value={formatCurrency(dashboardStats.thisMonthEarnings)} 
                icon={DollarSign} 
                color="green" 
                loading={isLoadingData} 
            />
            <StatsCard 
                title="Profile" 
                subtitle="Completion"
                value={`${toNumber(dashboardStats.verificationPercentage, 0)}%`} 
                icon={Shield} 
                color="indigo" 
                loading={isLoadingData} 
            />
        </div>

        {/* Main Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          
          {/* Scrollable Tab List (Pills Style) */}
          <div className="sticky top-[64px] z-30 bg-slate-50 pt-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="overflow-x-auto no-scrollbar snap-x">
                <TabsList className="h-auto p-1 bg-white border border-slate-200/60 shadow-sm rounded-full inline-flex w-auto min-w-full sm:min-w-0">
                    <TabItem value="profile" icon={User} label="Profile" />
                    <TabItem value="settings" icon={Settings} label="Settings" />
                    <TabItem value="appointments" icon={CalendarIcon} label="Schedule" />
                    <TabItem value="verification" icon={Shield} label="Verify" />
                    <TabItem value="support" icon={HelpCircle} label="Support" />
                </TabsList>
            </div>
          </div>

          {/* --- Tab: Profile --- */}
          <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Avatar & Key Info Card */}
                <Card className="lg:col-span-4 border-slate-100 shadow-sm rounded-2xl overflow-hidden h-fit">
                    <div className="h-24 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100"></div>
                    <CardContent className="pt-0 relative flex flex-col items-center text-center px-6 pb-8">
                        <div className="relative -mt-12 mb-4 group">
                            <Avatar className="w-28 h-28 border-4 border-white shadow-xl bg-white">
                                <AvatarImage src={therapistData.profile.avatar} className="object-cover" />
                                <AvatarFallback className="bg-slate-100 text-slate-400 text-3xl font-bold">
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {isEditingProfile && (
                                <Button size="icon" className="absolute bottom-1 right-1 h-8 w-8 rounded-full shadow-md bg-blue-600 hover:bg-blue-700 text-white border-2 border-white">
                                    <Upload className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                        
                        <h2 className="text-xl font-bold text-slate-900">{therapistData.profile.name}</h2>
                        <p className="text-slate-500 text-sm mb-4">{therapistData.profile.experience || '0'} Years Experience</p>

                        <div className="flex flex-wrap justify-center gap-2 w-full">
                            {toNumber(dashboardStats.verificationPercentage,0) >= 100 ? (
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 px-3 py-1 rounded-full">
                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verified
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 px-3 py-1 rounded-full">
                                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Pending Verification
                                </Badge>
                            )}
                        </div>
                        
                        <Separator className="my-6 bg-slate-100" />
                        
                        <div className="w-full space-y-4 text-left">
                           <div className="space-y-1.5">
                               <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Bio</Label>
                               {isEditingProfile ? (
                                   <Textarea 
                                     value={editProfileFields.bio} 
                                     onChange={e => setEditProfileFields({...editProfileFields, bio: e.target.value})}
                                     className="bg-slate-50 border-slate-200 min-h-[120px] text-sm focus:bg-white transition-colors rounded-xl"
                                   />
                               ) : (
                                   <p className="text-sm text-slate-600 leading-relaxed">{therapistData.profile.bio || 'No bio available'}</p>
                               )}
                           </div>
                           <div className="space-y-1.5">
                               <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Clinic Address</Label>
                               {isEditingProfile ? (
                                   <Textarea 
                                     value={editProfileFields.clinicAddress} 
                                     onChange={e => setEditProfileFields({...editProfileFields, clinicAddress: e.target.value})}
                                     className="bg-slate-50 border-slate-200 resize-none text-sm rounded-xl"
                                   />
                               ) : (
                                   <div className="flex items-start gap-2 text-sm text-slate-700">
                                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                      {therapistData.profile.clinicAddress || 'No address set'}
                                   </div>
                               )}
                           </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Form */}
                <Card className="lg:col-span-8 border-slate-100 shadow-sm rounded-2xl h-fit">
                    <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50">
                        <div>
                           <CardTitle className="text-lg font-bold text-slate-800">Professional Details</CardTitle>
                           <CardDescription>Manage your public profile information</CardDescription>
                        </div>
                        {isEditingProfile ? (
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(false)} className="text-slate-500 rounded-full">Cancel</Button>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-200" onClick={handleSaveProfile}>Save Changes</Button>
                            </div>
                        ) : (
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-100 hover:bg-blue-50 rounded-full" onClick={() => setIsEditingProfile(true)}>
                                <Edit className="w-3.5 h-3.5 mr-2" /> Edit
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
                                label="Years of Experience" 
                                value={isEditingProfile ? editProfileFields.experience : therapistData.profile.experience} 
                                isEditing={isEditingProfile}
                                onChange={(val: string) => setEditProfileFields({...editProfileFields, experience: val})}
                            />
                            <ProfileField 
                                label="Languages Spoken" 
                                value={isEditingProfile ? editProfileFields.languages : therapistData.profile.languages.join(', ')} 
                                isEditing={isEditingProfile}
                                onChange={(val: string) => setEditProfileFields({...editProfileFields, languages: val})}
                                placeholder="English, Hindi, etc."
                            />
                        </div>

                        <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 mt-2">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">Search Visibility</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Control how patients find you</p>
                                </div>
                                <Button variant="outline" size="sm" className="h-8 text-xs bg-white border-slate-200 rounded-full" onClick={() => setIsEditingFilters(!isEditingFilters)}>
                                    <Filter className="w-3 h-3 mr-2" /> {isEditingFilters ? 'Done' : 'Manage Filters'}
                                </Button>
                            </div>
                            
                            {isEditingFilters && (
                                <div className="space-y-4 mb-4 animate-in fade-in slide-in-from-top-1">
                                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                         {PRIMARY_FILTERS.map(f => (
                                             <div key={f.id} 
                                                 onClick={() => {
                                                     const newFilters = filterFields.primaryFilters.includes(f.id) 
                                                         ? filterFields.primaryFilters.filter(id => id !== f.id) 
                                                         : [...filterFields.primaryFilters, f.id];
                                                     setFilterFields({...filterFields, primaryFilters: newFilters});
                                                 }}
                                                 className={`cursor-pointer p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${filterFields.primaryFilters.includes(f.id) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'}`}
                                             >
                                                 <span>{f.icon}</span> {f.label}
                                             </div>
                                         ))}
                                      </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {filterFields.primaryFilters.length > 0 ? (
                                    filterFields.primaryFilters.map(id => {
                                        const label = PRIMARY_FILTERS.find(f => f.id === id)?.label || id;
                                        return <Badge key={id} className="bg-white text-slate-700 border border-slate-200 shadow-sm px-2.5 py-1 rounded-md">{label}</Badge>
                                    })
                                ) : (
                                    !isEditingFilters && <span className="text-xs text-slate-400 italic">No filters active</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
          </TabsContent>

          {/* --- Tab: Settings --- */}
          <TabsContent value="settings" className="space-y-6 animate-in fade-in-50 duration-500">
             <div className="grid md:grid-cols-3 gap-6">
                
                {/* Availability */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-slate-100 shadow-sm rounded-2xl">
                        <CardHeader className="border-b border-slate-50 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" /> Weekly Availability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                             {weeklySlots.map((slot) => (
                                <div key={slot.day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors gap-3">
                                    <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
                                        <div className="flex items-center gap-3">
                                            <Switch checked={slot.enabled} onCheckedChange={(c) => handleWeeklySlotChange(slot.day, 'enabled', c)} />
                                            <span className={`text-sm font-medium ${slot.enabled ? 'text-slate-900' : 'text-slate-400'}`}>{slot.day}</span>
                                        </div>
                                    </div>
                                    
                                    {slot.enabled && (
                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                            <div className="relative">
                                                <Input 
                                                    type="time" 
                                                    value={slot.start} 
                                                    onChange={(e) => handleWeeklySlotChange(slot.day, 'start', e.target.value)}
                                                    className="w-28 h-9 text-xs bg-slate-50 border-slate-200 rounded-lg"
                                                />
                                            </div>
                                            <span className="text-slate-300 text-xs">to</span>
                                            <div className="relative">
                                                <Input 
                                                    type="time" 
                                                    value={slot.end} 
                                                    onChange={(e) => handleWeeklySlotChange(slot.day, 'end', e.target.value)}
                                                    className="w-28 h-9 text-xs bg-slate-50 border-slate-200 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                             ))}
                                                         <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                    <p className="text-sm font-semibold text-slate-800">Unavailability / Vacation</p>
                                                                    <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
                                                                        if (!blockStartDate || !blockEndDate) return;
                                                                        const id = `${Date.now()}`;
                                                                        setUnavailability(prev => [...prev, { id, startDate: blockStartDate, endDate: blockEndDate, time: blockAllDay ? 'ALL_DAY' : (blockTime || '09:00'), note: blockNote, allDay: blockAllDay }]);
                                                                        setBlockStartDate(''); setBlockEndDate(''); setBlockTime(''); setBlockNote(''); setBlockAllDay(true);
                                                                    }}>Add</Button>
                                                                </div>
                                                                <div className="flex gap-2 flex-wrap mb-3">
                                                                    <Button type="button" size="sm" variant="secondary" className="h-7 text-xs" onClick={() => {
                                                                        const today = new Date().toISOString().split('T')[0];
                                                                        setBlockStartDate(today);
                                                                        setBlockEndDate(today);
                                                                        setBlockAllDay(false);
                                                                        setBlockTime('14:00');
                                                                        setBlockNote('');
                                                                    }}>Quick: 1 hour today</Button>
                                                                    <Button type="button" size="sm" variant="secondary" className="h-7 text-xs" onClick={() => {
                                                                        const today = new Date().toISOString().split('T')[0];
                                                                        setBlockStartDate(today);
                                                                        setBlockEndDate(today);
                                                                        setBlockAllDay(true);
                                                                        setBlockTime('');
                                                                        setBlockNote('');
                                                                    }}>Quick: Full day today</Button>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                                    <Input type="date" value={blockStartDate} onChange={(e) => setBlockStartDate(e.target.value)} className="h-9 text-sm border-blue-100" placeholder="Start date" />
                                                                    <Input type="date" value={blockEndDate} onChange={(e) => setBlockEndDate(e.target.value)} className="h-9 text-sm border-blue-100" placeholder="End date" />
                                                                    <div className="flex items-center gap-2">
                                                                        <Switch checked={blockAllDay} onCheckedChange={setBlockAllDay} />
                                                                        <span className="text-xs text-slate-600">All day</span>
                                                                    </div>
                                                                    {!blockAllDay && (
                                                                        <Input type="time" value={blockTime} onChange={(e) => setBlockTime(e.target.value)} className="h-9 text-sm border-blue-100" placeholder="Time slot" />
                                                                    )}
                                                                    <Input placeholder="Note (optional)" value={blockNote} onChange={(e) => setBlockNote(e.target.value)} className="h-9 text-sm border-blue-100 sm:col-span-2 lg:col-span-4" />
                                                                </div>
                                                                <div className="space-y-2 max-h-40 overflow-auto">
                                                                    {unavailability.length === 0 && <p className="text-xs text-slate-500">No blocks added. Use quick buttons or manually set dates above.</p>}
                                                                    {unavailability.map(item => (
                                                                        <div key={item.id} className="flex items-center justify-between text-xs bg-white border border-blue-100 rounded-lg px-3 py-2">
                                                                            <div>
                                                                                <div className="font-semibold text-slate-800">{item.startDate} → {item.endDate}</div>
                                                                                <div className="text-slate-500">{item.allDay ? 'All day' : item.time} {item.note ? `• ${item.note}` : ''}</div>
                                                                            </div>
                                                                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => setUnavailability(prev => prev.filter(u => u.id !== item.id))}>Remove</Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs text-slate-500">💡 Tip: Click "Remove" to reverse any block before saving. For single hour: set same start/end date, turn off "All day", and pick a time.</p>
                                                         </div>
                             <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 rounded-xl py-6" onClick={handleUpdateAvailability}>Save Availability Schedule</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Options */}
                <div className="space-y-6">
                    <Card className="border-slate-100 shadow-sm rounded-2xl">
                        <CardHeader className="pb-4">
                             <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Video className="w-4 h-4 text-blue-600" /> Service Modes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {[{id:'video',label:'Video'},{id:'audio',label:'Audio'},{id:'home',label:'Home Visit'}].map(opt => {
                                    const active = serviceTypes.includes(opt.id);
                                    return (
                                        <Button
                                            key={opt.id}
                                            type="button"
                                            variant={active ? 'default' : 'outline'}
                                            className={`w-full justify-center rounded-xl ${active ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                            onClick={() => {
                                                setServiceTypes(prev => prev.includes(opt.id) ? prev.filter(v => v !== opt.id) : [...prev, opt.id]);
                                            }}
                                        >
                                            {opt.label}
                                        </Button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-slate-500">Choose all modes you offer. These drive pricing and booking options.</p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-100 shadow-sm rounded-2xl">
                        <CardHeader className="pb-4">
                             <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" /> Consultation Fees
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {['video','audio','home'].map(mode => (
                              <div key={mode} className="space-y-2">
                                <Label className="text-xs uppercase text-slate-500">{mode === 'home' ? 'Home Visit' : mode.charAt(0).toUpperCase()+mode.slice(1)}</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
                                  <Input
                                    type="number"
                                    value={pricing[mode as 'video'|'audio'|'home'] || 0}
                                    onChange={e => setPricing(prev => ({ ...prev, [mode]: Number(e.target.value) }))}
                                    className="pl-7 text-lg font-bold h-11 border-slate-200 rounded-xl"
                                  />
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center justify-between text-sm text-slate-500 px-1">
                                <span>Default Session Duration</span>
                                <span className="font-medium text-slate-700">{duration} mins</span>
                            </div>
                            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl" onClick={handleUpdateServiceOptions}>
                                Update Rates
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm rounded-2xl">
                         <CardHeader className="pb-4">
                             <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Bell className="w-4 h-4 text-purple-600" /> Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-slate-700" htmlFor="email-notif">Email Alerts</Label>
                                <Switch id="email-notif" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                            </div>
                            <Separator className="bg-slate-100" />
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-slate-700" htmlFor="sms-notif">SMS Alerts</Label>
                                <Switch id="sms-notif" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
             </div>
          </TabsContent>

          {/* --- Tab: Appointments --- */}
          <TabsContent value="appointments" className="space-y-6 animate-in fade-in-50 duration-500">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800">Schedule</h2>
                <div className="flex items-center gap-2">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                         <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                             <DatePicker 
                                 value={selectedDate}
                                 onChange={(v: Date | null) => setSelectedDate(v ?? new Date())}
                                 slotProps={{ textField: { size: 'small', variant: 'standard', sx: { px: 2, py: 1, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:after': { borderBottom: 'none' } } } }}
                             />
                         </div>
                    </LocalizationProvider>
                    <Button variant="outline" size="icon" onClick={refreshData} className="border-slate-200 text-slate-500 bg-white">
                       <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
             </div>

             {/* Today's High Priority */}
             {todaySessions.length > 0 && (
                <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 uppercase tracking-wider px-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        Starting Soon
                   </div>
                   {todaySessions.map(session => (
                        <div key={session.id} className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl shadow-sm shadow-blue-100 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                            <div className="flex items-center gap-4 w-full sm:w-auto pl-2">
                                <Avatar className="h-12 w-12 border-2 border-blue-50">
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{session.patientName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{session.patientName}</h4>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{formatTime(session.startTime)}</span>
                                        <span className="capitalize">{session.sessionType}</span>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-200 pl-4 pr-6">
                                <Video className="w-4 h-4 mr-2" /> Join Session
                            </Button>
                        </div>
                    ))}
                </div>
             )}

             {/* Appointment List */}
             <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                    <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> Appointments for {formatDate(selectedDate)}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {scheduledSessions.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium">No sessions scheduled</h3>
                            <p className="text-slate-500 text-sm mt-1">Enjoy your free time!</p>
                        </div>
                    ) : (
                        <div>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="w-[30%] pl-6">Patient</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {scheduledSessions.map((s) => (
                                            <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/50">
                                                <TableCell className="pl-6 font-medium text-slate-900">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">{s.patientName[0]}</AvatarFallback>
                                                        </Avatar>
                                                        {s.patientName}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-medium">
                                                    {formatTime(s.startTime)}
                                                </TableCell>
                                                <TableCell><Badge variant="outline" className="capitalize font-normal text-slate-500 bg-white">{s.sessionType}</Badge></TableCell>
                                                <TableCell>
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-transparent font-medium hover:bg-emerald-100 shadow-none">Confirmed</Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50">Details</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {scheduledSessions.map((s) => (
                                    <div key={s.id} className="p-4 bg-white active:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-slate-100">
                                                    <AvatarFallback className="bg-slate-50 text-slate-600 font-bold">{s.patientName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">{s.patientName}</h4>
                                                    <p className="text-xs text-slate-500 capitalize">{s.sessionType} Session</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px]">Confirmed</Badge>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between border border-slate-100">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                {formatTime(s.startTime)}
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
             </Card>
          </TabsContent>

          {/* --- Tab: Verification --- */}
          <TabsContent value="verification" className="animate-in fade-in-50 duration-500">
             <Card className="rounded-2xl border-slate-100 shadow-sm max-w-2xl mx-auto">
                <CardHeader className="text-center pb-8 pt-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl">Verification Status</CardTitle>
                    <CardDescription>Complete these steps to activate your profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-8 pb-8">
                    {['Identity (KYC)', 'Degree Certificate', 'Medical License'].map((step, i) => (
                        <div key={step} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white hover:border-blue-200 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${i === 0 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                    {i === 0 ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs font-bold">{i+1}</span>}
                                </div>
                                <span className={i === 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}>{step}</span>
                            </div>
                            <Button variant="ghost" size="sm" className={i === 0 ? "text-green-600" : "text-blue-600 bg-blue-50 hover:bg-blue-100"}>
                                {i === 0 ? 'Verified' : 'Upload'}
                            </Button>
                        </div>
                    ))}
                </CardContent>
             </Card>
          </TabsContent>

          {/* --- Tab: Support --- */}
          <TabsContent value="support" className="animate-in fade-in-50 duration-500">
             <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group rounded-2xl">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <Mail className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-slate-900">Contact Support</h3>
                        <p className="text-slate-500 text-sm mb-6 px-4">Facing technical issues or have questions about payments? Our team is here to help.</p>
                        <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">Create Ticket</Button>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group rounded-2xl">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                            <FileText className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-slate-900">Knowledge Base</h3>
                        <p className="text-slate-500 text-sm mb-6 px-4">Browse detailed guides on how to manage sessions, payments, and your profile.</p>
                        <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">View Articles</Button>
                    </CardContent>
                </Card>
             </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}

// --- Helper Components (Styled) ---

const StatsCard = ({ title, subtitle, value, icon: Icon, color, loading }: any) => {
    const colors: Record<string, string> = {
        blue: "text-blue-600 bg-blue-50",
        yellow: "text-amber-500 bg-amber-50",
        green: "text-emerald-600 bg-emerald-50",
        indigo: "text-indigo-600 bg-indigo-50",
    };
    const colorClass = colors[color] || colors.blue;

    return (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl group cursor-default bg-white">
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-200" /> : value}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{title}</p>
                    <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );
};

const TabItem = ({ value, icon: Icon, label }: any) => (
    <TabsTrigger 
        value={value} 
        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 hover:text-slate-800 transition-all mx-1"
    >
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold tracking-wide">{label}</span>
    </TabsTrigger>
);

const ProfileField = ({ label, value, isEditing, onChange, type = 'text', options = [], placeholder = '' }: any) => (
    <div className="space-y-1.5 group">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold group-hover:text-blue-600 transition-colors">{label}</Label>
        {isEditing ? (
            type === 'select' ? (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {options.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            ) : (
                <Input 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    placeholder={placeholder}
                    className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
                />
            )
        ) : (
            <p className="text-base font-medium text-slate-800 py-1 border-b border-transparent">{value || <span className="text-slate-300 italic">Not specified</span>}</p>
        )}
    </div>
);

// Icon for recent activity
function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}