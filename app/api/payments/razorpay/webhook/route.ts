import type { NextRequest } from 'next/server';
import crypto from 'crypto';
const { ResponseUtils } = require('@/lib/utils');
const database = require('@/lib/database');
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

/*
 Optional: Razorpay webhook endpoint (skeleton)
 Set RAZORPAY_WEBHOOK_SECRET in env and configure the same in Razorpay Dashboard.
*/

function getWebhookSecret() {
  return (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const secret = getWebhookSecret();
    if (!secret) return ResponseUtils.error('Webhook secret not configured', 500);

    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected !== signature) {
      return ResponseUtils.forbidden('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody);
    // Basic pattern: on payment.captured, reconcile booking if needed.
    if (payload?.event === 'payment.captured') {
      const paymentEntity = payload?.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        try {
          // Find booking whose paymentOrder.orderId matches
          const booking = await database.findOne('bookings', { 'paymentOrder.orderId': orderId });
          if (booking && booking.paymentStatus !== 'paid') {
            const update: any = { paymentStatus: 'paid', updatedAt: new Date() };
            // Store captured amount + method for reconciliation
            update.paymentInfo = {
              ...(booking.paymentInfo || {}),
              capturedAt: new Date(),
              amountCaptured: paymentEntity?.amount,
              status: paymentEntity?.status,
              method: paymentEntity?.method
            };
            await database.updateOne('bookings', { _id: new ObjectId(booking._id) }, { $set: update });
          }
        } catch (e) {
          console.warn('Webhook reconciliation warning:', (e as any)?.message);
        }
      }
    }

    return ResponseUtils.success({ received: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return ResponseUtils.error('Webhook processing failed');
  }
}
