import type { NextApiRequest, NextApiResponse } from 'next';

// You should store these in .env.local
const IDFY_BASE_URL = process.env.IDFY_BASE_URL;
const IDFY_API_KEY = process.env.IDFY_API_KEY;
const IDFY_API_SECRET = process.env.IDFY_API_SECRET;

async function verifyGST(gstNumber: string) {
  // IDfy GST verification endpoint and payload
  const url = `${IDFY_BASE_URL}/verify/gst`; // Replace with actual endpoint
  const payload = {
    gstin: gstNumber,
  };
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'api-key': IDFY_API_KEY ?? '',
    'api-secret': IDFY_API_SECRET ?? '',
  };
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('GST verification failed');
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
    res.status(500).json({ success: false, error: error.message });
  }
}
