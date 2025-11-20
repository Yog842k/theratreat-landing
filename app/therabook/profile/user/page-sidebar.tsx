"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
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
  Shield,
  Heart,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Settings,
  Bell,
  Lock,
  CreditCard,
  ShoppingCart,
  BookOpen,
  HelpCircle,
  Video,
  Eye
} from "lucide-react";
import { useAuth } from "@/components/auth/NewAuthContext";
import Link from "next/link";

interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userProfile?: {
    // Personal Information
    dateOfBirth?: string;
    gender?: string;
    age?: string;
    address?: string;
    
    // Location
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
    
    // Preferences
  preferredLanguage?: string;
  preferredLanguages?: string[];
    seekingTherapy?: string;
    preferredTherapistGender?: string;
    preferredTimeSlots?: string[];
    
    // Health Information
    reasonForTherapy?: string;
    diagnosedConditions?: string;
    previousTherapyExperience?: string;
    currentMedications?: string;
    disabilitySupport?: string;
    
    // Emergency Contact
    emergencyContact?: {
      name?: string;
      phone?: string;
      relationship?: string;
    };
    
    // Consents
    consents?: {
      smsEmail?: boolean;
      terms?: boolean;
      informationAccuracy?: boolean;
      responsibleUse?: boolean;
      emergencyDisclaimer?: boolean;
    };
    
    // Status
    onboardingCompleted?: boolean;
  };
  
  // Legacy fields for backward compatibility
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  occupation?: string;
  profilePicture?: string;
  bloodType?: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export default function UserProfilePage() {
  const { user: authUser, token } = useAuth();
  
  // Debug authentication state
  useEffect(() => {
    console.log('🔐 Auth Debug:', {
      authUser,
      token: token ? `${token.substring(0, 20)}...` : null,
      hasToken: !!token,
      localStorage: {
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        user: typeof window !== 'undefined' ? localStorage.getItem('user') : null
      }
    });
  }, [authUser, token]);
  
  // State management
  const [user, setUser] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Appointments state
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Sidebar navigation items
  const sidebarItems = [
    { key: "profile", label: "Profile", icon: User },
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "self-tests", label: "My Self Tests", icon: Activity },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "learning", label: "Learning", icon: BookOpen },
    { key: "help", label: "Help & Support", icon: HelpCircle },
    { key: "settings", label: "Settings", icon: Settings }
  ];

  // Utility function to get user initials
  const getInitials = (name: string = "") => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Fetch bookings for appointments tab
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
      console.log('✅ Loaded bookings:', bookingsList.length);
    } catch (e: any) {
      console.error('❌ Error fetching bookings:', e);
      setBookingsError(e.message || 'Failed to load appointments');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch bookings when appointments tab is active
  useEffect(() => {
    if (activeTab === 'appointments' && token) {
      fetchBookings();
    }
  }, [activeTab, token]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!token) {
      setError("No authentication token found");
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
        const msg = payload?.message || 'Failed to fetch profile';
        throw new Error(msg);
      }

      // Support both shapes:
      // 1) { success, data: { user: {...} } } (ResponseUtils.success)
      // 2) { success, user: {...} } (direct NextResponse.json)
      const extractedUser = (payload?.user)
        ?? (payload?.data?.user)
        ?? (payload?.data && !Array.isArray(payload.data) && typeof payload.data === 'object' ? payload.data : null);

      console.log('👤 Profile Data (parsed):', { payload, extractedUser });
      setUser(extractedUser || {});
      setFormData(extractedUser || {});
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Load profile on component mount
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setError("Please log in to view your profile");
      setLoading(false);
    }
  }, [token]);

  // Handle form submission
  const handleSave = async () => {
    if (!token) {
      setError("No authentication token found");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      setSuccess("Profile updated successfully!");
      setEditing(false);
      await fetchUserProfile(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !user.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Profile Not Found</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helpers to update nested userProfile fields and format view values
  const setUserProfileField = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      userProfile: {
        ...(prev?.userProfile || {}),
        [key]: value,
      },
    }));
  };

  const displayAddress = () => {
    const up = user.userProfile || {} as any;
    const parts = [up.address, up.city, up.state, up.pinCode].filter(Boolean);
    const rest = [up.country].filter(Boolean);
    return parts.length > 0 || rest.length > 0 ? `${parts.join(', ')}${rest.length ? (parts.length ? ', ' : '') + rest.join(', ') : ''}` : 'Not provided';
  };

  // Enhanced Profile Content Component
  const ProfileContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Profile Information</h2>
          <p className="text-gray-500">Manage your personal details and preferences</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditing(false);
                setFormData(user);
                setError("");
                setSuccess("");
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => setEditing(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                {editing ? (
                  <Input 
                    value={(formData.name as string) || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-therabook-border focus:ring-therabook-primary"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{user.name || 'Not provided'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                {editing ? (
                  <Input 
                    type="email"
                    value={(formData.email as string) || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-therabook-border focus:ring-therabook-primary" 
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{user.email || 'Not provided'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                {editing ? (
                  <Input 
                    value={(formData.phone as string) || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-therabook-border focus:ring-therabook-primary" 
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{user.phone || 'Not provided'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                {editing ? (
                  <Input 
                    value={((formData as any)?.userProfile?.gender) ?? (user.userProfile?.gender || '')}
                    onChange={(e) => setUserProfileField('gender', e.target.value)}
                    className="border-therabook-border focus:ring-therabook-primary" 
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{user.userProfile?.gender || 'Not specified'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                {editing ? (
                  <Input 
                    type="date"
                    value={((formData as any)?.userProfile?.dateOfBirth) ?? (user.userProfile?.dateOfBirth || '')}
                    onChange={(e) => setUserProfileField('dateOfBirth', e.target.value)}
                    className="border-therabook-border focus:ring-therabook-primary" 
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{user.userProfile?.dateOfBirth || 'Not specified'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>KYC Status</Label>
                <div className="flex items-center gap-2">
                  <Badge className={user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    View Documents
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              {editing ? (
                <Textarea 
                  value={((formData as any)?.userProfile?.address) ?? (user.userProfile?.address || '')}
                  onChange={(e) => setUserProfileField('address', e.target.value)}
                  className="border-therabook-border focus:ring-therabook-primary" 
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{displayAddress()}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              Health Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Concern / Diagnosis</Label>
              {editing ? (
                <Textarea 
                  value={((formData as any)?.userProfile?.reasonForTherapy) ?? (user.userProfile?.reasonForTherapy || '')}
                  onChange={(e) => setUserProfileField('reasonForTherapy', e.target.value)}
                  className="border-therabook-border focus:ring-therabook-primary" 
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{user.userProfile?.reasonForTherapy || 'Not provided'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{user.userProfile?.age ? `${user.userProfile.age} years` : 'Not specified'}</p>
              </div>
              <div className="space-y-2">
                <Label>Preferred Languages</Label>
                {editing ? (
                  <div className="grid grid-cols-2 gap-2">
                    {['English','Hindi','Marathi','Tamil','Telugu','Bengali','Gujarati','Kannada','Malayalam','Punjabi','Urdu'].map((lang) => {
                      const current = ((formData as any)?.userProfile?.preferredLanguages) 
                        ?? (user.userProfile?.preferredLanguages)
                        ?? (user.userProfile?.preferredLanguage ? [user.userProfile.preferredLanguage] : []);
                      const checked = current.includes(lang);
                      return (
                        <label key={lang} className="flex items-center gap-2 p-2 border rounded-md border-therabook-border">
                          <input
                            type="checkbox"
                            className="accent-therabook-primary"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(current);
                              if (e.target.checked) next.add(lang); else next.delete(lang);
                              setUserProfileField('preferredLanguages', Array.from(next));
                              // For backward compatibility, also set singular preferredLanguage to first selected
                              const first = Array.from(next)[0] || '';
                              setUserProfileField('preferredLanguage', first);
                            }}
                          />
                          <span className="text-sm">{lang}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const list = user.userProfile?.preferredLanguages
                        ?? (user.userProfile?.preferredLanguage ? [user.userProfile.preferredLanguage] : []);
                      return list.length ? list.map((l) => (
                        <Badge key={l} className="bg-therabook-secondary text-therabook-primary border-therabook-border" variant="outline">{l}</Badge>
                      )) : <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">Not specified</p>;
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              {editing ? (
                <Input 
                  placeholder="Emergency contact number"
                  value={((formData as any)?.userProfile?.emergencyContact?.phone) ?? (user.userProfile?.emergencyContact?.phone || '')}
                  onChange={(e) => setUserProfileField('emergencyContact', {
                    ...(formData as any)?.userProfile?.emergencyContact || user.userProfile?.emergencyContact || {},
                    phone: e.target.value,
                  })}
                  className="border-therabook-border focus:ring-therabook-primary" 
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{user.userProfile?.emergencyContact?.phone || 'Not specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Appointments section with actual data
  const AppointmentsContent = () => {
    const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status || ''));
    const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status || ''));
    
    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return dateStr;
      }
    };
    
    const formatTime = (timeStr: string) => {
      if (!timeStr) return '';
      // Handle both "HH:MM" and "HH:MM AM/PM" formats
      if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
      try {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      } catch {
        return timeStr;
      }
    };

    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center text-gray-800 text-2xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
          My Appointments
        </CardTitle>
      </CardHeader>
          <CardContent className="p-6">
            {bookingsLoading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading appointments...</p>
              </div>
            )}
            
            {bookingsError && !bookingsLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 mb-4 font-medium">{bookingsError}</p>
                <Button onClick={fetchBookings} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Retry
                </Button>
              </div>
            )}
            
            {!bookingsLoading && !bookingsError && bookings.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-gray-600 font-medium text-lg">No appointments scheduled.</p>
                <p className="text-gray-500 text-sm mt-2">Book your first session to get started!</p>
              </div>
            )}

            {!bookingsLoading && !bookingsError && bookings.length > 0 && (
              <div className="space-y-6">
                {upcoming.length > 0 && (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-800">Upcoming Appointments</h3>
                      <Badge className="ml-3 bg-blue-100 text-blue-700">{upcoming.length}</Badge>
                    </div>
                    <div className="space-y-4">
                      {upcoming.map((booking: any) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-2 border-blue-200 rounded-2xl p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge className={`${booking.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'} shadow-sm`}>
                                  {booking.status || 'pending'}
                                </Badge>
                                {booking.paymentStatus && (
                                  <Badge variant="outline" className={`${booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'} shadow-sm`}>
                                    {booking.paymentStatus}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-bold text-lg text-gray-900 mb-2">
                                {booking.therapist?.name || booking.therapist?.[0]?.name || 'Therapist'}
                              </h4>
                              <div className="space-y-1.5 text-sm text-gray-600">
                                {booking.sessionType && (
                                  <div className="flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-blue-500" />
                                    <span className="capitalize font-medium">{booking.sessionType} Session</span>
                                  </div>
                                )}
                                {booking.appointmentDate && (
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                    <span>{formatDate(booking.appointmentDate)}</span>
                                  </div>
                                )}
                                {booking.appointmentTime && (
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                    <span>{formatTime(booking.appointmentTime)}</span>
                                  </div>
                                )}
                              </div>
                              {booking.totalAmount && (
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                  <p className="text-base font-bold text-blue-700">
                                    ₹{booking.totalAmount}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex flex-col gap-2">
                              {booking.meetingUrl && (
                                <Button 
                                  size="sm" 
                                  onClick={() => window.open(booking.meetingUrl, '_blank')}
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Join
                                </Button>
                              )}
                              <Link href={`/therabook/therapists/${booking.therapistId || booking.therapistProfileId || 'unknown'}/book/confirmation?bookingId=${booking._id}`}>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50 shadow-sm"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {past.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center mb-4">
                      <div className="h-1 w-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-700">Past Appointments</h3>
                      <Badge className="ml-3 bg-gray-100 text-gray-700">{past.length}</Badge>
                    </div>
                    <div className="space-y-4">
                      {past.map((booking: any) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge className={`${booking.status === 'completed' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} shadow-sm`}>
                                  {booking.status === 'completed' ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Completed
                                    </>
                                  ) : (
                                    booking.status || 'unknown'
                                  )}
                                </Badge>
                              </div>
                              <h4 className="font-bold text-lg text-gray-900 mb-2">
                                {booking.therapist?.name || booking.therapist?.[0]?.name || 'Therapist'}
                              </h4>
                              <div className="space-y-1.5 text-sm text-gray-600">
                                {booking.sessionType && (
                                  <div className="flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="capitalize font-medium">{booking.sessionType} Session</span>
                                  </div>
                                )}
                                {booking.appointmentDate && (
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                    <span>{formatDate(booking.appointmentDate)}</span>
                                  </div>
                                )}
                                {booking.appointmentTime && (
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                    <span>{formatTime(booking.appointmentTime)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <Link href={`/therabook/therapists/${booking.therapistId || booking.therapistProfileId || 'unknown'}/book/confirmation?bookingId=${booking._id}`}>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
      </CardContent>
    </Card>
      </div>
  );
  };

  const SelfTestsContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center text-gray-800 text-2xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mr-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
          My Self Tests
        </CardTitle>
      </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Self Tests Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Take self-assessment tests to better understand your mental health and track your progress over time.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              <Activity className="w-4 h-4 mr-2" />
              Explore Self Tests
            </Button>
          </div>
      </CardContent>
    </Card>
    </div>
  );

  const PaymentsContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center text-gray-800 text-2xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          Payment History
        </CardTitle>
      </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Payment History</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your payment transactions will appear here once you complete a booking and payment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">₹0</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
    </div>
  );

  const OrdersContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
          <CardTitle className="flex items-center text-gray-800 text-2xl">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg mr-3">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          My Orders
        </CardTitle>
      </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your product and service orders will be displayed here once you make a purchase.
            </p>
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </div>
      </CardContent>
    </Card>
    </div>
  );

  const LearningContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
          <CardTitle className="flex items-center text-gray-800 text-2xl">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg mr-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          Learning Resources
        </CardTitle>
      </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Learning Center</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Access articles, guides, and resources to support your mental health journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all"
              >
                <BookOpen className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
                <h4 className="font-bold text-gray-800 mb-2">Articles</h4>
                <p className="text-sm text-gray-600">Read expert articles</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all"
              >
                <Activity className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
                <h4 className="font-bold text-gray-800 mb-2">Guides</h4>
                <p className="text-sm text-gray-600">Step-by-step guides</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all"
              >
                <Video className="w-8 h-8 text-green-600 mb-3 mx-auto" />
                <h4 className="font-bold text-gray-800 mb-2">Videos</h4>
                <p className="text-sm text-gray-600">Watch tutorials</p>
              </motion.div>
            </div>
          </div>
      </CardContent>
    </Card>
    </div>
  );

  const HelpContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
          <CardTitle className="flex items-center text-gray-800 text-2xl">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg mr-3">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
          Help & Support
        </CardTitle>
      </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">FAQs</h4>
                  <p className="text-sm text-gray-600 mb-4">Find answers to common questions</p>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                    View FAQs
                  </Button>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-4">Get help via email</p>
                  <Button size="sm" variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
                    Contact Us
                  </Button>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Phone Support</h4>
                  <p className="text-sm text-gray-600 mb-4">Call us for immediate help</p>
                  <p className="text-sm font-semibold text-purple-600">+91 1800-XXX-XXXX</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 hover:border-orange-400 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Live Chat</h4>
                  <p className="text-sm text-gray-600 mb-4">Chat with our support team</p>
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    Start Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h4 className="font-bold text-gray-800 mb-2">Need Immediate Help?</h4>
            <p className="text-sm text-gray-600 mb-4">
              If you're experiencing a mental health emergency, please contact your local emergency services or a crisis helpline immediately.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-red-100 text-red-700">Emergency: 112</Badge>
              <Badge className="bg-blue-100 text-blue-700">Crisis Helpline: 1800-XXX-XXXX</Badge>
            </div>
          </div>
      </CardContent>
    </Card>
    </div>
  );

  const SettingsContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <CardTitle className="flex items-center text-gray-800 text-2xl">
            <div className="p-2 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg mr-3">
              <Settings className="w-6 h-6 text-white" />
            </div>
          Account Settings
        </CardTitle>
      </CardHeader>
        <CardContent className="p-6">
        <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all"
            >
              <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
                <div className="flex items-center w-full">
                  <div className="p-2 bg-blue-500 rounded-lg mr-4">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-800">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
          </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all"
            >
              <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
                <div className="flex items-center w-full">
                  <div className="p-2 bg-purple-500 rounded-lg mr-4">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-800">Notification Settings</h4>
                    <p className="text-sm text-gray-600">Manage your notification preferences</p>
                  </div>
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
          </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all"
            >
              <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
                <div className="flex items-center w-full">
                  <div className="p-2 bg-green-500 rounded-lg mr-4">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-800">Privacy Settings</h4>
                    <p className="text-sm text-gray-600">Control your privacy and data</p>
                  </div>
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 hover:border-orange-400 cursor-pointer transition-all"
            >
              <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
                <div className="flex items-center w-full">
                  <div className="p-2 bg-orange-500 rounded-lg mr-4">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-800">Account Preferences</h4>
                    <p className="text-sm text-gray-600">Customize your account settings</p>
                  </div>
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
              </Button>
            </motion.div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <h4 className="font-bold text-red-800 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Danger Zone
            </h4>
            <p className="text-sm text-red-600 mb-4">Irreversible and destructive actions</p>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );

  // Show authentication error if not logged in
  if (!loading && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <CardTitle className="text-red-600">Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Please log in to continue.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/auth/login'}
                className="w-full"
              >
                Go to Login
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    // Create test user and auto-login
                    const response = await fetch('/api/auth/create-test-user');
                    const data = await response.json();
                    
                    if (data.success) {
                      console.log('Test user created/found:', data);
                      // Auto-login with test user
                      localStorage.setItem('token', data.token);
                      localStorage.setItem('user', JSON.stringify(data.user));
                      window.location.reload();
                    } else {
                      console.error('Failed to create test user:', data);
                    }
                  } catch (error) {
                    console.error('Test user error:', error);
                  }
                }}
                className="w-full text-xs"
              >
                Create Test User & Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-white/10 backdrop-blur-sm p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <Avatar className="w-24 h-24 border-4 border-white/90 shadow-xl relative z-10">
                    <AvatarImage src={user.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <Button
                      size="sm"
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-blue-600 shadow-lg border-2 border-blue-200 p-0 z-20"
                    >
                        <Camera className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-1 drop-shadow-sm">{user.name || 'Your Profile'}</h1>
                    <p className="text-blue-100 mb-3">{user.email}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                    {user.phone && (
                        <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="font-medium">{user.phone}</span>
                      </div>
                    )}
                    {user.address && (
                        <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="font-medium truncate max-w-xs">{user.address}</span>
                      </div>
                    )}
                      {user.isVerified && (
                        <div className="flex items-center bg-green-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Verified</span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {editing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditing(false);
                        setFormData(user);
                        setError("");
                        setSuccess("");
                      }}
                        className="bg-white/90 hover:bg-white text-gray-700 border-0 shadow-lg backdrop-blur-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                        className="bg-white hover:bg-gray-50 text-blue-600 shadow-lg backdrop-blur-sm font-semibold"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setEditing(true)}
                      className="bg-white hover:bg-gray-50 text-blue-600 shadow-lg backdrop-blur-sm font-semibold"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-6 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-xl font-bold text-gray-800">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {sidebarItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <motion.button
                        key={item.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center px-4 py-3.5 text-left transition-all duration-300 rounded-xl group ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-[1.02]'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 hover:shadow-md'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${
                          isActive ? 'text-white scale-110' : 'text-blue-500 group-hover:scale-110'
                        }`} />
                        <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'}`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute right-2 w-2 h-2 bg-white rounded-full"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {activeTab === "profile" && <ProfileContent />}
            {activeTab === "appointments" && <AppointmentsContent />}
            {activeTab === "self-tests" && <SelfTestsContent />}
            {activeTab === "payments" && <PaymentsContent />}
            {activeTab === "orders" && <OrdersContent />}
            {activeTab === "learning" && <LearningContent />}
            {activeTab === "help" && <HelpContent />}
            {activeTab === "settings" && <SettingsContent />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
