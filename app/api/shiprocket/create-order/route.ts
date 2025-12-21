import { NextResponse } from 'next/server'
import { createShiprocketOrder, CreateOrderPayload } from '@/lib/shiprocket'

// Force dynamic so Shiprocket responses are not cached by Next.js
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const email = process.env.SHIPROCKET_EMAIL?.trim()
    const password = process.env.SHIPROCKET_PASSWORD?.trim()
    if (!email || !password) {
      return NextResponse.json({ error: 'Server misconfigured: SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing' }, { status: 500 })
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const payload = body.payload as CreateOrderPayload
    if (!payload?.order_id) return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
    if (!payload?.pickup_location) return NextResponse.json({ error: 'pickup_location is required' }, { status: 400 })
    if (!Array.isArray(payload?.order_items) || payload.order_items.length === 0) {
      return NextResponse.json({ error: 'order_items must be a non-empty array' }, { status: 400 })
    }

    const requiredBilling = [
      ['billing_customer_name', payload.billing_customer_name],
      ['billing_address', payload.billing_address],
      ['billing_city', payload.billing_city],
      ['billing_state', payload.billing_state],
      ['billing_pincode', payload.billing_pincode],
      ['billing_phone', payload.billing_phone],
    ]
    const missing = requiredBilling.filter(([, v]) => !v || `${v}`.trim() === '').map(([k]) => k)
    if (missing.length) {
      return NextResponse.json({ error: `Missing billing fields: ${missing.join(', ')}` }, { status: 400 })
    }

    const asNumericString = (v: any) => {
      if (v === undefined || v === null) return undefined
      const trimmed = `${v}`.trim()
      if (!trimmed) return undefined
      const digits = trimmed.replace(/\D+/g, '')
      return digits || undefined
    }

    const normalizePhone = (value: any) => {
      const digits = asNumericString(value) || ''
      if (!digits) return { phone: null, error: 'Phone is empty' }
      if (digits.length === 11 && digits.startsWith('0')) return { phone: digits.slice(-10) }
      if (digits.length === 12 && digits.startsWith('91')) return { phone: digits.slice(-10) }
      if (digits.length > 10) return { phone: digits.slice(-10) }
      if (digits.length === 10) return { phone: digits }
      return { phone: null, error: 'Phone must have 10 digits after removing country code and symbols' }
    }

    const normalizePincode = (value: any) => {
      const digits = asNumericString(value) || ''
      if (digits.length === 6) return { pincode: digits }
      if (digits.length > 6) return { pincode: digits.slice(-6) }
      return { pincode: null, error: 'Pincode must have 6 digits' }
    }

    const allSameDigit = (value: string | null | undefined) => !!value && /^([0-9])\1{9}$/.test(value)

    const { phone: cleanPhone, error: phoneError } = normalizePhone(payload.billing_phone)
    if (!cleanPhone) return NextResponse.json({ error: phoneError }, { status: 400 })
    if (allSameDigit(cleanPhone)) return NextResponse.json({ error: 'Phone cannot be all the same digit (e.g., 9999999999 is rejected by Shiprocket)' }, { status: 400 })

    const { pincode: cleanPincode, error: pincodeError } = normalizePincode(payload.billing_pincode)
    if (!cleanPincode) return NextResponse.json({ error: pincodeError }, { status: 400 })

    const deriveLastName = (fullName: string | undefined | null) => {
      if (!fullName) return 'NA'
      const parts = fullName.trim().split(/\s+/)
      if (parts.length === 1) return 'NA'
      return parts.slice(-1)[0] || 'NA'
    }

    const billingLastName = payload.billing_last_name?.trim() || deriveLastName(payload.billing_customer_name)

    const enriched: CreateOrderPayload = {
      ...payload,
      order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      billing_country: payload.billing_country || 'India',
      billing_last_name: billingLastName,
      billing_pincode: cleanPincode,
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      shipping_customer_name: payload.billing_customer_name,
      shipping_last_name: billingLastName,
      shipping_address: payload.billing_address,
      shipping_address_2: payload.billing_address_2,
      shipping_city: payload.billing_city,
      shipping_state: payload.billing_state,
      shipping_country: payload.billing_country || 'India',
      shipping_pincode: cleanPincode,
      shipping_phone: cleanPhone,
      shipping_email: payload.billing_email,
      sub_total: payload.order_items.reduce((s, it) => s + (Number(it.selling_price) || 0) * (Number(it.units) || 0), 0),
      payment_method: payload.payment_method === 'COD' ? 'COD' : 'Prepaid',
      length: Number(payload.length) || 0.5,
      breadth: Number(payload.breadth) || 0.5,
      height: Number(payload.height) || 0.5,
      weight: Number(payload.weight) || 0.5,
    }

    const result = await createShiprocketOrder({ email, password, payload: enriched })
    return NextResponse.json(result)
  } catch (e: any) {
    const message = e?.message || 'Shiprocket error'
    const isAuth = /login failed|403|401/i.test(message)
    if (e?.upstream) {
      return NextResponse.json({ error: message, upstream: e.upstream }, { status: isAuth ? 401 : 400 })
    }
    return NextResponse.json({ error: message }, { status: isAuth ? 401 : 400 })
  }
}
