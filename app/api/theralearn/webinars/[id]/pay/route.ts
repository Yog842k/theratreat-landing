import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { ObjectId } from "mongodb";

const database = require("@/lib/database");
const AuthMiddleware = require("@/lib/middleware");
const { ResponseUtils } = require("@/lib/utils");
const { getCredentials } = require("@/lib/razorpay-creds");
const { createRazorpayCustomer } = require("@/lib/razorpay-customer");

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const webinarId = new ObjectId(id);

    let user;
    try {
      user = await AuthMiddleware.authenticate(request);
    } catch {
      return ResponseUtils.unauthorized("Unauthorized");
    }

    const webinar = await database.findOne("theralearn_webinars", { _id: webinarId });
    if (!webinar) return ResponseUtils.notFound("Webinar not found");

    if (!webinar.isPaid || !webinar.price) {
      return ResponseUtils.errorCode("not_paid_webinar", "This webinar does not require payment", 400);
    }

    const creds = getCredentials?.();
    if (!creds?.keyId || !creds?.keySecret) {
      return ResponseUtils.errorCode("payment_config_missing", "Payment configuration missing", 500);
    }

    const razorpay = new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret });

    const amount = Math.round(Number(webinar.price) * 100);
    const notes = {
      webinarId: id,
      webinarTitle: webinar.title,
      userId: String(user._id || user.id || ""),
      userEmail: user.email || "",
    };

    await createRazorpayCustomer?.({ email: user.email, name: user.name }).catch(() => undefined);

    const order = (await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `theralearn_webinar_${id}_${Date.now()}`,
      payment_capture: true,
      notes,
    } as any)) as any;

    return ResponseUtils.success({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: creds.publicKey || creds.keyId,
      notes,
      webinar: {
        id,
        title: webinar.title,
        price: webinar.price,
      },
    });
  } catch (error: any) {
    console.error("TheraLearn pay error", error);
    return ResponseUtils.error(error?.message || "Payment error");
  }
}
