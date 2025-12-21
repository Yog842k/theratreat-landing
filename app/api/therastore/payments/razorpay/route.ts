import { NextResponse, NextRequest } from 'next/server'
import database from '@/lib/database'
import { requireUser } from '@/lib/api-auth'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(req: NextRequest) {
  try {
    requireUser(req)
    const body = await req.json()
    const { orderId } = body
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const ordersCol = await database.getCollection('orders')
    const order = await ordersCol.findOne({ _id: database.toObjectId(orderId) })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Create Razorpay order
    const amountPaise = Math.round(order.total * 100)
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64'),
      },
      body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt: orderId }),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Razorpay order failed', details: err }, { status: 500 })
    }
    const rpOrder = await res.json()
    await ordersCol.updateOne({ _id: database.toObjectId(orderId) }, { $set: { paymentGatewayOrderId: rpOrder.id } })
    return NextResponse.json({ razorpayOrder: rpOrder, keyId: RAZORPAY_KEY_ID })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Razorpay init failed' }, { status: 500 })
  }
}
