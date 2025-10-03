const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

export async function POST(request) {
  try {
    const user = await AuthMiddleware.requireRole(request, ['user', 'patient']);
    const body = await request.json();
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body || {};

    if (!bookingId || !ValidationUtils.validateObjectId(bookingId)) {
      return ResponseUtils.badRequest('Valid bookingId is required');
    }
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return ResponseUtils.badRequest('Missing Razorpay payment verification fields');
    }

  const fakeMode = String(process.env.PAYMENTS_FAKE_MODE || '').toLowerCase() === 'true';
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return ResponseUtils.error('Payment gateway is not configured');
    }

    if (!fakeMode) {
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = hmac.digest('hex');
      if (digest !== razorpay_signature) {
        return ResponseUtils.badRequest('Invalid payment signature');
      }
    }

    // Mark booking as paid (owner only)
    const result = await database.updateOne('bookings', {
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user._id)
    }, {
      $set: {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentProvider: fakeMode ? 'simulated' : 'razorpay',
        paymentInfo: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          verifiedAt: new Date()
        },
        updatedAt: new Date()
      }
    });

    if (result.matchedCount === 0) {
      return ResponseUtils.notFound('Booking not found');
    }

    return ResponseUtils.success({ ok: true });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return ResponseUtils.error('Failed to verify payment');
  }
}
