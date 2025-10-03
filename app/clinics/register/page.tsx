"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Building2, Upload, CheckCircle, FileText, User as UserIcon } from 'lucide-react';

import INDIA_STATES from '@/constants/india-states';
// Reference arrays
const clinicTypes = ["Multispecialty","Therapy-only","Rehab Centre","Hospital-based","Others"]; 
const designations = ["Owner","Coordinator","Admin","Other"]; 
const therapyTypes = ["Occupational Therapy (OT)","Speech Therapy","Psychology","Physiotherapy","Special Education","ABA","Other"]; 
const sessionDurations = ["45 mins","60 mins"]; 

interface FormData {
  clinicName: string; clinicType: string[]; clinicAddress: string; city: string; state: string; pincode: string; contactNumber: string; email: string; website: string; yearsInOperation: string;
  ownerName: string; designation: string; ownerMobile: string; ownerEmail: string;
  therapiesOffered: string[]; inHouseTherapists: string; externalTherapists: string; onlineSessions: boolean; sessionDuration: string; sessionCharges: string; assessmentReports: boolean; homeVisits: boolean;
  sessionModesOffered?: string[]; // e.g. ['video','audio','in-clinic','home']
  sessionModePrices?: {
    video: string;
    audio: string;
    inClinic: string;
    home: string;
  };
  accountHolderName: string; bankName: string; accountNumber: string; ifscCode: string; upiId: string;
  declarationAccepted: boolean; termsAccepted: boolean; signatureDate: string;
  ownerPassword: string; ownerPasswordConfirm: string; // added for login credentials
}

const totalSteps = 6;

