import { NextResponse } from 'next/server';
import { verifyBankAccount } from '@/lib/idfy';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const accountNumber = String(body.accountNumber || '').replace(/\D/g, '');
    const ifsc = String(body.ifsc || '').replace(/\s|-/g, '').toUpperCase();
    const name = body.name ? String(body.name) : undefined;
    if (!accountNumber || !ifsc) {
      return NextResponse.json({ error: 'MISSING_FIELDS', message: 'accountNumber and ifsc are required' }, { status: 400 });
    }
    // Validate formats to avoid unnecessary upstream calls
    if (!/^\d{9,20}$/.test(accountNumber)) {
      return NextResponse.json({ error: 'INVALID_ACCOUNT', message: 'Account number must have 9–20 digits' }, { status: 400 });
    }
    if (!/^[A-Z]{4}0[0-9A-Z]{6}$/.test(ifsc)) {
      return NextResponse.json({ error: 'INVALID_IFSC', message: 'IFSC must be like ABCD0XXXXXX (11 chars, 5th is zero)' }, { status: 400 });
    }
    const result = await verifyBankAccount({ accountNumber, ifsc, name });
    if (!result.ok) {
      return NextResponse.json(result, { status: 422 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
