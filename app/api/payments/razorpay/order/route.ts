import type { NextRequest } from 'next/server';
// All other dependencies resolved lazily inside the handler to prevent hard crashes producing HTML.

// Types only (optional) to keep editor hints; not required for runtime
type DynModules = {
  ObjectId: any;
  database: any;
  AuthMiddleware: any;
  ResponseUtils: any;
  ValidationUtils: any;
  getCredentials: any;
  validatePrefix: any;
  isWeakSecret: any;
  isSimulationEnabled: any;
};

async function loadDeps(): Promise<DynModules | null> {
  try {
    const [{ ObjectId }, razorCreds, utils, dbMod, authRaw] = await Promise.all([
      import('mongodb'),
      import('@/lib/razorpay-creds'),
      import('@/lib/utils'),
      import('@/lib/database').catch(e => ({ default: null })),
      import('@/lib/middleware').catch(e => ({ default: null }))
    ]);
    const { getCredentials, validatePrefix, isWeakSecret, isSimulationEnabled } = razorCreds as any;
    const { ResponseUtils, ValidationUtils } = utils as any;
    const database = (dbMod as any)?.default || (dbMod as any) || {};
    // Unwrap possible CommonJS default export pattern so requireRole is accessible
    let AuthMiddleware: any = (authRaw as any);
    if (AuthMiddleware?.default && !AuthMiddleware.requireRole) {
      AuthMiddleware = AuthMiddleware.default; // use the default export if methods live there
    }
    return { ObjectId, database, AuthMiddleware: AuthMiddleware || {}, ResponseUtils, ValidationUtils, getCredentials, validatePrefix, isWeakSecret, isSimulationEnabled };
  } catch (e) {
    console.error('[RZP][ORDER] dependency load failure:', (e as any)?.message);
    return null;
  }
}

export const runtime = 'nodejs';

/*
 Step 2 & 3: Dual-mode (test/live) order creation.
 Environment strategy (all optional except at least one mode pair):
   RAZORPAY_MODE=test|live (default: infer from provided keys; fallback 'test')
   TEST: RAZORPAY_TEST_KEY_ID / RAZORPAY_TEST_KEY_SECRET / NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID
   LIVE: RAZORPAY_LIVE_KEY_ID / RAZORPAY_LIVE_KEY_SECRET / NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID

 Backwards compatibility (legacy single pair):
   RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / NEXT_PUBLIC_RAZORPAY_KEY_ID (treated as active mode pair)

 Auto rules:
   1. If RAZORPAY_MODE provided, use it.
   2. Else if both live and test pairs exist choose test by default unless explicitly only live provided.
   3. Validate prefix alignment (test => rzp_test_, live => rzp_live_).
*/

// Credential resolution & validation moved to shared utility: lib/razorpay-creds.ts

export const dynamic = 'force-dynamic'; // ensure no caching layer interferes while debugging