export default function ClinicRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    clinicName: '', clinicType: [], clinicAddress: '', city: '', state: '', pincode: '', contactNumber: '', email: '', website: '', yearsInOperation: '',
    ownerName: '', designation: '', ownerMobile: '', ownerEmail: '',
  therapiesOffered: [], inHouseTherapists: '', externalTherapists: '', onlineSessions: false, sessionDuration: '', sessionCharges: '', assessmentReports: false, homeVisits: false,
  sessionModesOffered: [],
  sessionModePrices: { video: '', audio: '', inClinic: '', home: '' },
    accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', upiId: '',
    declarationAccepted: false, termsAccepted: false, signatureDate: new Date().toISOString().split('T')[0],
    ownerPassword: '', ownerPasswordConfirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const progress = (currentStep / totalSteps) * 100;
  const update = (field: keyof FormData, value: any) => setFormData(f => ({ ...f, [field]: value }));
  const toggleArray = (field: keyof FormData, value: string) => {
    const arr = formData[field] as string[]; update(field, arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  async function handleSubmit() {
    setSubmitting(true); setError(null); setResult(null);
    try {
      // Basic password validation before submission
      if (!formData.ownerPassword || formData.ownerPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      if (formData.ownerPassword !== formData.ownerPasswordConfirm) {
        throw new Error('Passwords do not match');
      }
      const { ownerPasswordConfirm, ...payload } = { ...formData, ownerPassword: formData.ownerPassword.trim() };
      const res = await fetch('/api/clinics/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Registration failed');
      setResult(json);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Clinic Registered</h1>
          <p className="text-sm text-muted-foreground">Store the token securely. This view is not persisted.</p>
        </div>
        <Card>
          <CardContent className="p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
            {result?.data?.token && (
              <Button className="mt-4" onClick={() => navigator.clipboard.writeText(result.data.token)}>Copy Token</Button>
            )}
            <Button variant="outline" className="mt-4 ml-2" onClick={() => { setResult(null); setCurrentStep(1); }}>Register Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Building2 className="w-7 h-7 text-primary" /> Clinic Registration</h1>
        <p className="text-muted-foreground text-sm">Join the TheraTreat network. Complete all steps; required fields marked *.</p>
      </header>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-2"><span>Step {currentStep} / {totalSteps}</span><span>{Math.round(progress)}% Complete</span></div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="p-8 space-y-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-semibold flex items-center gap-2"><Building2 className="w-5 h-5" /> Clinic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Clinic Name *</Label><Input value={formData.clinicName} onChange={e=>update('clinicName', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Clinic Type *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {clinicTypes.map(ct => (
                      <label key={ct} className="flex items-center gap-2 text-xs">
                        <Checkbox checked={formData.clinicType.includes(ct)} onCheckedChange={()=>toggleArray('clinicType', ct)} /> {ct}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2"><Label>Address *</Label><Textarea rows={3} value={formData.clinicAddress} onChange={e=>update('clinicAddress', e.target.value)} /></div>
                <div className="space-y-2"><Label>City *</Label><Input value={formData.city} onChange={e=>update('city', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select value={formData.state} onValueChange={v=>update('state', v)}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{INDIA_STATES.map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Pincode *</Label><Input value={formData.pincode} onChange={e=>update('pincode', e.target.value)} /></div>
                <div className="space-y-2"><Label>Contact Number *</Label><Input value={formData.contactNumber} onChange={e=>update('contactNumber', e.target.value)} placeholder="+91" /></div>
                <div className="space-y-2"><Label>Clinic Email *</Label><Input type="email" value={formData.email} onChange={e=>update('email', e.target.value)} /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={formData.website} onChange={e=>update('website', e.target.value)} placeholder="https://" /></div>
                <div className="space-y-2"><Label>Years in Operation *</Label><Input value={formData.yearsInOperation} onChange={e=>update('yearsInOperation', e.target.value)} /></div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-semibold flex items-center gap-2"><UserIcon className="w-5 h-5" /> Owner / Coordinator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Owner Name *</Label><Input value={formData.ownerName} onChange={e=>update('ownerName', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Designation *</Label>
                  <Select value={formData.designation} onValueChange={v=>update('designation', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{designations.map(d=> <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Owner Mobile *</Label><Input value={formData.ownerMobile} onChange={e=>update('ownerMobile', e.target.value)} /></div>
                <div className="space-y-2"><Label>Owner Email *</Label><Input type="email" value={formData.ownerEmail} onChange={e=>update('ownerEmail', e.target.value)} /></div>
                <div className="space-y-2 relative">
                  <Label>Owner Password * <span className="text-xs text-muted-foreground">(min 8 chars)</span></Label>
                  <div className="flex gap-2">
                    <Input type={showPassword ? 'text':'password'} value={formData.ownerPassword} onChange={e=>update('ownerPassword', e.target.value)} placeholder="Set a secure password" />
                  </div>
                  <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute right-2 top-9 text-xs text-primary underline">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password *</Label>
                  <Input type={showPassword ? 'text':'password'} value={formData.ownerPasswordConfirm} onChange={e=>update('ownerPasswordConfirm', e.target.value)} placeholder="Re-enter password" />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>ID Proof (placeholder)</Label><div className="border-2 border-dashed rounded p-4 text-xs text-center"><Upload className="w-6 h-6 mx-auto mb-2" />Upload</div></div>
                  <div className="space-y-2"><Label>Owner Photo (placeholder)</Label><div className="border-2 border-dashed rounded p-4 text-xs text-center"><Upload className="w-6 h-6 mx-auto mb-2" />Upload</div></div>
                </div>
              </div>
              {formData.ownerPassword && formData.ownerPasswordConfirm && formData.ownerPassword !== formData.ownerPasswordConfirm && (
                <div className="text-xs text-red-600">Passwords do not match</div>
              )}
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Therapies Offered *</Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {therapyTypes.map(t => (
                      <label key={t} className="flex items-center gap-2"><Checkbox checked={formData.therapiesOffered.includes(t)} onCheckedChange={()=>toggleArray('therapiesOffered', t)} />{t}</label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2"><Label>In-house Therapists *</Label><Input type="number" value={formData.inHouseTherapists} onChange={e=>update('inHouseTherapists', e.target.value)} /></div>
                <div className="space-y-2"><Label>External Visiting Therapists</Label><Input type="number" value={formData.externalTherapists} onChange={e=>update('externalTherapists', e.target.value)} /></div>
                <div className="space-y-2"><Label>Online Sessions *</Label><div className="flex gap-4 text-xs"><label className="flex items-center gap-2"><Checkbox checked={formData.onlineSessions} onCheckedChange={c=>update('onlineSessions', !!c)} />Yes</label><label className="flex items-center gap-2"><Checkbox checked={!formData.onlineSessions} onCheckedChange={c=>update('onlineSessions', !c)} />No</label></div></div>
                <div className="space-y-2"><Label>Session Duration *</Label><Select value={formData.sessionDuration} onValueChange={v=>update('sessionDuration', v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{sessionDurations.map(d=> <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Typical Session Charges *</Label><Input value={formData.sessionCharges} onChange={e=>update('sessionCharges', e.target.value)} placeholder="₹ per session" /></div>
                {/* Session Modes & Pricing */}
                <div className="md:col-span-2 space-y-2">
                  <Label>Session Modes & Pricing *</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { id: 'video', label: 'Video Session' },
                      { id: 'audio', label: 'Audio Session' },
                      { id: 'in-clinic', label: 'In-Clinic Session' },
                      { id: 'home', label: 'Home Visit Session' }
                    ].map(mode => {
                      const checked = (formData.sessionModesOffered||[]).includes(mode.id);
                      const storageKey = mode.id === 'in-clinic' ? 'inClinic' : (mode.id === 'home' ? 'home' : mode.id);
                      return (
                        <div key={mode.id} className="flex items-end gap-3 border rounded p-3 bg-white/50 dark:bg-neutral-900/40">
                          <div className="flex items-center gap-2 flex-1">
                            <Checkbox
                              id={`clinic-mode-${mode.id}`}
                              checked={checked}
                              onCheckedChange={() => {
                                update('sessionModesOffered', checked ? (formData.sessionModesOffered||[]).filter(m=>m!==mode.id) : [...(formData.sessionModesOffered||[]), mode.id]);
                              }}
                            />
                            <Label htmlFor={`clinic-mode-${mode.id}`} className="text-xs md:text-sm">{mode.label}</Label>
                          </div>
                          <div className="w-40">
                            <Input
                              type="number"
                              min="0"
                              placeholder="₹ Price"
                              value={(formData.sessionModePrices||{})[storageKey as keyof typeof formData.sessionModePrices] || ''}
                              disabled={!checked}
                              onChange={e => {
                                const val = e.target.value;
                                update('sessionModePrices', { ...(formData.sessionModePrices||{ video:'',audio:'',inClinic:'',home:'' }), [storageKey]: val });
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {(!formData.sessionModesOffered || formData.sessionModesOffered.length === 0) && (
                    <p className="text-xs text-amber-600">Select at least one mode and add a price.</p>
                  )}
                </div>
                <div className="space-y-2"><Label>Assessment Reports *</Label><div className="flex gap-4 text-xs"><label className="flex items-center gap-2"><Checkbox checked={formData.assessmentReports} onCheckedChange={c=>update('assessmentReports', !!c)} />Yes</label><label className="flex items-center gap-2"><Checkbox checked={!formData.assessmentReports} onCheckedChange={c=>update('assessmentReports', !c)} />No</label></div></div>
                <div className="space-y-2"><Label>Home Visits *</Label><div className="flex gap-4 text-xs"><label className="flex items-center gap-2"><Checkbox checked={formData.homeVisits} onCheckedChange={c=>update('homeVisits', !!c)} />Yes</label><label className="flex items-center gap-2"><Checkbox checked={!formData.homeVisits} onCheckedChange={c=>update('homeVisits', !c)} />No</label></div></div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="font-semibold flex items-center gap-2"><Upload className="w-5 h-5" /> Bank Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Account Holder Name *</Label><Input value={formData.accountHolderName} onChange={e=>update('accountHolderName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Bank Name & Branch *</Label><Input value={formData.bankName} onChange={e=>update('bankName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Account Number *</Label><Input value={formData.accountNumber} onChange={e=>update('accountNumber', e.target.value)} /></div>
                <div className="space-y-2"><Label>IFSC Code *</Label><Input value={formData.ifscCode} onChange={e=>update('ifscCode', e.target.value)} /></div>
                <div className="space-y-2"><Label>UPI ID</Label><Input value={formData.upiId} onChange={e=>update('upiId', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Bank Proof (placeholder)</Label><div className="border-2 border-dashed rounded p-4 text-xs text-center"><Upload className="w-6 h-6 mx-auto mb-2" />Upload</div></div>
            </div>
          )}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Agreements</h2>
              <div className="space-y-4 text-sm">
                <label className="flex items-start gap-3"><Checkbox checked={formData.declarationAccepted} onCheckedChange={c=>update('declarationAccepted', !!c)} /> <span>I declare all information is accurate.</span></label>
                <label className="flex items-start gap-3"><Checkbox checked={formData.termsAccepted} onCheckedChange={c=>update('termsAccepted', !!c)} /> <span>I accept the Service Agreement & Terms.</span></label>
              </div>
            </div>
          )}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Signature</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Signature Date *</Label><Input type="date" value={formData.signatureDate} onChange={e=>update('signatureDate', e.target.value)} /></div>
                <div className="space-y-2"><Label>Signature Upload (placeholder)</Label><div className="border-2 border-dashed rounded p-4 text-xs text-center"><Upload className="w-6 h-6 mx-auto mb-2" />Upload</div></div>
              </div>
              <div className="bg-green-50 p-4 rounded text-sm text-green-800 flex gap-2"><CheckCircle className="w-5 h-5" /> Review and submit when ready.</div>
            </div>
          )}

          {error && <div className="text-sm text-red-600">Error: {error}</div>}

          <div className="flex justify-between pt-4">
            <Button variant="outline" disabled={currentStep===1 || submitting} onClick={()=>setCurrentStep(s=> Math.max(1,s-1))}>Previous</Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={submitting}>Save Draft</Button>
              {currentStep === totalSteps ? (
                <Button disabled={submitting || !formData.declarationAccepted || !formData.termsAccepted} onClick={handleSubmit}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>
              ) : (
                <Button disabled={submitting} onClick={()=>setCurrentStep(s=> Math.min(totalSteps, s+1))}>Next Step</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
