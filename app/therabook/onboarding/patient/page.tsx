'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ReactSelect from 'react-select';
import INDIA_STATES from '@/constants/india-states';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Heart, 
  Shield, 
  CheckCircle, 
  Upload,
  ArrowLeft,
  ArrowRight,
  Sunrise,
  Sun,
  Moon,
  Calendar,
  Check
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/logo.png';

interface OnboardingData {
  // Step 1: Personal Details
  fullName: string;
  profilePhoto?: File;
  profileImageUrl?: string; // cloudinary URL after upload
  gender: string;
  dateOfBirth: string;
  age: string;
  phoneNumber: string;
  emailId: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Location & Preferences
  preferredLanguage: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  seekingTherapy: string;
  preferredTherapistGender: string;
  preferredTimeSlots: string[];
  
  // Step 3: Health Information
  previousTherapyExperience: string;
  reasonForTherapy: string;
  currentMedications: string;
  diagnosedConditions: string;
  medicalReports?: FileList | File[];
  disabilitySupport: string;
  
  // Step 4: Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  relationshipToYou: string;
  
  // Step 5: Legal Consents
  smsEmailConsent: boolean;
  termsAccepted: boolean;
  informationAccurate: boolean;
  responsibleUse: boolean;
  emergencyDisclaimer: boolean;
}

const steps = [
  { id: 1, title: 'Personal Details', percentage: 20, icon: User },
  { id: 2, title: 'Location & Preferences', percentage: 40, icon: MapPin },
  { id: 3, title: 'Health Information', percentage: 60, icon: Heart },
  { id: 4, title: 'Emergency Contact', percentage: 80, icon: Shield },
  { id: 5, title: 'Legal Consents', percentage: 100, icon: CheckCircle }
];

