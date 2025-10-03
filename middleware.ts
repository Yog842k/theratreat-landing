import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Redirect legacy payment URLs to the new Razorpay payment page
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Look for legacy payment routes under /therabook/therapists/[id]/book/
  // Examples handled: checkout, pay, billing, payment-old
  const legacyPattern = /^\/therabook\/therapists\/([^/]+)\/book\/(checkout|pay|billing|payment-old)\/?$/i;
  const match = pathname.match(legacyPattern);

  if (match) {
    const therapistId = match[1];
    url.pathname = `/therabook/therapists/${therapistId}/book/payment`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware for TheraBook app URLs
  matcher: ['/therabook/:path*'],
};
