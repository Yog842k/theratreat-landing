import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { requireUser } from '@/lib/api-auth'

type ProductRequest = {
  _id?: string
  vendorId: string
  name: string
  brand?: string
  price?: number
  gstPercent?: number
  category?: string
  description?: string
  images?: string[]
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  createdAt?: string
  productId?: string
}

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = requireUser(req)
    const col = await database.getCollection('product_requests')
    const filter = role === 'vendor' ? { vendorId: userId } : {}
    const docs = await col.find(filter).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ data: docs })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = requireUser(req)
    if (role !== 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await req.json()
    const pr: ProductRequest = {
      vendorId: userId,
      name: body.name,
      brand: body.brand,
      price: body.price,
      gstPercent: body.gstPercent,
      category: body.category,
      description: body.description,
      images: body.images || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    const { _id, ...prData } = pr;
    const col = await database.getCollection('product_requests');
    const res = await col.insertOne(prData);
    return NextResponse.json({ ok: true, id: res.insertedId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to submit request' }, { status: 500 })
  }
}
