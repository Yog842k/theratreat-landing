import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { requireUser } from '@/lib/api-auth'
import { createShiprocketOrder, generateShiprocketAwb, CreateOrderPayload } from '@/lib/shiprocket'

export const dynamic = 'force-dynamic'

const fallbackDims = {
  length: Number(process.env.SHIPROCKET_PARCEL_LENGTH) || 10,
  breadth: Number(process.env.SHIPROCKET_PARCEL_BREADTH) || 10,
  height: Number(process.env.SHIPROCKET_PARCEL_HEIGHT) || 5,
  weight: Number(process.env.SHIPROCKET_PARCEL_WEIGHT) || 0.5,
}

const asNumericString = (v: any) => {
  if (v === undefined || v === null) return ''
  const digits = `${v}`.replace(/\D+/g, '')
  return digits
}

const normalizePhone = (value: any) => {
  const digits = asNumericString(value)
  if (!digits) return { phone: null, error: 'Phone is empty' }
  if (digits.length === 11 && digits.startsWith('0')) return { phone: digits.slice(-10) }
  if (digits.length === 12 && digits.startsWith('91')) return { phone: digits.slice(-10) }
  if (digits.length > 10) return { phone: digits.slice(-10) }
  if (digits.length === 10) return { phone: digits }
  return { phone: null, error: 'Phone must have 10 digits after removing country code and symbols' }
}

const normalizePincode = (value: any) => {
  const digits = asNumericString(value)
  if (digits.length === 6) return { pincode: digits }
  if (digits.length > 6) return { pincode: digits.slice(-6) }
  return { pincode: null, error: 'Pincode must have 6 digits' }
}

const deriveLastName = (fullName: string | undefined | null) => {
  if (!fullName) return 'NA'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return 'NA'
  return parts.slice(-1)[0] || 'NA'
}

const allSameDigit = (value: string | null | undefined) => !!value && /^([0-9])\1{9}$/.test(value)

