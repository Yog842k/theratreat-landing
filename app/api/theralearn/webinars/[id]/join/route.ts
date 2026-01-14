import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const database = require("@/lib/database");
const AuthMiddleware = require("@/lib/middleware");
const { ResponseUtils } = require("@/lib/utils");
const { scheduleMeeting } = require("@/lib/meeting-scheduler");
const { hmsConfig } = require("@/lib/hms-config");

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
      const text = await res.text().catch(() => "");
      console.error("[webinar join] createAttendeeCode failed", { status: res.status, text: text?.slice(0, 500) });
      return null;
    }
    const data: any = await res.json();
    return data.code || data.room_code || data.data?.code || (data as any).roomCode || null;
  } catch {
    return null;
  }
}

async function ensureRoom(webinar: any, isHost: boolean) {
  if (webinar.roomId) {
    return {
      roomId: webinar.roomId,
      hostCode: webinar.hostCode || null,
      attendeeCode: webinar.attendeeCode || null,
    };
  }
  if (!isHost) {
    throw new Error("Host has not started this webinar yet.");
  }

  const bookingId = `webinar_${webinar._id}`;
  const meeting = await scheduleMeeting({ bookingId, sessionType: "video" });
  let attendeeCode: string | null = null;
  if (meeting.roomId) {
    attendeeCode = await createAttendeeCode(meeting.roomId, "guest");
  }

  await database.updateOne(
    "theralearn_webinars",
    { _id: webinar._id },
    {
      $set: {
        roomId: meeting.roomId,
        hostCode: meeting.roomCode || webinar.hostCode || null,
        hostMeetingUrl: meeting.meetingUrl || webinar.hostMeetingUrl || null,
        attendeeCode: attendeeCode || webinar.attendeeCode || null,
        attendeeMeetingUrl:
          attendeeCode ? hmsConfig.getRoomUrlWithFallback(attendeeCode) : webinar.attendeeMeetingUrl || meeting.meetingUrl,
        updatedAt: new Date(),
      },
    }
  );

  return {
    roomId: meeting.roomId,
    hostCode: meeting.roomCode || null,
    attendeeCode,
  };
}

async function createToken(roomId: string, role: string, userId: string) {
  const managementToken = process.env.HMS_MANAGEMENT_TOKEN || hmsConfig.managementToken;
  if (!managementToken) {
    const err = new Error("Missing HMS_MANAGEMENT_TOKEN");
    (err as any).code = "config_missing";
    throw err;
  }

  const res = await fetch(`https://api.100ms.live/v2/rooms/${roomId}/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${managementToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, role }),
  });
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  if (!res.ok || !json?.token) {
    const err = new Error(json?.error || json?.message || `Failed to fetch token (${res.status})`);
    (err as any).status = res.status;
    (err as any).body = text;
    throw err;
  }
  return json.token as string;
}

function isRoomCode(value: any) {
  const v = String(value || "").trim();
  return /^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i.test(v);
}

async function createTokenViaRoomCode(roomCode: string, role: string, userId: string) {
  const code = String(roomCode || "").trim();
  if (!isRoomCode(code)) {
    const err = new Error("Invalid room code");
    (err as any).code = "invalid_room_code";
    throw err;
  }

  const primaryCluster = (process.env.HMS_ROOM_CODE_JOIN_DOMAIN || "prod-in2").trim();
  const fallbackEnv = (process.env.HMS_ROOM_CODE_FALLBACK_CLUSTERS || "").trim();
  const defaultFallbacks = ["prod-us2", "prod-us1", "prod-eu1"];
  const configured = fallbackEnv ? fallbackEnv.split(/[\s,]+/).filter(Boolean) : [];
  const clusters = [primaryCluster, ...configured, ...defaultFallbacks].filter(
    (c, i, arr) => arr.indexOf(c) === i
  );

  const payload = JSON.stringify({ user_id: String(userId || "guest"), role });
  const attempts: { cluster: string; status: number; snippet: string }[] = [];
  for (const cluster of clusters) {
    const url = `https://${cluster}.100ms.live/api/v2/room-codes/${code}/join`;
    let res: Response;
    try {
      res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
    } catch (e: any) {
      const err = new Error(e?.message || "fetch failed");
      (err as any).code = "room_code_network_fail";
      (err as any).cluster = cluster;
      throw err;
    }
    if (res.ok) {
      const data: any = await res.json().catch(() => ({}));
      if (!data?.token) {
        const err = new Error("No token in room-code join response");
        (err as any).code = "room_code_no_token";
        (err as any).cluster = cluster;
        throw err;
      }
      return data.token as string;
    }
    const text = (await res.text().catch(() => "")).slice(0, 200);
    attempts.push({ cluster, status: res.status, snippet: text });
    if (res.status !== 404) break;
  }
  const err = new Error("Room-code join failed");
  (err as any).code = "room_code_join_failed";
  (err as any).attempts = attempts;
  throw err;
}

