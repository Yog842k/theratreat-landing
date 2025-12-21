import type { NextApiRequest, NextApiResponse } from 'next'
import { createShiprocketOrder, type CreateOrderPayload } from '@/lib/shiprocket'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const email = process.env.SHIPROCKET_EMAIL?.trim()
    const password = process.env.SHIPROCKET_PASSWORD?.trim()
    if (!email || !password) {
      return res.status(500).json({ error: 'SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing' })
    }

    const payload = req.body as CreateOrderPayload
    if (!payload?.order_id) return res.status(400).json({ error: 'order_id is required' })
    const result = await createShiprocketOrder({ email, password, payload })
    return res.status(200).json(result)
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Shiprocket error' })
  }
}
