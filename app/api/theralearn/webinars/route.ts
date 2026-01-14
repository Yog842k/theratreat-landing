import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

const database = require("@/lib/database");
const AuthMiddleware = require("@/lib/middleware");
const { ResponseUtils } = require("@/lib/utils");
const { USER_ROLES } = require("@/utils/constants");
const { scheduleMeeting } = require("@/lib/meeting-scheduler");
const { hmsConfig } = require("@/lib/hms-config");

type CustomQuestion = {
  id: string;
  label: string;
  required: boolean;
  type?: string;
};

function validatePayload(body: any) {
  const required = ["title", "startTime", "durationMinutes"];
  const missing = required.filter((k) => !body?.[k]);
  if (missing.length > 0) throw new Error(`Missing fields: ${missing.join(", ")}`);
}

function sanitizeQuestions(raw: any): CustomQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: any, idx: number) => {
      const label = String(item?.label || "").trim().slice(0, 200);
      if (!label) return null;
      return {
        id: String(item?.id || `q_${idx}_${Date.now()}`),
        label,
        required: Boolean(item?.required),
        type: item?.type || "text",
      };
    })
    .filter(Boolean) as CustomQuestion[];
}

function safeObjectId(value: any) {
  try {
    return new ObjectId(String(value));
  } catch {
    return value;
  }
}

async function createAttendeeCode(roomId: string, role = "guest") {
  if (!hmsConfig?.managementToken) return null;

  try {
    const res = await fetch("https://api.100ms.live/v2/room-codes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hmsConfig.managementToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room_id: roomId, role }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[webinars] room-code create failed", res.status, text);
      return null;
    }

    const data: any = await res.json();
    return (
      data.code ||
      data.room_code ||
      data.data?.code ||
      (data as any).roomCode ||
      (data as any).code_value ||
      (data as any).room_code_value ||
      null
    );
  } catch (err: any) {
    console.error("[webinars] room-code network error", err?.message || err);
    return null;
  }
}

function sanitizeTitle(title: string) {
  return title.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const upcomingOnly = url.searchParams.get("upcoming") === "true";
  const mineOnly = url.searchParams.get("mine") === "true";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100);

  let user: any = null;
  if (mineOnly) {
    try {
      user = await AuthMiddleware.authenticate(request);
    } catch {
      return ResponseUtils.unauthorized("Login required");
    }
  }

  const filter: any = {};
  if (mineOnly && user?._id) {
    filter.hostId = safeObjectId(user._id);
  }

  const collection = await database.getCollection("theralearn_webinars");
  let webinars = await collection
    .find(filter)
    .sort({ startTime: -1 })
    .limit(limit)
    .toArray();

  if (upcomingOnly) {
    const now = Date.now();
    webinars = webinars.filter((w: any) => {
      const ts = new Date(w.startTime).getTime();
      return !Number.isNaN(ts) && ts >= now;
    });
  }

  const publicWebinars = webinars.map((w: any) => {
    const { hostCode, attendeeCode, hostMeetingUrl, attendeeMeetingUrl, ...rest } = w;
    return rest;
  });

  return ResponseUtils.success(publicWebinars, "Webinars fetched");
}

export async function POST(request: NextRequest) {
  try {
      const user = await AuthMiddleware.requireRole(request, [USER_ROLES.INSTRUCTOR, USER_ROLES.THERAPIST, USER_ROLES.ADMIN]);
    const body = await request.json();
    validatePayload(body);

    const startTime = new Date(body.startTime);
    if (Number.isNaN(startTime.getTime())) {
      return ResponseUtils.badRequest("startTime must be a valid date");
    }

    const duration = Number(body.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) {
      return ResponseUtils.badRequest("durationMinutes must be a positive number");
    }

    const bookingId = `webinar_${sanitizeTitle(body.title)}_${Date.now()}`;
    const meeting = await scheduleMeeting({ bookingId, sessionType: "video" });

    let attendeeCode: string | null = null;
    if (meeting.roomId) {
      attendeeCode = await createAttendeeCode(meeting.roomId, "guest");
    }

    const attendeeMeetingUrl = attendeeCode
      ? hmsConfig.getRoomUrlWithFallback(attendeeCode)
      : meeting.meetingUrl;

    const doc: any = {
      title: String(body.title).trim(),
      description: body.description ?? "",
      thumbnail: body.thumbnail ? String(body.thumbnail).trim() : null,
      startTime,
      durationMinutes: duration,
      tags: Array.isArray(body.tags) ? body.tags : [],
      category: body.category ?? null,
      level: body.level ?? null,
      status: "scheduled",
      isPaid: Boolean(body.isPaid),
      price: body.price ? Number(body.price) : 0,
      hostId: safeObjectId(user._id),
      hostName: body.instructor ?? user.name ?? "Instructor",
      roomId: meeting.roomId,
      hostCode: meeting.roomCode,
      hostMeetingUrl: meeting.meetingUrl,
      attendeeCode,
      attendeeMeetingUrl,
      customQuestions: sanitizeQuestions(body.customQuestions),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.insertOne("theralearn_webinars", doc);
    doc._id = result.insertedId;

    return ResponseUtils.success(doc, "Webinar created", 201);
  } catch (err: any) {
    return ResponseUtils.error(err?.message || "Failed to create webinar");
  }
}
