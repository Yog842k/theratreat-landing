"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  _id: string;
  name: string;
  email: string;
  phone: string;
  userProfile?: {
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    medicalHistory?: string;
    allergies?: string;
    currentMedications?: string;
  };
  preferences?: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: string;
      shareHealthData: boolean;
    };
  };
  kycStatus?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserProfilePage() {
  const { user: authUser, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  // Fetch user profile
  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      fetchUserProfile();
    } else if (!authLoading && !isAuthenticated) {
      setError("Please log in to view your profile");
      setLoading(false);
    }
  }, [isAuthenticated, token, authLoading]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('Fetching profile with token:', token ? 'Token present' : 'No token');
      console.log('Auth user:', authUser);
      
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile fetch error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      console.log('Profile data:', data);
      
      if (data.success && data.user) {
        setUser(data.user);
        setFormData(data.user);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      console.log('Testing auth with token:', token);
      const response = await fetch('/api/debug/auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Auth test result:', data);
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Auth test error:', err);
    }
  };

  const handleSave = async () => {
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const keys = field.split('.');
        const newData = { ...prev };
        let current: any = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newData;
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-blue-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <Button 
              onClick={() => window.location.href = '/auth/login'} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-xs text-gray-500 mb-4 bg-gray-100 p-2 rounded">
              <div>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
              <div>Token: {token ? 'Present' : 'Missing'}</div>
              <div>Auth User: {authUser?.name || 'None'}</div>
            </div>
            <div className="space-y-2">
              <Button onClick={fetchUserProfile} className="w-full bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
              <Button onClick={testAuth} variant="outline" className="w-full">
                Test Auth
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                      {getInitials(user?.name || '')}
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
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'Loading...'}</h1>
                  <p className="text-blue-600">{user?.email || ''}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge 
                      variant={user?.kycStatus === 'Verified' ? 'default' : 'secondary'}
                      className={user?.kycStatus === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user?.kycStatus || 'Pending Verification'}
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Member since {new Date(user?.createdAt || '').getFullYear() || 'N/A'}
                    </Badge>
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
                        setFormData(user || {});
                        setError("");
                        setSuccess("");
                      }}
                      className="border-gray-300 hover:bg-gray-50"
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

        {/* Profile Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-blue-100 rounded-xl p-1">
              <TabsTrigger 
                value="personal" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <User className="w-4 h-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger 
                value="health" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <Heart className="w-4 h-4 mr-2" />
                Health Info
              </TabsTrigger>
              <TabsTrigger 
                value="emergency" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <Activity className="w-4 h-4 mr-2" />
                Emergency
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card className="border-blue-100 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                  <CardTitle className="flex items-center text-blue-900">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                      {editing ? (
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="p-3 bg-blue-50 rounded-lg text-gray-800">
                          {user?.name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {user?.email}
                        <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                      {editing ? (
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="p-3 bg-blue-50 rounded-lg text-gray-800 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {user?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob" className="text-gray-700">Date of Birth</Label>
                      {editing ? (
                        <Input
                          id="dob"
                          type="date"
                          value={formData.userProfile?.dateOfBirth || ''}
                          onChange={(e) => handleInputChange('userProfile.dateOfBirth', e.target.value)}
                          className="border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="p-3 bg-blue-50 rounded-lg text-gray-800 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {user?.userProfile?.dateOfBirth || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-gray-700">Gender</Label>
                      {editing ? (
                        <Select
                          value={formData.userProfile?.gender || ''}
                          onValueChange={(value) => handleInputChange('userProfile.gender', value)}
                        >
                          <SelectTrigger className="border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-blue-50 rounded-lg text-gray-800">
                          {user?.userProfile?.gender || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-blue-100" />

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700">Address</Label>
                    {editing ? (
                      <Textarea
                        id="address"
                        value={formData.userProfile?.address || ''}
                        onChange={(e) => handleInputChange('userProfile.address', e.target.value)}
                        className="border-blue-200 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                        placeholder="Enter your complete address"
                      />
                    ) : (
                      <div className="p-3 bg-blue-50 rounded-lg text-gray-800 flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        {user?.userProfile?.address || 'Not provided'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Information Tab */}
            <TabsContent value="health">
              <Card className="border-blue-100 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                  <CardTitle className="flex items-center text-blue-900">
                    <Heart className="w-5 h-5 mr-2" />
                    Health Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="medical-history" className="text-gray-700">Medical History</Label>
                    {editing ? (
                      <Textarea
                        id="medical-history"
                        value={formData.userProfile?.medicalHistory || ''}
                        onChange={(e) => handleInputChange('userProfile.medicalHistory', e.target.value)}
                        className="border-blue-200 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                        placeholder="Please describe your medical history, previous conditions, surgeries, etc."
                      />
                    ) : (
                      <div className="p-4 bg-blue-50 rounded-lg text-gray-800 min-h-[120px]">
                        {user?.userProfile?.medicalHistory || 'No medical history recorded'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies" className="text-gray-700">Allergies</Label>
                    {editing ? (
                      <Textarea
                        id="allergies"
                        value={formData.userProfile?.allergies || ''}
                        onChange={(e) => handleInputChange('userProfile.allergies', e.target.value)}
                        className="border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="List any known allergies (medications, food, environmental, etc.)"
                      />
                    ) : (
                      <div className="p-3 bg-blue-50 rounded-lg text-gray-800">
                        {user?.userProfile?.allergies || 'No known allergies'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications" className="text-gray-700">Current Medications</Label>
                    {editing ? (
                      <Textarea
                        id="medications"
                        value={formData.userProfile?.currentMedications || ''}
                        onChange={(e) => handleInputChange('userProfile.currentMedications', e.target.value)}
                        className="border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="List current medications with dosage and frequency"
                      />
                    ) : (
                      <div className="p-3 bg-blue-50 rounded-lg text-gray-800">
                        {user?.userProfile?.currentMedications || 'No current medications'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emergency Contact Tab */}
            <TabsContent value="emergency">
              <Card className="border-blue-100 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                  <CardTitle className="flex items-center text-blue-900">
                    <Activity className="w-5 h-5 mr-2" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergency-name" className="text-gray-700">Contact Name</Label>
                      {editing ? (
                        <Input
                          id="emergency-name"
                          value={formData.userProfile?.emergencyContact?.name || ''}
                          onChange={(e) => handleInputChange('userProfile.emergencyContact.name', e.target.value)}
                          className="border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Full name of emergency contact"
                        />
                      ) : (
                        <div className="p-3 bg-blue-50 rounded-lg text-gray-800">
                          {user?.userProfile?.emergencyContact?.name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency-phone" className="text-gray-700">Contact Phone</Label>
                      {editing ? (
                        <Input
                          id="emergency-phone"
                          value={formData.userProfile?.emergencyContact?.phone || ''}
                          onChange={(e) => handleInputChange('userProfile.emergencyContact.phone', e.target.value)}
                          className="border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Emergency contact phone number"
                        />
                      ) : (
                        <div className="p-3 bg-blue-50 rounded-lg text-gray-800">
                          {user?.userProfile?.emergencyContact?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="emergency-relationship" className="text-gray-700">Relationship</Label>
                      {editing ? (
                        <Input
                          id="emergency-relationship"
                          value={formData.userProfile?.emergencyContact?.relationship || ''}
                          onChange={(e) => handleInputChange('userProfile.emergencyContact.relationship', e.target.value)}
                          className="border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Relationship to emergency contact (e.g., spouse, parent, sibling)"
                        />
                      ) : (
                        <div className="p-3 bg-blue-50 rounded-lg text-gray-800">
                          {user?.userProfile?.emergencyContact?.relationship || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card className="border-blue-100 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                  <CardTitle className="flex items-center text-blue-900">
                    <Settings className="w-5 h-5 mr-2" />
                    Account Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Bell className="w-4 h-4 mr-2" />
                      Notification Preferences
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Email Notifications</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {user?.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">SMS Notifications</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {user?.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-blue-100" />

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Privacy Settings
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Profile Visibility</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {user?.preferences?.privacy?.profileVisibility || 'Private'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Share Health Data</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {user?.preferences?.privacy?.shareHealthData ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-blue-100" />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Account Settings</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Manage your account security and preferences.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-100">
                        Change Password
                      </Button>
                      <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-100">
                        Two-Factor Auth
                      </Button>
                      <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-100">
                        Download Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
