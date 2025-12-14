import { NextRequest, NextResponse } from 'next/server';

export type ApiSuccess<T> = { success: true; data: T; pagination?: any };
export type ApiError = { success: false; error: string; data?: any };

export function ok<T>(data: T, init?: ResponseInit & { pagination?: any }) {
  const body: ApiSuccess<T> = { success: true, data, pagination: init?.pagination };
  const headers = new Headers(init?.headers);
  return new NextResponse(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: headers,
  });
}

export function badRequest(message: string, data?: any) {
  return jsonError(message, 400, data);
}

export function unauthorized(message = 'Unauthorized') {
  return jsonError(message, 401);
}

export function notFound(message = 'Not found') {
  return jsonError(message, 404);
}

export function serverError(message = 'Internal server error') {
  return jsonError(message, 500);
}

export function jsonError(message: string, status = 500, data?: any) {
  const body: ApiError = { success: false, error: message, data };
  return NextResponse.json(body, { status });
}

export function getRequestId(req: NextRequest) {
  return req.headers.get('x-request-id') || crypto.randomUUID();
}

export function withRequestHeaders(req: NextRequest, extra?: Record<string, string>) {
  const headers = new Headers();
  headers.set('x-request-id', getRequestId(req));
  if (extra) Object.entries(extra).forEach(([k, v]) => headers.set(k, v));
  return headers;
}

export function etagFrom(obj: unknown) {
  try {
    const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
    const buf = new TextEncoder().encode(json);
    const hash = [...crypto.subtle ? [] : []];
    // Fallback simple hash
    let h = 0;
    for (let i = 0; i < buf.length; i++) h = (h * 31 + buf[i]) >>> 0;
    return `W/"${h.toString(16)}-${buf.length}"`;
  } catch {
    return undefined;
  }
}