// Comprehensive list of Indian regional languages (Eighth Schedule) + English
const preferredLanguageOptions = [
  { value: 'english', label: 'English' },
  { value: 'assamese', label: 'Assamese' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'bodo', label: 'Bodo' },
  { value: 'dogri', label: 'Dogri' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'kashmiri', label: 'Kashmiri' },
  { value: 'konkani', label: 'Konkani' },
  { value: 'maithili', label: 'Maithili' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'manipuri', label: 'Manipuri (Meitei)' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'nepali', label: 'Nepali' },
  { value: 'odia', label: 'Odia (Oriya)' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'santali', label: 'Santali' },
  { value: 'sindhi', label: 'Sindhi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'urdu', label: 'Urdu' }
];

// Time slot options with icons & hints
const timeSlotOptions = [
  { value: 'Morning', icon: Sunrise, hint: '6 AM – 11 AM' },
  { value: 'Afternoon', icon: Sun, hint: '11 AM – 4 PM' },
  { value: 'Evening', icon: Moon, hint: '4 PM – 9 PM' },
  { value: 'Weekends', icon: Calendar, hint: 'Sat & Sun' }
];

export default function PatientOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    phoneNumber: '',
    emailId: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    seekingTherapy: '',
    preferredTherapistGender: '',
    preferredTimeSlots: [],
    previousTherapyExperience: '',
    reasonForTherapy: '',
    currentMedications: '',
    diagnosedConditions: '',
    disabilitySupport: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    relationshipToYou: '',
    smsEmailConsent: false,
    termsAccepted: false,
    informationAccurate: false,
    responsibleUse: false,
    emergencyDisclaimer: false
  });

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate age when date of birth changes
      if (field === 'dateOfBirth' && value) {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        newData.age = age.toString();
      }
      
      return newData;
    });
  };

  const handleTimeSlotToggle = (slot: string) => {
    setData(prev => ({
      ...prev,
      preferredTimeSlots: prev.preferredTimeSlots.includes(slot)
        ? prev.preferredTimeSlots.filter(s => s !== slot)
        : [...prev.preferredTimeSlots, slot]
    }));
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, fieldName: 'profilePhoto' | 'medicalReports') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      
      if (fieldName === 'profilePhoto') {
        const file = files[0];
        if (file.size > 2 * 1024 * 1024) {
          setError('Profile photo must be less than 2MB');
          return;
        }
        if (!file.type.startsWith('image/')) {
          setError('Profile photo must be an image file');
          return;
        }
        updateData('profilePhoto', file);
        uploadProfilePhoto(file);
      } else if (fieldName === 'medicalReports') {
        const validFiles = files.filter(file => {
          if (file.size > 5 * 1024 * 1024) {
            setError(`${file.name} is too large. Maximum size is 5MB per file.`);
            return false;
          }
          return true;
        });
        
        if (validFiles.length > 0) {
          updateData('medicalReports', validFiles);
        }
      }
      setError('');
    }
  };

  // Upload profile photo to Cloudinary and store returned URL
  const uploadProfilePhoto = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads/profile', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success && json.data?.url) {
        updateData('profileImageUrl', json.data.url);
      } else {
        console.error('Image upload failed', json.message);
      }
    } catch (err) {
      console.error('Upload error', err);
    }
  };

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 1:
        if (!data.fullName || !data.gender || !data.dateOfBirth || !data.phoneNumber || !data.emailId || !data.password || !data.confirmPassword) {
          setError('Please fill in all required fields');
          return false;
        }
        if (data.password !== data.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        // Password complexity rules
        const pwd = data.password;
        const passwordOk = pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
        if (!passwordOk) {
          setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
          return false;
        }
        // Phone number validation (India specific 10 digits)
        if (!/^\d{10}$/.test(data.phoneNumber)) {
          setError('Phone number must be exactly 10 digits');
          return false;
        }
        break;
      case 2:
        if (!data.preferredLanguage || !data.city || !data.state || !data.pinCode || !data.seekingTherapy) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (!data.previousTherapyExperience || !data.disabilitySupport) {
          setError('Please answer all required questions');
          return false;
        }
        break;
      case 4:
        if (!data.emergencyContactName || !data.emergencyContactPhone || !data.relationshipToYou) {
          setError('Please fill in all emergency contact details');
          return false;
        }
        break;
      case 5:
        if (!data.smsEmailConsent || !data.termsAccepted || !data.informationAccurate || !data.responsibleUse || !data.emergencyDisclaimer) {
          setError('Please accept all required terms and conditions');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Create the basic user object that the API expects
      const userData = {
        name: data.fullName,
        email: data.emailId,
        password: data.password,
        userType: 'patient',
        phone: data.phoneNumber,
        profileImageUrl: data.profileImageUrl || undefined,
        // Store additional patient data in a single field
        patientData: {
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          age: data.age,
          city: data.city,
          state: data.state,
          country: data.country,
          pinCode: data.pinCode,
          preferredLanguage: data.preferredLanguage,
          seekingTherapy: data.seekingTherapy,
          preferredTherapistGender: data.preferredTherapistGender,
          preferredTimeSlots: data.preferredTimeSlots,
          previousTherapyExperience: data.previousTherapyExperience,
          reasonForTherapy: data.reasonForTherapy,
          currentMedications: data.currentMedications,
          diagnosedConditions: data.diagnosedConditions,
          disabilitySupport: data.disabilitySupport,
          emergencyContact: {
            name: data.emergencyContactName,
            phone: data.emergencyContactPhone,
            relationship: data.relationshipToYou
          },
          consents: {
            smsEmail: data.smsEmailConsent,
            terms: data.termsAccepted,
            informationAccuracy: data.informationAccurate,
            responsibleUse: data.responsibleUse,
            emergencyDisclaimer: data.emergencyDisclaimer
          }
        }
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      // Debug logging
      console.log('API Response:', result);
      console.log('Response status:', response.status);

      if (result.success) {
        // Redirect to home page after successful registration
        router.push('/?registered=true');
      } else {
        setError(result.message || 'Registration failed');
        console.error('Registration failed:', result);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: {
        // Real-time password rule checks
        const passwordValidation = {
          length: data.password.length >= 8,
          upper: /[A-Z]/.test(data.password),
          lower: /[a-z]/.test(data.password),
          number: /[0-9]/.test(data.password),
          special: /[^A-Za-z0-9]/.test(data.password)
        };
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={data.fullName}
                  onChange={(e) => updateData('fullName', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Profile Photo (Optional)
                </Label>
                <div className="mt-2 relative">
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) { // 2MB limit
                          setError('Profile photo must be less than 2MB');
                          return;
                        }
                        updateData('profilePhoto', file);
                        uploadProfilePhoto(file);
                        setError('');
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'profilePhoto')}
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-blue-600">
                      {data.profilePhoto ? (data.profileImageUrl ? 'Uploaded ✓' : data.profilePhoto.name) : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG (Max 2MB)</p>
                    {data.profilePhoto && (
                      <p className="text-xs text-green-600 mt-1">
                        {data.profileImageUrl ? 'Uploaded ✓' : `✓ ${data.profilePhoto.name} (${(data.profilePhoto.size / 1024 / 1024).toFixed(1)}MB)`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                    Gender *
                  </Label>
                  <ReactSelect
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                    ]}
                    value={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                    ].find(opt => opt.value === data.gender) || null}
                    onChange={selected => updateData('gender', selected ? selected.value : '')}
                    classNamePrefix="react-select"
                    placeholder="Select gender"
                    isClearable
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => updateData('dateOfBirth', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                  Age
                </Label>
                <Input
                  id="age"
                  placeholder="Auto-filled from DOB"
                  value={data.age}
                  onChange={(e) => updateData('age', e.target.value)}
                  className="mt-1"
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  Phone Number * [+91]
                </Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    autoComplete="tel"
                    placeholder="10-digit number"
                    value={data.phoneNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateData('phoneNumber', digits);
                    }}
                    className="rounded-l-none"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter a 10-digit mobile number (numbers only).</p>
              </div>

              <div>
                <Label htmlFor="emailId" className="text-sm font-medium text-gray-700">
                  Email ID *
                </Label>
                <Input
                  id="emailId"
                  type="email"
                  placeholder="your@email.com"
                  value={data.emailId}
                  onChange={(e) => updateData('emailId', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Create Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={data.password}
                    autoComplete="new-password"
                    onChange={(e) => updateData('password', e.target.value)}
                    className="mt-1"
                  />
                  <ul className="mt-2 text-xs space-y-1">
                    <li className={passwordValidation.length ? 'text-green-600' : 'text-gray-500'}>
                      {passwordValidation.length ? '✓' : '•'} At least 8 characters
                    </li>
                    <li className={passwordValidation.upper ? 'text-green-600' : 'text-gray-500'}>
                      {passwordValidation.upper ? '✓' : '•'} One uppercase letter (A-Z)
                    </li>
                    <li className={passwordValidation.lower ? 'text-green-600' : 'text-gray-500'}>
                      {passwordValidation.lower ? '✓' : '•'} One lowercase letter (a-z)
                    </li>
                    <li className={passwordValidation.number ? 'text-green-600' : 'text-gray-500'}>
                      {passwordValidation.number ? '✓' : '•'} One number (0-9)
                    </li>
                    <li className={passwordValidation.special ? 'text-green-600' : 'text-gray-500'}>
                      {passwordValidation.special ? '✓' : '•'} One special character (!@#$% etc.)
                    </li>
                  </ul>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={data.confirmPassword}
                    autoComplete="new-password"
                    onChange={(e) => updateData('confirmPassword', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Location & Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredLanguage" className="text-sm font-medium text-gray-700">
                    Preferred Language *
                  </Label>
                  <ReactSelect
                    options={preferredLanguageOptions}
                    value={preferredLanguageOptions.find(opt => opt.value === data.preferredLanguage) || null}
                    onChange={selected => updateData('preferredLanguage', selected ? selected.value : '')}
                    classNamePrefix="react-select"
                    placeholder="Select language"
                    isClearable
                    // Menu is long; make it scrollable
                    styles={{ menuList: (base) => ({ ...base, maxHeight: 220, overflowY: 'auto' }) }}
                  />
                  <p className="mt-1 text-xs text-gray-500">Includes all officially recognized Indian languages.</p>
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City / Town *
                  </Label>
                  <Input
                    id="city"
                    placeholder="Enter your city"
                    value={data.city}
                    onChange={(e) => updateData('city', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State *
                  </Label>
                  <ReactSelect
                    options={INDIA_STATES.map(s => ({ value: s, label: s }))}
                    value={INDIA_STATES.map(s => ({ value: s, label: s })).find(o => o.value === data.state) || null}
                    onChange={(selected) => updateData('state', selected ? selected.value : '')}
                    classNamePrefix="react-select"
                    placeholder="Select state"
                    isClearable
                    styles={{ menuList: (base) => ({ ...base, maxHeight: 240, overflowY: 'auto' }) }}
                  />
                </div>

                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Country *
                  </Label>
                  <Input
                    id="country"
                    placeholder="Enter your country"
                    value={data.country}
                    onChange={(e) => updateData('country', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pinCode" className="text-sm font-medium text-gray-700">
                  PIN Code / ZIP Code *
                </Label>
                <Input
                  id="pinCode"
                  placeholder="Enter PIN/ZIP code"
                  value={data.pinCode}
                  onChange={(e) => updateData('pinCode', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Are you seeking therapy? *
                </Label>
                <RadioGroup
                  value={data.seekingTherapy}
                  onValueChange={(value) => updateData('seekingTherapy', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">Online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <Label htmlFor="in-person">In Person</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="preferredTherapistGender" className="text-sm font-medium text-gray-700">
                  Preferred Therapist Gender
                </Label>
                <ReactSelect
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'no-preference', label: 'No Preference' },
                  ]}
                  value={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'no-preference', label: 'No Preference' },
                  ].find(opt => opt.value === data.preferredTherapistGender) || null}
                  onChange={selected => updateData('preferredTherapistGender', selected ? selected.value : '')}
                  classNamePrefix="react-select"
                  placeholder="Select preference"
                  isClearable
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Preferred Time Slots
                </Label>
                <p className="text-xs text-gray-500 mt-1">Select one or more time windows that usually work for you.</p>
                <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                  {timeSlotOptions.map(({ value, icon: Icon, hint }) => {
                    const selected = data.preferredTimeSlots.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleTimeSlotToggle(value)}
                        aria-pressed={selected}
                        className={`relative group rounded-lg border px-3 py-3 text-left flex flex-col items-start gap-2 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/60 backdrop-blur-sm hover:border-blue-400 ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'} `}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-blue-600 bg-white ${selected ? 'border-blue-500' : 'border-gray-300'} `}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className={`font-medium text-sm ${selected ? 'text-blue-700' : 'text-gray-800'}`}>{value}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium ml-0.5">{hint}</span>
                        {selected && (
                          <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                        <span className="pointer-events-none absolute inset-0 rounded-lg ring-0 ring-blue-500/0 group-hover:ring-2 group-hover:ring-blue-200 transition"></span>
                      </button>
                    );
                  })}
                </div>
                {data.preferredTimeSlots.length > 0 && (
                  <p className="mt-2 text-xs text-blue-600">Selected: {data.preferredTimeSlots.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Health Information</h3>
              <Badge variant="outline" className="text-xs">Optional but Recommended</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Do you have any previous therapy experience?
                </Label>
                <RadioGroup
                  value={data.previousTherapyExperience}
                  onValueChange={(value) => updateData('previousTherapyExperience', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="therapy-yes" />
                    <Label htmlFor="therapy-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="therapy-no" />
                    <Label htmlFor="therapy-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="reasonForTherapy" className="text-sm font-medium text-gray-700">
                  Reason for seeking therapy (Short description)
                </Label>
                <Textarea
                  id="reasonForTherapy"
                  placeholder="Please describe why you're seeking therapy..."
                  value={data.reasonForTherapy}
                  onChange={(e) => updateData('reasonForTherapy', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Any current medications?
                </Label>
                <RadioGroup
                  value={data.currentMedications}
                  onValueChange={(value) => updateData('currentMedications', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="meds-yes" />
                    <Label htmlFor="meds-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="meds-no" />
                    <Label htmlFor="meds-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="diagnosedConditions" className="text-sm font-medium text-gray-700">
                  Any diagnosed conditions you'd like to share? (Optional)
                </Label>
                <Textarea
                  id="diagnosedConditions"
                  placeholder="Please share any relevant diagnosed conditions..."
                  value={data.diagnosedConditions}
                  onChange={(e) => updateData('diagnosedConditions', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Upload any previous medical reports (PDF/Image Upload – Optional)
                </Label>
                <div className="mt-2 relative">
                  <input
                    type="file"
                    id="medicalReports"
                    accept="application/pdf,image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const validFiles = files.filter(file => {
                        if (file.size > 5 * 1024 * 1024) { // 5MB limit per file
                          setError(`${file.name} is too large. Maximum size is 5MB per file.`);
                          return false;
                        }
                        return true;
                      });
                      
                      if (validFiles.length > 0) {
                        updateData('medicalReports', validFiles);
                        setError('');
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'medicalReports')}
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-blue-600">
                      {data.medicalReports && data.medicalReports.length > 0 
                        ? `${data.medicalReports.length} file(s) selected` 
                        : 'Click to upload or drag and drop'
                      }
                    </p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB each)</p>
                  </div>
                </div>
                {data.medicalReports && data.medicalReports.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Selected files:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {Array.from(data.medicalReports).map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                          <span>{file.name}</span>
                          <span>{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Do you have any disability / support needs?
                </Label>
                <RadioGroup
                  value={data.disabilitySupport}
                  onValueChange={(value) => updateData('disabilitySupport', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="disability-yes" />
                    <Label htmlFor="disability-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="disability-no" />
                    <Label htmlFor="disability-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
              <Badge variant="outline" className="text-xs">Mandatory for therapy platforms</Badge>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName" className="text-sm font-medium text-gray-700">
                    Emergency Contact Name *
                  </Label>
                  <Input
                    id="emergencyContactName"
                    placeholder="Enter contact person's name"
                    value={data.emergencyContactName}
                    onChange={(e) => updateData('emergencyContactName', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="relationshipToYou" className="text-sm font-medium text-gray-700">
                    Relationship to You *
                  </Label>
                  <ReactSelect
                    options={[
                      { value: 'parent', label: 'Parent' },
                      { value: 'spouse', label: 'Spouse' },
                      { value: 'sibling', label: 'Sibling' },
                      { value: 'friend', label: 'Friend' },
                      { value: 'guardian', label: 'Guardian' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={[
                      { value: 'parent', label: 'Parent' },
                      { value: 'spouse', label: 'Spouse' },
                      { value: 'sibling', label: 'Sibling' },
                      { value: 'friend', label: 'Friend' },
                      { value: 'guardian', label: 'Guardian' },
                      { value: 'other', label: 'Other' },
                    ].find(opt => opt.value === data.relationshipToYou) || null}
                    onChange={selected => updateData('relationshipToYou', selected ? selected.value : '')}
                    classNamePrefix="react-select"
                    placeholder="Select relationship"
                    isClearable
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContactPhone" className="text-sm font-medium text-gray-700">
                  Phone Number * [+91]
                </Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={data.emergencyContactPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateData('emergencyContactPhone', digits);
                    }}
                    className="rounded-l-none"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter a 10-digit mobile number.</p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Legal Consents & Agreements</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="smsEmailConsent"
                  checked={data.smsEmailConsent}
                  onCheckedChange={(checked) => updateData('smsEmailConsent', checked)}
                />
                <Label htmlFor="smsEmailConsent" className="text-sm text-gray-700">
                  I consent to receiving SMS, email, or WhatsApp reminders. *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsAccepted"
                  checked={data.termsAccepted}
                  onCheckedChange={(checked) => updateData('termsAccepted', checked)}
                />
                <Label htmlFor="termsAccepted" className="text-sm text-gray-700">
                  I accept the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Use</Link>
                  ,{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>
                  , and{' '}
                  <Link href="/refund" className="text-blue-600 hover:text-blue-800">Refund Policy</Link>
                  . *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="informationAccurate"
                  checked={data.informationAccurate}
                  onCheckedChange={(checked) => updateData('informationAccurate', checked)}
                />
                <Label htmlFor="informationAccurate" className="text-sm text-gray-700">
                  I confirm the information I have provided is true and accurate. *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="responsibleUse"
                  checked={data.responsibleUse}
                  onCheckedChange={(checked) => updateData('responsibleUse', checked)}
                />
                <Label htmlFor="responsibleUse" className="text-sm text-gray-700">
                  I agree to use TheraTreat responsibly and will not impersonate anyone else. *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="emergencyDisclaimer"
                  checked={data.emergencyDisclaimer}
                  onCheckedChange={(checked) => updateData('emergencyDisclaimer', checked)}
                />
                <Label htmlFor="emergencyDisclaimer" className="text-sm text-gray-700">
                  I understand that this platform does not offer emergency services. In case of crisis, I will contact appropriate local authorities. *
                </Label>
              </div>

              <Alert className="mt-6">
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Emergency Services Disclaimer</strong>
                  <br />
                  If you are experiencing a mental health emergency, please contact your local emergency services (108 in India, 911 in US) or visit your nearest emergency room immediately. This platform is not a substitute for emergency mental health services.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src={Logo} alt="TheraBook" width={60} height={60} className="rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Patient Registration</h1>
          <p className="text-gray-600">Join TheraTreat to start your wellness journey</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-blue-600">
              Step {currentStep} of 5: {steps[currentStep - 1].title}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {steps[currentStep - 1].percentage}% Complete
            </span>
          </div>
          <Progress value={steps[currentStep - 1].percentage} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full ${
                  index + 1 <= currentStep ? 'bg-blue-600' : 
                  index + 1 === currentStep ? 'bg-blue-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            {currentStep === 5 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{loading ? 'Completing Registration...' : 'Complete Registration'}</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
