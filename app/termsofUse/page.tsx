"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import { 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Shield,
  Scale,
  Users,
  CreditCard,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  Globe,
  BookOpen,
  Stethoscope,
  Brain,
  ShoppingCart,
  GraduationCap,
  Building2,
  UserCheck,
  Heart,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Star,
  MessageCircle,
  Zap,
  Archive,
  RefreshCw
} from "lucide-react";

type TermsOfUseProps = { setCurrentView?: (view: any) => void };

function TermsOfUse({ setCurrentView }: TermsOfUseProps) {
  const [openSections, setOpenSections] = useState<string[]>(["overview"]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2025";

  const termsSections = [
    {
      id: "overview",
      title: "Platform Overview and Services",
      icon: <Info className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p>
            TheraTreat is a comprehensive healthcare technology platform operated by TheraTreat Technologies Private Limited, 
            providing integrated healthcare services through seven core modules:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-600">TheraBook</h4>
              </div>
              <p className="text-sm">Therapy booking and consultation engine connecting patients with verified healthcare professionals across 35+ specializations.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-purple-600">TheraSelf</h4>
              </div>
              <p className="text-sm">AI-driven self-diagnostic quiz builder and assessment tools for preliminary health screening.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-green-600">TheraStore</h4>
              </div>
              <p className="text-sm">E-commerce platform for therapy equipment, medical devices, wellness products, and health supplements.</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-orange-600">TheraLearn</h4>
              </div>
              <p className="text-sm">Learning and professional development hub offering courses, workshops, and continuing education units (CEUs).</p>
            </div>
          </div>
          <p>
            Additional modules include TheraBlog (health articles and community resources), Admin Panel (platform management), 
            and role-based user dashboards for personalized experiences.
          </p>
        </div>
      )
    },
    {
      id: "user-types",
      title: "User Categories and Account Types",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p>TheraTreat supports multiple user categories, each with specific rights, responsibilities, and access levels:</p>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Patients/Clients
              </h4>
              <p className="text-sm mb-2">Individuals seeking healthcare services through our platform.</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Access to therapy booking and consultations</li>
                <li>• Use of self-assessment tools and AI diagnostics</li>
                <li>• Purchase of healthcare products and equipment</li>
                <li>• Access to educational content and resources</li>
                <li>• Participation in wellness programs and community features</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                Healthcare Professionals (Therapists)
              </h4>
              <p className="text-sm mb-2">Licensed healthcare practitioners providing services through our platform.</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Provide therapy sessions via video, audio, in-clinic, or home visits</li>
                <li>• Manage appointment schedules and availability</li>
                <li>• Access patient management tools and session notes</li>
                <li>• Participate in professional development programs</li>
                <li>• Subject to professional licensing and verification requirements</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-500" />
                Clinics and Healthcare Facilities
              </h4>
              <p className="text-sm mb-2">Healthcare institutions offering services through our platform.</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Manage multiple therapists and practitioners</li>
                <li>• Coordinate facility-based appointments and services</li>
                <li>• Access administrative tools and reporting features</li>
                <li>• Maintain compliance with healthcare regulations</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" />
                Instructors and Students
              </h4>
              <p className="text-sm mb-2">Educational content creators and learners in our learning ecosystem.</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Create and deliver educational courses and workshops</li>
                <li>• Access learning materials and certification programs</li>
                <li>• Participate in continuing education and professional development</li>
                <li>• Engage in peer learning and networking activities</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-purple-500" />
                Sellers and Vendors
              </h4>
              <p className="text-sm mb-2">Businesses and individuals selling healthcare products through TheraStore.</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• List and sell healthcare products and equipment</li>
                <li>• Manage inventory, pricing, and order fulfillment</li>
                <li>• Access seller tools and analytics</li>
                <li>• Comply with product quality and safety standards</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold mb-2 text-yellow-800">Account Verification Requirements</h4>
            <p className="text-sm text-yellow-700">
              All professional users (therapists, instructors, sellers) must complete identity verification, 
              professional credential validation, and background checks. Verification typically takes 5-7 business days.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "service-terms",
      title: "Service-Specific Terms and Conditions",
      icon: <Stethoscope className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {/* TheraBook Terms */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              TheraBook - Therapy Booking and Consultations
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Session Types:</strong> Video consultations, audio calls, in-clinic visits, and home visits.</p>
              <p><strong>Minimum Duration:</strong> 45 minutes for all session types.</p>
              <p><strong>Cancellation Policy:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Video/Audio/In-Clinic: Free cancellation 2+ hours before scheduled time</li>
                <li>• Home Visits: Free cancellation 3+ hours before scheduled time</li>
                <li>• 50% refund if cancelled within cutoff window</li>
                <li>• No refund for no-shows or late cancellations</li>
              </ul>
              <p><strong>Professional Standards:</strong> All therapists must maintain valid licenses and follow established care protocols.</p>
              <p><strong>Emergency Disclaimer:</strong> TheraTreat is not for medical emergencies. Contact emergency services immediately for urgent medical needs.</p>
            </div>
          </div>

          {/* TheraSelf Terms */}
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <h4 className="font-semibold mb-3 text-purple-800 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              TheraSelf - AI Assessment and Self-Diagnostic Tools
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Educational Purpose:</strong> All assessments are for informational and educational purposes only.</p>
              <p><strong>Not Medical Diagnosis:</strong> Results do not constitute professional medical diagnosis, treatment, or advice.</p>
              <p><strong>Professional Consultation Required:</strong> Users must consult qualified healthcare providers for medical concerns.</p>
              <p><strong>Data Usage:</strong> Assessment data may be anonymized and used to improve AI algorithms and platform services.</p>
              <p><strong>Accuracy Limitations:</strong> AI assessments have inherent limitations and should not replace professional judgment.</p>
            </div>
          </div>

          {/* TheraStore Terms */}
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              TheraStore - E-commerce and Product Sales
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Product Listings:</strong> All products undergo quality verification before listing.</p>
              <p><strong>Return Policy:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• 30-day return policy for most items</li>
                <li>• Medical devices: 7-day return window for hygiene reasons</li>
                <li>• Supplements: No returns once opened</li>
                <li>• Original packaging required for all returns</li>
              </ul>
              <p><strong>Shipping:</strong> Standard (5-7 days), Express (2-3 days), Same-day (select cities).</p>
              <p><strong>International Orders:</strong> Available to 25+ countries with customs handling.</p>
              <p><strong>Seller Responsibilities:</strong> Accurate product descriptions, timely fulfillment, customer service.</p>
            </div>
          </div>

          {/* TheraLearn Terms */}
          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <h4 className="font-semibold mb-3 text-orange-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              TheraLearn - Educational Courses and Training
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Course Access:</strong> Lifetime access to purchased courses unless otherwise specified.</p>
              <p><strong>Refund Policy:</strong> Full refund within 7 days if less than 25% of course completed.</p>
              <p><strong>Certificates:</strong> Digital certificates provided upon course completion with blockchain verification.</p>
              <p><strong>CEUs:</strong> Continuing Education Units available for accredited programs.</p>
              <p><strong>Intellectual Property:</strong> Course content protected by copyright; personal use only.</p>
              <p><strong>Instructor Revenue:</strong> 70% revenue share for course creators.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "payments",
      title: "Payment Terms and Billing",
      icon: <CreditCard className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">Accepted Payment Methods</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-gray-50 p-2 rounded text-sm text-center">UPI</div>
            <div className="bg-gray-50 p-2 rounded text-sm text-center">Credit/Debit Cards</div>
            <div className="bg-gray-50 p-2 rounded text-sm text-center">Net Banking</div>
            <div className="bg-gray-50 p-2 rounded text-sm text-center">Digital Wallets</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Commission Structure</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>TheraBook:</strong> 15% platform commission on therapy sessions</li>
              <li>• <strong>TheraStore:</strong> 5-15% commission based on product category</li>
              <li>• <strong>TheraLearn:</strong> 30% platform share, 70% to instructors</li>
            </ul>

            <h4 className="font-semibold">Billing and Invoicing</h4>
            <ul className="space-y-1 text-sm">
              <li>• Auto-generated invoices for all transactions</li>
              <li>• GST compliance with detailed tax breakdowns</li>
              <li>• Download receipts and payment history from dashboard</li>
              <li>• Business invoices available for corporate accounts</li>
            </ul>

            <h4 className="font-semibold">Refund Processing</h4>
            <ul className="space-y-1 text-sm">
              <li>• Refunds processed within 3-5 business days</li>
              <li>• Refunds issued to original payment method</li>
              <li>• Processing fees may apply for payment gateway charges</li>
              <li>• Dispute resolution through customer support</li>
            </ul>

            <h4 className="font-semibold">Professional Payouts</h4>
            <ul className="space-y-1 text-sm">
              <li>• Weekly/bi-weekly payouts to registered bank accounts</li>
              <li>• Minimum payout threshold: ₹500</li>
              <li>• Tax deductions as per Indian regulations</li>
              <li>• Detailed earnings reports and analytics available</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2 text-blue-800">Payment Security</h4>
            <p className="text-sm text-blue-700">
              All payments are secured with 256-bit SSL encryption and PCI DSS compliance. 
              We do not store complete payment card information on our servers.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "privacy-security",
      title: "Data Privacy and Security",
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">Data Protection Framework</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-semibold text-green-800 mb-2">Technical Safeguards</h5>
              <ul className="text-sm space-y-1 text-green-700">
                <li>• 256-bit SSL encryption for all data transmission</li>
                <li>• AES-256 encryption for data at rest</li>
                <li>• Multi-factor authentication for all accounts</li>
                <li>• Regular security audits and penetration testing</li>
                <li>• ISO 27001 certified data centers</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-2">Regulatory Compliance</h5>
              <ul className="text-sm space-y-1 text-blue-700">
                <li>• Digital Personal Data Protection Act (DPDP) 2023</li>
                <li>• GDPR compliance for international users</li>
                <li>• HIPAA-level security for health data</li>
                <li>• Information Technology Act, 2000</li>
                <li>• Medical Council of India guidelines</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold">Data Collection and Usage</h4>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">Personal Information</h5>
              <p className="text-sm">Name, contact details, age, gender, location, payment information, and account preferences.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">Health Information</h5>
              <p className="text-sm">Medical history, assessment results, therapy notes, session recordings (with consent), and health goals.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">Usage Data</h5>
              <p className="text-sm">Platform interactions, session logs, learning progress, search queries, and performance analytics.</p>
            </div>
          </div>

          <h4 className="font-semibold">Data Retention Policy</h4>
          <ul className="space-y-1 text-sm">
            <li>• Patient data: Retained for 5 years post last interaction</li>
            <li>• Therapist data: Retained for 7 years as per professional requirements</li>
            <li>• Payment records: Retained for 7 years for legal compliance</li>
            <li>• Session recordings: Deleted after 1 year unless specifically saved</li>
            <li>• Marketing data: Retained until consent withdrawal</li>
          </ul>

          <h4 className="font-semibold">User Rights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-semibold mb-1">Access Rights</h5>
              <p className="text-sm">Request copies of your personal data</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-semibold mb-1">Rectification</h5>
              <p className="text-sm">Correct inaccurate personal information</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-semibold mb-1">Erasure</h5>
              <p className="text-sm">Request deletion of personal data</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-semibold mb-1">Portability</h5>
              <p className="text-sm">Export data in machine-readable format</p>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold mb-2 text-red-800">Data Breach Protocol</h4>
            <p className="text-sm text-red-700">
              In case of any data security incident, affected users will be notified within 72 hours, 
              and appropriate authorities will be informed as required by law.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "user-responsibilities",
      title: "User Responsibilities and Code of Conduct",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">General User Obligations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-semibold text-green-600">✓ Required Behavior</h5>
              <ul className="text-sm space-y-1">
                <li>• Provide accurate and truthful information</li>
                <li>• Maintain confidentiality of login credentials</li>
                <li>• Respect other users and platform guidelines</li>
                <li>• Use platform for legitimate healthcare purposes</li>
                <li>• Report suspicious or inappropriate behavior</li>
                <li>• Keep contact information updated</li>
                <li>• Honor scheduled appointments and commitments</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-red-600">✗ Prohibited Activities</h5>
              <ul className="text-sm space-y-1">
                <li>• Sharing false or misleading information</li>
                <li>• Harassment, discrimination, or abuse</li>
                <li>• Unauthorized access to others' accounts</li>
                <li>• Commercial spam or unauthorized marketing</li>
                <li>• Violating intellectual property rights</li>
                <li>• Circumventing platform security measures</li>
                <li>• Off-platform transactions or payments</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold">Professional User Standards</h4>
          <div className="space-y-3">
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h5 className="font-semibold text-blue-800 mb-2">Healthcare Professionals</h5>
              <ul className="text-sm space-y-1">
                <li>• Maintain valid professional licenses and certifications</li>
                <li>• Follow established medical ethics and professional standards</li>
                <li>• Obtain informed consent for all treatments and sessions</li>
                <li>• Maintain patient confidentiality and privacy</li>
                <li>• Provide accurate information about qualifications and experience</li>
                <li>• Respond promptly to patient inquiries and emergencies</li>
                <li>• Participate in mandatory continuing education programs</li>
              </ul>
            </div>

            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h5 className="font-semibold text-orange-800 mb-2">Instructors and Educators</h5>
              <ul className="text-sm space-y-1">
                <li>• Provide original, high-quality educational content</li>
                <li>• Ensure accuracy of course materials and information</li>
                <li>• Respond to student questions and provide support</li>
                <li>• Respect intellectual property rights</li>
                <li>• Maintain professional teaching standards</li>
                <li>• Update course content to reflect current best practices</li>
              </ul>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h5 className="font-semibold text-green-800 mb-2">Sellers and Vendors</h5>
              <ul className="text-sm space-y-1">
                <li>• Provide accurate product descriptions and specifications</li>
                <li>• Ensure product quality and safety standards</li>
                <li>• Process orders and handle customer service promptly</li>
                <li>• Comply with applicable regulations and certifications</li>
                <li>• Honor return and refund policies</li>
                <li>• Maintain adequate inventory and fulfillment capabilities</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold">Consequences of Violations</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span><strong>Minor Violations:</strong> Warning, temporary restrictions, or mandatory training</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="w-4 h-4 text-orange-500" />
              <span><strong>Serious Violations:</strong> Account suspension, listing removal, or loss of privileges</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="w-4 h-4 text-red-500" />
              <span><strong>Severe Violations:</strong> Permanent account termination and legal action</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      icon: <Archive className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">Platform Intellectual Property</h4>
          <p className="text-sm">
            TheraTreat owns all intellectual property rights in the platform, including but not limited to:
          </p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• Software code, algorithms, and AI models</li>
            <li>• Platform design, user interfaces, and user experience</li>
            <li>• Trademarks, logos, and brand elements</li>
            <li>• Proprietary assessment tools and methodologies</li>
            <li>• Database structure and compiled user data</li>
            <li>• Documentation, training materials, and help content</li>
          </ul>

          <h4 className="font-semibold">User-Generated Content</h4>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">Content Ownership</h5>
              <p className="text-sm">
                Users retain ownership of original content they create (courses, articles, reviews). 
                By uploading content, users grant TheraTreat a non-exclusive license to use, display, 
                and distribute the content on the platform.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">License Grant</h5>
              <p className="text-sm">
                Users grant TheraTreat worldwide, royalty-free rights to use submitted content for 
                platform operations, marketing, and service improvement, while respecting user privacy settings.
              </p>
            </div>
          </div>

          <h4 className="font-semibold">Third-Party Content</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• Users must respect third-party intellectual property rights</li>
            <li>• Obtain proper licenses for copyrighted materials</li>
            <li>• Report copyright infringement through DMCA procedures</li>
            <li>• TheraTreat responds to legitimate takedown requests</li>
          </ul>

          <h4 className="font-semibold">Professional Credentials and Certifications</h4>
          <p className="text-sm">
            Digital certificates and credentials issued through TheraTreat are protected intellectual property. 
            Unauthorized reproduction, modification, or misrepresentation of credentials is strictly prohibited.
          </p>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold mb-2 text-purple-800">DMCA Compliance</h4>
            <p className="text-sm text-purple-700">
              TheraTreat complies with the Digital Millennium Copyright Act. Copyright holders can submit 
              takedown requests to our designated DMCA agent at legal@theratreat.in.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Limitations of Liability",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <h4 className="font-semibold mb-2 text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Medical Disclaimer
            </h4>
            <div className="text-sm text-red-700 space-y-2">
              <p>
                <strong>TheraTreat is not a medical provider and does not practice medicine.</strong> 
                We are a technology platform that facilitates connections between healthcare professionals and patients.
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Individual healthcare professionals are solely responsible for medical decisions and treatment</li>
                <li>• AI assessments and self-diagnostic tools are for informational purposes only</li>
                <li>• Always consult qualified healthcare providers for medical advice</li>
                <li>• TheraTreat is not suitable for medical emergencies</li>
                <li>• In emergencies, contact local emergency services immediately</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold">Service Availability</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• Platform services provided "as is" without warranties</li>
            <li>• No guarantee of uninterrupted service availability</li>
            <li>• Scheduled maintenance may temporarily affect access</li>
            <li>• Third-party service dependencies may impact functionality</li>
            <li>• Internet connectivity issues may affect user experience</li>
          </ul>

          <h4 className="font-semibold">Limitation of Liability</h4>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">Direct Damages</h5>
              <p className="text-sm">
                TheraTreat's total liability for any claims is limited to the amount paid by the user 
                in the 12 months preceding the claim, not exceeding ₹10,000.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">Indirect Damages</h5>
              <p className="text-sm">
                TheraTreat is not liable for indirect, incidental, consequential, or punitive damages, 
                including loss of profits, data, or business opportunities.
              </p>
            </div>
          </div>

          <h4 className="font-semibold">Third-Party Services</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• Payment gateways and financial service providers</li>
            <li>• Shipping and logistics partners</li>
            <li>• Video conferencing and communication tools</li>
            <li>• Cloud storage and hosting services</li>
            <li>• Analytics and marketing platforms</li>
          </ul>
          <p className="text-sm">
            TheraTreat is not responsible for third-party service failures, data breaches, or policy changes.
          </p>

          <h4 className="font-semibold">Force Majeure</h4>
          <p className="text-sm">
            TheraTreat is not liable for delays or failures due to circumstances beyond reasonable control, 
            including natural disasters, government actions, pandemics, network failures, or other force majeure events.
          </p>
        </div>
      )
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution and Governing Law",
      icon: <Scale className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">Dispute Resolution Process</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h5 className="font-semibold">Direct Communication</h5>
                <p className="text-sm text-gray-600">
                  Users are encouraged to resolve disputes directly through platform messaging or support channels.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h5 className="font-semibold">Formal Complaint</h5>
                <p className="text-sm text-gray-600">
                  Submit formal complaints to disputes@theratreat.in within 7 days of the incident. 
                  Include detailed information and supporting documentation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h5 className="font-semibold">Internal Investigation</h5>
                <p className="text-sm text-gray-600">
                  TheraTreat investigates complaints within 14 business days and provides written resolution decisions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <h5 className="font-semibold">Mediation</h5>
                <p className="text-sm text-gray-600">
                  If internal resolution fails, parties may opt for mediation through recognized mediation centers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <span className="text-blue-600 font-semibold text-sm">5</span>
              </div>
              <div>
                <h5 className="font-semibold">Arbitration</h5>
                <p className="text-sm text-gray-600">
                  Unresolved disputes subject to binding arbitration under the Arbitration and Conciliation Act, 2015.
                </p>
              </div>
            </div>
          </div>

          <h4 className="font-semibold">Governing Law and Jurisdiction</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="text-sm space-y-2">
              <li><strong>Governing Law:</strong> Laws of India, specifically the state of Maharashtra</li>
              <li><strong>Jurisdiction:</strong> Courts of Mumbai, Maharashtra have exclusive jurisdiction</li>
              <li><strong>Language:</strong> All legal proceedings conducted in English</li>
              <li><strong>Arbitration Seat:</strong> Mumbai, Maharashtra, India</li>
              <li><strong>International Users:</strong> Indian law applies regardless of user location</li>
            </ul>
          </div>

          <h4 className="font-semibold">Consumer Protection</h4>
          <div className="space-y-2">
            <p className="text-sm">
              Indian consumers have rights under the Consumer Protection Act, 2019, including:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Right to be heard and seek redressal</li>
              <li>• Access to consumer forums and ombudsman services</li>
              <li>• Protection against unfair trade practices</li>
              <li>• Right to compensation for defective services</li>
            </ul>
          </div>

          <h4 className="font-semibold">Professional Regulatory Bodies</h4>
          <p className="text-sm">
            Healthcare professionals must comply with regulations from relevant councils including 
            Medical Council of India, Indian Association of Physiotherapists, Rehabilitation Council of India, 
            and other professional regulatory bodies.
          </p>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold mb-2 text-yellow-800">Appeals Process</h4>
            <p className="text-sm text-yellow-700">
              Users may appeal dispute resolution decisions within 7 days by emailing appeals@theratreat.in 
              with new evidence or procedural concerns.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "modifications",
      title: "Terms Modification and Contact Information",
      icon: <RefreshCw className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">Terms Modification Policy</h4>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">Notification Process</h5>
              <ul className="text-sm space-y-1">
                <li>• 30-day advance notice for material changes</li>
                <li>• Email notifications to all registered users</li>
                <li>• Platform notifications and banner announcements</li>
                <li>• Updated terms posted on website with effective date</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold mb-2">User Response Options</h5>
              <ul className="text-sm space-y-1">
                <li>• Continued use constitutes acceptance of new terms</li>
                <li>• Users may close accounts before effective date</li>
                <li>• Feedback and concerns can be submitted during notice period</li>
                <li>• Professional users may negotiate specific terms</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold">Version History and Archives</h4>
          <p className="text-sm">
            Previous versions of these terms are archived and available upon request. 
            The current version supersedes all previous versions.
          </p>

          <h4 className="font-semibold">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email Support
                </h5>
                <ul className="text-sm space-y-1">
                  <li>General: support@theratreat.in</li>
                  <li>Legal: legal@theratreat.in</li>
                  <li>Disputes: disputes@theratreat.in</li>
                  <li>Privacy: privacy@theratreat.in</li>
                  <li>Business: business@theratreat.in</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  Phone Support
                </h5>
                <ul className="text-sm space-y-1">
                  <li>Phone/WhatsApp: +91 8446602680</li>
                  <li>Hours: Mon-Sat 9:00 AM - 6:00 PM IST</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Registered Office
                </h5>
                <div className="text-sm">
                  <p>TheraTreat Technologies Private Limited</p>
                  <p>1503/2, Jadhav Nagar, Shikrapur, Shirur, Pune 412208, Maharashtra</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Business Hours
                </h5>
                <ul className="text-sm space-y-1">
                  <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                  <li>Saturday: 10:00 AM - 4:00 PM</li>
                  <li>Sunday: Closed</li>
                  <li>Holidays: As per Indian calendar</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold mb-2 text-green-800">Company Information</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Company Name:</strong> TheraTreat Technologies Private Limited</p>
              <p><strong>CIN:</strong> U72200MH2024PTC[XXXXXX]</p>
              <p><strong>GSTIN:</strong> 27XXXXXXXXXXXXX</p>
              <p><strong>Registration Date:</strong> 2024</p>
              <p><strong>Authorized Capital:</strong> ₹XX,XX,XXX</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen mt-22 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Please read these terms carefully before using TheraTreat platform and services
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Last Updated: {lastUpdated}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-3 h-3 mr-1" />
              Effective: {effectiveDate}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Globe className="w-3 h-3 mr-1" />
              Governed by Indian Law
            </Badge>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-4">
              By accessing or using TheraTreat platform and services, you agree to be bound by these Terms of Use 
              and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/60 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">Multi-User Platform</span>
                </div>
                <p>Serving patients, therapists, clinics, instructors, students, and vendors</p>
              </div>
              <div className="bg-white/60 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold">Healthcare Focused</span>
                </div>
                <p>Specialized platform for healthcare services and wellness solutions</p>
              </div>
              <div className="bg-white/60 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4" />
                  <span className="font-semibold">Legal Compliance</span>
                </div>
                <p>Compliant with Indian healthcare and data protection regulations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6">
          {termsSections.map((section) => (
            <Card key={section.id} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <Collapsible open={openSections.includes(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {section.icon}
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </div>
                      {openSections.includes(section.id) ? 
                        <ChevronUp className="w-5 h-5" /> : 
                        <ChevronDown className="w-5 h-5" />
                      }
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.content}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50" onClick={() => setCurrentView?.("policies")}>
            <FileText className="w-4 h-4" />
            Privacy Policy
          </Button>
          <Button className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50" onClick={() => setCurrentView?.("help")}>
            <MessageCircle className="w-4 h-4" />
            Help Center
          </Button>
          <Button className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50">
            <Share2 className="w-4 h-4" />
            Share Terms
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          <p>
            These terms constitute a legally binding agreement between you and TheraTreat Technologies Private Limited. 
            For questions or concerns, contact us at <strong>legal@theratreat.in</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// Next.js page export
export default function TermsOfUsePage() {
  return <TermsOfUse setCurrentView={() => {}} />;
}