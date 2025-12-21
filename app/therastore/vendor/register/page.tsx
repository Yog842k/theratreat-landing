'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, ArrowLeft, Building2, IndianRupee, Landmark } from 'lucide-react';

type VerifyState = 'idle' | 'verifying' | 'verified' | 'failed';

export default function VendorRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');

  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  const [gstStatus, setGstStatus] = useState<VerifyState>('idle');
  const [panStatus, setPanStatus] = useState<VerifyState>('idle');
  const [bankStatus, setBankStatus] = useState<VerifyState>('idle');

  const gstRegex = /^[0-9A-Z]{15}$/; // simplified; checksum not applied here
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  const ifscRegex = /^[A-Z]{4}0[0-9A-Z]{6}$/;

  async function verifyGST() {
    const value = gstin.trim().toUpperCase();
    setGstStatus('verifying');
    if (!gstRegex.test(value)) {
      setGstStatus('failed');
      toast.error('Enter a valid 15-character GSTIN');
      return;
    }
    try {
      const res = await fetch('/api/verify-gst', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gstNumber: value }) });
      const json = await res.json();
      if (res.ok && json?.success) {
        setGstStatus('verified');
        toast.success('GST verified');
      } else {
        setGstStatus('failed');
        toast.error(json?.error || 'GST verification failed');
      }
    } catch (e: any) {
      setGstStatus('failed');
      toast.error(e?.message || 'GST verification error');
    }
  }

  async function verifyPAN() {
    const value = pan.trim().toUpperCase().replace(/\s|-/g, '');
    setPanStatus('verifying');
    if (!panRegex.test(value)) {
      setPanStatus('failed');
      toast.error('Enter a valid PAN (AAAAA9999A)');
      return;
    }
    try {
      // prefer app router endpoint; fallback to legacy
      let res = await fetch('/api/kyc/verify-pan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pan: value, name: contactName }) });
      if (!res.ok) {
        // try legacy
        res = await fetch('/api/verify-pan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pan: value }) });
      }
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json?.ok || json?.success || json?.match || json?.provider || json?.nameOnCard)) {
        setPanStatus('verified');
        toast.success('PAN verified');
      } else if (json?.detail || json?.error) {
        setPanStatus('failed');
        toast.error(json?.detail || json?.error || 'PAN verification failed');
      } else {
        setPanStatus('failed');
        toast.error('PAN verification failed');
      }
    } catch (e: any) {
      setPanStatus('failed');
      toast.error(e?.message || 'PAN verification error');
    }
  }

  async function verifyBank() {
    const acct = accountNumber.trim().replace(/\D/g, '');
    const ifscCode = ifsc.trim().toUpperCase().replace(/\s|-/g, '');
    setBankStatus('verifying');
    if (!/^\d{9,20}$/.test(acct) || !ifscRegex.test(ifscCode)) {
      setBankStatus('failed');
      toast.error('Enter a valid account number (9-20 digits) and IFSC (ABCD0XXXXXX)');
      return;
    }
    try {
      const res = await fetch('/api/idfy/verify-bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountNumber: acct, ifsc: ifscCode, name: contactName }) });
      const json = await res.json();
      if (res.ok && json?.ok) {
        setBankStatus('verified');
        toast.success('Bank account verified');
      } else {
        setBankStatus('failed');
        toast.error(json?.detail || json?.message || 'Bank verification failed');
      }
    } catch (e: any) {
      setBankStatus('failed');
      toast.error(e?.message || 'Bank verification error');
    }
  }

  function StatusBadge({ state }: { state: VerifyState }) {
    if (state === 'verified') return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1"/>Verified</Badge>;
    if (state === 'failed') return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200"><AlertCircle className="w-3 h-3 mr-1"/>Failed</Badge>;
    if (state === 'verifying') return <Badge variant="secondary">Verifying…</Badge>;
    return <Badge variant="outline">Not verified</Badge>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Require verified PAN & GST before submit
    if (gstStatus !== 'verified' || panStatus !== 'verified') {
      toast.error('Please verify GST and PAN before submitting');
      return;
    }
    setLoading(true);
    try {
      // TODO: Persist vendor details via backend endpoint when available
      toast.success('Details captured (demo). Backend persistence can be added.');
      router.push('/therastore');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-slate-200 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2"><ArrowLeft className="w-4 h-4"/>Back</Button>
          <h1 className="text-lg font-bold">TheraStore Vendor Registration</h1>
          <div />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Business */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-600"/> Business Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Registered business name" required/>
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name" required/>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"/>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile"/>
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="w-4 h-4 text-emerald-600"/> Compliance (PAN & GST)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>GSTIN</Label>
                <StatusBadge state={gstStatus}/>
              </div>
              <div className="flex gap-2">
                <Input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="15-character GSTIN" maxLength={15} className="uppercase"/>
                <Button type="button" variant="outline" onClick={verifyGST} disabled={gstStatus==='verifying'}>Verify</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>PAN</Label>
                <StatusBadge state={panStatus}/>
              </div>
              <div className="flex gap-2">
                <Input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="AAAAA9999A" maxLength={10} className="uppercase"/>
                <Button type="button" variant="outline" onClick={verifyPAN} disabled={panStatus==='verifying'}>Verify</Button>
              </div>
              <p className="text-xs text-slate-500">We use IDfy for secure KYC verification.</p>
            </div>
          </CardContent>
        </Card>

        {/* Bank details (optional but recommended) */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="w-4 h-4 text-emerald-600"/> Payout Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Account Number</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g,''))} placeholder="9–20 digits" inputMode="numeric"/>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>IFSC</Label>
                <StatusBadge state={bankStatus}/>
              </div>
              <div className="flex gap-2">
                <Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="ABCD0XXXXXX" maxLength={11} className="uppercase"/>
                <Button type="button" variant="outline" onClick={verifyBank} disabled={bankStatus==='verifying'}>Verify</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/therastore')}>Cancel</Button>
          <Button type="submit" disabled={loading || panStatus!=='verified' || gstStatus!=='verified'} className="bg-emerald-600 hover:bg-emerald-700">{loading ? 'Submitting…' : 'Submit for Review'}</Button>
        </div>
      </form>
    </div>
  );
}
