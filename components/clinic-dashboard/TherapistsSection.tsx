import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus, X, User, Mail, Phone, Briefcase, Loader2, CheckCircle2, Shield, Upload, FileText, GraduationCap, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/components/auth/NewAuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClinicData {
  clinic: {
    _id: string;
    name: string;
    [key: string]: any;
  };
  metrics: {
    monthlyBookings: number;
    revenue: number;
    therapists: number;
    [key: string]: any;
  };
  therapists: any[];
  recentBookings: any[];
  notifications: any[];
}

interface TherapistsSectionProps {
  clinicData: ClinicData;
  onRefresh?: () => void;
}

export default function TherapistsSection({ clinicData, onRefresh }: TherapistsSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    title: 'Therapist',
    specializations: '',
    experience: '',
    consultationFee: '',
    bio: '',

  });

  const [files, setFiles] = useState({
    photo: null as File | null,
    license: null as File | null,
    degree: null as File | null,
  });

  const [filePreviews, setFilePreviews] = useState({
    photo: null as string | null,
    license: null as string | null,
    degree: null as string | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (type: 'photo' | 'license' | 'degree', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (type === 'photo') {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Photo must be a JPG or PNG image');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo must be less than 2MB');
        return;
      }
      setFilePreviews(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
    } else if (type === 'license' || type === 'degree') {
      if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError(`${type === 'license' ? 'License' : 'Degree'} must be a PDF or image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`${type === 'license' ? 'License' : 'Degree'} must be less than 5MB`);
        return;
      }
    }

    setFiles(prev => ({ ...prev, [type]: file }));
    setError(null);
  };

  const removeFile = (type: 'photo' | 'license' | 'degree') => {
    setFiles(prev => ({ ...prev, [type]: null }));
    if (type === 'photo' && filePreviews.photo) {
      URL.revokeObjectURL(filePreviews.photo);
    }
    setFilePreviews(prev => ({ ...prev, [type]: null }));
  };

  const uploadFile = async (file: File, type: 'photo' | 'license' | 'degree'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Use profile upload for images, resume upload for PDFs
    // All files are uploaded to Cloudinary and URLs are returned
    const endpoint = type === 'photo' 
      ? '/api/uploads/profile'  // For photos (JPG/PNG) - goes to 'theratreat/profile' folder
      : file.type === 'application/pdf' 
        ? '/api/uploads/resume'  // For PDFs - goes to 'theratreat/resumes' folder
        : '/api/uploads/profile';  // For image documents (JPG/PNG) - goes to 'theratreat/profile' folder

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'File upload failed');
    }

    // Return the Cloudinary secure URL
    const cloudinaryUrl = data.data.url;
    if (!cloudinaryUrl) {
      throw new Error('No URL returned from Cloudinary upload');
    }

    return cloudinaryUrl;
  };

  const handleAddTherapist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.fullName) {
      setError('Full name is required');
      return;
    }
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files to Cloudinary first
      let photoUrl = '';
      let licenseUrl = '';
      let degreeUrl = '';

      if (files.photo) {
        console.log('Uploading photo to Cloudinary...');
        photoUrl = await uploadFile(files.photo, 'photo');
        console.log('Photo uploaded successfully:', photoUrl);
      }
      if (files.license) {
        console.log('Uploading license to Cloudinary...');
        licenseUrl = await uploadFile(files.license, 'license');
        console.log('License uploaded successfully:', licenseUrl);
      }
      if (files.degree) {
        console.log('Uploading degree to Cloudinary...');
        degreeUrl = await uploadFile(files.degree, 'degree');
        console.log('Degree uploaded successfully:', degreeUrl);
      }

      const response = await fetch('/api/clinics/therapists/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email || '',
          phone: formData.phone || '',
          clinicId: clinicData.clinic._id,
          title: formData.title,
          specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()) : [],
          experience: Number(formData.experience) || 0,
          consultationFee: Number(formData.consultationFee) || 0,
          bio: formData.bio,
          image: photoUrl,
          licenseDocument: licenseUrl,
          degreeDocument: degreeUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Therapist added successfully to your clinic!');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          title: 'Therapist',
          specializations: '',
          experience: '',
          consultationFee: '',
          bio: '',
        });
        setFiles({ photo: null, license: null, degree: null });
        if (filePreviews.photo) {
          URL.revokeObjectURL(filePreviews.photo);
        }
        setFilePreviews({ photo: null, license: null, degree: null });
        // Refresh data after 1.5 seconds
        setTimeout(() => {
          setIsAddModalOpen(false);
          if (onRefresh) onRefresh();
        }, 1500);
      } else {
        setError(data.message || 'Failed to add therapist');
      }
    } catch (err: any) {
      console.error('Error adding therapist:', err);
      setError(err.message || 'Failed to add therapist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-blue-100 shadow-lg">
        <CardHeader className="border-b-2 border-blue-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black text-slate-900">
              Therapists Team ({clinicData.therapists?.length || 0})
            </CardTitle>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Therapist
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {clinicData.therapists && clinicData.therapists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinicData.therapists.map((therapist: any, index: number) => (
                <Card key={therapist._id || index} className="border-2 border-blue-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg mb-1">
                          {therapist.displayName || therapist.fullName || 'Therapist'}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">{therapist.title || 'Therapist'}</p>
                        {therapist.specializations && therapist.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {therapist.specializations.slice(0, 2).map((spec: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {spec}
                              </span>
                            ))}
                            {therapist.specializations.length > 2 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                +{therapist.specializations.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        {therapist.consultationFee > 0 && (
                          <p className="text-sm font-semibold text-green-600">
                            ₹{therapist.consultationFee}/session
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold mb-2">No therapists added yet</p>
              <p className="text-sm">Click "Add Therapist" to add your first therapist to the clinic.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Therapist Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] !bg-white shadow-2xl border-2 border-blue-300 rounded-2xl p-0 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                Add New Therapist
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-2 text-base">
                Add a new therapist to your clinic. This creates a therapist record under your clinic.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <form onSubmit={handleAddTherapist} className="space-y-6 py-6">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-sm flex items-center gap-3 shadow-md">
                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl text-green-700 text-sm flex items-center gap-3 shadow-md">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold">{success}</span>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-slate-700 font-semibold mb-2 block">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Dr. John Doe"
                    required
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-700 font-semibold mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="therapist@example.com"
                    required
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-slate-700 font-semibold mb-2 block">
                    Phone <span className="text-slate-500 text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-slate-700 font-semibold mb-2 block">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Therapist"
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specializations" className="text-slate-700 font-semibold mb-2 block">
                    Specializations
                  </Label>
                  <Input
                    id="specializations"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleInputChange}
                    placeholder="Speech Therapy, Occupational Therapy"
                    className="h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white rounded-lg"
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate multiple with commas</p>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-slate-700 font-semibold mb-2 block">
                    Experience (years)
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="5"
                    min="0"
                    className="h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="consultationFee" className="text-slate-700 font-semibold mb-2 block">
                    Consultation Fee (₹)
                  </Label>
                  <Input
                    id="consultationFee"
                    name="consultationFee"
                    type="number"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    placeholder="1000"
                    min="0"
                    className="h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                About
              </h3>
              <div>
                <Label htmlFor="bio" className="text-slate-700 font-semibold mb-2 block">
                  Bio / Description
                </Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief description about the therapist's background, expertise, and approach..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white rounded-lg resize-none"
                />
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Documents & Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Photo Upload */}
                <div>
                  <Label htmlFor="photo" className="text-slate-700 font-semibold mb-2 block">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    Photo <span className="text-slate-500 text-xs font-normal">(JPG/PNG, max 2MB)</span>
                  </Label>
                  {filePreviews.photo ? (
                    <div className="relative">
                      <img 
                        src={filePreviews.photo} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border-2 border-amber-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('photo')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-amber-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-amber-600" />
                        <p className="text-sm text-slate-600">Click to upload photo</p>
                      </div>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => handleFileChange('photo', e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* License Upload */}
                <div>
                  <Label htmlFor="license" className="text-slate-700 font-semibold mb-2 block">
                    <FileText className="w-4 h-4 inline mr-1" />
                    License <span className="text-slate-500 text-xs font-normal">(PDF/Image, max 5MB)</span>
                  </Label>
                  {files.license ? (
                    <div className="relative">
                      <div className="w-full h-32 border-2 border-amber-200 rounded-lg bg-white flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                          <p className="text-xs text-slate-600 truncate px-2">{files.license.name}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('license')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-amber-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-amber-600" />
                        <p className="text-sm text-slate-600">Click to upload license</p>
                      </div>
                      <Input
                        id="license"
                        type="file"
                        accept="application/pdf,image/jpeg,image/jpg,image/png"
                        onChange={(e) => handleFileChange('license', e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Degree Upload */}
                <div>
                  <Label htmlFor="degree" className="text-slate-700 font-semibold mb-2 block">
                    <GraduationCap className="w-4 h-4 inline mr-1" />
                    Degree <span className="text-slate-500 text-xs font-normal">(PDF/Image, max 5MB)</span>
                  </Label>
                  {files.degree ? (
                    <div className="relative">
                      <div className="w-full h-32 border-2 border-amber-200 rounded-lg bg-white flex items-center justify-center">
                        <div className="text-center">
                          <GraduationCap className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                          <p className="text-xs text-slate-600 truncate px-2">{files.degree.name}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('degree')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-amber-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-amber-600" />
                        <p className="text-sm text-slate-600">Click to upload degree</p>
                      </div>
                      <Input
                        id="degree"
                        type="file"
                        accept="application/pdf,image/jpeg,image/jpg,image/png"
                        onChange={(e) => handleFileChange('degree', e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    title: 'Therapist',
                    specializations: '',
                    experience: '',
                    consultationFee: '',
                    bio: '',
                  });
                  if (filePreviews.photo) {
                    URL.revokeObjectURL(filePreviews.photo);
                  }
                  setFiles({ photo: null, license: null, degree: null });
                  setFilePreviews({ photo: null, license: null, degree: null });
                  setError(null);
                  setSuccess(null);
                }}
                disabled={isSubmitting}
                className="h-12 px-6 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding Therapist...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Therapist
                  </>
                )}
              </Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
