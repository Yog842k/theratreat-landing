import { NextApiRequest, NextApiResponse } from 'next';
import { verifyPan } from '@/lib/idfy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { pan } = req.body;
  if (!pan) return res.status(400).json({ error: 'Missing PAN' });
  try {
    const result = await verifyPan({ pan });
    if (result && result.ok) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ error: result?.error || 'PAN verification failed' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