function createTokenViaJwt(roomId: string, role: string, userId: string) {
  const accessKey = process.env.HMS_ACCESS_KEY || process.env.HMS_ACCESS_KEY_NEW;
  const secret = process.env.HMS_SECRET || process.env.HMS_SECRET_NEW;
  if (!accessKey || !secret) {
    const err = new Error("Missing HMS_ACCESS_KEY/HMS_SECRET");
    (err as any).code = "jwt_config_missing";
    throw err;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 24 * 60 * 60;
  const clockSkew = 30; // seconds to allow for clock drift
  const payload: any = {
    access_key: accessKey,
    room_id: String(roomId),
    user_id: String(userId || "guest"),
    role: String(role),
    type: "app",
    version: 2,
    iat: now,
    nbf: now - clockSkew,
    exp: now + expiresIn,
  };

  try {
    return jwt.sign(payload, secret, {
      algorithm: "HS256",
      jwtid: randomUUID(),
    });
  } catch (e: any) {
    const err = new Error("Failed to sign JWT token");
    (err as any).code = "jwt_sign_failed";
    (err as any).detail = e?.message || String(e);
    throw err;
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let user: any = null;
    try {
      user = await AuthMiddleware.authenticate(request);
    } catch (err: any) {
      return ResponseUtils.errorCode("unauthorized", err?.message || "Authentication required", 401);
    }
    const resolvedParams = await params;
    const webinarId = safeObjectId(resolvedParams.id);

    const webinar = await database.findOne("theralearn_webinars", { _id: webinarId });
    if (!webinar) return ResponseUtils.notFound("Webinar not found");

    const isHost = String(webinar.hostId || "") === String(user._id || "") || user.userType === "admin";

    if (!isHost) {
      const attendeeFilter = { userId: safeObjectId(user._id), webinarId };
      const attendee = await database.findOne("theralearn_webinar_attendees", attendeeFilter);
      if (!attendee) {
        return ResponseUtils.errorCode("not_registered", "You must register before joining this webinar", 400);
      }
      if (webinar.isPaid && attendee.paymentStatus !== "paid") {
        return ResponseUtils.errorCode("payment_required", "Payment required before joining this webinar", 402);
      }
    }

    let roomInfo;
    try {
      roomInfo = await ensureRoom(webinar, isHost);
    } catch (e: any) {
      const msg = e?.message || "Room not available";
      console.error("[webinar join] ensureRoom failed", { message: msg, stack: e?.stack });
      if (msg.toLowerCase().includes("host") && msg.toLowerCase().includes("not started")) {
        return ResponseUtils.errorCode("not_started", "Host has not started this webinar yet", 400);
      }
      return ResponseUtils.error(msg, 500);
    }

    const roomId = roomInfo?.roomId;
    if (!roomId) return ResponseUtils.errorCode("room_missing", "Room not available yet", 400);

    // If hostCode is missing/unusable, try generating one (helps room-code join fallback)
    if (isHost && (!roomInfo?.hostCode || !isRoomCode(roomInfo.hostCode))) {
      try {
        const hostCode = await createAttendeeCode(roomId, "host");
        if (hostCode) {
          roomInfo.hostCode = hostCode;
          await database.updateOne(
            "theralearn_webinars",
            { _id: webinar._id },
            { $set: { hostCode, updatedAt: new Date() } }
          );
        }
      } catch {
        // ignore
      }
    }

    const role = isHost ? "host" : "guest";
    const callerUserId = String(user._id || "guest");
    let token: string | null = null;
    let mode: "management-api" | "room-code" | "jwt" = "management-api";
    try {
      token = await createToken(roomId, role, callerUserId);
    } catch (e: any) {
      // If management token endpoint fails (commonly 404 when room isn't in this project),
      // fall back to room-code join if we have a valid room code.
      if (e?.status === 404) {
        const candidateRoomCode = isHost
          ? roomInfo?.hostCode
          : roomInfo?.attendeeCode || roomInfo?.hostCode;

        if (isRoomCode(candidateRoomCode)) {
          try {
            mode = "room-code";
            token = await createTokenViaRoomCode(String(candidateRoomCode), role, callerUserId);
          } catch (fallbackErr: any) {
            console.error("[webinar join] room-code token fallback failed", {
              code: fallbackErr?.code,
              cluster: fallbackErr?.cluster,
              attempts: fallbackErr?.attempts,
              message: fallbackErr?.message,
            });
            // fall through to JWT fallback
          }
        }
      }

      // Final fallback: generate JWT token locally using access key/secret.
      if (!token) {
        try {
          mode = "jwt";
          token = createTokenViaJwt(roomId, role, callerUserId);
        } catch (jwtErr: any) {
          console.error("[webinar join] jwt token fallback failed", {
            code: jwtErr?.code,
            detail: jwtErr?.detail,
            message: jwtErr?.message,
          });
        }
      }

      if (token) {
        return ResponseUtils.success({
          token,
          roomId,
          role,
          mode,
          webinar: {
            _id: webinar._id,
            title: webinar.title,
            startTime: webinar.startTime,
            isPaid: webinar.isPaid || false,
            price: webinar.price || 0,
          },
        });
      }

      const msg = e?.message || "Failed to create token";
      console.error("[webinar join] createToken failed", {
        message: msg,
        code: e?.code,
        roomId,
        hostCode: roomInfo?.hostCode,
        attendeeCode: roomInfo?.attendeeCode,
        status: e?.status,
        body: e?.body ? String(e.body).slice(0, 800) : undefined,
        stack: e?.stack,
      });
      if (e?.code === "config_missing") {
        return ResponseUtils.errorCode("config_missing", "Video config missing (HMS_MANAGEMENT_TOKEN)", 500);
      }
      // If JWT config is also missing, surface a clearer message.
      if (e?.status === 404) {
        return ResponseUtils.errorCode(
          "token_generation_failed",
          "Could not generate 100ms join token. Room may not belong to this 100ms project, and no room-code/JWT fallback is available.",
          500
        );
      }
      const extra: string[] = [];
      if (e?.status) extra.push(`status=${e.status}`);
      if (e?.body) extra.push(`body=${String(e.body).slice(0, 500)}`);
      const suffix = extra.length ? ` (${extra.join(", ")})` : "";
      return ResponseUtils.error(`${msg}${suffix}`, 500);
    }

    return ResponseUtils.success({
      token: token || "",
      roomId,
      role,
      mode,
      webinar: {
        _id: webinar._id,
        title: webinar.title,
        startTime: webinar.startTime,
        isPaid: webinar.isPaid || false,
        price: webinar.price || 0,
      },
    });
  } catch (err: any) {
    const message = err?.message || "Failed to join webinar";
    console.error("[webinar join] error", {
      message,
      stack: err?.stack,
      status: err?.status,
      body: err?.body,
      code: err?.code,
    });
    // Surface known errors as 4xx when possible
    const lower = message.toLowerCase();
    if (lower.includes("unauthorized") || lower.includes("authentication")) {
      return ResponseUtils.errorCode("unauthorized", message, 401);
    }
    if (lower.includes("not registered") || lower.includes("register")) {
      return ResponseUtils.errorCode("not_registered", message, 400);
    }
    if (lower.includes("payment")) {
      return ResponseUtils.errorCode("payment_required", message, 402);
    }
    const parts: string[] = [];
    if (err?.code) parts.push(`code=${err.code}`);
    if (err?.status) parts.push(`status=${err.status}`);
    if (err?.body) parts.push(`body=${String(err.body).slice(0, 500)}`);
    const detail = parts.length ? ` (${parts.join(", ")})` : "";
    return ResponseUtils.error(`${message}${detail}`);
  }
}
