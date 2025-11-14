import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import React from "react";
import Button from "@mui/material/Button";
import { Filter } from "lucide-react";
import { Plus } from "lucide-react";
export default function AppointmentsSection() {
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
