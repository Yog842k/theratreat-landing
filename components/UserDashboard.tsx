'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import VideoCallDashboard from "./video-call/VideoCallDashboard";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  Bell, 
  Settings, 
  User, 
  CreditCard, 
  ShoppingCart, 
  BookOpen, 
  HelpCircle, 
  LogOut, 
  Edit, 
  Download, 
  Video, 
  Phone, 
  MapPin, 
  Star, 
  Eye, 
  Bookmark, 
  History, 
  MessageSquare, 
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Play,
  FileBarChart,
  Heart,
  Stethoscope,
  Activity,
  Shield,
  Headphones
} from "lucide-react";

type DashboardSection = 
  | "profile" 
  | "appointments" 
  | "video-calls"
  | "self-tests" 
  | "payments" 
  | "orders" 
  | "learning" 
  | "help" 
  | "settings";

const sidebarItems = [
  { key: "profile", label: "Profile", icon: User },
  { key: "appointments", label: "Appointments", icon: Calendar },
  { key: "video-calls", label: "Video Calls", icon: Video },
  { key: "self-tests", label: "My Self Tests", icon: FileBarChart },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "learning", label: "Learning", icon: BookOpen },
  { key: "help", label: "Help & Support", icon: HelpCircle },
  { key: "settings", label: "Settings", icon: Settings }
];

