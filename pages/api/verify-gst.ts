import type { NextApiRequest, NextApiResponse } from 'next';

// You should store these in .env.local
const IDFY_BASE_URL = process.env.IDFY_BASE_URL;
const IDFY_API_KEY = process.env.IDFY_API_KEY;
const IDFY_API_SECRET = process.env.IDFY_API_SECRET;

async function verifyGST(gstNumber: string) {
  if (!IDFY_BASE_URL || !IDFY_API_KEY || !IDFY_API_SECRET) {
    // Fallback mock response when IDfy is not configured
    return {
      gstin: gstNumber,
      verified: true,
      fallback: true,
      message: 'Mocked GST verification (IDfy not configured)',
    };
  }
  // IDfy GST verification endpoint and payload
  const url = `${IDFY_BASE_URL}/verify/gst`;
  const payload = { gstin: gstNumber };
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'api-key': IDFY_API_KEY,
    'api-secret': IDFY_API_SECRET,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => 'Unknown');
    throw new Error(`GST verification failed (${response.status}): ${detail}`);
  }
  return response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { gstNumber } = req.body;
  if (!gstNumber) {
    return res.status(400).json({ error: 'GST number required' });
  }
  try {
    const result = await verifyGST(gstNumber);
    res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error('[GST VERIFY] error', error);
    res.status(500).json({ success: false, error: error?.message || 'Verification failed' });
  }
}
