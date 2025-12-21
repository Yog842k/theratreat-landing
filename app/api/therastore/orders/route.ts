import { NextResponse, NextRequest } from 'next/server'
import database from '@/lib/database'
import { requireUser } from '@/lib/api-auth'

type OrderItem = {
  productId: string
  name: string
  quantity: number
  price: number
  gstPercent?: number
}

type Order = {
  _id?: string
  userId: string
  role: 'user' | 'therapist' | 'clinic'
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'cod' | 'razorpay'
  paymentStatus: 'pending' | 'paid' | 'failed'
  status: 'created' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping?: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  shiprocket?: {
    order_id?: string
    shipment_id?: string
    awb?: string
  }
  createdAt?: string
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireUser(req)
    const col = await database.getCollection('orders')
    const docs = await col.find({ userId }).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(docs)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = requireUser(req)
    const body = (await req.json()) as Partial<Order>
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: 'Items required' }, { status: 400 })
    }
    const now = new Date().toISOString()
    const allowedRoles = ['user', 'therapist', 'clinic'] as const;
    const safeRole: 'user' | 'therapist' | 'clinic' =
      typeof role === 'string' && allowedRoles.includes(role as any)
        ? (role as 'user' | 'therapist' | 'clinic')
        : 'user';
    const order: Order = {
      userId,
      role: safeRole,
      items: body.items as OrderItem[],
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      total: body.total || 0,
      paymentMethod: (body.paymentMethod as any) || 'cod',
      paymentStatus: 'pending',
      status: 'created',
      shipping: body.shipping,
      createdAt: now,
    }
    const col = await database.getCollection('orders')
    const { _id, ...orderData } = order;
    const res = await col.insertOne(orderData);
    return NextResponse.json({ ...orderData, _id: res.insertedId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create order' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    requireUser(req)
    const body = await req.json()
    const { id, update } = body
    if (!id || !update) return NextResponse.json({ error: 'id and update required' }, { status: 400 })
    const col = await database.getCollection('orders')
    await col.updateOne({ _id: database.toObjectId(id) }, { $set: update })
    const doc = await col.findOne({ _id: database.toObjectId(id) })
    return NextResponse.json(doc)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update order' }, { status: 500 })
  }
}
