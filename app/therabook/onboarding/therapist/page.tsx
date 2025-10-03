"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';
import { useRouter } from 'next/navigation';
import { SPECIALIZATIONS } from '@/utils/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface AvailabilitySlot { day: string; start: string; end: string; }

export default function TherapistOnboardingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: '',
    title: '',
    bio: '',
    specializations: [] as string[],
    experience: '',
    consultationFee: '',
    languages: '' ,
    sessionTypes: [] as string[],
    availability: [] as AvailabilitySlot[]
  });

  useEffect(() => {
    if (user && user.userType !== 'therapist') router.replace('/');
  }, [user, router]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const res = await fetch('/api/therapist-onboarding', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const data = await res.json();
        if (data.success && data.data.therapist) {
          const t = data.data.therapist;
          setForm(f => ({
            ...f,
            displayName: t.displayName || user.name,
            title: t.title || '',
            bio: t.bio || '',
            specializations: t.specializations || [],
            experience: t.experience?.toString() || '',
            consultationFee: t.consultationFee?.toString() || '',
            languages: (t.languages || []).join(', '),
            sessionTypes: t.sessionTypes || [],
            availability: t.availability || []
          }));
        }
      } catch(e:any) {
        console.error(e);
      } finally { setInitialLoad(false); }
    };
    load();
  }, [isAuthenticated, user]);

  const toggleSpecialization = (s: string) => {
    setForm(f => ({ ...f, specializations: f.specializations.includes(s) ? f.specializations.filter(x => x!==s) : [...f.specializations, s] }));
  };

  const toggleSessionType = (s: string) => {
    setForm(f => ({ ...f, sessionTypes: f.sessionTypes.includes(s) ? f.sessionTypes.filter(x => x!==s) : [...f.sessionTypes, s] }));
  };

  const addAvailability = () => {
    setForm(f => ({ ...f, availability: [...f.availability, { day: 'Monday', start: '09:00', end: '17:00' }] }));
  };

  const updateSlot = (idx:number, key: keyof AvailabilitySlot, value:string) => {
    setForm(f => ({ ...f, availability: f.availability.map((sl,i)=> i===idx? {...sl,[key]:value}: sl) }));
  };

  const removeSlot = (idx:number) => setForm(f => ({ ...f, availability: f.availability.filter((_,i)=>i!==idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      const payload = {
        ...form,
        experience: form.experience === '' ? null : Number(form.experience),
        consultationFee: form.consultationFee === '' ? null : Number(form.consultationFee),
        languages: form.languages.split(',').map(l=>l.trim()).filter(Boolean),
        availability: form.availability, // keep as-is (can be empty)
      };
      const res = await fetch('/api/therapist-onboarding', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.errors || data.message || 'Failed');
      }
      setSuccess('Onboarding saved! Redirecting to profile...');
      // Mark onboardingCompleted in stored user for immediate UX update
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.onboardingCompleted = true;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      } catch {}
      setTimeout(()=> router.push('/therabook/profile/therapist'), 1200);
    } catch(e:any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  if (!isAuthenticated) return <div className='p-12 text-center'>Please log in.</div>;
  if (initialLoad) return <div className='p-12 text-center'>Loading...</div>;

  return (
    <div className='min-h-screen bg-gray-50 py-10'>
      <div className='max-w-5xl mx-auto px-6'>
        <h1 className='text-4xl font-bold mb-6 text-gray-900'>Therapist Onboarding</h1>
        <p className='text-gray-600 mb-10 max-w-2xl'>Provide your professional details. This helps patients discover and book you. You can edit later.</p>
        <form onSubmit={handleSubmit} className='space-y-10'>
          <Card className='border-0 shadow-sm rounded-2xl'>
            <CardContent className='p-8 space-y-6'>
              <div>
                <label className='font-medium text-gray-800 block mb-2'>Display Name</label>
                <Input value={form.displayName} onChange={e=> setForm(f=>({...f, displayName:e.target.value}))} placeholder='e.g. Dr. Aditi Sharma' />
              </div>
              <div>
                <label className='font-medium text-gray-800 block mb-2'>Professional Title</label>
                <Input value={form.title} onChange={e=> setForm(f=>({...f, title:e.target.value}))} placeholder='e.g. Clinical Psychologist' />
              </div>
              <div>
                <label className='font-medium text-gray-800 block mb-2'>Bio</label>
                <Textarea value={form.bio} onChange={e=> setForm(f=>({...f, bio:e.target.value}))} placeholder='Short introduction about your approach, experience and focus areas.' className='min-h-[120px]' />
              </div>
              <div>
                <label className='font-medium text-gray-800 block mb-3'>Specializations</label>
                <div className='flex flex-wrap gap-2'>
                  {SPECIALIZATIONS.map(s => (
                    <button type='button' key={s} onClick={()=>toggleSpecialization(s)} className={`px-3 py-1 rounded-full text-sm border ${form.specializations.includes(s)?'bg-blue-600 text-white border-blue-600':'bg-white hover:bg-blue-50 text-gray-700 border-gray-300'}`}>{s}</button>
                  ))}
                </div>
                {form.specializations.length>0 && <div className='mt-3 flex flex-wrap gap-2'>{form.specializations.map(s => <Badge key={s} className='bg-blue-100 text-blue-700'>{s}</Badge>)}</div>}
              </div>
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <label className='font-medium text-gray-800 block mb-2'>Years of Experience</label>
                  <Input type='number' min={0} value={form.experience} onChange={e=> setForm(f=>({...f, experience:e.target.value}))} />
                </div>
                <div>
                  <label className='font-medium text-gray-800 block mb-2'>Consultation Fee (₹)</label>
                  <Input type='number' min={0} value={form.consultationFee} onChange={e=> setForm(f=>({...f, consultationFee:e.target.value}))} />
                </div>
              </div>
              <div>
                <label className='font-medium text-gray-800 block mb-2'>Languages (comma separated)</label>
                <Input value={form.languages} onChange={e=> setForm(f=>({...f, languages:e.target.value}))} placeholder='English, Hindi' />
              </div>
              <div>
                <label className='font-medium text-gray-800 block mb-3'>Session Types</label>
                <div className='flex flex-wrap gap-2'>
                  {['Online','In-Clinic','Home Visit'].map(s => (
                    <button type='button' key={s} onClick={()=>toggleSessionType(s)} className={`px-3 py-1 rounded-full text-sm border ${form.sessionTypes.includes(s)?'bg-yellow-400 text-gray-900 border-yellow-400':'bg-white hover:bg-yellow-50 text-gray-700 border-gray-300'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className='flex items-center justify-between mb-3'>
                  <label className='font-medium text-gray-800'>Weekly Availability</label>
                  <Button type='button' size='sm' onClick={addAvailability}>Add Slot</Button>
                </div>
                <div className='space-y-4'>
                  {form.availability.map((slot, idx) => (
                    <div key={idx} className='grid grid-cols-12 gap-3 items-center'>
                      <select value={slot.day} onChange={e=> updateSlot(idx,'day',e.target.value)} className='col-span-3 h-10 rounded-md border border-gray-300 px-2'>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d=> <option key={d}>{d}</option>)}
                      </select>
                      <Input type='time' value={slot.start} onChange={e=> updateSlot(idx,'start',e.target.value)} className='col-span-2' />
                      <span className='col-span-1 text-center text-gray-500'>to</span>
                      <Input type='time' value={slot.end} onChange={e=> updateSlot(idx,'end',e.target.value)} className='col-span-2' />
                      <Button type='button' variant='destructive' onClick={()=> removeSlot(idx)} className='col-span-2'>Remove</Button>
                    </div>
                  ))}
                  {form.availability.length===0 && <p className='text-sm text-gray-500'>No slots added yet.</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          {error && <div className='text-red-600'>{error}</div>}
          {success && <div className='text-green-600'>{success}</div>}
          <div className='flex justify-end'>
            <Button type='submit' disabled={loading}>{loading? 'Saving...' : 'Save & Continue'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
