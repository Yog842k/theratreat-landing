import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { MapPin } from "lucide-react";

interface ClinicData {
  clinic: { _id: string; name: string; [key: string]: any; };
  metrics: { monthlyBookings: number; revenue: number; therapists: number; rating: number; totalReviews: number; completionScore: number; pendingPayments: number; };
  therapists: any[];
  recentBookings: any[];
  notifications: any[];
}

interface LocationSectionProps {
  clinicData: ClinicData;
}

export default function LocationSection({ clinicData }: LocationSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-blue-100 shadow-lg">
        <CardHeader className="border-b-2 border-blue-100">
          <CardTitle className="text-2xl font-black text-slate-900">Clinic Location</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Location Module</h3>
            <p className="text-slate-500">Map and address details will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
