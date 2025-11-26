'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight,
  ArrowLeft,
  Upload,
  Building2,
  FileText,
  CreditCard,
  CheckCircle2,
  Package,
  Banknote,
  Shield,
  X,
  Check
} from 'lucide-react';

const businessTypes = ['Manufacturer', 'Distributor', 'Importer', 'Reseller'];
const productCategories = [
  'Physiotherapy Equipment',
  'Occupational Therapy Tools',
  'Neurological Rehab Aids',
  'Pediatric Therapy Products',
  'Orthopedic & Mobility Aids',
  'Wellness & Pain Relief',
  'Exercise & Fitness Equipment',
  'Medical Devices',
  'Sensory Integration Tools',
  'Assistive Technology'
];
const certifications = ['ISO', 'BIS', 'CE', 'CDSCO'];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(1);
  const [uploading, setUploading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Section 1: Business Info
    companyName: '',
    businessType: '',
    gstin: '',
    pan: '',
    msmeNumber: '',
    iecNumber: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    contactPersonName: '',
    email: '',
    phone: '',
    
    // Section 2: Product Info
    primaryProductCategory: '',
    brandsRepresented: '',
    productCount: '',
    certificationsAvailable: [] as string[],
    catalogCsv: null as File | null,
    
    // Section 3: Banking Details
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    cancelledCheque: null as File | null,
    
    // Section 4: Compliance Uploads
    gstCertificate: null as File | null,
    panCard: null as File | null,
    businessRegistrationProof: null as File | null,
    productCertificates: [] as File[],
    productImages: [] as File[],
    
    // Section 5: Agreements
    infoAccurate: false,
    authorizeListing: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleFileChange = async (field: string, file: File | null, isMultiple: boolean = false) => {
    if (!file) {
      if (isMultiple) {
        setFormData(prev => ({ ...prev, [field]: [] }));
      } else {
        setFormData(prev => ({ ...prev, [field]: null }));
      }
      return;
    }

    // Validate file size (max 5MB for documents, 2MB for images)
    const maxSize = file.type.startsWith('image/') ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Maximum size: ${maxSize === 2 * 1024 * 1024 ? '2MB' : '5MB'}`);
      return;
    }

    if (isMultiple) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as File[]), file]
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const removeFile = (field: string, index?: number) => {
    if (index !== undefined) {
      setFormData(prev => {
        const files = prev[field as keyof typeof prev] as File[];
        return { ...prev, [field]: files.filter((_, i) => i !== index) };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateSection = (section: number): boolean => {
    switch (section) {
      case 1:
        if (!formData.companyName || !formData.businessType || !formData.gstin || !formData.pan || 
            !formData.address || !formData.state || !formData.city || !formData.pincode || 
            !formData.contactPersonName || !formData.email || !formData.phone) {
          alert('Please fill all required fields in Business Info section');
          return false;
        }
        if (formData.businessType === 'Importer' && !formData.iecNumber) {
          alert('IEC Number is required for Importers');
          return false;
        }
        return true;
      case 2:
        if (!formData.primaryProductCategory || !formData.brandsRepresented || !formData.productCount) {
          alert('Please fill all required fields in Product Info section');
          return false;
        }
        return true;
      case 3:
        if (!formData.accountName || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.cancelledCheque) {
          alert('Please fill all required fields in Banking Details section');
          return false;
        }
        return true;
      case 4:
        if (!formData.gstCertificate || !formData.panCard || !formData.businessRegistrationProof || 
            formData.productImages.length < 5) {
          alert('Please upload all required documents. Minimum 5 product images required.');
          return false;
        }
        return true;
      case 5:
        if (!formData.infoAccurate || !formData.authorizeListing) {
          alert('Please accept all agreements and declarations');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < 5) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSection(5)) return;

    try {
      // Upload files and get URLs
      const uploadedFiles: Record<string, string | string[]> = {};
      
      // Upload single files
      const singleFileFields = [
        { field: 'catalogCsv', file: formData.catalogCsv },
        { field: 'cancelledCheque', file: formData.cancelledCheque },
        { field: 'gstCertificate', file: formData.gstCertificate },
        { field: 'panCard', file: formData.panCard },
        { field: 'businessRegistrationProof', file: formData.businessRegistrationProof }
      ];

      for (const { field, file } of singleFileFields) {
        if (file) {
          setUploading(field);
          const formData = new FormData();
          formData.append('file', file);
          const endpoint = file.type === 'application/pdf' || file.name.endsWith('.csv') 
            ? '/api/uploads/resume' 
            : '/api/uploads/profile';
          const res = await fetch(endpoint, { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) {
            uploadedFiles[field] = data.data.url;
          }
        }
      }

      // Upload multiple files
      if (formData.productCertificates.length > 0) {
        const certUrls: string[] = [];
        for (const file of formData.productCertificates) {
          setUploading(`productCertificates-${certUrls.length}`);
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/uploads/resume', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) certUrls.push(data.data.url);
        }
        uploadedFiles.productCertificates = certUrls;
      }

      if (formData.productImages.length > 0) {
        const imageUrls: string[] = [];
        for (const file of formData.productImages) {
          setUploading(`productImages-${imageUrls.length}`);
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/uploads/profile', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) imageUrls.push(data.data.url);
        }
        uploadedFiles.productImages = imageUrls;
      }

      setUploading(null);

      // Submit form data
      const submissionData = {
        ...formData,
        ...uploadedFiles,
        // Remove File objects before submission
        catalogCsv: null,
        cancelledCheque: null,
        gstCertificate: null,
        panCard: null,
        businessRegistrationProof: null,
        productCertificates: [],
        productImages: []
      };

      const response = await fetch('/api/therastore/vendor-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        router.push('/therastore/vendor-register/success');
      } else {
        alert(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred. Please try again.');
      setUploading(null);
    }
  };

  const sections = [
    { number: 1, title: 'Business Info', icon: Building2 },
    { number: 2, title: 'Product Info', icon: Package },
    { number: 3, title: 'Banking Details', icon: CreditCard },
    { number: 4, title: 'Compliance Uploads', icon: FileText },
    { number: 5, title: 'Agreements', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Vendor Onboarding Form
          </h1>
          <p className="text-xl text-gray-600">
            Join TheraStore as a trusted vendor partner
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-2 overflow-x-auto pb-4">
          {sections.map((section, idx) => (
            <div key={section.number} className="flex items-center flex-shrink-0">
              <div className={`flex flex-col items-center ${idx < sections.length - 1 ? 'mr-2' : ''}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentSection > section.number 
                    ? 'bg-emerald-600 text-white' 
                    : currentSection === section.number
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentSection > section.number ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    section.number
                  )}
                </div>
                <span className={`text-xs mt-2 font-semibold ${
                  currentSection >= section.number ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  {section.title}
                </span>
              </div>
              {idx < sections.length - 1 && (
                <div className={`w-12 h-1 mx-2 transition-all ${
                  currentSection > section.number ? 'bg-emerald-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          {/* Section 1: Business Info */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-600" />
                Section 1: Business Info
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GSTIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.gstin}
                    onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="29ABCDE1234F1Z5"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PAN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pan}
                    onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MSME Number (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.msmeNumber}
                    onChange={(e) => handleInputChange('msmeNumber', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter MSME number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IEC Number {formData.businessType === 'Importer' && '*'}
                  </label>
                  <input
                    type="text"
                    required={formData.businessType === 'Importer'}
                    value={formData.iecNumber}
                    onChange={(e) => handleInputChange('iecNumber', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter IEC number"
                    disabled={formData.businessType !== 'Importer'}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address (HQ + Warehouse) *
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    rows={3}
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter city"
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
                    onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="110001"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPersonName}
                    onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email & Phone *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 mb-2"
                    placeholder="business@example.com"
                  />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Product Info */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-emerald-600" />
                Section 2: Product Info
              </h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Product Category *
                </label>
                <select
                  required
                  value={formData.primaryProductCategory}
                  onChange={(e) => handleInputChange('primaryProductCategory', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                >
                  <option value="">Select category</option>
                  {productCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand(s) Represented *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brandsRepresented}
                  onChange={(e) => handleInputChange('brandsRepresented', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="Enter brand names (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Count / SKUs *
                </label>
                <input
                  type="number"
                  required
                  value={formData.productCount}
                  onChange={(e) => handleInputChange('productCount', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  placeholder="Enter number of products/SKUs"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certifications Available (ISO / BIS / CE / CDSCO)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {certifications.map(cert => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => handleArrayToggle('certificationsAvailable', cert)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                        formData.certificationsAvailable.includes(cert)
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{cert}</span>
                        {formData.certificationsAvailable.includes(cert) && (
                          <Check className="w-5 h-5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Catalog CSV *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-600 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileChange('catalogCsv', e.target.files?.[0] || null)}
                    className="hidden"
                    id="catalog-upload"
                  />
                  <label htmlFor="catalog-upload" className="cursor-pointer">
                    <span className="text-emerald-600 font-semibold">Click to upload</span> or drag and drop
                  </label>
                  {formData.catalogCsv && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-600">{formData.catalogCsv.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile('catalogCsv')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Banking Details */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-emerald-600" />
                Section 3: Banking Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountName}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter account holder name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="ABCD0123456"
                    maxLength={11}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Cancelled Cheque *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-600 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('cancelledCheque', e.target.files?.[0] || null)}
                      className="hidden"
                      id="cheque-upload"
                    />
                    <label htmlFor="cheque-upload" className="cursor-pointer">
                      <span className="text-emerald-600 font-semibold">Click to upload</span> or drag and drop
                    </label>
                    {formData.cancelledCheque && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600">{formData.cancelledCheque.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('cancelledCheque')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Compliance Uploads */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-600" />
                Section 4: Compliance Uploads
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GST Certificate *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('gstCertificate', e.target.files?.[0] || null)}
                      className="hidden"
                      id="gst-upload"
                    />
                    <label htmlFor="gst-upload" className="cursor-pointer text-sm">
                      <span className="text-emerald-600 font-semibold">Upload</span>
                    </label>
                    {formData.gstCertificate && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-600">{formData.gstCertificate.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('gstCertificate')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PAN Card *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('panCard', e.target.files?.[0] || null)}
                      className="hidden"
                      id="pan-upload"
                    />
                    <label htmlFor="pan-upload" className="cursor-pointer text-sm">
                      <span className="text-emerald-600 font-semibold">Upload</span>
                    </label>
                    {formData.panCard && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-600">{formData.panCard.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('panCard')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Registration Proof (Udyam / Shop Act) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('businessRegistrationProof', e.target.files?.[0] || null)}
                      className="hidden"
                      id="registration-upload"
                    />
                    <label htmlFor="registration-upload" className="cursor-pointer text-sm">
                      <span className="text-emerald-600 font-semibold">Upload</span>
                    </label>
                    {formData.businessRegistrationProof && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-600">{formData.businessRegistrationProof.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('businessRegistrationProof')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Certificates (CE / ISO / BIS / CDSCO)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(file => {
                            handleFileChange('productCertificates', file, true);
                          });
                        }
                      }}
                      className="hidden"
                      id="certificates-upload"
                    />
                    <label htmlFor="certificates-upload" className="cursor-pointer text-sm">
                      <span className="text-emerald-600 font-semibold">Upload Multiple</span>
                    </label>
                    {formData.productCertificates.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.productCertificates.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-center gap-2 text-xs">
                            <span className="text-gray-600 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('productCertificates', idx)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Images (min 5) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(file => {
                            handleFileChange('productImages', file, true);
                          });
                        }
                      }}
                      className="hidden"
                      id="images-upload"
                    />
                    <label htmlFor="images-upload" className="cursor-pointer text-sm">
                      <span className="text-emerald-600 font-semibold">Upload Multiple (min 5)</span>
                    </label>
                    {formData.productImages.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-2">
                          {formData.productImages.length} image(s) uploaded
                          {formData.productImages.length < 5 && (
                            <span className="text-red-600"> (Need {5 - formData.productImages.length} more)</span>
                          )}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {formData.productImages.map((file, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Product ${idx + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile('productImages', idx)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Agreements & Declarations */}
          {currentSection === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-600" />
                Section 5: Agreements & Declarations
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.infoAccurate}
                    onChange={(e) => handleInputChange('infoAccurate', e.target.checked)}
                    className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">
                    I confirm that all information provided is accurate
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.authorizeListing}
                    onChange={(e) => handleInputChange('authorizeListing', e.target.checked)}
                    className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">
                    I authorize TheraTreat Health Pvt Ltd to list and market my products
                  </span>
                </label>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <strong>Digital Consent:</strong> By submitting this form, you provide your digital signature and consent to the terms and conditions of TheraStore vendor partnership.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentSection > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            {currentSection < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={uploading !== null}
                className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading {uploading}...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

