'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface RegisterResponse {
  user: any;
  token: string;
}

const specializationSuggestions = [
  'Anxiety', 'Depression', 'Trauma', 'Relationships', 'Addiction', 'Stress', 'Career'
];

export default function NewTherapistPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specializations, setSpecializations] = useState<string>('');
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdTherapistId, setCreatedTherapistId] = useState<string | null>(null);

  const parseList = (val: string) => val.split(',').map(v => v.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreatedTherapistId(null);

    if (!name || !email || !password) {
      setError('Name, email and password are required');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Register therapist user
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
            phone,
          userType: 'therapist'
        })
      });
      const registerJson = await registerRes.json();
      if (!registerRes.ok) {
        const details = registerJson?.errors ? `: ${(registerJson.errors || []).join?.(' | ')}` : '';
        throw new Error((registerJson?.message || 'Registration failed') + details);
      }
      const { user: newTherapist, token }: RegisterResponse = registerJson.data;

      // 2. Update therapist profile with details
      const profileRes = await fetch('/api/therapists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          specializations: parseList(specializations),
          experience: Number(experience) || 0,
          qualifications: parseList(qualifications),
          bio,
          consultationFee: Number(consultationFee) || 0,
          availability: []
        })
      });
      const profileJson = await profileRes.json();
      if (!profileRes.ok) {
        throw new Error(profileJson?.message || 'Profile update failed');
      }

      setSuccess('Therapist created successfully');
      setCreatedTherapistId(newTherapist?._id || '');
    } catch (err: any) {
      setError(err.message || 'Failed to create therapist');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Therapist</CardTitle>
            <CardDescription>Create and seed a therapist account into the database.</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.userType && user.userType !== 'admin' && (
              <div className="mb-4 text-sm text-gray-600">You are logged in as <strong>{user.userType}</strong>. This form still works for seeding purposes.</div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-700">{success}</div>
            )}
            {createdTherapistId && (
              <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200 text-sm">
                Therapist ID: <code className="font-mono">{createdTherapistId}</code>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="therapist@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Strong password" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Experience (years)</label>
                  <Input type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="5" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Consultation Fee ($)</label>
                  <Input type="number" value={consultationFee} onChange={e => setConsultationFee(e.target.value)} placeholder="120" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specializations (comma separated)</label>
                <Input value={specializations} onChange={e => setSpecializations(e.target.value)} placeholder="Anxiety, Depression" />
                <div className="flex flex-wrap gap-1 mt-2">
                  {specializationSuggestions.map(s => (
                    <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => {
                      setSpecializations(prev => prev ? (prev + ', ' + s) : s);
                    }}>{s}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Qualifications (comma separated)</label>
                <Input value={qualifications} onChange={e => setQualifications(e.target.value)} placeholder="PhD, CBT Certification" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Short professional biography" />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Therapist'}</Button>
                <Link href="/therabook/therapists"><Button type="button" variant="outline">Back</Button></Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
