import { NextResponse } from 'next/server'
import { loginCheck } from '@/lib/shiprocket'

export async function POST() {
  try {
    const email = process.env.SHIPROCKET_EMAIL
    const password = process.env.SHIPROCKET_PASSWORD
    if (!email || !password) {
      return NextResponse.json({ error: 'SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing in env' }, { status: 500 })
    }
    const result = await loginCheck({ email, password })
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Shiprocket login failed' }, { status: 400 })
  }
}
