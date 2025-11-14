import { NextApiRequest, NextApiResponse } from 'next';
import { verifyOtp } from '@/lib/otp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Missing phone or code' });
  try {
    const result = await verifyOtp({ phone, purpose: 'clinic_registration', code });
    if (result && result.ok && result.verified) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: result?.error || 'Invalid OTP' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
