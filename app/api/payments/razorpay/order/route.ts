import type { NextRequest } from 'next/server';
// @ts-ignore - relying on runtime package
import Razorpay from 'razorpay';
import { ObjectId } from 'mongodb';
import { getCredentials, validatePrefix, isWeakSecret, isSimulationEnabled } from '@/lib/razorpay-creds';
const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');

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

export async function POST(request: NextRequest) {
  try {
    // Inline key usage is disabled permanently (security hardening).

    // Auth guard with explicit error codes so missing token doesn't produce a 500
    let user: any;
    try {
      user = await AuthMiddleware.requireRole(request, ['user','patient']);
    } catch (e: any) {
      const msg = e?.message || 'Authentication failed';
      if (msg === 'Insufficient permissions') {
        return ResponseUtils.errorCode('FORBIDDEN', 'Insufficient permissions', 403);
      }
      return ResponseUtils.errorCode('AUTH_REQUIRED', 'Authentication required', 401);
    }
  const body = await request.json();
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
      return ResponseUtils.errorCode('RAZORPAY_NO_CREDENTIALS', 'Razorpay credentials not configured');
    }
    const prefixIssue = validatePrefix(creds.keyId, creds.mode);
    if (prefixIssue) {
      return ResponseUtils.errorCode('RAZORPAY_PREFIX_MISMATCH', prefixIssue);
    }

    // Secret length sanity check (Razorpay secrets usually >= 30 chars). Short secrets are almost always copy errors.
    if (isWeakSecret(creds.keySecret)) {
      return ResponseUtils.errorCode(
        'RAZORPAY_WEAK_SECRET',
        'Razorpay secret appears truncated (length < 25). Re-copy the full secret from the Razorpay dashboard and restart the server.'
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

    const rzp: any = new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret });
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
        receipt: `booking_${bookingId}`,
        payment_capture: autoCapture,
        notes: { bookingId: String(bookingId), mode: creds.mode, commissionPercent: defaultCommission },
        ...(transfers.length ? { transfers } : {})
      });
    } catch (e: any) {
      const reason = e?.error?.description || e?.message || 'Unknown';
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
  } catch (error) {
    console.error('Razorpay order error:', error);
    return ResponseUtils.errorCode('RAZORPAY_UNCAUGHT', 'Failed to initialize payment');
  }
}
