import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Theratreat</h3>
            <p className="text-blue-100 leading-relaxed">
              Your comprehensive healthcare ecosystem - connecting patients with providers, enabling self-care, facilitating learning, and providing access to quality Therapy equipment.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-100">
                <Phone className="w-4 h-4" />
                <span>+91 8446602680</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Mail className="w-4 h-4" />
                <span>support@theratreat.in</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <MapPin className="w-4 h-4" />
                <span>1503/2, Jadhav Nagar, Shikrapur, Shirur, Pune 412208, Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="font-semibold mb-4">Core Modules</h4>
            <ul className="space-y-2">
              <li><Link href="/book" className="text-blue-100 hover:text-white transition">TheraBook - Consultations</Link></li>
              <li><Link href="/self-test" className="text-blue-100 hover:text-white transition">TheraSelf - Assessments</Link></li>
              <li><Link href="/store" className="text-blue-100 hover:text-white transition">TheraStore - Equipment</Link></li>
              <li><Link href="/learn" className="text-blue-100 hover:text-white transition">TheraLearn - Education</Link></li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="font-semibold mb-4">For Providers</h4>
            <ul className="space-y-2">
              <li><Link href="/register-patient" className="text-blue-100 hover:text-white transition">Register as Patient</Link></li>
              <li><Link href="/register-therapist" className="text-blue-100 hover:text-white transition">Apply as Therapist</Link></li>
              <li><Link href="/register-clinic" className="text-blue-100 hover:text-white transition">Register Your Clinic</Link></li>
              <li><Link href="/sell-equipment" className="text-blue-100 hover:text-white transition">Sell Equipment with Us</Link></li>
              <li><Link href="/register-instructor" className="text-blue-100 hover:text-white transition">Register as Instructor</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-blue-100 hover:text-white transition">Help Center</Link></li>
              <li><Link href="/about" className="text-blue-100 hover:text-white transition">About Us</Link></li>
              <li><Link href="/privacy" className="text-blue-100 hover:text-white transition">Privacy & Policies</Link></li>
              <li><Link href="/refund" className="text-blue-100 hover:text-white transition">Refund & Cancellation</Link></li>
              <li><Link href="/termsofUse" className="text-blue-100 hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/compliance" className="text-blue-100 hover:text-white transition">Healthcare Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-blue-600 mt-12 pt-8">
          <div className="max-w-md">
            <h4 className="font-semibold mb-2">Stay Connected</h4>
            <p className="text-blue-100 mb-4">Get health tips, platform updates, and exclusive offers</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 border border-blue-500 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-400 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-blue-600 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-sm text-blue-100">
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/termsofUse" className="hover:text-white transition">Terms of Use</Link>
              <Link href="/refund" className="hover:text-white transition">Refund & Cancellation</Link>
              <Link href="/hipaa" className="hover:text-white transition">HIPAA Compliance</Link>
              <Link href="/accessibility" className="hover:text-white transition">Accessibility</Link>
              <Link href="/sitemap" className="hover:text-white transition">Sitemap</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="#" className="text-blue-100 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-blue-100 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-blue-100 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-blue-100 hover:text-white transition">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-6 text-blue-200 text-sm">
            © 2025 Theratreat. All rights reserved. | Comprehensive Healing Platform | HIPAA Compliant
          </div>
        </div>
      </div>
    </footer>
  );
};