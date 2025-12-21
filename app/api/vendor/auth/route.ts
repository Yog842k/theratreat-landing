import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { generateToken } from '@/lib/authUtils'

type Vendor = {
  // _id is omitted to let MongoDB handle it
  email: string
  password: string
  name?: string
  phone?: string
  pickupAddress?: {
    address: string
    city: string
    state: string
    pincode: string
  }
  createdAt?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, email, password, name, phone, pickupAddress } = body || {}
    if (!action || !email || !password) return NextResponse.json({ error: 'action,email,password required' }, { status: 400 })
    const col = await database.getCollection('vendors')
    if (action === 'signup') {
      const existing = await col.findOne({ email })
      if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      const doc: Vendor = { email, password, name, phone, pickupAddress, createdAt: new Date().toISOString() }
      const res = await col.insertOne(doc)
      const token = generateToken({ userId: String(res.insertedId), role: 'vendor' })
      return NextResponse.json({ ok: true, token })
    } else if (action === 'login') {
      const v = await col.findOne({ email })
      if (!v) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      // In mock DB, passwords are hashed automatically; accept plain compare for now
      const bcrypt = require('bcryptjs')
      const match = v.password?.startsWith('$2') ? await bcrypt.compare(password, v.password) : v.password === password
      if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      const token = generateToken({ userId: String(v._id), role: 'vendor' })
      return NextResponse.json({ ok: true, token })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Vendor auth failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // simple profile fetch by token (optional)
  try {
    const auth = req.headers.get('authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { verifyToken } = require('@/lib/authUtils')
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'vendor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const col = await database.getCollection('vendors')
    const v = await col.findOne({ _id: database.toObjectId(payload.userId) }, { projection: { password: 0 } })
    return NextResponse.json({ vendor: v })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch vendor' }, { status: 500 })
  }
}
