import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

export default function ProfileSection() {
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClinic() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/clinics/me');
        if (!res.ok) throw new Error('Failed to fetch clinic data');
        const json = await res.json();
        setClinic(json?.clinic || json?.data?.clinic || null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Error loading clinic data');
        } else {
          setError('Error loading clinic data');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchClinic();
  }, []);

  if (loading) return <div className="p-8 text-center text-blue-600">Loading clinic profile...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
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
    </div>
  );
}
