import { NextResponse, NextRequest } from 'next/server'
import database from '@/lib/database'
import { requireUser } from '@/lib/api-auth'

type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  gstPercent?: number
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireUser(req)
    const col = await database.getCollection('carts')
    const cart = await col.findOne({ userId }, { projection: { _id: 0, items: 1 } })
    return NextResponse.json({ items: cart?.items || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireUser(req)
    const body = await req.json()
    const items = (body?.items || []) as CartItem[]
    const col = await database.getCollection('carts')
    await col.updateOne(
      { userId },
      { $set: { userId, items, updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to save cart' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = requireUser(req)
    const body = await req.json()
    const item = body as CartItem & { quantity: number }
    const col = await database.getCollection('carts')
    const cart = await col.findOne({ userId })
    const items: CartItem[] = cart?.items || []
    const idx = items.findIndex((i) => i.productId === item.productId)
    if (item.quantity <= 0) {
      if (idx >= 0) items.splice(idx, 1)
    } else if (idx >= 0) {
      items[idx] = { ...items[idx], ...item }
    } else {
      items.push(item)
    }
    await col.updateOne(
      { userId },
      { $set: { items, updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update cart' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = requireUser(req)
    const col = await database.getCollection('carts')
    await col.updateOne({ userId }, { $set: { items: [], updatedAt: new Date().toISOString() } }, { upsert: true })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to clear cart' }, { status: 500 })
  }
}
