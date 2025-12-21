import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { requireUser } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const { role } = requireUser(req)
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const col = await database.getCollection('product_requests')
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ data: docs })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { role } = requireUser(req)
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await req.json()
    const { id, approve, notes } = body || {}
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const prCol = await database.getCollection('product_requests')
    const prodCol = await database.getCollection('products')
    const reqDoc = await prCol.findOne({ _id: database.toObjectId(id) })
    if (!reqDoc) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    if (approve) {
      // Publish product
      const product = {
        name: reqDoc.name,
        brand: reqDoc.brand,
        price: reqDoc.price || 0,
        gstPercent: reqDoc.gstPercent || 0,
        category: reqDoc.category,
        description: reqDoc.description,
        images: reqDoc.images || [],
        vendorId: reqDoc.vendorId,
        createdAt: new Date().toISOString(),
        stock: 0,
        rating: 5,
        reviewCount: 0,
        condition: 'New',
        fastDelivery: false,
      }
      const ins = await prodCol.insertOne(product)
      await prCol.updateOne({ _id: database.toObjectId(id) }, { $set: { status: 'approved', notes, productId: ins.insertedId } })
      return NextResponse.json({ ok: true, productId: ins.insertedId })
    } else {
      await prCol.updateOne({ _id: database.toObjectId(id) }, { $set: { status: 'rejected', notes } })
      return NextResponse.json({ ok: true })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update request' }, { status: 500 })
  }
}
