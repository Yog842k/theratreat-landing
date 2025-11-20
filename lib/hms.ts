import * as HMS from "@100mslive/server-sdk";

// Initialize SDK with validation
let hms: HMS.SDK | null = null;

function getSDK() {
  if (hms) return hms;
  
  const accessKey = process.env.HMS_ACCESS_KEY;
  const secret = process.env.HMS_SECRET;
  
  if (!accessKey || !secret) {
    throw new Error('HMS_ACCESS_KEY and HMS_SECRET must be configured in environment variables');
  }
  
  try {
    hms = new HMS.SDK(accessKey, secret);
    return hms;
  } catch (error: any) {
    throw new Error(`Failed to initialize 100ms SDK: ${error?.message || String(error)}`);
  }
}

// Example: create a video session room for a therapist-patient meeting
export async function createSessionRoom({ therapistId, patientId, templateId }: {
  therapistId: string;
  patientId: string;
  templateId: string;
}) {
  try {
    const sdk = getSDK();
    
    if (!templateId) {
      throw new Error('templateId is required to create a room');
    }
    
    const room = await sdk.rooms.create({
      name: `session_${therapistId}_${patientId}_${Date.now()}`,
      description: `Therapist ${therapistId} & Patient ${patientId}`,
      template_id: templateId,
    });
    
    return room;
  } catch (error: any) {
    // Provide more detailed error information
    const errorMessage = error?.message || String(error);
    const errorDetails = {
      message: errorMessage,
      name: error?.name,
      code: error?.code,
      status: error?.status,
      statusCode: error?.statusCode,
      response: error?.response,
      hasAccessKey: !!process.env.HMS_ACCESS_KEY,
      hasSecret: !!process.env.HMS_SECRET,
      hasTemplateId: !!templateId,
      errorType: error?.constructor?.name || 'Unknown',
      ...(error?.stack && { stack: error.stack })
    };
    
    console.error('[lib/hms] createSessionRoom error:', errorDetails);
    
    // Try to extract more details from the error
    let enhancedMessage = errorMessage;
    if (error?.response) {
      try {
        const responseText = typeof error.response === 'string' ? error.response : JSON.stringify(error.response);
        enhancedMessage = `${errorMessage} (Response: ${responseText})`;
      } catch {}
    }
    
    throw new Error(`Failed to create 100ms room: ${enhancedMessage}`);
  }
}

// Alias for compatibility with route.ts
export const createRoom = createSessionRoom;

// Example: generate auth token for user to join
export async function generateJoinToken({ roomId, userId, role }: {
  roomId: string;
  userId: string;
  role: "host" | "guest" | "viewer";
}) {
  try {
    const sdk = getSDK();
    return await sdk.auth.getAuthToken({
      roomId,
      role,
      userId,
    });
  } catch (error: any) {
    console.error('[lib/hms] generateJoinToken error:', error);
    throw new Error(`Failed to generate join token: ${error?.message || String(error)}`);
  }
}


/**
 * Delete a room using the 100ms REST API (SDK does not support this)
 */
import fetch from 'node-fetch';
export async function deleteRoom(roomId: string) {
  const token = process.env.HMS_MANAGEMENT_TOKEN;
  if (!token) throw new Error('ENV_MISSING: HMS_MANAGEMENT_TOKEN');
  const url = `https://api.100ms.live/v2/rooms/${roomId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const preview = await res.text();
    throw new Error(`ROOM_DELETE_FAILED: ${res.status} ${preview}`);
  }
  return { ok: true };
}

/**
 * Generate a client auth token for joining a room
 */
export async function generateRoomToken(roomId: string, userId: string, role: string) {
  const hmsInstance = getSDK();
  if (!hmsInstance) {
    throw new Error('HMS SDK not initialized');
  }
  return await hmsInstance.auth.getAuthToken({ roomId, userId, role });
}

/**
 * Generate a management token
 */
export async function getManagementToken() {
  try {
    const sdk = getSDK();
    return await sdk.auth.getManagementToken();
  } catch (error: any) {
    console.error('[lib/hms] getManagementToken error:', error);
    throw new Error(`Failed to generate management token: ${error?.message || String(error)}`);
  }
}

/**
 * List active peers in a room
 */
export async function listActivePeers(roomId: string) {
  const hmsInstance = getSDK();
  if (!hmsInstance) {
    throw new Error('HMS SDK not initialized');
  }
  return await hmsInstance.activeRooms.retrieveActivePeers(roomId);
}

/**
 * Send a broadcast message to all peers in a room
 */
export async function sendBroadcastMessage(roomId: string, message: string) {
  const hmsInstance = getSDK();
  if (!hmsInstance) {
    throw new Error('HMS SDK not initialized');
  }
  return await hmsInstance.activeRooms.sendMessage(roomId, { message });
}

/**
 * List sessions (optionally filtered by room)
 */
export async function listSessions(filters?: { roomId?: string; limit?: number }) {
  let params: { roomId?: string; limit?: number } = {};
  if (filters) {
    if (typeof filters.roomId === 'string' && filters.roomId.trim()) {
      params.roomId = filters.roomId;
    }
    if (typeof filters.limit === 'number') {
      params.limit = filters.limit;
    }
  }
  const hmsInstance = getSDK();
  if (!hmsInstance) {
    throw new Error('HMS SDK not initialized');
  }
  const iterable = hmsInstance.sessions.list(params);
  const sessions = [];
  for await (const session of iterable) {
    sessions.push(session);
  }
  return sessions;
}
