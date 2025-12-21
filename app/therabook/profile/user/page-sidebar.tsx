"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/NewAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit3,
  Save,
  X,
  Camera,
  LogOut,
  CreditCard,
  ShoppingCart,
  BookOpen,
  HelpCircle,
  Settings,
  Activity,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Video,
  Eye,
  Shield,
  Bell,
  Lock
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility for Tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types (Preserved from original) ---
interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
  isVerified?: boolean;
  profilePicture?: string;
  createdAt?: string;
  userProfile?: {
    dateOfBirth?: string;
    gender?: string;
    age?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
    preferredLanguage?: string;
    preferredLanguages?: string[];
    reasonForTherapy?: string;
    emergencyContact?: {
      name?: string;
      phone?: string;
      relationship?: string;
    };
  };
}

export default function UserProfilePage() {
  const { user: authUser, token } = useAuth();
  
  // --- Original State Management ---
  const [user, setUser] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Bookings State
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState("profile");
  
  // --- Fetch User Profile (Original Logic) ---
  const fetchUserProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const payload = await response.json();

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || 'Failed to fetch profile');
      }

      const extractedUser = (payload?.user)
        ?? (payload?.data?.user)
        ?? (payload?.data && !Array.isArray(payload.data) && typeof payload.data === 'object' ? payload.data : null);

      setUser(extractedUser || {});
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Bookings (Original Logic) ---
  const fetchBookings = async () => {
    if (!token) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const res = await fetch('/api/bookings?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load bookings');
      }
      const json = await res.json();
      const bookingsList = json?.data?.bookings || [];
      setBookings(bookingsList);
    } catch (e: any) {
      setBookingsError(e.message || 'Failed to load appointments');
    } finally {
      setBookingsLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (token) fetchUserProfile();
    else setLoading(false);
  }, [token]);

  useEffect(() => {
    if (activeTab === 'appointments' && token) {
      fetchBookings();
    }
  }, [activeTab, token]);


  // --- Helper to update profile (Original Logic) ---
  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!token) return;
    try {
      setError("");
      setSuccess("");
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      setSuccess("Profile updated successfully!");
      await fetchUserProfile(); // Refresh
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      return false;
    }
  };

  // --- Render Loading/Auth States ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-500 mb-6">You need to be logged in to access your profile.</p>
          <Link href="/auth/login" className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "profile", label: "Overview", icon: LayoutDashboard },
    { key: "personal", label: "Personal Info", icon: User },
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "self-tests", label: "Self Tests", icon: Activity },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "learning", label: "Learning", icon: BookOpen },
    { key: "help", label: "Support", icon: HelpCircle },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-10">
      
      {/* --- Header --- */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <span className="font-bold text-lg tracking-tight text-slate-800">TheraTreat</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-semibold text-slate-900">{user.name || "User"}</p>
                 <p className="text-xs text-slate-500">{user.email}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm overflow-hidden">
                 {user.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : (user.name?.[0] || "U").toUpperCase()}
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Layout --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Alerts */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
        )}
        {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> {success}
            </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    activeTab === item.key 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", activeTab === item.key ? "text-indigo-100" : "text-slate-400")} />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "profile" && <OverviewTab user={user} setActiveTab={setActiveTab} />}
                  
                  {activeTab === "personal" && (
                    <PersonalInfoTab 
                        user={user} 
                        onSave={handleUpdateProfile} 
                    />
                  )}
                  
                  {activeTab === "appointments" && (
                    <AppointmentsTab 
                        bookings={bookings} 
                        loading={bookingsLoading} 
                        error={bookingsError} 
                        fetchBookings={fetchBookings} 
                    />
                  )}
                  
                  {activeTab === "self-tests" && <SelfTestsTab token={token} />}
                  {activeTab === "payments" && <PlaceholderTab title="Payment History" icon={CreditCard} desc="Your transactions will appear here." />}
                  {activeTab === "orders" && <PlaceholderTab title="My Orders" icon={ShoppingCart} desc="Your product orders will appear here." />}
                  {activeTab === "learning" && <LearningTab />}
                  {activeTab === "help" && <HelpTab />}
                  {activeTab === "settings" && <SettingsTab />}
                </motion.div>
             </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 pb-safe z-40 flex justify-around items-center shadow-lg">
         {navItems.slice(0, 5).map((item) => (
           <button
             key={item.key}
             onClick={() => setActiveTab(item.key)}
             className={cn(
               "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
               activeTab === item.key ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
             )}
           >
             <item.icon className={cn("w-6 h-6", activeTab === item.key && "fill-indigo-100")} />
             <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
           </button>
         ))}
      </div>

    </div>
  );
}

