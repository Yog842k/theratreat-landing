import { NextApiRequest, NextApiResponse } from 'next';
import { requestOtp } from '@/lib/otp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Missing phone number' });
  try {
    const result = await requestOtp({ phone, purpose: 'clinic_registration' });
    if (result && result.success !== false) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: result?.error || 'Failed to send OTP' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
