import { NextResponse, NextRequest } from 'next/server'
import database from '@/lib/database'
import { requireUser } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = requireUser(req)
    const body = await req.json()
    const { items, shipping, paymentMethod } = body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items required' }, { status: 400 })
    }
    const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0)
    const tax = items.reduce((sum: number, it: any) => {
      const gst = it.gstPercent ? (it.price * it.quantity * it.gstPercent) / 100 : 0
      return sum + gst
    }, 0)
    const total = subtotal + tax

    const order = {
      userId,
      role: role || 'user',
      items,
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethod === 'razorpay' ? 'razorpay' : 'cod',
      paymentStatus: paymentMethod === 'razorpay' ? 'pending' : 'pending',
      status: 'created',
      shipping,
      createdAt: new Date().toISOString(),
    }

    const col = await database.getCollection('orders')
    const res = await col.insertOne(order)
    const orderId = res.insertedId.toString()

    if (order.paymentMethod === 'razorpay') {
      // Client should call Razorpay create endpoint next
      return NextResponse.json({ orderId, next: 'razorpay' })
    } else {
      // COD: Confirm immediately and trigger Shiprocket + SMS client-side or via separate call
      return NextResponse.json({ orderId, next: 'cod-confirm' })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Checkout failed' }, { status: 500 })
  }
}
