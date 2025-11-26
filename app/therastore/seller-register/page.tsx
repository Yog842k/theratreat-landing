'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight,
  Upload,
  Building2,
  FileText,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

export default function SellerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    officialName: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    pincode: '',
    serviceOffered: '',
    licenseFile: null as File | null,
    gstin: '',
    description: '',
    productCategories: [] as string[],
    paymentMethod: 'razorpay' as 'razorpay' | 'bank',
    logisticsOption: 'self' as 'self' | 'partnered' | 'therastore'
  });

  const categories = [
    'Mobility Aids',
    'Therapy Tools',
    'Sensory Kits',
    'Exercise Equipment',
    'Medical Devices',
    'Wellness Products',
    'Rehabilitation Equipment'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, licenseFile: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save seller registration
      try {
        const sellers = JSON.parse(localStorage.getItem('therastore_sellers') || '[]');
        sellers.push({
          ...formData,
          _id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('therastore_sellers', JSON.stringify(sellers));
        router.push('/therastore/seller-register/success');
      } catch (error) {
        console.error('Error saving seller registration:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Become a Seller
          </h1>
          <p className="text-xl text-gray-600">
            Join TheraStore and start selling your healthcare products
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 transition-all ${
                  step > s ? 'bg-emerald-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Your Business Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Owner Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.officialName}
                    onChange={(e) => handleInputChange('officialName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Official Business Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="business@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="110001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address & Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 mb-3"
                  placeholder="Street Address"
                />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Services Offered *
                </label>
                <input
                  type="text"
                  required
                  value={formData.serviceOffered}
                  onChange={(e) => handleInputChange('serviceOffered', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="Describe your services"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal & Documentation</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Clinic License / Shop License *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-600 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="license-upload"
                  />
                  <label htmlFor="license-upload" className="cursor-pointer">
                    <span className="text-emerald-600 font-semibold">Click to upload</span> or drag and drop
                  </label>
                  {formData.licenseFile && (
                    <p className="text-sm text-gray-600 mt-2">{formData.licenseFile.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GSTIN *
                </label>
                <input
                  type="text"
                  required
                  value={formData.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="29ABCDE1234F1Z5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="Tell us about your business..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Categories *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                        formData.productCategories.includes(category)
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment & Logistics Setup</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Setup *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Razorpay</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Bank Transfer</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logistics Option *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors">
                    <input
                      type="radio"
                      name="logisticsOption"
                      value="self"
                      checked={formData.logisticsOption === 'self'}
                      onChange={(e) => handleInputChange('logisticsOption', e.target.value)}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <span className="font-semibold">Self-Managed</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors">
                    <input
                      type="radio"
                      name="logisticsOption"
                      value="partnered"
                      checked={formData.logisticsOption === 'partnered'}
                      onChange={(e) => handleInputChange('logisticsOption', e.target.value)}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <span className="font-semibold">Partnered Logistics</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors">
                    <input
                      type="radio"
                      name="logisticsOption"
                      value="therastore"
                      checked={formData.logisticsOption === 'therastore'}
                      onChange={(e) => handleInputChange('logisticsOption', e.target.value)}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <span className="font-semibold">TheraStore Logistics</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-all"
              >
                Previous
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all"
            >
              {step < 3 ? 'Next' : 'Submit Application'}
              <ArrowRight className="inline w-5 h-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}







