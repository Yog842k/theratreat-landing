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
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/components/auth/NewAuthContext";

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

  // Profile Content Component (updated to match desired UI)
  const ProfileContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-therabook-primary">Profile Information</h2>
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
              className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-therabook-primary hover:bg-therabook-primary/90 text-therabook-primary-foreground"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => setEditing(true)}
            className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-therabook-border">
          <CardHeader className="bg-therabook-muted">
            <CardTitle className="flex items-center gap-2 text-therabook-primary">
              <User className="w-5 h-5" />
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
        <Card className="border-therabook-border">
          <CardHeader className="bg-therabook-muted">
            <CardTitle className="flex items-center gap-2 text-therabook-primary">
              <Heart className="w-5 h-5" />
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

  // Placeholder components for other sections
  const AppointmentsContent = () => (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Calendar className="w-5 h-5 mr-2" />
          My Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">No appointments scheduled.</p>
      </CardContent>
    </Card>
  );

  const SelfTestsContent = () => (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Activity className="w-5 h-5 mr-2" />
          My Self Tests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">No self tests completed yet.</p>
      </CardContent>
    </Card>
  );

  const PaymentsContent = () => (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">No payment history available.</p>
      </CardContent>
    </Card>
  );

  const OrdersContent = () => (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <ShoppingCart className="w-5 h-5 mr-2" />
          My Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">No orders found.</p>
      </CardContent>
    </Card>
  );

  const LearningContent = () => (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <BookOpen className="w-5 h-5 mr-2" />
          Learning Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">No learning content available.</p>
      </CardContent>
    </Card>
  );

  const HelpContent = () => (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <HelpCircle className="w-5 h-5 mr-2" />
          Help & Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Contact support for assistance.</p>
      </CardContent>
    </Card>
  );

  const SettingsContent = () => (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Settings className="w-5 h-5 mr-2" />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Bell className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Shield className="w-4 h-4 mr-2" />
            Privacy Settings
          </Button>
        </div>
      </CardContent>
    </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-blue-100">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-900">{user.name || 'Your Profile'}</h1>
                  <p className="text-blue-600">{user.email}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    {user.phone && (
                      <div className="flex items-center text-sm text-blue-700">
                        <Phone className="w-4 h-4 mr-1" />
                        {user.phone}
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center text-sm text-blue-700">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.address}
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
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
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
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
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
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-blue-100 shadow-sm bg-white sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-blue-900">Menu</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 ${
                          activeTab === item.key
                            ? 'bg-blue-600 text-white border-r-4 border-blue-700'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 ${
                          activeTab === item.key ? 'text-white' : 'text-blue-500'
                        }`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
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
