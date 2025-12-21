import { NextRequest } from 'next/server';

const ACCESS_PASS = '123@theratreat';

export async function POST(req: NextRequest) {
  try {
    const { pass, next } = await req.json();
    if (pass !== ACCESS_PASS) {
      return Response.json({ success: false, error: 'Invalid access pass' }, { status: 401 });
    }

    const headers = new Headers();
    const cookie = [
      `therastore_admin=1`,
      `Path=/`,
      `HttpOnly`,
      `SameSite=Lax`,
      // Avoid Secure on http local dev to ensure cookie works
      req.nextUrl.protocol === 'https:' ? 'Secure' : '',
      `Max-Age=${60 * 60 * 24}`, // 1 day
    ].filter(Boolean).join('; ');

    headers.append('Set-Cookie', cookie);
    return new Response(JSON.stringify({ success: true, redirect: next || '/therastore/add-product' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...Object.fromEntries(headers) },
    });
  } catch (e: any) {
    return Response.json({ success: false, error: e?.message || 'Auth error' }, { status: 500 });
  }
}
