import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import type { Twilio } from "twilio";

const database = require("@/lib/database");
const AuthMiddleware = require("@/lib/middleware");
const { ResponseUtils } = require("@/lib/utils");
const { hmsConfig } = require("@/lib/hms-config");
const { getCredentials } = require("@/lib/razorpay-creds");

function safeObjectId(value: any) {
  try {
    return new ObjectId(String(value));
  } catch {
    return value;
  }
}

function buildMeetingUrl(code: string | null) {
  if (!code) return null;
  return hmsConfig.getRoomUrlWithFallback(code) || hmsConfig.getRoomUrl(code);
}

function normalizePhone(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null;
  let p = raw.trim();
  if (/^0\d{10}$/.test(p)) p = p.substring(1);
  if (!p.startsWith("+") && /^\d{10}$/.test(p)) p = `${process.env.OTP_DEFAULT_COUNTRY_CODE || "+91"}${p}`;
  if (!/^\+?[1-9]\d{7,15}$/.test(p)) return null;
  if (!p.startsWith("+")) p = "+" + p;
  return p;
}

let twilioClient: Twilio | null = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const twilioLib = require("twilio");
    twilioClient = twilioLib(sid, token, { lazyLoading: true });
    return twilioClient;
  } catch (err) {
    console.error("[webinar sms] twilio init", err);
    return null;
  }
}

async function sendRegistrationSms(phoneRaw: string | null, webinar: any) {
  const to = normalizePhone(phoneRaw || "");
  const from = String(process.env.TWILIO_SMS_FROM || "").split("#")[0].trim();
  if (!to || !from) return;

  const client = getTwilioClient();
  if (!client) return;

  const startTime = webinar?.startTime ? new Date(webinar.startTime) : null;
  const when = startTime && !Number.isNaN(startTime.getTime()) ? startTime.toLocaleString("en-IN", { timeZone: process.env.DEFAULT_TIMEZONE || "Asia/Kolkata" }) : "upcoming";
  const parts = [
    `You are registered for ${webinar?.title || "the webinar"}.`,
    `Starts: ${when}.`,
    "Join from TheraLearn — we will notify you inside the app before start.",
  ];

  try {
    await client.messages.create({ to, from, body: parts.join(" ") });
  } catch (err) {
    console.error("[webinar sms] send failed", err);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let user: any = null;
    try {
      user = await AuthMiddleware.authenticate(request);
    } catch {
      user = null;
    }
    const resolvedParams = await params;
    const webinarId = safeObjectId(resolvedParams.id);

    const webinar = await database.findOne("theralearn_webinars", { _id: webinarId });
    if (!webinar) return ResponseUtils.notFound("Webinar not found");

    const body = await request.json().catch(() => ({}));
    const paymentStatus = body?.paymentStatus;
    const paymentReference = body?.paymentReference || body?.paymentId || null;
    const razorpayPaymentId = body?.razorpayPaymentId || body?.razorpay_payment_id;
    const razorpayOrderId = body?.razorpayOrderId || body?.razorpay_order_id;
    const razorpaySignature = body?.razorpaySignature || body?.razorpay_signature;
    const responses = body?.responses && typeof body.responses === "object" ? body.responses : {};

    const contactName = String(
      body?.name || body?.fullName || body?.contactName || user?.name || user?.fullName || ""
    ).trim();
    const contactPhone = String(
      body?.phone || body?.contact || body?.mobile || user?.phone || user?.mobile || ""
    ).trim();
    const contactEmail = String(body?.email || user?.email || "").trim();

    const questions: any[] = Array.isArray(webinar.customQuestions) ? webinar.customQuestions : [];
    const missingRequired = questions.filter((q) => q?.required && !String(responses?.[q.id] || "").trim());
    if (missingRequired.length > 0) {
      return ResponseUtils.badRequest(
        `Missing required responses: ${missingRequired.map((q) => q.label).join(", ")}`
      );
    }

    if (!user && !contactPhone) {
      return ResponseUtils.badRequest("Phone number is required for registration");
    }

    const attendeeFilter = user
      ? { userId: safeObjectId(user._id), webinarId }
      : { guestPhone: contactPhone, webinarId };

    let attendee = await database.findOne("theralearn_webinar_attendees", attendeeFilter);

    if (!attendee) {
      attendee = {
        ...attendeeFilter,
        status: webinar.isPaid ? "pending_payment" : "registered",
        paymentStatus: webinar.isPaid ? "pending" : "free",
        paymentReference: null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        responses,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await database.insertOne("theralearn_webinar_attendees", attendee);
      attendee._id = result.insertedId;
    } else {
      await database.updateOne(
        "theralearn_webinar_attendees",
        attendeeFilter,
        {
          $set: {
            contactName: contactName || attendee.contactName || null,
            contactPhone: contactPhone || attendee.contactPhone || null,
            contactEmail: contactEmail || attendee.contactEmail || null,
            responses: { ...(attendee.responses || {}), ...responses },
            updatedAt: new Date(),
          },
        }
      );
      attendee = await database.findOne("theralearn_webinar_attendees", attendeeFilter);
    }

    if (webinar.isPaid) {
      if (paymentStatus !== "paid" || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return ResponseUtils.errorCode(
          "payment_required",
          "Payment required before enrolling in this webinar",
          402
        );
      }

      const creds = getCredentials?.();
      if (!creds?.keySecret) {
        return ResponseUtils.errorCode("payment_config_missing", "Payment configuration missing", 500);
      }

      const expected = crypto
        .createHmac("sha256", creds.keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expected !== razorpaySignature) {
        return ResponseUtils.errorCode("payment_signature_invalid", "Payment verification failed", 400);
      }

      await database.updateOne(
        "theralearn_webinar_attendees",
        attendeeFilter,
        {
          $set: {
            status: "registered",
            paymentStatus: "paid",
            paymentReference: paymentReference || razorpayPaymentId || attendee.paymentReference || null,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            contactName: contactName || attendee.contactName || null,
            contactPhone: contactPhone || attendee.contactPhone || null,
            contactEmail: contactEmail || attendee.contactEmail || null,
            responses: { ...(attendee.responses || {}), ...responses },
            updatedAt: new Date(),
          },
        }
      );
    }

    const joinCode = webinar.attendeeCode || webinar.hostCode || null;
    const meetingUrl = webinar.attendeeMeetingUrl || webinar.hostMeetingUrl || buildMeetingUrl(joinCode);
    const joinPath = `/theralearn/webinars/${String(webinar._id || webinarId)}/room`;

    // Best-effort SMS confirmation
    if (contactPhone || attendee?.contactPhone) {
      await sendRegistrationSms(contactPhone || attendee?.contactPhone, webinar);
    }

    return ResponseUtils.success(
      {
        webinarId,
        status: attendee.status,
        joinCode,
        meetingUrl,
        joinPath,
      },
      "Registration confirmed"
    );
  } catch (err: any) {
    return ResponseUtils.error(err?.message || "Failed to register for webinar");
  }
}
