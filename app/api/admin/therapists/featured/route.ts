import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Therapist from '@/lib/models/Therapist'
import { requireUser } from '@/lib/api-auth'

const ensureAdmin = (req: Request) => {
  const { role } = requireUser(req)
  if (role !== 'admin') throw new Error('Forbidden')
}

export async function GET(req: Request) {
  try {
    ensureAdmin(req)
    await connectDB()
    const therapists = await Therapist.find({})
      .select('displayName title rating reviewCount isVerified featured featuredOrder consultationFee specializations image')
      .sort({ featured: -1, featuredOrder: 1, rating: -1 })
      .lean()
    return NextResponse.json({ ok: true, therapists })
  } catch (e: any) {
    const msg = e?.message || 'Failed to fetch featured therapists'
    const status = msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function POST(req: Request) {
  try {
    ensureAdmin(req)
    await connectDB()
    const body = await req.json().catch(() => ({}))
    const featuredIds: string[] = Array.isArray(body?.featuredIds) ? body.featuredIds.map(String) : []
    const orderMap: Record<string, number> = Array.isArray(body?.order)
      ? body.order.reduce((acc: Record<string, number>, id: any, idx: number) => {
          acc[String(id)] = idx
          return acc
        }, {})
      : {}

    // Clear previous featured flags
    await Therapist.updateMany({}, { featured: false, featuredOrder: 0 })

    if (featuredIds.length) {
      const ops = featuredIds.map((id, idx) => ({ id, order: orderMap[id] ?? idx }))
      for (const item of ops) {
        await Therapist.updateOne({ _id: item.id }, { featured: true, featuredOrder: item.order })
      }
    }

    return NextResponse.json({ ok: true, featuredCount: featuredIds.length })
  } catch (e: any) {
    const msg = e?.message || 'Failed to update featured therapists'
    const status = msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
