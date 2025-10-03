const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ResponseUtils, ValidationUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export const runtime = 'nodejs';

// Test-mode verification simply marks the booking paid without signature checking.
export async function POST(request) {
  try {
    const user = await AuthMiddleware.requireRole(request, ['user','patient']);
    const body = await request.json();
    const { bookingId, razorpay_order_id } = body || {};

    if (!bookingId || !ValidationUtils.validateObjectId(bookingId)) {
      return ResponseUtils.badRequest('Valid bookingId is required');
    }

    const booking = await database.findOne('bookings', {
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user._id)
    });
    if (!booking) return ResponseUtils.notFound('Booking not found');

    // Simulate a payment success
    const paymentInfo = {
      provider: 'razorpay-test-simulated',
      orderId: razorpay_order_id || booking?.paymentOrder?.orderId || `order_TESTSIM_${bookingId}`,
      paymentId: 'pay_TESTSIMULATED',
      signatureBypassed: true,
      mode: 'test-simulated',
      verifiedAt: new Date()
    };

    await database.updateOne('bookings', { _id: new ObjectId(bookingId) }, {
      $set: {
        paymentStatus: 'paid',
        status: booking.status === 'pending' ? 'confirmed' : booking.status,
        paymentInfo,
        updatedAt: new Date()
      }
    });

    return ResponseUtils.success({ paymentInfo, testMode: true, simulated: true }, 'Payment verified (test mode)');
  } catch (error) {
    console.error('Test Razorpay verify error:', error);
    return ResponseUtils.error('Failed to verify test payment');
  }
}
