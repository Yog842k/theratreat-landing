import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, User, Calendar, Stethoscope, CreditCard, FileBarChart, Shield, MapPin, Settings, ChevronRight, Search, Bell, LogOut, Plus, Filter, Check, X, DollarSign } from "lucide-react";
import { Activity } from "lucide-react";
import { useAuth } from "@/components/auth/NewAuthContext";
import { useRouter } from "next/navigation";
import OverviewSection from "./clinic-dashboard/OverviewSection";
import ProfileSection from "./clinic-dashboard/ProfileSection";
import AppointmentsSection from "./clinic-dashboard/AppointmentsSection";
import ComplianceSection from "./clinic-dashboard/ComplianceSection";
import LocationSection from "./clinic-dashboard/LocationSection";
import PaymentsSection from "./clinic-dashboard/PaymentsSection";
import ReportsSection from "./clinic-dashboard/ReportsSection";
import SettingsSection from "./clinic-dashboard/SettingsSection";
import TherapistsSection from "./clinic-dashboard/TherapistsSection";

const sidebarItems = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "profile", label: "Clinic Profile", icon: User },
  { key: "appointments", label: "Appointments", icon: Calendar },
  { key: "therapists", label: "Therapists", icon: Stethoscope },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "reports", label: "Reports", icon: FileBarChart },
  { key: "compliance", label: "Compliance", icon: Shield },
  { key: "location", label: "Location", icon: MapPin },
  { key: "settings", label: "Settings", icon: Settings },
];



interface ClinicData {
  clinic: {
    _id: string;
    name: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    owner?: {
      name: string;
      email: string;
    };
    [key: string]: any;
  };
  metrics: {
    monthlyBookings: number;
    revenue: number;
    therapists: number;
    rating: number;
    totalReviews: number;
    completionScore: number;
    pendingPayments: number;
  };
  therapists: any[];
  recentBookings: any[];
  notifications: any[];
}

export default function ClinicDashboard() {
  const [section, setSection] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    if (token) {
      fetchClinicData();
    }
  }, [token]);

  const fetchClinicData = async () => {
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/clinics/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        setClinicData(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to load clinic data');
      }
    } catch (err: any) {
      console.error('Error fetching clinic data:', err);
      setError(err.message || 'Failed to load clinic data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clinic data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchClinicData} className="bg-blue-600 hover:bg-blue-700">
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (!clinicData) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">No clinic data available</p>
        </div>
      );
    }

    switch(section) {
      case "overview":
        return <OverviewSection clinicData={clinicData} />;
      case "profile":
        return <ProfileSection clinicData={clinicData} />;
      case "appointments":
        return <AppointmentsSection clinicData={clinicData} />;
      case "therapists":
        return <TherapistsSection clinicData={clinicData} onRefresh={fetchClinicData} />;
      case "payments":
        return <PaymentsSection clinicData={clinicData} />;
      case "reports":
        return <ReportsSection clinicData={clinicData} />;
      case "compliance":
        return <ComplianceSection clinicData={clinicData} />;
      case "location":
        return <LocationSection clinicData={clinicData} />;
      case "settings":
        return <SettingsSection clinicData={clinicData} />;
      default:
        return <OverviewSection clinicData={clinicData} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b-2 border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  {loading ? 'Loading...' : clinicData?.clinic?.name || 'Clinic Dashboard'}
                </h1>
                <p className="text-sm text-slate-500">
                  {clinicData?.clinic?.city && clinicData?.clinic?.state 
                    ? `${clinicData.clinic.city}, ${clinicData.clinic.state}` 
                    : 'Healthcare Dashboard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64 h-10 border-2 border-blue-200 focus:border-blue-600 rounded-lg"
                />
              </div>
              <Button variant="ghost" className="relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
              </Button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-72 bg-white border-r-2 border-blue-100 min-h-screen p-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
          <div className="space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  section === item.key
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {section === item.key && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t-2 border-blue-100">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full border-2 border-blue-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 font-semibold"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-slate-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

