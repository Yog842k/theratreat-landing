import { MapPin, Mail, Phone, Heart, Users, Building2 } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-green-50">
      {/* Header Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">👇</span>
            <h1 className="text-4xl font-bold text-blue-600">Contact Us</h1>
          </div>
          <p className="text-xl text-gray-600">
            We're here to help you! Whether you're a patient, therapist, clinic, or partner—our team is always ready to connect.
          </p>
        </div>
      </div>

      {/* Main Contact Info */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Office Address */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Office Address</h3>
            <p className="text-gray-600 leading-relaxed">
              1503/2, Jadhav Nagar, Shikrapur,<br />
              Shirur, Pune 412208<br />
              Maharashtra
            </p>
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Email</h3>
            <p className="text-gray-600">
              <a href="mailto:support@theratreat.in" className="text-green-600 hover:underline">
                support@theratreat.in
              </a>
            </p>
          </div>

          {/* Phone/WhatsApp */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Phone/WhatsApp</h3>
            <p className="text-gray-600">
              <a href="tel:+918446602680" className="text-purple-600 hover:underline">
                +91 8446602680
              </a>
            </p>
          </div>
        </div>

        {/* Specific Queries Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-600 mb-4">For Specific Queries:</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Patients */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-blue-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Patients</h3>
            <p className="text-blue-600 font-medium">
              <a href="mailto:help@theratreat.in" className="hover:underline">
                help@theratreat.in
              </a>
            </p>
          </div>

          {/* Therapists & Clinics */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Therapists & Clinics</h3>
            <p className="text-green-600 font-medium">
              <a href="mailto:info@theratreat.in" className="hover:underline">
                info@theratreat.in
              </a>
            </p>
          </div>

          {/* Business/Media */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-purple-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Business/Media</h3>
            <p className="text-purple-600 font-medium">
              <a href="mailto:connect@theratreat.in" className="hover:underline">
                connect@theratreat.in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <p className="text-gray-600">Prefer a quick message? Fill out the form and we’ll get back to you shortly.</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
