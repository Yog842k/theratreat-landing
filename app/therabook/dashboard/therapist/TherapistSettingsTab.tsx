


import React, { useState,useEffect} from 'react';
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export interface TherapistSettingsTabProps {
  profile: any;
  onSave: (form: any) => void;
  saving: boolean;
  success: boolean;
  error: string;
}

export default function TherapistSettingsTab({ profile, onSave, saving, success, error }: TherapistSettingsTabProps) {
  const [form, setForm] = useState<any>({
    ...profile,
    sessionModes: profile.sessionModes || [],
    sessionTypes: profile.sessionTypes || [],
    serviceTypes: profile.serviceTypes || [],
    pricing: profile.pricing || {},
    duration: profile.duration || 50,
    weeklySlots: profile.weeklySlots || [
      { day: 'Monday', start: '09:00', end: '17:00', enabled: true },
      { day: 'Tuesday', start: '09:00', end: '17:00', enabled: true },
      { day: 'Wednesday', start: '09:00', end: '17:00', enabled: true },
      { day: 'Thursday', start: '09:00', end: '17:00', enabled: true },
      { day: 'Friday', start: '09:00', end: '17:00', enabled: true }
    ],
    unavailability: profile.unavailability || [],
    emailNotifications: profile.emailNotifications ?? true,
    smsNotifications: profile.smsNotifications ?? true,
    publicProfile: profile.publicProfile ?? true,
    specializations: profile.specializations || [],
    languages: profile.languages || [],
    degrees: profile.degrees || [],
    certifications: profile.certifications || [],
    platforms: profile.platforms || ['TheraBook Video'],
    bankDetails: profile.bankDetails || {
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [agreementsText, setAgreementsText] = useState('');
  const [availabilityText, setAvailabilityText] = useState('');
  const getSelectedModes = () => {
    const modes = Array.isArray(form.sessionModes) ? form.sessionModes.filter(Boolean) : [];
    return modes.length > 0 ? modes : ['video', 'audio', 'clinic', 'home'];
  };
  const profileKey = `${profile?._id || ''}-${(profile?.updatedAt && typeof profile.updatedAt === 'object' && '$date' in profile.updatedAt) ? profile.updatedAt.$date : (profile?.updatedAt || '')}-${profile?.email || ''}`;
  useEffect(() => {
    if (editMode) return;
    setForm({
      ...profile,
      // Name mapping: prefer fullName, displayName, name
      fullName: profile.fullName || profile.displayName || profile.name || '',
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth || '',
      phoneNumber: profile.phoneNumber || '',
      email: profile.email || '',
      residentialAddress: profile.residentialAddress || profile.clinicAddress || profile.location || '',
      currentCity: profile.currentCity || '',
      panCard: profile.panCard || '',
      aadhaar: profile.aadhaar || '',
      profilePhotoUrl: profile.profilePhotoUrl || profile.image || '',
      qualification: profile.qualification || '',
      university: profile.university || '',
      graduationYear: profile.graduationYear || '',
      licenseNumber: profile.licenseNumber || '',
      qualificationCertUrls: profile.qualificationCertUrls || [],
      licenseDocumentUrl: profile.licenseDocumentUrl || '',
      resumeUrl: profile.resumeUrl || '',
      designations: profile.designations || [],
      primaryConditions: profile.primaryConditions || [],
      primaryFilters: profile.primaryFilters || [],
      experience: profile.experience || '',
      workplaces: profile.workplaces || '',
      onlineExperience: profile.onlineExperience || false,
      preferredDays: profile.preferredDays || [],
      preferredTimeSlots: profile.preferredTimeSlots || [],
      weeklySessions: profile.weeklySessions || '',
      sessionDurations: profile.sessionDurations || [],
      sessionFee: profile.sessionFee || profile.consultationFee || 0,
      dynamicPricing: profile.dynamicPricing || false,
      freeFirstSession: profile.freeFirstSession || false,
      paymentMode: profile.paymentMode || '',
      bankDetails: profile.bankDetails || {
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
      },
      hasClinic: profile.hasClinic || false,
      bio: profile.bio || '',
      linkedIn: profile.linkedIn || '',
      website: profile.website || '',
      instagram: profile.instagram || '',
      therapyLanguages: profile.therapyLanguages || profile.languages || profile.preferredLanguages || [],
      agreements: profile.agreements || {},
      displayName: profile.displayName || '',
      title: profile.title || '',
      specializations: profile.specializations || profile.designations || [],
      languages: profile.languages || profile.therapyLanguages || profile.preferredLanguages || [],
      sessionTypes: profile.sessionTypes || [],
      serviceTypes: profile.serviceTypes || [],
      availability: profile.availability || [],
      consultationFee: profile.consultationFee || profile.sessionFee || 0,
      currency: profile.currency || 'INR',
      isApproved: profile.isApproved || false,
      registrationCompleted: profile.registrationCompleted || false,
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount || 0,
      createdAt: profile.createdAt || '',
      updatedAt: profile.updatedAt || '',
      rejected: profile.rejected || false,
      status: profile.status || '',
      verified: profile.verified || profile.isVerified || false,
      verifiedAt: profile.verifiedAt || '',
      clinicAddress: profile.clinicAddress || profile.residentialAddress || profile.location || '',
      location: profile.location || profile.clinicAddress || profile.residentialAddress || '',
      name: profile.name || profile.fullName || profile.displayName || '',
      // UI fields
      sessionModes: profile.sessionModes || profile.sessionTypes || [],
      pricing: profile.pricing || {
        video: profile.consultationFee || 0,
        audio: profile.consultationFee || 0,
        clinic: profile.consultationFee || 0,
        home: profile.consultationFee || 0
      },
      duration: (profile.sessionDurations && profile.sessionDurations.length > 0) ? parseInt(profile.sessionDurations[0]) || 50 : 50,
      weeklySlots: profile.weeklySlots || [
        { day: 'Monday', start: '09:00', end: '17:00', enabled: true },
        { day: 'Tuesday', start: '09:00', end: '17:00', enabled: true },
        { day: 'Wednesday', start: '09:00', end: '17:00', enabled: true },
        { day: 'Thursday', start: '09:00', end: '17:00', enabled: true },
        { day: 'Friday', start: '09:00', end: '17:00', enabled: true }
      ],
      unavailability: profile.unavailability || [],
      emailNotifications: profile.emailNotifications ?? true,
      smsNotifications: profile.smsNotifications ?? true,
      publicProfile: profile.publicProfile ?? true,
      degrees: profile.degrees || [],
      certifications: profile.certifications || [],
      platforms: profile.platforms || ['TheraBook Video'],
    });
    setAgreementsText(JSON.stringify(profile.agreements || {}, null, 2));
    setAvailabilityText(JSON.stringify(profile.availability || [], null, 2));
    setEditMode(false);
  }, [profileKey, editMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && 'checked' in e.target) {
      setForm((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [name]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let parsedAgreements = form.agreements;
    let parsedAvailability = form.availability;
    try {
      parsedAgreements = agreementsText.trim() ? JSON.parse(agreementsText) : {};
    } catch {}
    try {
      parsedAvailability = availabilityText.trim() ? JSON.parse(availabilityText) : [];
    } catch {}
    onSave({
      ...form,
      sessionModes: form.sessionModes,
      pricing: form.pricing,
      agreements: parsedAgreements,
      availability: parsedAvailability,
    });
    setEditMode(false);
  };

  return (
    <div className="space-y-8">
      {!editMode && (
        <div className="flex justify-end mb-4">
          <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition" onClick={() => setEditMode(true)}>
            Edit
          </button>
        </div>
      )}
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              {editMode ? (
                <input type="text" name="displayName" value={form.displayName ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.displayName ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              {editMode ? (
                <input type="text" name="title" value={form.title ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.title ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              {editMode ? (
                <input type="text" name="fullName" value={form.fullName ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.fullName ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name (Internal)</label>
              {editMode ? (
                <input type="text" name="name" value={form.name ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.name ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              {editMode ? (
                <select name="gender" value={form.gender ?? ''} onChange={handleChange} className="input-ui">
                  {genderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div className="py-2 text-slate-700">{form.gender ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              {editMode ? (
                <input type="date" name="dateOfBirth" value={form.dateOfBirth ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.dateOfBirth ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              {editMode ? (
                <input type="tel" name="phoneNumber" value={form.phoneNumber ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.phoneNumber ?? ''}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              {editMode ? (
                <input type="email" name="email" value={form.email ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.email ?? ''}</div>
              )}
            </div>
          </div>
        </div>
        {/* Address & IDs */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Address & IDs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Residential Address</label>
              {editMode ? (
                <textarea name="residentialAddress" value={form.residentialAddress ?? ''} onChange={handleChange} className="input-ui min-h-[48px]" />
              ) : (
                <div className="py-2 text-slate-700">{form.residentialAddress ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Clinic Address</label>
              {editMode ? (
                <textarea name="clinicAddress" value={form.clinicAddress ?? ''} onChange={handleChange} className="input-ui min-h-[48px]" />
              ) : (
                <div className="py-2 text-slate-700">{form.clinicAddress ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current City</label>
              {editMode ? (
                <input type="text" name="currentCity" value={form.currentCity ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.currentCity ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              {editMode ? (
                <input type="text" name="location" value={form.location ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.location ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PAN Card</label>
              {editMode ? (
                <input type="text" name="panCard" value={form.panCard ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.panCard ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Aadhaar</label>
              {editMode ? (
                <input type="text" name="aadhaar" value={form.aadhaar ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.aadhaar ?? ''}</div>
              )}
            </div>
          </div>
        </div>
        {/* Professional Info, Session Types, Modes, Pricing, Duration, Weekly Slots, Unavailability, Notifications, Public Profile, Specializations, Degrees, Certifications, Platforms */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Professional & Service Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Qualification, University, Graduation Year, License Number, Experience, Workplaces, Online Experience */}
            <div>
              <label className="block text-sm font-medium mb-1">Designations</label>
              {editMode ? (
                <input
                  type="text"
                  name="designations"
                  value={form.designations?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, designations: e.target.value.split(',').map((d: string) => d.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="e.g. Clinical Psychologist, CBT Specialist"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.designations?.length ? form.designations.join(', ') : '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qualification</label>
              {editMode ? (
                <input type="text" name="qualification" value={form.qualification ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.qualification ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">University</label>
              {editMode ? (
                <input type="text" name="university" value={form.university ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.university ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Graduation Year</label>
              {editMode ? (
                <input type="text" name="graduationYear" value={form.graduationYear ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.graduationYear ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Number</label>
              {editMode ? (
                <input type="text" name="licenseNumber" value={form.licenseNumber ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.licenseNumber ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience (years)</label>
              {editMode ? (
                <input type="text" name="experience" value={form.experience ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.experience ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Workplaces</label>
              {editMode ? (
                <input type="text" name="workplaces" value={form.workplaces ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.workplaces ?? ''}</div>
              )}
            </div>
            <div className="flex items-center gap-2 md:col-span-2 mt-2">
              {editMode ? (
                <><input type="checkbox" name="onlineExperience" checked={form.onlineExperience} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                <label className="text-sm font-medium">Online Experience</label></>
              ) : (
                <div className="py-2 text-slate-700">Online Experience: {form.onlineExperience ? 'Yes' : 'No'}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Preferred Languages</label>
              {editMode ? (
                <input
                  type="text"
                  name="preferredLanguages"
                  value={form.preferredLanguages?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, preferredLanguages: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="e.g. English, Hindi"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.preferredLanguages?.length ? form.preferredLanguages.join(', ') : '-'}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Therapy Languages</label>
              {editMode ? (
                <input
                  type="text"
                  name="therapyLanguages"
                  value={form.therapyLanguages?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, therapyLanguages: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="e.g. English, Hindi"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.therapyLanguages?.length ? form.therapyLanguages.join(', ') : '-'}</div>
              )}
            </div>
            {/* Specializations */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Specializations</label>
              {editMode ? (
                <input type="text" name="specializations" value={form.specializations?.join(', ')} onChange={e => setForm((prev: any) => ({ ...prev, specializations: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))} className="input-ui" placeholder="e.g. CBT, Anxiety, Depression" />
              ) : (
                <div className="py-2 text-slate-700">{form.specializations?.length ? form.specializations.join(', ') : '-'}</div>
              )}
            </div>
            {/* Degrees */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Degrees</label>
              {editMode ? (
                <input type="text" name="degrees" value={form.degrees?.join(', ')} onChange={e => setForm((prev: any) => ({ ...prev, degrees: e.target.value.split(',').map((d: string) => d.trim()).filter(Boolean) }))} className="input-ui" placeholder="e.g. M.A. Psychology, PhD" />
              ) : (
                <div className="py-2 text-slate-700">{form.degrees?.length ? form.degrees.join(', ') : '-'}</div>
              )}
            </div>
            {/* Certifications */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Certifications</label>
              {editMode ? (
                <input type="text" name="certifications" value={form.certifications?.join(', ') ?? ''} onChange={e => setForm((prev: any) => ({ ...prev, certifications: e.target.value.split(',').map((c: string) => c.trim()).filter(Boolean) }))} className="input-ui" placeholder="e.g. RCI, IACP" />
              ) : (
                <div className="py-2 text-slate-700">{form.certifications?.length ? form.certifications.join(', ') : ''}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Primary Conditions</label>
              {editMode ? (
                <input
                  type="text"
                  name="primaryConditions"
                  value={form.primaryConditions?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, primaryConditions: e.target.value.split(',').map((c: string) => c.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="e.g. Anxiety, Depression"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.primaryConditions?.length ? form.primaryConditions.join(', ') : '-'}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Primary Filters</label>
              {editMode ? (
                <input
                  type="text"
                  name="primaryFilters"
                  value={form.primaryFilters?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, primaryFilters: e.target.value.split(',').map((f: string) => f.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="e.g. CBT, Trauma, Couples"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.primaryFilters?.length ? form.primaryFilters.join(', ') : '-'}</div>
              )}
            </div>
            {/* Platforms */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Platforms</label>
              {editMode ? (
                <input type="text" name="platforms" value={form.platforms?.join(', ')} onChange={e => setForm((prev: any) => ({ ...prev, platforms: e.target.value.split(',').map((p: string) => p.trim()).filter(Boolean) }))} className="input-ui" placeholder="e.g. TheraBook Video, Zoom" />
              ) : (
                <div className="py-2 text-slate-700">{form.platforms?.length ? form.platforms.join(', ') : '-'}</div>
              )}
            </div>
          </div>
          {/* Session Types */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Session Types</label>
            {editMode ? (
              <input type="text" name="sessionTypes" value={form.sessionTypes?.join(', ') ?? ''} onChange={e => setForm((prev: any) => ({ ...prev, sessionTypes: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))} className="input-ui" placeholder="e.g. Individual, Couple, Family" />
            ) : (
              <div className="py-2 text-slate-700">{form.sessionTypes?.length ? form.sessionTypes.join(', ') : ''}</div>
            )}
          </div>
          {/* Service Types */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Service Types</label>
            {editMode ? (
              <input type="text" name="serviceTypes" value={form.serviceTypes?.join(', ') ?? ''} onChange={e => setForm((prev: any) => ({ ...prev, serviceTypes: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))} className="input-ui" placeholder="e.g. Therapy, Coaching" />
            ) : (
              <div className="py-2 text-slate-700">{form.serviceTypes?.length ? form.serviceTypes.join(', ') : ''}</div>
            )}
          </div>
          {/* Session Modes */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Session Modes</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {['video','audio','clinic','home'].map(mode => (
                editMode ? (
                  <button
                    type="button"
                    key={mode}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${form.sessionModes?.includes(mode) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'}`}
                    onClick={() => {
                      setForm((prev: any) => {
                        const modes = prev.sessionModes || [];
                        return {
                          ...prev,
                          sessionModes: modes.includes(mode)
                            ? modes.filter((m: string) => m !== mode)
                            : [...modes, mode]
                        };
                      });
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ) : (
                  <span key={mode} className={`px-3 py-1 rounded-lg border text-xs font-medium mr-2 ${form.sessionModes?.includes(mode) ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                )
              ))}
            </div>
          </div>
          {/* Pricing for each mode */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {getSelectedModes().map((mode: string) => (
              <div key={mode}>
                <label className="block text-xs font-medium mb-1">{mode.charAt(0).toUpperCase() + mode.slice(1)} Price (₹)</label>
                {editMode ? (
                  <input
                    type="number"
                    name={`price_${mode}`}
                    value={form.pricing?.[mode] !== undefined ? String(form.pricing[mode]) : ''}
                    onChange={e => {
                      let value = e.target.value;
                      setForm((prev: any) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          [mode]: value === '' ? 0 : Number(value)
                        }
                      }));
                    }}
                    className="input-ui"
                    min={0}
                  />
                ) : (
                  <div className="py-2 text-slate-700">₹{form.pricing?.[mode] ?? '-'}</div>
                )}
              </div>
            ))}
          </div>
          {/* Duration */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Session Duration (minutes)</label>
            {editMode ? (
              <input type="number" name="duration" value={form.duration} onChange={handleChange} className="input-ui" min={10} max={180} />
            ) : (
              <div className="py-2 text-slate-700">{form.duration || 50} min</div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Session Durations (comma-separated)</label>
              {editMode ? (
                <input
                  type="text"
                  name="sessionDurations"
                  value={form.sessionDurations?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, sessionDurations: e.target.value.split(',').map((d: string) => d.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="e.g. 30, 45, 60"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.sessionDurations?.length ? form.sessionDurations.join(', ') : '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weekly Sessions</label>
              {editMode ? (
                <input type="text" name="weeklySessions" value={form.weeklySessions ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.weeklySessions ?? '-'}</div>
              )}
            </div>
          </div>
          {/* Weekly Slots */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Weekly Availability</label>
            <div className="space-y-2">
              {(Array.isArray(form.weeklySlots) ? form.weeklySlots : []).map((slot: any, idx: number) => (
                <div key={slot.day || idx} className="flex items-center gap-2">
                  <span className="w-24 font-medium">{slot.day}</span>
                  {editMode ? (
                    <>
                      <input type="time" value={slot.start} onChange={e => setForm((prev: any) => {
                        const updated = Array.isArray(prev.weeklySlots) ? [...prev.weeklySlots] : [];
                        updated[idx].start = e.target.value;
                        return { ...prev, weeklySlots: updated };
                      })} className="input-ui w-28" />
                      <span>-</span>
                      <input type="time" value={slot.end} onChange={e => setForm((prev: any) => {
                        const updated = Array.isArray(prev.weeklySlots) ? [...prev.weeklySlots] : [];
                        updated[idx].end = e.target.value;
                        return { ...prev, weeklySlots: updated };
                      })} className="input-ui w-28" />
                      <label className="ml-2 flex items-center gap-1"><input type="checkbox" checked={slot.enabled} onChange={e => setForm((prev: any) => {
                        const updated = Array.isArray(prev.weeklySlots) ? [...prev.weeklySlots] : [];
                        updated[idx].enabled = e.target.checked;
                        return { ...prev, weeklySlots: updated };
                      })} className="accent-blue-600 w-4 h-4" /> Enable</label>
                    </>
                  ) : (
                    <span className="text-slate-700">{slot.start} - {slot.end} {slot.enabled ? '' : '(Disabled)'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Unavailability */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Unavailability (Blocks)</label>
            {editMode ? (
              <textarea name="unavailability" value={form.unavailability?.map((b: any) => `${b.startDate} to ${b.endDate} (${b.time || 'ALL DAY'})${b.note ? ' - ' + b.note : ''}`).join('\n')} onChange={e => setForm((prev: any) => ({ ...prev, unavailability: e.target.value.split('\n').map((line: string) => {
                const [dates, rest] = line.split('(');
                const [startDate, endDate] = dates.split('to').map((d: string) => d.trim());
                const [timeNote] = rest ? rest.replace(')', '').split('-') : ['ALL DAY'];
                const note = rest && rest.includes('-') ? rest.split('-')[1].trim() : '';
                return { startDate, endDate, time: timeNote.trim(), note, allDay: timeNote.trim().toUpperCase() === 'ALL DAY' };
              }) }))} className="input-ui min-h-[60px]" placeholder="YYYY-MM-DD to YYYY-MM-DD (ALL DAY) - Optional note" />
            ) : (
              <div className="py-2 text-slate-700 whitespace-pre-line">{form.unavailability?.length ? form.unavailability.map((b: any) => `${b.startDate} to ${b.endDate} (${b.time || 'ALL DAY'})${b.note ? ' - ' + b.note : ''}`).join('\n') : '-'}</div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Days</label>
              {editMode ? (
                <input
                  type="text"
                  name="preferredDays"
                  value={form.preferredDays?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, preferredDays: e.target.value.split(',').map((d: string) => d.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="e.g. Monday, Wednesday"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.preferredDays?.length ? form.preferredDays.join(', ') : '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Time Slots</label>
              {editMode ? (
                <input
                  type="text"
                  name="preferredTimeSlots"
                  value={form.preferredTimeSlots?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, preferredTimeSlots: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="e.g. 10:00-12:00, 16:00-18:00"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.preferredTimeSlots?.length ? form.preferredTimeSlots.join(', ') : '-'}</div>
              )}
            </div>
          </div>
          {/* Notifications & Public Profile */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Notifications</label>
              {editMode ? (
                <input type="checkbox" name="emailNotifications" checked={form.emailNotifications} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
              ) : (
                <div className="py-2 text-slate-700">{form.emailNotifications ? 'Enabled' : 'Disabled'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMS Notifications</label>
              {editMode ? (
                <input type="checkbox" name="smsNotifications" checked={form.smsNotifications} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
              ) : (
                <div className="py-2 text-slate-700">{form.smsNotifications ? 'Enabled' : 'Disabled'}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Public Profile</label>
              {editMode ? (
                <input type="checkbox" name="publicProfile" checked={form.publicProfile} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
              ) : (
                <div className="py-2 text-slate-700">{form.publicProfile ? 'Visible' : 'Hidden'}</div>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {editMode ? (
                <><input type="checkbox" name="hasClinic" checked={form.hasClinic} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                <label className="text-sm font-medium">Has Clinic</label></>
              ) : (
                <div className="py-2 text-slate-700">Has Clinic: {form.hasClinic ? 'Yes' : 'No'}</div>
              )}
            </div>
          </div>
        </div>
        {/* Payments & Pricing Flags */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Payments & Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Mode</label>
              {editMode ? (
                <input type="text" name="paymentMode" value={form.paymentMode ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.paymentMode ?? '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Consultation Fee (â‚¹)</label>
              {editMode ? (
                <input type="number" name="consultationFee" value={form.consultationFee ?? ''} onChange={handleChange} className="input-ui" min={0} />
              ) : (
                <div className="py-2 text-slate-700">{form.consultationFee ?? '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Session Fee (â‚¹)</label>
              {editMode ? (
                <input type="number" name="sessionFee" value={form.sessionFee ?? ''} onChange={handleChange} className="input-ui" min={0} />
              ) : (
                <div className="py-2 text-slate-700">{form.sessionFee ?? '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              {editMode ? (
                <input type="text" name="currency" value={form.currency ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.currency ?? '-'}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <><input type="checkbox" name="dynamicPricing" checked={form.dynamicPricing} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                <label className="text-sm font-medium">Dynamic Pricing</label></>
              ) : (
                <div className="py-2 text-slate-700">Dynamic Pricing: {form.dynamicPricing ? 'Yes' : 'No'}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <><input type="checkbox" name="freeFirstSession" checked={form.freeFirstSession} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                <label className="text-sm font-medium">Free First Session</label></>
              ) : (
                <div className="py-2 text-slate-700">Free First Session: {form.freeFirstSession ? 'Yes' : 'No'}</div>
              )}
            </div>
          </div>
        </div>
        {/* Bio & Social */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Bio & Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Bio</label>
              {editMode ? (
                <textarea name="bio" value={form.bio} onChange={handleChange} className="input-ui min-h-[60px]" />
              ) : (
                <div className="py-2 text-slate-700">{form.bio || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              {editMode ? (
                <input type="text" name="linkedIn" value={form.linkedIn} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.linkedIn || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              {editMode ? (
                <input type="text" name="website" value={form.website} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.website || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              {editMode ? (
                <input type="text" name="instagram" value={form.instagram} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.instagram || '-'}</div>
              )}
            </div>
          </div>
        </div>
        {/* Media & Documents */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Media & Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Profile Photo URL</label>
              {editMode ? (
                <input type="text" name="profilePhotoUrl" value={form.profilePhotoUrl ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.profilePhotoUrl || '-'}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Qualification Certificate URLs</label>
              {editMode ? (
                <input
                  type="text"
                  name="qualificationCertUrls"
                  value={form.qualificationCertUrls?.join(', ') ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, qualificationCertUrls: e.target.value.split(',').map((u: string) => u.trim()).filter(Boolean) }))}
                  className="input-ui"
                  placeholder="Comma-separated URLs"
                />
              ) : (
                <div className="py-2 text-slate-700">{form.qualificationCertUrls?.length ? form.qualificationCertUrls.join(', ') : '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Document URL</label>
              {editMode ? (
                <input type="text" name="licenseDocumentUrl" value={form.licenseDocumentUrl ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.licenseDocumentUrl || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resume URL</label>
              {editMode ? (
                <input type="text" name="resumeUrl" value={form.resumeUrl ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.resumeUrl || '-'}</div>
              )}
            </div>
          </div>
        </div>
        {/* Account & Verification */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Account & Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              {editMode ? (
                <input type="text" name="status" value={form.status ?? ''} onChange={handleChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.status || '-'}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <><input type="checkbox" name="isApproved" checked={form.isApproved} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                <label className="text-sm font-medium">Approved</label></>
              ) : (
                <div className="py-2 text-slate-700">Approved: {form.isApproved ? 'Yes' : 'No'}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <><input type="checkbox" name="registrationCompleted" checked={form.registrationCompleted} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                <label className="text-sm font-medium">Registration Completed</label></>
              ) : (
                <div className="py-2 text-slate-700">Registration Completed: {form.registrationCompleted ? 'Yes' : 'No'}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <><input type="checkbox" name="rejected" checked={form.rejected} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                <label className="text-sm font-medium">Rejected</label></>
              ) : (
                <div className="py-2 text-slate-700">Rejected: {form.rejected ? 'Yes' : 'No'}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <><input type="checkbox" name="verified" checked={form.verified} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                <label className="text-sm font-medium">Verified</label></>
              ) : (
                <div className="py-2 text-slate-700">Verified: {form.verified ? 'Yes' : 'No'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verified At</label>
              {editMode ? (
                <input type="text" name="verifiedAt" value={form.verifiedAt ?? ''} onChange={handleChange} className="input-ui" placeholder="YYYY-MM-DD or ISO" />
              ) : (
                <div className="py-2 text-slate-700">{form.verifiedAt || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              {editMode ? (
                <input type="number" name="rating" value={form.rating ?? ''} onChange={handleChange} className="input-ui" min={0} step="0.1" />
              ) : (
                <div className="py-2 text-slate-700">{form.rating ?? '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Count</label>
              {editMode ? (
                <input type="number" name="reviewCount" value={form.reviewCount ?? ''} onChange={handleChange} className="input-ui" min={0} />
              ) : (
                <div className="py-2 text-slate-700">{form.reviewCount ?? '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Created At</label>
              {editMode ? (
                <input type="text" name="createdAt" value={form.createdAt ?? ''} onChange={handleChange} className="input-ui" placeholder="YYYY-MM-DD or ISO" />
              ) : (
                <div className="py-2 text-slate-700">{form.createdAt || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Updated At</label>
              {editMode ? (
                <input type="text" name="updatedAt" value={form.updatedAt ?? ''} onChange={handleChange} className="input-ui" placeholder="YYYY-MM-DD or ISO" />
              ) : (
                <div className="py-2 text-slate-700">{form.updatedAt || '-'}</div>
              )}
            </div>
          </div>
        </div>
        {/* Agreements & Availability */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Agreements & Availability</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Agreements (JSON)</label>
              {editMode ? (
                <textarea
                  value={agreementsText}
                  onChange={(e) => setAgreementsText(e.target.value)}
                  className="input-ui min-h-[80px]"
                  placeholder='{"termsAccepted": true}'
                />
              ) : (
                <div className="py-2 text-slate-700 whitespace-pre-line">{agreementsText || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Availability (JSON)</label>
              {editMode ? (
                <textarea
                  value={availabilityText}
                  onChange={(e) => setAvailabilityText(e.target.value)}
                  className="input-ui min-h-[80px]"
                  placeholder='[{"day":"Monday","start":"09:00","end":"17:00"}]'
                />
              ) : (
                <div className="py-2 text-slate-700 whitespace-pre-line">{availabilityText || '-'}</div>
              )}
            </div>
          </div>
        </div>
        {/* Bank Details */}
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Account Holder</label>
              {editMode ? (
                <input type="text" name="accountHolder" value={form.bankDetails?.accountHolder ?? ''} onChange={handleBankChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.bankDetails?.accountHolder ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              {editMode ? (
                <input type="text" name="bankName" value={form.bankDetails?.bankName ?? ''} onChange={handleBankChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.bankDetails?.bankName ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              {editMode ? (
                <input type="text" name="accountNumber" value={form.bankDetails?.accountNumber ?? ''} onChange={handleBankChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.bankDetails?.accountNumber ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IFSC Code</label>
              {editMode ? (
                <input type="text" name="ifscCode" value={form.bankDetails?.ifscCode ?? ''} onChange={handleBankChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.bankDetails?.ifscCode ?? ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">UPI ID</label>
              {editMode ? (
                <input type="text" name="upiId" value={form.bankDetails?.upiId ?? ''} onChange={handleBankChange} className="input-ui" />
              ) : (
                <div className="py-2 text-slate-700">{form.bankDetails?.upiId ?? ''}</div>
              )}
            </div>
          </div>
        </div>
        {/* ...existing code for other sections, using editMode to toggle between input and read-only ... */}
        {/* Save Button */}
        {editMode && (
          <div className="flex items-center justify-end pt-2">
            <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="ml-4 px-6 py-2 rounded-xl font-semibold border border-slate-300 text-slate-600 bg-white hover:bg-slate-100 transition" onClick={() => setEditMode(false)} disabled={saving}>
              Cancel
            </button>
            {success && <span className="ml-4 text-green-600 font-medium">Saved!</span>}
            {error && <span className="ml-4 text-red-600 font-medium">{error}</span>}
          </div>
        )}
      </form>
    </div>
  );
}
