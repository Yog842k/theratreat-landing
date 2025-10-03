const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch {}

// Force Node.js runtime (Buffer used for Basic auth)
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const user = await AuthMiddleware.requireRole(request, ['user', 'patient']);
    const body = await request.json();
    const { bookingId, currency = 'INR' } = body || {};

    if (!bookingId || !ValidationUtils.validateObjectId(bookingId)) {
      return ResponseUtils.badRequest('Valid bookingId is required');
    }

    // Load booking and enforce ownership
    const booking = await database.findOne('bookings', {
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user._id)
    });
    if (!booking) {
      return ResponseUtils.notFound('Booking not found');
    }

    if (booking.paymentStatus === 'paid') {
      return ResponseUtils.badRequest('Booking already paid');
    }

    // Calculate payable amount = session totalAmount + fees (keep UI parity)
    const base = Number(booking.totalAmount || 0);
    const platformFee = 5; // Keep in sync with UI
    const tax = 10; // Optional tax shown in UI summary
    const amount = base + platformFee + tax;
    if (!Number.isFinite(amount) || amount <= 0) {
      return ResponseUtils.badRequest('Invalid amount to charge');
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const fakeMode = String(process.env.PAYMENTS_FAKE_MODE || '').toLowerCase() === 'true';

    // Dev fallback: simulated order (useful when keys are not available)
    if (fakeMode) {
      const order = {
        id: `order_FAKE_${bookingId}`,
        amount: Math.round(amount * 100),
        currency,
        status: 'created'
      };
      // Optionally persist fake order reference
      try {
        await database.updateOne('bookings', { _id: new ObjectId(bookingId) }, {
          $set: {
            paymentOrder: {
              provider: 'simulated',
              orderId: order.id,
              amount: order.amount,
              currency: order.currency,
              createdAt: new Date()
            },
            updatedAt: new Date()
          }
        });
      } catch {}
      return ResponseUtils.success({ order, keyId: 'rzp_test_FAKE', simulated: true });
    }
    if (!keyId || !keySecret) {
      console.error('Razorpay keys missing. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set.');
      return ResponseUtils.error('Payment gateway is not configured');
    }

    // Create order via Razorpay REST API
    const amountPaise = Math.round(amount * 100);
    let order;
    if (Razorpay) {
      try {
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        order = await rzp.orders.create({
          amount: amountPaise,
          currency,
          receipt: `booking_${bookingId}`,
          payment_capture: 1,
          notes: {
            bookingId: String(bookingId),
            sessionType: booking.sessionType || ''
          }
        });
      } catch (e) {
        const reason = e?.error?.description || e?.message || 'Unknown error';
        let msg = `Failed to create payment order: ${reason}`;
        if (/authentication/i.test(reason)) {
          const modeHint = keyId.startsWith('rzp_live_') ? 'live' : (keyId.startsWith('rzp_test_') ? 'test' : 'unknown');
          msg += ` (auth: ensure correct ${modeHint} key/secret, no extra spaces, and restart the server after updating .env)`;
          // Masked diagnostics (dev-only): do not log full secrets
          const maskedKey = keyId ? `${keyId.slice(0, 8)}…${keyId.slice(-4)}` : 'undefined';
          const secretLen = keySecret ? keySecret.length : 0;
          console.error(`[Razorpay Auth Hint] mode=${modeHint} key=${maskedKey} secretLen=${secretLen}`);
        }
        return ResponseUtils.error(msg, 502);
      }
    } else {
      // Fallback to REST API if SDK is not available
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const orderPayload = {
        amount: amountPaise,
        currency,
        receipt: `booking_${bookingId}`,
        payment_capture: 1,
        notes: {
          bookingId: String(bookingId),
          sessionType: booking.sessionType || ''
        }
      };
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        let reason = '';
        try {
          const j = errText ? JSON.parse(errText) : null;
          reason = j?.error?.description || j?.error?.reason || j?.message || '';
        } catch {}
        console.error('Razorpay order create failed:', res.status, errText);
        let msg = reason ? `Failed to create payment order: ${reason}` : 'Failed to create payment order';
        if (res.status === 401 || /authentication/i.test(reason)) {
          const modeHint = keyId.startsWith('rzp_live_') ? 'live' : (keyId.startsWith('rzp_test_') ? 'test' : 'unknown');
          msg += ` (auth: ensure correct ${modeHint} key/secret, no extra spaces, and restart the server after updating .env)`;
          // Masked diagnostics (dev-only): do not log full secrets
          const maskedKey = keyId ? `${keyId.slice(0, 8)}…${keyId.slice(-4)}` : 'undefined';
          const secretLen = keySecret ? keySecret.length : 0;
          console.error(`[Razorpay Auth Hint] mode=${modeHint} key=${maskedKey} secretLen=${secretLen}`);
        }
        return ResponseUtils.error(msg, 502);
      }
      order = await res.json();
    }

    // Optionally store order reference on booking
    try {
      await database.updateOne('bookings', { _id: new ObjectId(bookingId) }, {
        $set: {
          paymentOrder: {
            provider: 'razorpay',
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            createdAt: new Date()
          },
          updatedAt: new Date()
        }
      });
    } catch (e) {
      console.warn('Failed to persist paymentOrder on booking:', e?.message);
    }

    return ResponseUtils.success({ order, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId });
  } catch (error) {
    console.error('Razorpay order route error:', error);
    return ResponseUtils.error('Failed to initialize payment');
  }
}
