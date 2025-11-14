import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import React from "react";
import Button from "@mui/material/Button";
import { Filter } from "lucide-react";
import { Plus } from "lucide-react";

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

interface AppointmentsSectionProps {
  clinicData: ClinicData;
}

export default function AppointmentsSection({ clinicData }: AppointmentsSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-blue-100 shadow-lg">
        <CardHeader className="border-b-2 border-blue-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black text-slate-900">All Appointments</CardTitle>
            <div className="flex gap-3">
              <Button className="border-2 border-blue-200 text-slate-600 hover:bg-blue-50 font-semibold">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center text-slate-500">
          No appointments found. Connect to backend to show appointments.
        </CardContent>
      </Card>
    </div>
  );
}
