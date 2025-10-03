"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Building2, Users, Calendar, Star, MapPin, Bell, IndianRupee, CheckCircle, AlertCircle, Eye, Edit, Plus, Filter, Download } from 'lucide-react';

interface DashboardData {
  clinic: any;
  therapists: any[];
  metrics: any;
  recentBookings: any[];
  notifications: any[];
}

export default function ClinicDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/clinics/me', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || json.error || 'Failed');
        if (mounted) setData(json.data);
      } catch (e: any) {
        if (mounted) setError(e.message);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-8 text-sm">Loading clinic dashboard...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-sm">No data.</div>;

  const { clinic, therapists, metrics, recentBookings, notifications } = data;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Monthly Bookings</p><p className="text-2xl font-semibold">{metrics.monthlyBookings}</p></div><Calendar className="w-8 h-8 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Monthly Revenue</p><p className="text-2xl font-semibold">₹{(metrics.revenue/1000).toFixed(1)}K</p></div><IndianRupee className="w-8 h-8 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Active Therapists</p><p className="text-2xl font-semibold">{metrics.therapists}</p></div><Users className="w-8 h-8 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Avg Rating</p><p className="text-2xl font-semibold">{metrics.rating || 0}</p><div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs text-muted-foreground">({metrics.totalReviews||0})</span></div></div><Star className="w-8 h-8 text-primary" /></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2"><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent Bookings</CardTitle></CardHeader><CardContent><div className="space-y-4">{recentBookings.map(rb => (<div key={rb.id} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex-1"><p className="font-medium">{rb.patient}</p><p className="text-sm text-muted-foreground">{rb.therapist} • {rb.type}</p><p className="text-xs text-muted-foreground">{rb.date} {rb.time}</p></div><Badge variant="outline">{rb.status||'--'}</Badge></div>))}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent Activity</CardTitle><Bell className="w-4 h-4" /></CardHeader><CardContent><div className="space-y-3">{notifications.slice(0,4).map(n => (<div key={n.id} className="flex gap-3 p-2 rounded hover:bg-muted"><div className={`w-2 h-2 rounded-full mt-2 ${n.read?'bg-muted-foreground':'bg-primary'}`} /><div className="flex-1"><p className="text-sm">{n.message}</p><p className="text-xs text-muted-foreground">{n.time}</p></div></div>))}</div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Profile Completion Score</CardTitle><p className="text-sm text-muted-foreground">Improve to attract more patients</p></CardHeader><CardContent><div className="space-y-4"><div className="flex justify-between"><span>Overall Completion</span><span>{metrics.completionScore}%</span></div><Progress value={metrics.completionScore||0} className="h-2" /><div className="grid md:grid-cols-3 gap-4 text-sm"><div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" />Basic Info</div><div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" />Therapists</div><div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-yellow-500" />Gallery</div></div></div></CardContent></Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6"><Card><CardHeader><CardTitle>Clinic Information</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-2 gap-6 text-sm"><div className="space-y-3"><div><Label>Name</Label><Input readOnly value={clinic.name||''} /></div><div><Label>Type</Label><Input readOnly value={(clinic.types||[]).join(', ')} /></div><div><Label>Phone</Label><Input readOnly value={clinic.contactNumber||''} /></div><div><Label>Email</Label><Input readOnly value={clinic.email||''} /></div></div><div className="space-y-3"><div><Label>Address</Label><Input readOnly value={clinic.address||clinic.city||''} /></div><div><Label>Website</Label><Input readOnly value={clinic.website||''} /></div><div><Label>Owner</Label><Input readOnly value={clinic.owner?.name||''} /></div><div><Label>Status</Label><Badge variant="secondary">{clinic.active?'Active':'Disabled'}</Badge></div></div></div><div className="flex gap-2 mt-6"><Button><Edit className="w-4 h-4 mr-2" /> Edit Profile</Button><Button variant="outline"><Eye className="w-4 h-4 mr-2" /> Public Profile</Button></div></CardContent></Card></div>
  );

  const renderTherapists = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h3>Therapist Team</h3><Button><Plus className="w-4 h-4 mr-2" /> Add Therapist</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{therapists.map(t => (<Card key={t._id}><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><Avatar><AvatarImage src={t.image||''} /><AvatarFallback>{(t.displayName||'T').split(' ').map((n:string)=>n[0]).join('')}</AvatarFallback></Avatar><div><p className="font-medium">{t.displayName}</p><p className="text-xs text-muted-foreground">{(t.specializations||[]).join(', ')}</p></div></div><div className="space-y-1 text-xs"><div className="flex justify-between"><span>Experience</span><span>{t.experience || 0} yrs</span></div><div className="flex justify-between"><span>Fee</span><span>₹{t.consultationFee||0}</span></div><div className="flex justify-between"><span>Status</span><span>{t.active?'Active':'Inactive'}</span></div></div><div className="flex gap-2 mt-3"><Button size="sm" variant="outline" className="flex-1"><Eye className="w-3 h-3 mr-1" />View</Button><Button size="sm" variant="outline" className="flex-1"><Edit className="w-3 h-3 mr-1" />Edit</Button></div></CardContent></Card>))}</div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6"><div className="flex justify-between items-center"><h3>Bookings</h3><div className="flex gap-2"><Button size="sm" variant="outline"><Filter className="w-4 h-4 mr-1" />Filter</Button><Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" />Export</Button></div></div><Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b"><tr><th className="text-left p-3">Patient</th><th className="text-left p-3">Therapist</th><th className="text-left p-3">Service</th><th className="text-left p-3">Date/Time</th><th className="text-left p-3">Status</th></tr></thead><tbody>{recentBookings.map(b => (<tr key={b.id} className="border-b"><td className="p-3">{b.patient}</td><td className="p-3">{b.therapist}</td><td className="p-3">{b.type}</td><td className="p-3">{b.date} {b.time}</td><td className="p-3"><Badge variant="outline">{b.status||'--'}</Badge></td></tr>))}</tbody></table></div></CardContent></Card></div>
  );

  const renderSettings = () => (
    <div className="space-y-6"><Card><CardHeader><CardTitle>Settings (Placeholder)</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Notification & operational settings UI goes here.</CardContent></Card></div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4"><div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center"><Building2 className="w-8 h-8 text-primary" /></div><div><h1>{clinic.name}</h1><div className="flex items-center gap-4 mt-1 text-sm"><Badge>{(clinic.types||[])[0]||'Clinic'}</Badge><div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" /><span>{clinic.city || clinic.state || ''}</span></div><div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span>{metrics.rating || 0} ({metrics.totalReviews||0})</span></div></div></div></div>
        <div className="flex gap-2"><Button variant="outline"><Eye className="w-4 h-4 mr-2" />Public Profile</Button><Button><Plus className="w-4 h-4 mr-2" />Quick Action</Button></div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="therapists">Therapists</TabsTrigger><TabsTrigger value="bookings">Bookings</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList>
        <TabsContent value="overview" className="mt-6">{renderOverview()}</TabsContent>
        <TabsContent value="profile" className="mt-6">{renderProfile()}</TabsContent>
        <TabsContent value="therapists" className="mt-6">{renderTherapists()}</TabsContent>
        <TabsContent value="bookings" className="mt-6">{renderBookings()}</TabsContent>
        <TabsContent value="settings" className="mt-6">{renderSettings()}</TabsContent>
      </Tabs>
    </div>
  );
}
