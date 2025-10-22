"use client";
import React, { useState } from 'react';
import INDIA_STATES from '@/constants/india-states';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2 } from 'lucide-react';

import { ViewType } from '@/constants/app-data';

interface Props {
  onSuccess?: () => void;
  setCurrentView?: (view: ViewType) => void;
}

export function PatientRegistration({ onSuccess, setCurrentView }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(false);
    if (!fullName || !email || !password || !city || !stateVal) {
      setError('Please fill all required fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
            password,
          phone,
          userType: 'patient',
          profile: { city, state: stateVal }
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Registration failed');
      setSuccess(true);
      onSuccess?.();
      // Optionally redirect after short delay
      setTimeout(() => {
  if (setCurrentView) setCurrentView('home');
      }, 1500);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Patient Registration</CardTitle>
          <CardDescription>Create your account to book therapy sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-700 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <AlertDescription>Registration successful! Redirecting...</AlertDescription>
              </Alert>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password * (min 8 chars)</Label>
                <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={city} onChange={e=>setCity(e.target.value)} placeholder="Your city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <select id="state" value={stateVal} onChange={e=>setStateVal(e.target.value)} className="w-full h-9 border rounded-md px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500">
                  <option value="">Select State</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="bio" className="text-sm mb-1 block">Short Description (optional)</Label>
              <textarea id="bio" className="w-full border rounded px-3 py-2 text-sm h-24" placeholder="Anything you'd like your therapist to know (kept private)"></textarea>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Account
              </Button>
              {setCurrentView && (
                <Button type="button" variant="outline" onClick={()=>setCurrentView('home')}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default PatientRegistration;