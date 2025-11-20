import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Filter, Edit, Save, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PRIMARY_FILTERS, CATEGORY_FILTERS, THERAPY_TYPES } from "@/constants/therabook-filters";

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
    rating: number;
    totalReviews: number;
    completionScore: number;
    pendingPayments: number;
  };
  therapists: any[];
  recentBookings: any[];
  notifications: any[];
}

interface ProfileSectionProps {
  clinicData: ClinicData;
}

export default function ProfileSection({ clinicData }: ProfileSectionProps) {
  const clinic = clinicData?.clinic;
  const [isEditingFilters, setIsEditingFilters] = useState(false);
  const [filterFields, setFilterFields] = useState({
    therapyTypes: (clinic?.services?.therapiesOffered || []) as string[],
    primaryFilters: (clinic?.primaryFilters || []) as string[],
    conditions: (clinic?.conditions || []) as string[]
  });

  if (!clinic) return <div className="p-8 text-center text-slate-600">No clinic profile found.</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-blue-100 shadow-lg">
        <CardHeader className="border-b-2 border-blue-100">
          <CardTitle className="text-2xl font-black text-slate-900">Clinic Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-700 font-bold mb-2 block">Clinic Name</Label>
              <Input className="h-12 border-2 border-blue-200 focus:border-blue-600 rounded-lg" defaultValue={clinic.name || ''} readOnly />
            </div>
            <div>
              <Label className="text-slate-700 font-bold mb-2 block">Clinic Type</Label>
              <Input className="h-12 border-2 border-blue-200 focus:border-blue-600 rounded-lg" defaultValue={Array.isArray(clinic.types) ? clinic.types.join(', ') : (clinic.types || '')} readOnly />
            </div>
            <div className="md:col-span-2">
              <Label className="text-slate-700 font-bold mb-2 block">Address</Label>
              <Input className="h-12 border-2 border-blue-200 focus:border-blue-600 rounded-lg" defaultValue={clinic.address || ''} readOnly />
            </div>
            <div>
              <Label className="text-slate-700 font-bold mb-2 block">Contact Number</Label>
              <Input className="h-12 border-2 border-blue-200 focus:border-blue-600 rounded-lg" defaultValue={clinic.contactNumber || ''} readOnly />
            </div>
            <div>
              <Label className="text-slate-700 font-bold mb-2 block">Email Address</Label>
              <Input className="h-12 border-2 border-blue-200 focus:border-blue-600 rounded-lg" defaultValue={clinic.email || ''} readOnly />
            </div>
            <div>
              <Label className="text-slate-700 font-bold mb-2 block">Registration Number</Label>
              <Input className="h-12 border-2 border-blue-200 focus:border-blue-600 rounded-lg" defaultValue={clinic.registrationNumber || ''} readOnly />
            </div>
            <div>
              <Label className="text-slate-700 font-bold mb-2 block">Established Year</Label>
              <Input className="h-12 border-2 border-blue-200 focus:border-blue-600 rounded-lg" defaultValue={clinic.yearsInOperation || ''} readOnly />
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6" disabled>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" className="border-2 border-blue-200 text-slate-600 hover:bg-blue-50 font-bold px-6" disabled>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Search System Section */}
      <Card className="bg-white border-2 border-indigo-100 shadow-lg">
        <CardHeader className="border-b-2 border-indigo-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Filter className="w-6 h-6 text-indigo-600" />
              Filter & Search Settings
            </CardTitle>
            {!isEditingFilters ? (
              <Button variant="outline" onClick={() => setIsEditingFilters(true)} className="border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Edit className="w-4 h-4 mr-2" />
                Edit Filters
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditingFilters(false)} className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={async () => {
                  // TODO: Save filters to API
                  setIsEditingFilters(false);
                }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Filters
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {/* Therapy Types */}
          <div>
            <Label className="text-slate-700 font-bold mb-3 block">Therapy Types Offered *</Label>
            <p className="text-xs text-slate-500 mb-3">Select all therapy types your clinic offers</p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border-2 border-indigo-100 rounded-lg bg-white">
              {THERAPY_TYPES.map(therapyType => (
                <button
                  key={therapyType}
                  type="button"
                  disabled={!isEditingFilters}
                  onClick={() => {
                    const newTypes = filterFields.therapyTypes.includes(therapyType)
                      ? filterFields.therapyTypes.filter(t => t !== therapyType)
                      : [...filterFields.therapyTypes, therapyType];
                    setFilterFields(prev => ({ ...prev, therapyTypes: newTypes }));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm border-2 transition-all font-semibold ${
                    filterFields.therapyTypes.includes(therapyType)
                      ? 'bg-indigo-500 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-indigo-200 hover:border-indigo-400'
                  } ${!isEditingFilters ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {therapyType}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Filters */}
          <div>
            <Label className="text-slate-700 font-bold mb-3 block">Primary Filters (Quick Access Categories) *</Label>
            <p className="text-xs text-slate-500 mb-3">Select the primary categories your clinic specializes in</p>
            <div className="grid md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-3 border-2 border-indigo-100 rounded-lg bg-white">
              {PRIMARY_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  type="button"
                  disabled={!isEditingFilters}
                  onClick={() => {
                    const newFilters = filterFields.primaryFilters.includes(filter.id)
                      ? filterFields.primaryFilters.filter(f => f !== filter.id)
                      : [...filterFields.primaryFilters, filter.id];
                    setFilterFields(prev => ({ ...prev, primaryFilters: newFilters }));
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    filterFields.primaryFilters.includes(filter.id)
                      ? 'bg-indigo-50 border-indigo-500 shadow-md'
                      : 'bg-white border-indigo-200 hover:border-indigo-400'
                  } ${!isEditingFilters ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{filter.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-700 mb-1">{filter.label}</div>
                      <div className="text-xs text-slate-500">{filter.description}</div>
                    </div>
                    {filterFields.primaryFilters.includes(filter.id) && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <Label className="text-slate-700 font-bold mb-3 block">Conditions Treated *</Label>
            <p className="text-xs text-slate-500 mb-3">Select specific conditions your clinic treats</p>
            <div className="max-h-96 overflow-y-auto p-3 border-2 border-indigo-100 rounded-lg bg-white space-y-4">
              {Object.entries(CATEGORY_FILTERS).map(([key, category]) => (
                <div key={key} className="space-y-2">
                  <h4 className="font-semibold text-sm text-indigo-700">{category.label}</h4>
                  <div className="grid md:grid-cols-2 gap-2 pl-4">
                    {category.conditions.map(condition => (
                      <button
                        key={condition}
                        type="button"
                        disabled={!isEditingFilters}
                        onClick={() => {
                          const newConditions = filterFields.conditions.includes(condition)
                            ? filterFields.conditions.filter(c => c !== condition)
                            : [...filterFields.conditions, condition];
                          setFilterFields(prev => ({ ...prev, conditions: newConditions }));
                        }}
                        className={`px-3 py-2 rounded-lg border-2 text-left text-sm transition-all ${
                          filterFields.conditions.includes(condition)
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'bg-white border-indigo-200 hover:border-indigo-400 text-slate-700'
                        } ${!isEditingFilters ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2">
                          {filterFields.conditions.includes(condition) && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          )}
                          <span>{condition}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