// ------------------------------------------------------------------
// --- TABS & COMPONENTS
// ------------------------------------------------------------------

// 1. Overview Tab
function OverviewTab({ user, setActiveTab }: { user: UserProfile, setActiveTab: (t: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-indigo-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user.name?.split(' ')[0]}! 👋</h1>
            <p className="text-indigo-100 max-w-md">Your mental health journey is important. Track your progress and manage your sessions here.</p>
          </div>
          <div className="hidden md:block bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
             <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
           <button onClick={() => setActiveTab('appointments')} className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors">
             Book Session
           </button>
           <button onClick={() => setActiveTab('self-tests')} className="px-5 py-2.5 bg-indigo-500/50 text-white border border-white/20 rounded-xl font-semibold text-sm hover:bg-indigo-500/70 transition-colors">
             Take Self Test
           </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-2"><Calendar className="text-indigo-600 w-5 h-5" /> <span className="font-semibold text-slate-600">Appointments</span></div>
           <p className="text-2xl font-bold text-slate-900">0</p>
           <p className="text-xs text-slate-400">Upcoming sessions</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-2"><CheckCircle2 className="text-green-600 w-5 h-5" /> <span className="font-semibold text-slate-600">Completed</span></div>
           <p className="text-2xl font-bold text-slate-900">0</p>
           <p className="text-xs text-slate-400">Total sessions</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-2"><Activity className="text-pink-600 w-5 h-5" /> <span className="font-semibold text-slate-600">Tests</span></div>
           <p className="text-2xl font-bold text-slate-900">--</p>
           <p className="text-xs text-slate-400">Last Score</p>
        </div>
      </div>
    </div>
  );
}

