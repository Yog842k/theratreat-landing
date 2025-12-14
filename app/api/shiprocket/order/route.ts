import { NextResponse } from 'next/server'
import database from '@/lib/database'

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD
const SHIPROCKET_TOKEN = process.env.SHIPROCKET_TOKEN
const SHIPROCKET_AUTH_HEADER = process.env.SHIPROCKET_AUTH_HEADER // e.g. "Bearer <jwt>" or "Token <api_key>"

function buildAuthHeaderFromEnv(): string | null {
  const raw = (SHIPROCKET_AUTH_HEADER || SHIPROCKET_TOKEN || '').trim()
  if (!raw) return null
  // If value already contains a scheme (e.g., "Bearer ..." or "Token ..."), use as-is
  if (/^(Bearer|Token)\s+/i.test(raw)) return raw
  // Default to Bearer when scheme omitted
  return `Bearer ${raw}`
}

async function shiprocketAuthHeader(): Promise<string> {
  const fromEnv = buildAuthHeaderFromEnv()
  if (fromEnv) return fromEnv
  // Fallback to login when no token is provided via env
  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
  })
  if (!res.ok) throw new Error('Shiprocket auth failed')
  const data = await res.json()
  const token = String(data.token || '').trim()
  return /^(Bearer|Token)\s+/i.test(token) ? token : `Bearer ${token}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId } = body
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const col = await database.getCollection('orders')
    const order = await col.findOne({ _id: database.toObjectId(orderId) })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (!order.shipping) return NextResponse.json({ error: 'Shipping info required' }, { status: 400 })

    const authHeader = await shiprocketAuthHeader()
    const payload = {
      order_id: orderId,
      order_date: new Date().toISOString(),
      pickup_location: 'Primary',
      channel_id: '',
      billing_customer_name: order.shipping.name,
      billing_last_name: '',
      billing_address: order.shipping.address,
      billing_city: order.shipping.city,
      billing_pincode: order.shipping.pincode,
      billing_state: order.shipping.state,
      billing_country: 'India',
      billing_email: '',
      billing_phone: order.shipping.phone,
      shipping_is_billing: true,
      order_items: order.items.map((it: any) => ({ name: it.name, sku: it.productId, units: it.quantity, selling_price: it.price })),
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: order.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    }

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Shiprocket order create failed', details: err }, { status: 500 })
    }
    const data = await res.json()
    await col.updateOne({ _id: database.toObjectId(orderId) }, { $set: { shiprocket: { order_id: data.order_id, shipment_id: data.shipment_id, awb: data.awb } } })
    return NextResponse.json({ shiprocket: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Shiprocket error' }, { status: 500 })
  }
}
