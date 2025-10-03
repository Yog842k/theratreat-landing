import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { footerSections } from "@/constants/app-data";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white border-t border-gray-200 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-white">TheraTreat</h3>
            <p className="text-gray-300 mb-6 max-w-md font-medium leading-relaxed">
              Your comprehensive healthcare ecosystem - connecting patients with providers, 
              enabling self-care, facilitating learning, and providing access to quality medical equipment.
            </p>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="font-medium">1-800-THERATREAT</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="font-medium">support@theratreat.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Available nationwide</span>
              </div>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="font-bold mb-4 text-white">Core Modules</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {footerSections.coreModules.map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="hover:text-blue-400 transition-colors font-medium">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="font-semibold mb-4">For Providers</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {footerSections.forProviders.map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {footerSections.support.map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-blue-800 pt-8 mb-8">
          <div className="max-w-md">
            <h4 className="font-semibold mb-2">Stay Connected</h4>
            <p className="text-blue-200 text-sm mb-4">Get health tips, platform updates, and exclusive offers</p>
            <div className="flex space-x-2">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="bg-blue-800 border-blue-700 text-white placeholder:text-blue-300"
              />
              <Button variant="secondary" className="bg-blue-600 hover:bg-blue-500 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-blue-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-4 text-sm text-blue-200">
            {footerSections.legal.map((item, index) => (
              <a key={index} href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>
          
          {/* Social Media */}
          <div className="flex space-x-4">
            <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-blue-300">
          <p>&copy; 2025 TheaPheap. All rights reserved. | Comprehensive Healthcare Platform | HIPAA Compliant</p>
        </div>
      </div>
    </footer>
  );
}
