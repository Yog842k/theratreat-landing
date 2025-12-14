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

  // Admin gate for TheraStore add product page
  if (pathname === '/therastore/add-product') {
    const adminCookie = req.cookies.get('therastore_admin')?.value;
    if (adminCookie !== '1') {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/therastore/admin-login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin access gate: require explicit admin pass
  if (pathname.startsWith('/admin')) {
    // Allow access to the login page itself
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const adminPass = req.cookies.get('tt_admin_pass')?.value;
    const expected = process.env.ADMIN_PANEL_PASS || '123@theratreat';

    if (adminPass !== expected) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware for TheraBook legacy routes and TheraStore admin routes
  matcher: ['/therabook/:path*', '/therastore/add-product', '/admin/:path*'],
};