const extractShipmentId = (resp: any) => resp?.shipment_id ?? resp?.data?.shipment_id
const extractAwbCode = (resp: any) => resp?.awb_code ?? resp?.response?.data?.awb_code ?? resp?.data?.awb_code

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireUser(req)
    const email = process.env.SHIPROCKET_EMAIL?.trim()
    const password = process.env.SHIPROCKET_PASSWORD?.trim()
    if (!email || !password) {
      return NextResponse.json({ error: 'Server misconfigured: SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing' }, { status: 500 })
    }

    const body = await req.json().catch(() => null)
    const orderId = body?.orderId
    const force = !!body?.force
    const autoAwb = body?.generateAwb !== undefined ? !!body.generateAwb : true
    const pickupLocation = (body?.pickupLocation || process.env.SHIPROCKET_PICKUP_LOCATION || 'Default').toString().trim()
    const courierId = body?.courierId

    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 })

    const orders = await database.getCollection('orders')
    const order = await orders.findOne({ _id: database.toObjectId(orderId) })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (String(order.userId) !== String(userId)) return NextResponse.json({ error: 'Unauthorized for this order' }, { status: 403 })

    if (order.shiprocket?.order_id && !force) {
      return NextResponse.json({ ok: true, alreadyExists: true, shiprocket: order.shiprocket })
    }

    const shipping = order.shipping || body?.shipping
    if (!shipping) return NextResponse.json({ error: 'Shipping details missing on order' }, { status: 400 })

    const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'pincode'] as const
    const missing = requiredFields.filter((k) => !shipping[k] || `${shipping[k]}`.trim() === '')
    if (missing.length) return NextResponse.json({ error: `Missing shipping fields: ${missing.join(', ')}` }, { status: 400 })

    const items = Array.isArray(order.items) ? order.items : []
    if (!items.length) return NextResponse.json({ error: 'Order has no items to ship' }, { status: 400 })

    const { phone: cleanPhone, error: phoneError } = normalizePhone(shipping.phone)
    if (!cleanPhone) return NextResponse.json({ error: phoneError }, { status: 400 })
    if (allSameDigit(cleanPhone)) return NextResponse.json({ error: 'Phone cannot be all the same digit (e.g., 9999999999)' }, { status: 400 })

    const { pincode: cleanPincode, error: pincodeError } = normalizePincode(shipping.pincode)
    if (!cleanPincode) return NextResponse.json({ error: pincodeError }, { status: 400 })

    const billingLastName = deriveLastName(shipping.name)
    const subTotal = items.reduce((s: number, it: any) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0)

    const payload: CreateOrderPayload = {
      order_id: (body?.shiprocketOrderId || `THERA-${orderId}`).toString(),
      order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickup_location: pickupLocation,
      billing_customer_name: shipping.name,
      billing_last_name: billingLastName,
      billing_address: shipping.address,
      billing_address_2: shipping.address2 || shipping.addressLine2,
      billing_city: shipping.city,
      billing_state: shipping.state,
      billing_country: shipping.country || 'India',
      billing_pincode: cleanPincode,
      billing_phone: cleanPhone,
      billing_email: shipping.email,
      shipping_is_billing: true,
      shipping_customer_name: shipping.name,
      shipping_last_name: billingLastName,
      shipping_address: shipping.address,
      shipping_address_2: shipping.address2 || shipping.addressLine2,
      shipping_city: shipping.city,
      shipping_state: shipping.state,
      shipping_country: shipping.country || 'India',
      shipping_pincode: cleanPincode,
      shipping_phone: cleanPhone,
      shipping_email: shipping.email,
      order_items: items.map((it: any, idx: number) => ({
        name: it.name || `Item ${idx + 1}`,
        sku: it.productId || it.sku || `SKU-${idx + 1}`,
        units: Number(it.quantity) || 1,
        selling_price: Number(it.price) || 0,
        tax: typeof it.gstPercent === 'number' ? Number(it.gstPercent) : undefined,
      })),
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: subTotal,
      length: Number(body?.length) || fallbackDims.length,
      breadth: Number(body?.breadth) || fallbackDims.breadth,
      height: Number(body?.height) || fallbackDims.height,
      weight: Number(body?.weight) || fallbackDims.weight,
    }

    console.log('[shiprocket][order] start', { orderId: payload.order_id, userId, items: items.length })

    const createResponse = await createShiprocketOrder({ email, password, payload })
    const shipmentId = extractShipmentId(createResponse)

    let awbResponse: any = null
    let awbCode: string | undefined
    if (autoAwb && shipmentId) {
      try {
        awbResponse = await generateShiprocketAwb({ email, password, shipmentId, courierId })
        awbCode = extractAwbCode(awbResponse)
      } catch (awbErr: any) {
        awbResponse = { error: awbErr?.message || 'Shiprocket AWB generation failed', upstream: awbErr?.upstream }
      }
    }

    const shiprocketData = {
      order_id: payload.order_id,
      shipment_id: shipmentId,
      awb: awbCode,
      courier_company_id: createResponse?.courier_company_id || awbResponse?.courier_company_id,
      status: createResponse?.status || createResponse?.message,
      updatedAt: new Date().toISOString(),
    }

    await orders.updateOne(
      { _id: database.toObjectId(orderId) },
      {
        $set: {
          shiprocket: shiprocketData,
        },
      }
    )

    console.log('[shiprocket][order] success', { orderId: payload.order_id, shipmentId, awb: awbCode })
    return NextResponse.json({ ok: true, shiprocket: shiprocketData, createResponse, awbResponse })
  } catch (e: any) {
    const message = e?.message || 'Shiprocket order failed'
    const isAuth = /login failed|403|401|unauthorized/i.test(message)
    if (e?.upstream) {
      console.error('[shiprocket][order] upstream error', { message, upstream: e.upstream })
      return NextResponse.json({ error: message, upstream: e.upstream }, { status: isAuth ? 401 : 400 })
    }
    console.error('[shiprocket][order] error', message)
    return NextResponse.json({ error: message }, { status: isAuth ? 401 : 400 })
  }
}