// 2. Personal Info Tab (With original FormData logic)
function PersonalInfoTab({ user, onSave }: { user: UserProfile, onSave: (d: Partial<UserProfile>) => Promise<boolean | undefined> }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setFormData(user); }, [user]);

  // Helper to update nested userProfile fields
  const setUserProfileField = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      userProfile: {
        ...(prev.userProfile || {}),
        [key]: value,
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);
    if (success) setEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
           <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
           <p className="text-sm text-slate-500">Manage your private details</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setFormData(user); }} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-70">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        )}
      </div>
      
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
         {/* Top Section */}
         <InputGroup label="Full Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} disabled={!editing} />
         <InputGroup label="Email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} disabled={!editing} />
         <InputGroup label="Phone Number" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} disabled={!editing} />
         
         <InputGroup 
            label="Gender" 
            value={formData.userProfile?.gender} 
            onChange={(v: string) => setUserProfileField('gender', v)} 
            disabled={!editing} 
         />
         <InputGroup 
            label="Date of Birth" 
            type="date"
            value={formData.userProfile?.dateOfBirth} 
            onChange={(v: string) => setUserProfileField('dateOfBirth', v)} 
            disabled={!editing} 
         />

         {/* Address Area */}
         <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
             <textarea 
                disabled={!editing}
                value={formData.userProfile?.address || ''}
                onChange={e => setUserProfileField('address', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                rows={2}
             />
         </div>

         {/* Languages - Implementing original Checkbox Logic */}
         <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Languages</label>
            {editing ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['English','Hindi','Marathi','Tamil','Telugu','Bengali','Gujarati','Kannada'].map((lang) => {
                        const current = formData.userProfile?.preferredLanguages || [];
                        const checked = current.includes(lang);
                        return (
                            <label key={lang} className="flex items-center gap-2 p-2 border rounded-lg border-slate-200 cursor-pointer hover:bg-slate-50">
                                <input 
                                    type="checkbox" 
                                    className="accent-indigo-600 rounded"
                                    checked={checked}
                                    onChange={(e) => {
                                        const next = new Set(current);
                                        if (e.target.checked) next.add(lang); else next.delete(lang);
                                        setUserProfileField('preferredLanguages', Array.from(next));
                                    }}
                                />
                                <span className="text-sm text-slate-700">{lang}</span>
                            </label>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {(formData.userProfile?.preferredLanguages?.length ? formData.userProfile.preferredLanguages : ['Not specified']).map(l => (
                        <span key={l} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">{l}</span>
                    ))}
                </div>
            )}
         </div>

         <div className="md:col-span-2 pt-6 border-t border-slate-100">
             <h3 className="font-semibold text-slate-900 mb-4">Therapy Preferences</h3>
             <label className="block">
                  <span className="text-sm font-medium text-slate-700 mb-1 block">Reason for Therapy</span>
                  <textarea 
                    disabled={!editing}
                    value={formData.userProfile?.reasonForTherapy || ''}
                    onChange={e => setUserProfileField('reasonForTherapy', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 min-h-[80px]"
                  />
               </label>
         </div>

         <div className="md:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup 
                    label="Contact Name" 
                    value={formData.userProfile?.emergencyContact?.name} 
                    onChange={(v: string) => setUserProfileField('emergencyContact', {...(formData.userProfile?.emergencyContact || {}), name: v})} 
                    disabled={!editing} 
                 />
                 <InputGroup 
                    label="Contact Phone" 
                    value={formData.userProfile?.emergencyContact?.phone} 
                    onChange={(v: string) => setUserProfileField('emergencyContact', {...(formData.userProfile?.emergencyContact || {}), phone: v})} 
                    disabled={!editing} 
                 />
            </div>
         </div>
      </div>
    </div>
  );
}

// 3. Appointments Tab (With original mapping logic)
function AppointmentsTab({ bookings, loading, error, fetchBookings }: any) {
    if (loading) return <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /><p className="text-slate-500 mt-2">Loading appointments...</p></div>;
    if (error) return <div className="text-center py-10 text-red-600"><AlertCircle className="w-8 h-8 mx-auto mb-2"/>{error}<br/><button onClick={fetchBookings} className="text-indigo-600 underline mt-2">Retry</button></div>;
    if (bookings.length === 0) return <PlaceholderTab title="No Appointments" icon={Calendar} desc="Book your first session to get started." />;

    const formatDate = (str: string) => {
        try { return new Date(str).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); } catch { return str; }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">My Appointments</h2>
            <div className="grid gap-4">
                {bookings.map((booking: any) => (
                    <div key={booking._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", booking.status === 'confirmed' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                                    {booking.status || 'Pending'}
                                </span>
                                {booking.paymentStatus === 'paid' && <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Paid</span>}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{booking.therapist?.name || 'Therapist'}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-1">
                                {booking.appointmentDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-indigo-500"/> {formatDate(booking.appointmentDate)}</span>}
                                {booking.appointmentTime && <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-indigo-500"/> {booking.appointmentTime}</span>}
                                {booking.totalAmount && <span className="font-semibold text-slate-900">₹{booking.totalAmount}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {booking.meetingUrl && (
                                <button onClick={() => window.open(booking.meetingUrl, '_blank')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                                    <Video className="w-4 h-4" /> Join
                                </button>
                            )}
                            <Link href={`/therabook/therapists/${booking.therapistId}/book/confirmation?bookingId=${booking._id}`} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <Eye className="w-4 h-4" /> Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 4. Self Tests Tab (With original fetch logic)
function SelfTestsTab({ token }: { token: string | null }) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true); setErr(null);
                const res = await fetch('/api/theraself/results', {
                    cache: 'no-store',
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                const json = await res.json();
                const list = Array.isArray(json) ? json : [];
                list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                setItems(list);
            } catch (e: any) {
                setErr(e.message || 'Failed to load assessments');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token]);

    if (loading) return <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
    if (err) return <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">{err}</div>;
    if (!items.length) return <PlaceholderTab title="No Assessments" icon={Activity} desc="Take a self-assessment to track your progress." />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Self Test Results</h2>
            <div className="grid gap-4">
                {items.map((d: any, idx: number) => {
                    const score = Math.round(Number(d.overallTheraScore || 0) * 10) / 10;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{d.childName || 'Assessment'}</h3>
                                    <p className="text-sm text-slate-500">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Unknown Date'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-indigo-600">{score}</span>
                                    <span className="text-xs text-slate-400">TheraScore</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 mb-4 whitespace-pre-wrap">
                                {d.reportText ? d.reportText.substring(0, 150) + '...' : 'No report summary.'}
                            </div>
                            <button 
                                className="text-sm font-medium text-indigo-600 hover:underline"
                                onClick={() => {
                                    const blob = new Blob([d.reportText || ''], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url; a.download = `Report_${d.childName || 'Child'}.txt`;
                                    a.click(); URL.revokeObjectURL(url);
                                }}
                            >
                                Download Full Report
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// 5. Placeholder / Static Tabs
function PlaceholderTab({ title, icon: Icon, desc }: any) {
  return (
     <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200 border-dashed">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
           {Icon ? <Icon className="w-8 h-8 text-slate-400" /> : <Settings className="w-8 h-8 text-slate-300" />}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 max-w-sm mt-2">{desc || "This section is under development."}</p>
     </div>
  )
}

// 6. Static Content Tabs
function LearningTab() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Learning Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all cursor-pointer">
                    <BookOpen className="w-8 h-8 text-blue-600 mb-4" />
                    <h3 className="font-bold text-slate-900">Articles</h3>
                    <p className="text-sm text-slate-600 mt-1">Expert mental health guides.</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 hover:shadow-md transition-all cursor-pointer">
                    <Video className="w-8 h-8 text-purple-600 mb-4" />
                    <h3 className="font-bold text-slate-900">Videos</h3>
                    <p className="text-sm text-slate-600 mt-1">Guided sessions & tutorials.</p>
                </div>
            </div>
        </div>
    )
}

function HelpTab() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Help & Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <HelpCircle className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="font-bold text-slate-900 mb-2">FAQs</h3>
                    <p className="text-sm text-slate-500 mb-4">Common questions about therapy sessions.</p>
                    <button className="text-sm font-medium text-indigo-600 hover:underline">View FAQs</button>
                </div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="font-bold text-red-900 mb-2">Crisis Support</h3>
                    <p className="text-sm text-red-700 mb-4">If this is an emergency, contact local services immediately.</p>
                    <span className="inline-block px-3 py-1 bg-white rounded-md text-xs font-bold text-red-600 border border-red-200">Helpline: 112</span>
                </div>
            </div>
        </div>
    )
}

function SettingsTab() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 text-left">
                    <div className="p-2 bg-slate-100 rounded-lg"><Lock className="w-5 h-5 text-slate-600"/></div>
                    <div><h4 className="font-medium text-slate-900">Change Password</h4><p className="text-xs text-slate-500">Update your security</p></div>
                </button>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 text-left">
                    <div className="p-2 bg-slate-100 rounded-lg"><Bell className="w-5 h-5 text-slate-600"/></div>
                    <div><h4 className="font-medium text-slate-900">Notifications</h4><p className="text-xs text-slate-500">Email & SMS preferences</p></div>
                </button>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 text-left">
                    <div className="p-2 bg-slate-100 rounded-lg"><Shield className="w-5 h-5 text-slate-600"/></div>
                    <div><h4 className="font-medium text-slate-900">Privacy</h4><p className="text-xs text-slate-500">Data usage settings</p></div>
                </button>
            </div>
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <h4 className="font-bold text-red-800 text-sm mb-1">Delete Account</h4>
                <p className="text-xs text-red-600 mb-3">Irreversible action.</p>
                <button className="text-xs font-semibold text-white bg-red-600 px-3 py-1.5 rounded hover:bg-red-700">Delete</button>
            </div>
        </div>
    )
}

function InputGroup({ label, value, onChange, type = "text", disabled }: any) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 mb-1 block">{label}</span>
      <input 
        type={type}
        disabled={disabled}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-300"
      />
    </label>
  )
}