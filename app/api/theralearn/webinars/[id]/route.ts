import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

const database = require("@/lib/database");
const { ResponseUtils } = require("@/lib/utils");
const AuthMiddleware = require("@/lib/middleware");

function safeObjectId(value: any) {
  try {
    return new ObjectId(String(value));
  } catch {
    return value;
  }
}

async function countAttendees(webinarId: any) {
  try {
    const collection = await database.getCollection("theralearn_webinar_attendees");
    if (collection?.countDocuments) {
      return await collection.countDocuments({ webinarId });
    }
    const list = await collection.find({ webinarId }).toArray();
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let user: any = null;
    try {
      user = await AuthMiddleware.authenticate(request);
    } catch {
      user = null;
    }

    const resolved = await params;
    const webinarId = safeObjectId(resolved.id);

    const webinar = await database.findOne("theralearn_webinars", { _id: webinarId });
    if (!webinar) return ResponseUtils.notFound("Webinar not found");

    const attendeeCount = await countAttendees(webinarId);

    let attendee = null;
    if (user?._id) {
      attendee = await database.findOne("theralearn_webinar_attendees", {
        webinarId,
        userId: safeObjectId(user._id),
      });
    }

    const { hostCode, attendeeCode, hostMeetingUrl, attendeeMeetingUrl, ...rest } = webinar;

    return ResponseUtils.success({
      webinar: {
        ...rest,
        attendeeMeetingUrl: attendeeMeetingUrl || null,
        customQuestions: Array.isArray(webinar.customQuestions) ? webinar.customQuestions : [],
      },
      attendeeCount,
      alreadyRegistered: Boolean(attendee),
      attendeeStatus: attendee?.status || null,
    });
  } catch (err: any) {
    return ResponseUtils.error(err?.message || "Failed to load webinar");
  }
}
