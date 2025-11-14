// Mock OTP sender for development
export async function POST(req) {
  const { phoneNumber } = await req.json();
  if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid phone number' }), { status: 400 });
  }
  // Simulate sending OTP (store in-memory or just return success)
  // In production, integrate with SMS provider and store OTP securely
  return new Response(JSON.stringify({ success: true, otpSent: true }), { status: 202 });
}
