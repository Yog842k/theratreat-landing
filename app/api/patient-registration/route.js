// Patient registration API route
import { NextResponse } from 'next/server';
import { OtpUtils } from '@/lib/otp';

export async function POST(req) {
  try {
    const data = await req.json();
    // Basic validation
    if (!data.fullName || !data.email || !data.password || !data.phoneNumber) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    // Normalize phone number
    const phone = data.phoneNumber.replace(/\D/g, '');
    if (phone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number' }, { status: 400 });
    }
    const normalized = process.env.OTP_DEFAULT_COUNTRY_CODE ? process.env.OTP_DEFAULT_COUNTRY_CODE + phone : '+91' + phone;
    // Debug log for OTP send/verify
    console.log('[PatientRegistration] phone:', normalized, 'purpose:', 'patient_registration', 'otpCode:', data.otpCode);
    // If no OTP code, send OTP
    if (!data.otpCode) {
      console.log('[PatientRegistration] Sending OTP:', { phone: normalized, purpose: 'patient_registration' });
      const otpRes = await OtpUtils.requestOtp({ phone: normalized, purpose: 'patient_registration' });
      if (otpRes.ok) {
        console.log('[PatientRegistration] OTP sent:', { phone: normalized, ttlMinutes: otpRes.ttlMinutes });
        return NextResponse.json({ otpSent: true, phone: normalized, ttlMinutes: otpRes.ttlMinutes }, { status: 202 });
      } else {
        console.log('[PatientRegistration] OTP send failed:', otpRes);
        return NextResponse.json({ success: false, message: otpRes.detail || 'Failed to send OTP' }, { status: 500 });
      }
    }
    // If OTP code present, verify OTP
    console.log('[PatientRegistration] Verifying OTP:', { phone: normalized, purpose: 'patient_registration', code: data.otpCode });
    const verifyRes = await OtpUtils.verifyOtp({ phone: normalized, purpose: 'patient_registration', code: data.otpCode });
    console.log('[PatientRegistration] Verify result:', verifyRes);
    if (!verifyRes.ok) {
      return NextResponse.json({ success: false, message: verifyRes.error || 'OTP verification failed' }, { status: 400 });
    }
    // Save patient data to MongoDB
    const database = require('@/lib/database');
    const userDoc = {
      name: data.fullName,
      email: data.email,
      password: data.password, // Consider hashing in production
      userType: 'client',
      phone: normalized,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      isVerified: true,
      isActive: true,
      preferences: {
        notifications: {
          email: true,
          sms: true
        }
      }
      // Add more fields as needed
    };
    const result = await database.insertOne('users', userDoc);
    return NextResponse.json({ success: true, message: 'Registration completed', userId: result.insertedId, user: userDoc }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Registration failed', error: err?.message }, { status: 500 });
  }
}
