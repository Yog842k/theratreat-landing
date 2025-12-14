'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextSendIn, setNextSendIn] = useState<number | null>(null);
  const [resendSeconds, setResendSeconds] = useState<number>(0);

  const normalizePhone = (raw: string) => {
    const digits = (raw || '').replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length > 10 && digits.startsWith('91')) return `+${digits}`;
    if (digits.length >= 8) return `+${digits}`;
    return raw;
  };

  const requestOtp = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const normalizedPhone = normalizePhone(phone);
      const res = await fetch('/api/auth/forgot-password/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: normalizedPhone }),
      });
      const data = await res.json();
      if (res.ok && data?.success && (data?.data?.otpSent || data?.message?.toLowerCase?.().includes('otp'))) {
        const ns = Number(data?.data?.nextSendSeconds ?? 60);
        setMessage(`OTP sent to your phone. Expires in ${data?.data?.ttlMinutes ?? 10} minutes.`);
        setNextSendIn(ns);
        setResendSeconds(ns);
        setStep('verify');
      } else {
        setError(data?.message || 'Failed to send OTP');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    if (!otp || otp.length < 4) {
      setError('Enter the 6-digit OTP');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const normalizedPhone = normalizePhone(phone);
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: normalizedPhone, code: otp, newPassword }),
      });
      const data = await res.json();
      if (data?.success) {
        setMessage('Password reset successful. Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 1200);
      } else {
        setError(data?.message || 'Failed to reset password');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend countdown (align with therapist OTP flow)
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password</CardTitle>
            <CardDescription className="text-gray-600">
              {step === 'request' ? 'Enter your email and phone to receive an OTP' : 'Enter the OTP and a new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50"><AlertDescription className="text-red-700">{error}</AlertDescription></Alert>
            )}
            {message && (
              <Alert className="mb-4 border-green-200 bg-green-50"><AlertDescription className="text-green-700">{message}</AlertDescription></Alert>
            )}

            {step === 'request' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <Input id="phone" placeholder="e.g. +919876543210 or 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" />
                </div>
                <Button onClick={requestOtp} disabled={loading || !email || !phone} className="w-full h-12">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
                <div className="text-center text-sm text-gray-600">
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">Back to login</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Enter OTP</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="justify-center">
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {resendSeconds > 0 ? (
                    <p className="text-xs text-gray-500 mt-1">Resend OTP in {resendSeconds}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={requestOtp}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12" placeholder="Min 8 chars, upper/lower/number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12" />
                </div>
                <Button onClick={resetPassword} disabled={loading || !otp || !newPassword || !confirmPassword} className="w-full h-12">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
                <div className="text-center text-sm text-gray-600">
                  <button type="button" onClick={() => setStep('request')} className="text-blue-600 hover:text-blue-800">Change phone</button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
