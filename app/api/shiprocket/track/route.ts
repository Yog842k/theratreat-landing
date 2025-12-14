import { NextResponse } from 'next/server';
import { srLogin, trackByAwb, trackByOrder } from '@/lib/shiprocket';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const awb = url.searchParams.get('awb');
    const orderId = url.searchParams.get('orderId');
    if (!awb && !orderId) return NextResponse.json({ ok: false, error: 'awb or orderId required' }, { status: 400 });
    const auth = await srLogin();
    const result = awb ? await trackByAwb(auth.token, awb) : await trackByOrder(auth.token, orderId!);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
