import { NextResponse } from 'next/server';
import { srLogin, generateAWB } from '@/lib/shiprocket';

export async function POST(req: Request) {
  try {
    const { shipmentId } = await req.json();
    if (!shipmentId) return NextResponse.json({ ok: false, error: 'shipmentId required' }, { status: 400 });
    const auth = await srLogin();
    const result = await generateAWB(auth.token, Number(shipmentId));
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
