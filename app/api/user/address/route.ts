import { NextResponse, NextRequest } from 'next/server'
import database from '@/lib/database'
import { requireUser } from '@/lib/api-auth'

type Address = {
  name: string
  phone: string
  email?: string
  address: string
  city: string
  state: string
  pincode: string
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireUser(req)
    const col = await database.getCollection('addresses')
    const doc = await col.findOne({ userId }, { projection: { _id: 0, userId: 0 } })
    return NextResponse.json(doc || null)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch address' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireUser(req)
    const body = (await req.json()) as Address
    const col = await database.getCollection('addresses')
    await col.updateOne(
      { userId },
      { $set: { userId, ...body, updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to save address' }, { status: 500 })
  }
}
 
