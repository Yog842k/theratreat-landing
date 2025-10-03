const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

// Force Node runtime
export const runtime = 'nodejs';

// Test-mode (always simulated) order creation endpoint.
// Separate from the real /api/payments/razorpay/order so you can
// build & test UI flows even when real keys are absent.
export async function POST(request) {
  try {
    const user = await AuthMiddleware.requireRole(request, ['user','patient']);
    const body = await request.json();
    const { bookingId, currency = 'INR' } = body || {};

    if (!bookingId || !ValidationUtils.validateObjectId(bookingId)) {
      return ResponseUtils.badRequest('Valid bookingId is required');
    }

    const booking = await database.findOne('bookings', {
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user._id)
    });
    if (!booking) return ResponseUtils.notFound('Booking not found');

    if (booking.paymentStatus === 'paid') {
      return ResponseUtils.badRequest('Booking already paid');
    }

    const base = Number(booking.totalAmount || 0);
    const platformFee = 5;
    const tax = 10;
    const amount = base + platformFee + tax;
    if (!Number.isFinite(amount) || amount <= 0) {
      return ResponseUtils.badRequest('Invalid amount to charge');
    }

    const order = {
      id: `order_TESTSIM_${bookingId}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'created',
      test: true,
      simulated: true
    };

    try {
      await database.updateOne('bookings', { _id: new ObjectId(bookingId) }, {
        $set: {
          paymentOrder: {
            provider: 'simulated-test',
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            createdAt: new Date()
          },
          updatedAt: new Date()
        }
      });
    } catch (e) {
      console.warn('Test order persist warning:', e?.message);
    }

    // Provide a mock public key so UI can render a badge if needed
    return ResponseUtils.success({ order, keyId: 'rzp_test_SIMULATED', simulated: true, testMode: true });
  } catch (error) {
    console.error('Test Razorpay order error:', error);
    return ResponseUtils.error('Failed to create test payment order');
  }
}