export async function POST(request: NextRequest) {
  let ResponseUtilsLocal: any = null;
  try {
    const deps = await loadDeps();
    if (!deps) {
      return new Response(JSON.stringify({ success: false, code: 'MODULE_LOAD_ERROR', message: 'Failed to load payment dependencies' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const { ObjectId, database, AuthMiddleware, ResponseUtils, ValidationUtils, getCredentials, validatePrefix, isWeakSecret, isSimulationEnabled } = deps;
    ResponseUtilsLocal = ResponseUtils;

    // Hard guards so downstream code never throws TypeError creating an HTML error page
    if (!ResponseUtils || !ValidationUtils) {
      return new Response(JSON.stringify({ success: false, code: 'UTILS_MISSING', message: 'Core utility modules missing' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    if (!database || typeof database.findOne !== 'function' || typeof database.updateOne !== 'function') {
      return ResponseUtils.errorCode('DB_MODULE_MISSING', 'Database module not available', 500);
    }
    if (!AuthMiddleware || typeof AuthMiddleware.requireRole !== 'function') {
      return ResponseUtils.errorCode('AUTH_MIDDLEWARE_MISSING', 'Auth middleware missing', 500);
    }

    console.log('[RZP][ORDER] entry', {
      modeEnv: process.env.RAZORPAY_MODE,
      hasTest: !!process.env.RAZORPAY_TEST_KEY_ID,
      hasLive: !!process.env.RAZORPAY_LIVE_KEY_ID,
      hasLegacy: !!process.env.RAZORPAY_KEY_ID,
      simulatedFlag: process.env.RAZORPAY_SIMULATED,
      ts: Date.now()
    });
    // Inline key usage is disabled permanently (security hardening).

    // Auth guard with configurable roles. By default only end-user roles can create orders.
    // Override with:
    //   RAZORPAY_ORDER_ROLES=user,patient,therapist   (comma list)
    //   RAZORPAY_ALLOW_ANY_ROLE=1 (accept any authenticated user)
    let user: any;
    const anyRoleBypass = process.env.RAZORPAY_ALLOW_ANY_ROLE === '1';
    const allowedRoles = anyRoleBypass ? [] : (process.env.RAZORPAY_ORDER_ROLES || 'user,patient')
      .split(',')
      .map(r => r.trim())
      .filter(Boolean);
    try {
      if (anyRoleBypass && typeof AuthMiddleware.authenticate === 'function') {
        user = await AuthMiddleware.authenticate(request);
      } else {
        user = await AuthMiddleware.requireRole(request, allowedRoles);
      }
    } catch (e: any) {
      const msg = e?.message || 'Authentication failed';
      if (msg === 'Insufficient permissions') {
        return ResponseUtils.errorCode('FORBIDDEN', `Insufficient permissions (required roles: ${allowedRoles.join('/')})`, 403);
      }
      return ResponseUtils.errorCode('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Safer JSON parse (avoid throwing top-level uncaught if body is empty / invalid JSON)
    let body: any = {};
    try { body = await request.json(); } catch { body = {}; }
    const { bookingId, therapistId: rawTherapistId, amount: manualAmount, currency = 'INR' } = body || {};

    let booking: any = null;
    let bookingContext: 'booking' | 'direct' = 'booking';
    if (bookingId) {
      if (!ValidationUtils.validateObjectId(bookingId)) {
        return ResponseUtils.badRequest('bookingId is not a valid ObjectId');
      }
      booking = await database.findOne('bookings', { _id: new ObjectId(bookingId), userId: new ObjectId(user._id) });
      if (!booking) return ResponseUtils.notFound('Booking not found');
      if (booking.paymentStatus === 'paid') return ResponseUtils.badRequest('Booking already paid');
    } else {
      // Direct payment flow (spec style): therapistId + amount
      if (!rawTherapistId || !ValidationUtils.validateObjectId(rawTherapistId)) {
        return ResponseUtils.badRequest('therapistId (ObjectId) required when bookingId not provided');
      }
      if (!manualAmount || !Number.isFinite(Number(manualAmount)) || Number(manualAmount) <= 0) {
        return ResponseUtils.badRequest('Valid amount required');
      }
      bookingContext = 'direct';
      booking = { _id: null, therapistId: new ObjectId(rawTherapistId), totalAmount: Number(manualAmount), sessionType: 'session', userId: new ObjectId(user._id) };
    }

    const base = Number(booking.totalAmount || manualAmount || 0);
  const platformFee = 5; // TODO: replace with dynamic fee logic
  const tax = 10; // TODO: calculate GST/VAT if required
  const grossAmount = base + platformFee + tax;
  // Fetch therapist for commission rule
  const therapist = booking.therapistId ? await database.findOne('therapists', { _id: booking.therapistId }) : null;
  const defaultCommission = therapist?.defaultCommissionPercent ?? 0.15; // 15% fallback
  const commissionAmount = Number((grossAmount * defaultCommission).toFixed(2));
  const therapistAmount = Number((grossAmount - commissionAmount).toFixed(2));
  const amount = grossAmount; // total charged to patient
    if (!Number.isFinite(amount) || amount <= 0) {
      return ResponseUtils.badRequest('Invalid amount to charge');
    }

    const creds = getCredentials();
    if (!creds) {
      if (isSimulationEnabled()) {
        const fakeOrderId = `order_SIM_NO_CREDS_${Date.now()}`;
  // Using a deterministic simulated key id so frontend logic expecting a key-like string can proceed.
  // This value is NOT a real credential. Marked for secret scanner allow.
  return ResponseUtils.success({ order: { id: fakeOrderId, amount: Math.round((manualAmount||booking?.totalAmount||0||1)*100), currency, status: 'created', simulated: true, noCredentials: true }, keyId: 'rzp_test_SIMULATED', mode: 'test', simulated: true }, 'Simulated (no credentials)'); // secret-scan: allow
      }
      return ResponseUtils.errorCode('RAZORPAY_NO_CREDENTIALS', 'Razorpay credentials not configured');
    }
    const prefixIssue = validatePrefix(creds.keyId, creds.mode);
    if (prefixIssue) {
      return ResponseUtils.errorCode('RAZORPAY_PREFIX_MISMATCH', prefixIssue);
    }

    // Secret length sanity check (Razorpay secrets usually >= 30 chars). Short secrets are almost always copy errors.
    if (isWeakSecret(creds.keySecret)) {
      const min = Number.isFinite(Number(process.env.RAZORPAY_SECRET_MIN)) && Number(process.env.RAZORPAY_SECRET_MIN) > 0 ? Number(process.env.RAZORPAY_SECRET_MIN) : 25;
      return ResponseUtils.errorCode(
        'RAZORPAY_WEAK_SECRET',
        `Razorpay secret appears truncated (length < ${min}). Re-copy it from the Razorpay dashboard. (Override check with RAZORPAY_ALLOW_WEAK=1 or adjust min via RAZORPAY_SECRET_MIN).`
      );
    }

    // Optional simulation mode (explicit opt-in) – only if RAZORPAY_SIMULATED=1
    if (isSimulationEnabled()) {
  const fakeOrderId = `order_SIM_${Date.now()}`;
      const fakeOrder = {
        id: fakeOrderId,
        amount: Math.round(amount * 100),
        currency,
        status: 'created',
        notes: { bookingId: String(bookingId), mode: creds.mode, simulated: true }
      };
      if (bookingContext === 'booking') {
        try {
          await database.updateOne('bookings', { _id: new ObjectId(bookingId) }, {
            $set: {
              paymentOrder: {
                provider: `razorpay-${creds.mode}`,
                orderId: fakeOrderId,
                amount: fakeOrder.amount,
                currency: fakeOrder.currency,
                mode: creds.mode,
                simulated: true,
                createdAt: new Date(),
                split: therapist?.razorpayAccountId && process.env.RAZORPAY_PLATFORM_ACCOUNT ? {
                  commissionPercent: defaultCommission,
                  commissionAmount,
                  therapistAmount,
                  grossAmount,
                  therapistAccount: therapist?.razorpayAccountId,
                  platformAccount: process.env.RAZORPAY_PLATFORM_ACCOUNT
                } : null
              },
              updatedAt: new Date()
            }
          });
        } catch {}
      }
      return ResponseUtils.success({ order: fakeOrder, keyId: creds.publicKey, mode: creds.mode, simulated: true, reason: 'forced', split: { commissionPercent: defaultCommission, commissionAmount, therapistAmount } }, 'Simulated');
    }

    const autoCapture = Number(process.env.RAZORPAY_AUTO_CAPTURE ?? 1) === 0 ? 0 : 1;

    let rzp: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RazorpayLib = require('razorpay');
      rzp = new RazorpayLib({ key_id: creds.keyId, key_secret: creds.keySecret });
    } catch (e) {
      console.warn('[RZP][ORDER] razorpay package not found – simulation fallback path', (e as any)?.message);
      if (!isSimulationEnabled()) {
        return ResponseUtils.errorCode('RAZORPAY_SDK_MISSING', 'Razorpay SDK not installed and simulation disabled');
      }
    }
    let order: any;
    try {
      const transfers: any[] = [];
      const platformAccount = (process.env.RAZORPAY_PLATFORM_ACCOUNT || '').trim();
      const therapistAccount = (therapist?.razorpayAccountId || '').trim();
      if (therapistAccount && platformAccount) {
        transfers.push(
          {
            account: therapistAccount,
            amount: Math.round(therapistAmount * 100),
            currency,
            notes: { role: 'therapist', therapistId: String(booking.therapistId || '') }
          },
          {
            account: platformAccount,
            amount: Math.round(commissionAmount * 100),
            currency,
            notes: { role: 'platform_commission', bookingId: String(bookingId) }
          }
        );
      }
      order = await rzp.orders.create({
        amount: Math.round(amount * 100),
        currency,
        // Provide clearer receipt id for direct payments without bookingId
        receipt: bookingId ? `booking_${bookingId}` : `direct_${Date.now()}`,
        payment_capture: autoCapture,
        notes: { bookingId: String(bookingId||''), mode: creds.mode, commissionPercent: defaultCommission },
        ...(transfers.length ? { transfers } : {})
      });
    } catch (e: any) {
      const reason = e?.error?.description || e?.message || 'Unknown';
      console.error('[RZP][ORDER] order create error raw:', e);
      if (isSimulationEnabled()) {
        const simId = `order_SIM_FAIL_${Date.now()}`;
        return ResponseUtils.success({ order: { id: simId, amount: Math.round(amount * 100), currency, status: 'created', simulated: true, fallbackFromError: reason }, keyId: creds.publicKey, mode: creds.mode, simulated: true, error: reason });
      }
      const isAuth = /auth|key|secret|unauthorized/i.test(reason);
      const code = isAuth ? 'RAZORPAY_AUTH' : 'RAZORPAY_ORDER_CREATE_FAILED';
      const authHint = isAuth ? ' (Authentication failed – verify key id & secret pair for selected mode and restart server)' : '';
      return ResponseUtils.errorCode(code, `Failed to create Razorpay order: ${reason}${authHint}`, 502);
    }

    if (bookingContext === 'booking') {
      try {
        await database.updateOne('bookings', { _id: new ObjectId(bookingId) }, {
          $set: {
            paymentOrder: {
              provider: `razorpay-${creds.mode}`,
              orderId: order.id,
              amount: order.amount,
              currency: order.currency,
              mode: creds.mode,
              autoCapture: !!autoCapture,
              split: therapist?.razorpayAccountId && process.env.RAZORPAY_PLATFORM_ACCOUNT ? {
                commissionPercent: defaultCommission,
                commissionAmount,
                therapistAmount,
                grossAmount,
                therapistAccount: therapist?.razorpayAccountId,
                platformAccount: process.env.RAZORPAY_PLATFORM_ACCOUNT
              } : null,
              createdAt: new Date()
            },
            updatedAt: new Date()
          }
        });
      } catch (persistErr) {
        console.warn('Warning: failed to persist paymentOrder (non-fatal):', (persistErr as any)?.message);
      }
    }

    return ResponseUtils.success({ order, keyId: creds.publicKey, mode: creds.mode, split: { commissionPercent: defaultCommission, commissionAmount, therapistAmount, grossAmount, context: bookingContext } });
  } catch (error: any) {
    console.error('[RZP][ORDER] uncaught error:', error?.stack || error);
    const devDetail = process.env.NODE_ENV !== 'production' ? (error?.message || 'unknown') : undefined;
    if (ResponseUtilsLocal) {
      return ResponseUtilsLocal.errorCode('RAZORPAY_UNCAUGHT', 'Failed to initialize payment', 500, devDetail);
    }
    return new Response(JSON.stringify({ success: false, code: 'RAZORPAY_UNCAUGHT', message: 'Failed to initialize payment', detail: devDetail }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// Friendly JSON for accidental GET (default Next 405 returns HTML-ish error surface in some clients)
export async function GET() {
  return new Response(
    JSON.stringify({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Use POST to create a Razorpay order. This endpoint expects a JSON body. For diagnostics call /api/payments/razorpay/ping.'
    }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
