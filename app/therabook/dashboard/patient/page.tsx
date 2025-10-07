"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface BookingItem {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  sessionType: string;
  status: string;
  totalAmount?: number;
  therapist?: { name?: string };
  therapistId?: string;
}

export default function PatientBookingsDashboard() {
  const { isAuthenticated, token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  const loadBookings = async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/bookings?limit=100', { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed');
      setBookings(json.data.bookings || []);
    } catch (e:any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) loadBookings(); }, [isAuthenticated]);

  const upcoming = bookings.filter(b => ['pending','confirmed'].includes(b.status));
  const past = bookings.filter(b => ['completed','cancelled'].includes(b.status));

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      await loadBookings();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <Button variant="outline" size="sm" onClick={loadBookings}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>
      {!isAuthenticated && <div className="text-sm text-red-600">Please log in to see bookings.</div>}
      {loading && <div className="text-sm">Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="space-y-4">
            {upcoming.map(b => (
              <Card key={b._id} className="overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{b.sessionType.replace('-', ' ')} • {formatDate(b.appointmentDate)} {b.appointmentTime}</div>
                    <div className="text-xs text-slate-500">Therapist: {b.therapist?.name || b.therapistId}</div>
                    <div className="text-xs text-slate-500">Amount: ₹{b.totalAmount || 0}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{b.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => cancelBooking(b._id)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!upcoming.length && !loading && <div className="text-xs text-slate-500">No upcoming bookings.</div>}
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="space-y-4">
            {past.map(b => (
              <Card key={b._id} className="overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{b.sessionType.replace('-', ' ')} • {formatDate(b.appointmentDate)} {b.appointmentTime}</div>
                    <div className="text-xs text-slate-500">Therapist: {b.therapist?.name || b.therapistId}</div>
                    <div className="text-xs text-slate-500">Amount: ₹{b.totalAmount || 0}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{b.status}</Badge>
                    <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" />Invoice</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!past.length && !loading && <div className="text-xs text-slate-500">No past bookings.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
