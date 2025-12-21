import { NextResponse } from 'next/server'
import { generateShiprocketAwb } from '@/lib/shiprocket'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const email = process.env.SHIPROCKET_EMAIL?.trim()
    const password = process.env.SHIPROCKET_PASSWORD?.trim()
    if (!email || !password) {
      return NextResponse.json({ error: 'Server misconfigured: SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing' }, { status: 500 })
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const rawShipmentId = (body as any).shipment_id ?? (body as any).shipmentId
    const courierId = (body as any).courier_id ?? (body as any).courierId

    if (rawShipmentId === undefined || rawShipmentId === null || `${rawShipmentId}`.trim() === '') {
      return NextResponse.json({ error: 'shipment_id is required' }, { status: 400 })
    }

    const result = await generateShiprocketAwb({
      email,
      password,
      shipmentId: rawShipmentId,
      courierId,
    })

    return NextResponse.json(result)
  } catch (e: any) {
    const message = e?.message || 'Shiprocket error'
    const isAuth = /login failed|403|401/i.test(message)
    if (e?.upstream) {
      return NextResponse.json({ error: message, upstream: e.upstream }, { status: isAuth ? 401 : 400 })
    }
    return NextResponse.json({ error: message }, { status: isAuth ? 401 : 400 })
  }
}
