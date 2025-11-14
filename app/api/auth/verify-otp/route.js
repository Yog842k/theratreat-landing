
import { OtpUtils } from '@/lib/otp';

export async function POST(req) {
  const { phoneNumber, otp, purpose } = await req.json();
  if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid phone number' }), { status: 400 });
  }
  const normalized = process.env.OTP_DEFAULT_COUNTRY_CODE ? process.env.OTP_DEFAULT_COUNTRY_CODE + phoneNumber : '+91' + phoneNumber;
  if (!otp) {
    // Send OTP using Twilio Verify
    const res = await OtpUtils.requestOtp({ phone: normalized, purpose: purpose || 'signup:user' });
    if (res.ok) {
      return new Response(JSON.stringify({ success: true, otpSent: true, phone: normalized, ttlMinutes: res.ttlMinutes }), { status: 202 });
    } else {
      return new Response(JSON.stringify({ success: false, message: res.detail || 'Failed to send OTP' }), { status: 500 });
    }
  } else {
    // Verify OTP using Twilio Verify
    const verifyRes = await OtpUtils.verifyOtp({ phone: normalized, purpose: purpose || 'signup:user', code: otp });
    if (verifyRes.ok) {
      return new Response(JSON.stringify({ success: true, verified: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, message: verifyRes.error || 'OTP verification failed' }), { status: 400 });
    }
  }
}
