import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Button } from "../ui/button";
import { Plus, Calendar, DollarSign, Users, Star, TrendingUp } from "lucide-react";

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

interface OverviewSectionProps {
  clinicData: ClinicData;
}

export default function OverviewSection({ clinicData }: OverviewSectionProps) {
  const { metrics, recentBookings } = clinicData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Monthly Bookings</p>
                <h3 className="text-3xl font-black text-slate-900">{metrics.monthlyBookings}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Monthly Revenue</p>
                <h3 className="text-3xl font-black text-slate-900">{formatCurrency(metrics.revenue)}</h3>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Active Therapists</p>
                <h3 className="text-3xl font-black text-slate-900">{metrics.therapists}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Average Rating</p>
                <h3 className="text-3xl font-black text-slate-900">
                  {metrics.rating > 0 ? metrics.rating.toFixed(1) : 'N/A'}
                </h3>
                {metrics.totalReviews > 0 && (
                  <p className="text-xs text-slate-500 mt-1">{metrics.totalReviews} reviews</p>
                )}
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-2 border-blue-100 shadow-lg">
        <CardHeader className="border-b-2 border-blue-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black text-slate-900">Recent Appointments</CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {recentBookings && recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking: any, index: number) => (
                <div key={booking.id || index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{booking.type || 'Session'}</p>
                      <p className="text-sm text-slate-600">
                        {booking.date} at {booking.time || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {booking.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No recent appointments found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Completion Score</h3>
            <p className="text-3xl font-black text-blue-600">{metrics.completionScore || 0}%</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Pending Payments</h3>
            <p className="text-3xl font-black text-green-600">{formatCurrency(metrics.pendingPayments)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Total Therapists</h3>
            <p className="text-3xl font-black text-purple-600">{metrics.therapists}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