export function UserDashboard() {
  const [activeSection, setActiveSection] = useState<DashboardSection>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Mock data
  const userData = {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+91 98765 43210",
    gender: "Female",
    age: 28,
    dateOfBirth: "1995-06-15",
    preferredLanguage: "English",
    diagnosis: "Anxiety and stress management",
    address: "123 Main St, Mumbai, Maharashtra 400001",
    kycStatus: "Verified"
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-therabook-primary">Profile Information</h2>
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
          className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary"
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {isEditing ? (
                  <Input defaultValue={userData.name} className="border-therabook-border focus:ring-therabook-primary" />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                {isEditing ? (
                  <Input defaultValue={userData.email} className="border-therabook-border focus:ring-therabook-primary" />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                {isEditing ? (
                  <Input defaultValue={userData.phone} className="border-therabook-border focus:ring-therabook-primary" />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                {isEditing ? (
                  <Select defaultValue={userData.gender.toLowerCase()}>
                    <SelectTrigger className="border-therabook-border focus:ring-therabook-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.gender}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                {isEditing ? (
                  <Input type="date" defaultValue={userData.dateOfBirth} className="border-therabook-border focus:ring-therabook-primary" />
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.dateOfBirth}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>KYC Status</Label>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">{userData.kycStatus}</Badge>
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    View Documents
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Address</Label>
              {isEditing ? (
                <Textarea defaultValue={userData.address} className="border-therabook-border focus:ring-therabook-primary" />
              ) : (
                <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.address}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-therabook-border">
          <CardHeader className="bg-therabook-muted">
            <CardTitle className="flex items-center gap-2 text-therabook-primary">
              <Heart className="w-5 h-5" />
              Health Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Diagnosis</Label>
              {isEditing ? (
                <Textarea defaultValue={userData.diagnosis} className="border-therabook-border focus:ring-therabook-primary" />
              ) : (
                <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.diagnosis}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.age} years</p>
              </div>
              <div className="space-y-2">
                <Label>Preferred Language</Label>
                {isEditing ? (
                  <Select defaultValue={userData.preferredLanguage.toLowerCase()}>
                    <SelectTrigger className="border-therabook-border focus:ring-therabook-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="tamil">Tamil</SelectItem>
                      <SelectItem value="telugu">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">{userData.preferredLanguage}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              {isEditing ? (
                <Input placeholder="Emergency contact number" className="border-therabook-border focus:ring-therabook-primary" />
              ) : (
                <p className="text-sm py-2 px-3 bg-therabook-muted rounded-md">+91 98765 43211</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditing && (
        <div className="flex gap-2">
          <Button className="bg-therabook-primary hover:bg-therabook-primary/90 text-therabook-primary-foreground">Save Changes</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)} className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">Cancel</Button>
        </div>
      )}
    </div>
  );

  const renderAppointmentsSection = () => (
    <div className="space-y-6">
      <h2 className="text-therabook-primary">Appointments</h2>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-therabook-muted">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-therabook-primary data-[state=active]:text-therabook-primary-foreground">Upcoming</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-therabook-primary data-[state=active]:text-therabook-primary-foreground">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <Card className="border-therabook-border">
            <CardHeader className="bg-therabook-muted">
              <CardTitle className="text-therabook-primary">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Today's Appointment */}
              <div className="p-4 bg-therabook-secondary border border-therabook-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-therabook-primary">Therapy Session - Dr. Sarah Wilson</h4>
                    <p className="text-sm text-therabook-primary/80">Today, 2:00 PM - 3:00 PM</p>
                    <p className="text-sm text-therabook-primary/70">Video Consultation</p>
                  </div>
                  <Badge className="bg-therabook-accent text-therabook-primary">Today</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-therabook-primary hover:bg-therabook-primary/90 text-therabook-primary-foreground"
                    onClick={() => router.push('/video-call/lobby?bookingId=booking-123&userRole=client&userId=demo-client-1')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Therapist
                  </Button>
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                </div>
              </div>

              {/* Future Appointments */}
              <div className="p-4 border border-therabook-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">Physical Therapy - Dr. Mike Chen</h4>
                    <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM - 11:00 AM</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      In-Person (Clinic A, Room 204)
                    </p>
                  </div>
                  <Badge variant="outline" className="border-therabook-border text-therabook-primary">Tomorrow</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="border-therabook-border">
            <CardHeader className="bg-therabook-muted">
              <CardTitle className="text-therabook-primary">Past Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-therabook-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">Therapy Session - Dr. Sarah Wilson</h4>
                    <p className="text-sm text-muted-foreground">Feb 6, 2025 • 2:00 PM - 3:00 PM</p>
                    <p className="text-sm text-muted-foreground">Video Consultation</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    <FileText className="w-4 h-4 mr-2" />
                    Session Notes
                  </Button>
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Receipt
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border border-therabook-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">Initial Assessment - Dr. Priya Sharma</h4>
                    <p className="text-sm text-muted-foreground">Jan 30, 2025 • 11:00 AM - 12:00 PM</p>
                    <p className="text-sm text-muted-foreground">In-Person (Clinic B, Room 105)</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    <FileText className="w-4 h-4 mr-2" />
                    Assessment Report
                  </Button>
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderSelfTestsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-theraself-primary">My Self Tests</h2>
        <Button className="bg-theraself-primary hover:bg-theraself-primary/90 text-theraself-primary-foreground">
          <FileBarChart className="w-4 h-4 mr-2" />
          Take New Assessment
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-theraself-border">
          <CardHeader className="bg-theraself-muted">
            <CardTitle className="text-theraself-primary">Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-theraself-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">Anxiety Assessment (GAD-7)</h4>
                  <p className="text-sm text-muted-foreground">Completed: Feb 8, 2025</p>
                  <p className="text-sm text-green-600">Score: 12/21 (Moderate Anxiety)</p>
                </div>
                <Badge variant="outline" className="border-theraself-border text-theraself-primary">Latest</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Therapist Notes:</strong> "Patient showing improvement in anxiety management. 
                  Continue with current coping strategies and mindfulness exercises."
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-theraself-border text-theraself-primary hover:bg-theraself-secondary">
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                  <Button size="sm" variant="outline" className="border-theraself-border text-theraself-primary hover:bg-theraself-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border border-theraself-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">Depression Screening (PHQ-9)</h4>
                  <p className="text-sm text-muted-foreground">Completed: Jan 25, 2025</p>
                  <p className="text-sm text-blue-600">Score: 8/27 (Mild Depression)</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Therapist Notes:</strong> "Baseline assessment completed. 
                  Recommend regular therapy sessions and lifestyle modifications."
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-theraself-border text-theraself-primary hover:bg-theraself-secondary">
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                  <Button size="sm" variant="outline" className="border-theraself-border text-theraself-primary hover:bg-theraself-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-theraself-border">
          <CardHeader className="bg-theraself-muted">
            <CardTitle className="text-theraself-primary">Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Anxiety Levels</span>
                  <span className="text-sm text-muted-foreground">Improving ↓</span>
                </div>
                <Progress value={65} className="h-2 bg-theraself-secondary [&>div]:bg-theraself-primary" />
                <p className="text-xs text-muted-foreground mt-1">
                  35% reduction from initial assessment
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Stress Management</span>
                  <span className="text-sm text-muted-foreground">Stable →</span>
                </div>
                <Progress value={75} className="h-2 bg-theraself-secondary [&>div]:bg-theraself-primary" />
                <p className="text-xs text-muted-foreground mt-1">
                  Maintaining good coping strategies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPaymentsSection = () => (
    <div className="space-y-6">
      <h2 className="text-therabook-primary">Payments</h2>
      
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="bg-therabook-muted">
          <TabsTrigger value="history" className="data-[state=active]:bg-therabook-primary data-[state=active]:text-therabook-primary-foreground">Payment History</TabsTrigger>
          <TabsTrigger value="methods" className="data-[state=active]:bg-therabook-primary data-[state=active]:text-therabook-primary-foreground">Saved Methods</TabsTrigger>
          <TabsTrigger value="refunds" className="data-[state=active]:bg-therabook-primary data-[state=active]:text-therabook-primary-foreground">Refunds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="border-therabook-border">
            <CardHeader className="bg-therabook-muted">
              <CardTitle className="text-therabook-primary">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-therabook-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Therapy Session Payment</h4>
                    <p className="text-sm text-muted-foreground">Feb 8, 2025 • Dr. Sarah Wilson</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹2,500</p>
                    <Badge variant="outline" className="text-green-600">Paid</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Invoice
                  </Button>
                  <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="methods" className="space-y-4">
          <Card className="border-therabook-border">
            <CardHeader className="bg-therabook-muted">
              <CardTitle className="text-therabook-primary">Saved Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-therabook-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/27</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Primary</Badge>
                    <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">Remove</Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                <CreditCard className="w-4 h-4 mr-2" />
                Add New Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="refunds" className="space-y-4">
          <Card className="border-therabook-border">
            <CardHeader className="bg-therabook-muted">
              <CardTitle className="text-therabook-primary">Refunds & Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No refund requests found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderOrdersSection = () => (
    <div className="space-y-6">
      <h2 className="text-therastore-primary">Orders</h2>
      
      <Card className="border-therastore-border">
        <CardHeader className="bg-therastore-muted">
          <CardTitle className="text-therastore-primary">Course & Webinar Purchases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-therastore-border rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium">Mindfulness Mastery Course</h4>
                <p className="text-sm text-muted-foreground">Ordered: Jan 28, 2025</p>
                <p className="text-sm text-muted-foreground">8 modules • 12 hours</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹4,999</p>
                <Badge className="bg-therastore-primary text-therastore-primary-foreground">Active</Badge>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2 bg-therastore-secondary [&>div]:bg-therastore-primary" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-therastore-primary hover:bg-therastore-primary/90 text-therastore-primary-foreground">
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
              <Button size="sm" variant="outline" className="border-therastore-border text-therastore-primary hover:bg-therastore-secondary">
                <Download className="w-4 h-4 mr-2" />
                Certificate
              </Button>
            </div>
          </div>

          <div className="p-4 border border-therastore-border rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium">Stress Management Webinar</h4>
                <p className="text-sm text-muted-foreground">Ordered: Jan 15, 2025</p>
                <p className="text-sm text-muted-foreground">Live session + Recording</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹1,499</p>
                <Badge variant="outline">Completed</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-therastore-border text-therastore-primary hover:bg-therastore-secondary">
                <Play className="w-4 h-4 mr-2" />
                Watch Recording
              </Button>
              <Button size="sm" variant="outline" className="border-therastore-border text-therastore-primary hover:bg-therastore-secondary">
                <Download className="w-4 h-4 mr-2" />
                Materials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLearningSection = () => (
    <div className="space-y-6">
      <h2 className="text-theralearn-primary">Learning Progress</h2>
      
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="bg-theralearn-muted">
          <TabsTrigger value="videos" className="data-[state=active]:bg-theralearn-primary data-[state=active]:text-theralearn-primary-foreground">Videos</TabsTrigger>
          <TabsTrigger value="articles" className="data-[state=active]:bg-theralearn-primary data-[state=active]:text-theralearn-primary-foreground">Articles</TabsTrigger>
          <TabsTrigger value="bookmarks" className="data-[state=active]:bg-theralearn-primary data-[state=active]:text-theralearn-primary-foreground">Bookmarks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="space-y-4">
          <Card className="border-theralearn-border">
            <CardHeader className="bg-theralearn-muted">
              <CardTitle className="text-theralearn-primary">Recently Watched</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-theralearn-border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-12 bg-theralearn-secondary rounded flex items-center justify-center">
                    <Play className="w-4 h-4 text-theralearn-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Managing Anxiety Through Breathing</h4>
                    <p className="text-sm text-muted-foreground">Dr. Priya Sharma • 15 mins</p>
                    <div className="mt-2">
                      <Progress value={75} className="h-1 bg-theralearn-secondary [&>div]:bg-theralearn-primary" />
                      <p className="text-xs text-muted-foreground mt-1">75% completed</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-theralearn-primary hover:bg-theralearn-primary/90 text-theralearn-primary-foreground">
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card className="border-theralearn-border">
            <CardHeader className="bg-theralearn-muted">
              <CardTitle className="text-theralearn-primary">Reading List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-theralearn-border rounded-lg">
                  <h4 className="font-medium">Understanding Depression: A Complete Guide</h4>
                  <p className="text-sm text-muted-foreground">By Dr. Rajesh Kumar • 8 min read</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="border-theralearn-border text-theralearn-primary hover:bg-theralearn-secondary">
                      <Eye className="w-4 h-4 mr-2" />
                      Read
                    </Button>
                    <Button size="sm" variant="outline" className="border-theralearn-border text-theralearn-primary hover:bg-theralearn-secondary">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          <Card className="border-theralearn-border">
            <CardHeader className="bg-theralearn-muted">
              <CardTitle className="text-theralearn-primary">Bookmarked Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bookmarks yet</p>
                <Button size="sm" variant="outline" className="mt-2 border-theralearn-border text-theralearn-primary hover:bg-theralearn-secondary">
                  Browse Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderHelpSection = () => (
    <div className="space-y-6">
      <h2 className="text-therabook-primary">Help & Support</h2>
      
      <div className="grid gap-6">
        <Card className="border-therabook-border">
          <CardHeader className="bg-therabook-muted">
            <CardTitle className="flex items-center gap-2 text-therabook-primary">
              <HelpCircle className="w-5 h-5" />
              Quick Help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                <div className="flex items-center gap-2 w-full">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Chat Support</span>
                </div>
                <span className="text-sm text-muted-foreground mt-1">Get instant help from our team</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                <div className="flex items-center gap-2 w-full">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Call Support</span>
                </div>
                <span className="text-sm text-muted-foreground mt-1">Speak with our support team</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                <div className="flex items-center gap-2 w-full">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">FAQ</span>
                </div>
                <span className="text-sm text-muted-foreground mt-1">Find answers to common questions</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                <div className="flex items-center gap-2 w-full">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">User Guide</span>
                </div>
                <span className="text-sm text-muted-foreground mt-1">Learn how to use TheaPheap</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-therabook-border">
          <CardHeader className="bg-therabook-muted">
            <CardTitle className="text-therabook-primary">Recent Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-therabook-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Payment Issue</h4>
                    <p className="text-sm text-muted-foreground">Ticket #12345 • Feb 8, 2025</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Payment was processed successfully after verification.
                </p>
              </div>
              
              <div className="p-4 border border-therabook-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Appointment Rescheduling</h4>
                    <p className="text-sm text-muted-foreground">Ticket #12344 • Feb 6, 2025</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Working with therapist to find new available slot.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <h2 className="text-therabook-primary">Settings</h2>
      
      <div className="grid gap-6">
        <Card className="border-therabook-border">
          <CardHeader className="bg-therabook-muted">
            <CardTitle className="flex items-center gap-2 text-therabook-primary">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified before your appointments</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Assessment Results</Label>
                <p className="text-sm text-muted-foreground">Receive notifications when results are ready</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Marketing Updates</Label>
                <p className="text-sm text-muted-foreground">Stay updated with new features and offers</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Learning Progress</Label>
                <p className="text-sm text-muted-foreground">Track your course completion progress</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-therabook-border">
          <CardHeader className="bg-therabook-muted">
            <CardTitle className="flex items-center gap-2 text-therabook-primary">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                Enable
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Data Export</Label>
                <p className="text-sm text-muted-foreground">Download your data</p>
              </div>
              <Button size="sm" variant="outline" className="border-therabook-border text-therabook-primary hover:bg-therabook-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Account Deletion</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account</p>
              </div>
              <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-therabook-border">
          <CardHeader className="bg-therabook-muted">
            <CardTitle className="flex items-center gap-2 text-therabook-primary">
              <Settings className="w-5 h-5" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="english">
                <SelectTrigger className="border-therabook-border focus:ring-therabook-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                  <SelectItem value="telugu">Telugu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select defaultValue="ist">
                <SelectTrigger className="border-therabook-border focus:ring-therabook-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Standard Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch to dark theme</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-therabook-muted border-r border-therabook-border p-6">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key as DashboardSection)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.key
                      ? "bg-therabook-primary text-therabook-primary-foreground"
                      : "text-therabook-primary hover:bg-therabook-secondary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === "profile" && renderProfileSection()}
          {activeSection === "appointments" && renderAppointmentsSection()}
          {activeSection === "video-calls" && (
            <VideoCallDashboard userRole="client" userId="demo-client-1" />
          )}
          {activeSection === "self-tests" && renderSelfTestsSection()}
          {activeSection === "payments" && renderPaymentsSection()}
          {activeSection === "orders" && renderOrdersSection()}
          {activeSection === "learning" && renderLearningSection()}
          {activeSection === "help" && renderHelpSection()}
          {activeSection === "settings" && renderSettingsSection()}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
