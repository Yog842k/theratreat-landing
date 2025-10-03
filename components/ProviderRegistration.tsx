import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Building2, 
  Users, 
  TrendingUp, 
  Shield,
  CheckCircle,
  FileText,
  Calendar
} from "lucide-react";

export function ProviderRegistration() {
  const [registrationType, setRegistrationType] = useState<"therapist" | "clinic">("therapist");

  const benefits = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Expand Your Practice",
      description: "Reach thousands of patients seeking quality care"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      title: "Increase Revenue",
      description: "Grow your income with our patient matching system"
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Insurance Handled",
      description: "We manage billing and insurance verification"
    },
    {
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      title: "Flexible Scheduling",
      description: "Set your availability and manage appointments easily"
    }
  ];

  const requirements = [
    "Valid professional license in your state",
    "Malpractice insurance coverage",
    "Clean background check",
    "Minimum 2 years of clinical experience",
    "Commitment to evidence-based practices"
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">Join Our Network of Providers</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with patients who need your expertise. Join thousands of licensed professionals 
          providing quality care through our platform.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <UserPlus className="w-5 h-5 mr-2" />
            Individual Therapists
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Building2 className="w-5 h-5 mr-2" />
            Clinics & Groups
          </Badge>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-primary">Why Join TheaPheap?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                {benefit.icon}
              </div>
              <h3 className="font-semibold">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Start Your Application</CardTitle>
          <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as "therapist" | "clinic")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="therapist">Register as Therapist</TabsTrigger>
              <TabsTrigger value="clinic">Register as Clinic</TabsTrigger>
            </TabsList>
            
            <TabsContent value="therapist" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number *</Label>
                  <Input id="license" placeholder="Enter your license number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Primary Specialty *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mental-health">Mental Health Counseling</SelectItem>
                      <SelectItem value="physical-therapy">Physical Therapy</SelectItem>
                      <SelectItem value="occupational-therapy">Occupational Therapy</SelectItem>
                      <SelectItem value="speech-therapy">Speech Therapy</SelectItem>
                      <SelectItem value="psychology">Psychology</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10-15">10-15 years</SelectItem>
                      <SelectItem value="15+">15+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryState">Primary State *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
                      ].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Licensed State(s) *</Label>
                  <Input id="state" placeholder="e.g., CA, NY, TX" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about your background, specialties, and approach to treatment..." 
                  rows={4}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="clinic" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name *</Label>
                  <Input id="clinicName" placeholder="Enter clinic name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email *</Label>
                  <Input id="adminEmail" type="email" placeholder="Enter admin email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Phone Number *</Label>
                  <Input id="clinicPhone" placeholder="Enter clinic phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npi">NPI Number *</Label>
                  <Input id="npi" placeholder="Enter NPI number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" placeholder="Enter clinic address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerCount">Number of Providers</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 providers</SelectItem>
                      <SelectItem value="6-15">6-15 providers</SelectItem>
                      <SelectItem value="16-50">16-50 providers</SelectItem>
                      <SelectItem value="50+">50+ providers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicState">State *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
                      ].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicServices">Services Offered</Label>
                <Textarea 
                  id="clinicServices" 
                  placeholder="Describe the services your clinic offers..." 
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Requirements */}
          <div className="bg-muted/50 rounded-lg p-6 mt-8">
            <h3 className="font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Application Requirements
            </h3>
            <ul className="space-y-2">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Terms */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and 
                <a href="#" className="text-primary hover:underline ml-1">Privacy Policy</a>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="background" />
              <Label htmlFor="background" className="text-sm">
                I consent to background check and credential verification
              </Label>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button size="lg" className="flex-1">
              Submit Application
            </Button>
            <Button variant="outline" size="lg">
              Save as Draft
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Process Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-primary">Application Process</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: <FileText className="w-8 h-8" />, title: "Submit Application", desc: "Complete our online form" },
            { icon: <Shield className="w-8 h-8" />, title: "Verification", desc: "We verify credentials & background" },
            { icon: <Users className="w-8 h-8" />, title: "Interview", desc: "Brief video interview with our team" },
            { icon: <CheckCircle className="w-8 h-8" />, title: "Get Started", desc: "Start accepting patients!" }
          ].map((step, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-blue-600">
                {step.icon}
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
