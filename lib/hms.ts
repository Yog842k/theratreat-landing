
import { SDK } from '@100mslive/server-sdk';

const hms = new SDK();


export async function createRoom(name: string, template_id: string, description?: string) {
  return await hms.rooms.create({ name, template_id, description });
}
export async function listRooms(limit = 10) {
  return await hms.rooms.list({ limit });
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
  return await hms.auth.getAuthToken({ roomId, userId, role });
}

/**
 * Generate a management token
 */
export async function getManagementToken() {
  return await hms.auth.getManagementToken();
}

/**
 * List active peers in a room
 */
export async function listActivePeers(roomId: string) {
  return await hms.activeRooms.retrieveActivePeers(roomId);
}

/**
 * Send a broadcast message to all peers in a room
 */
export async function sendBroadcastMessage(roomId: string, message: string) {
  return await hms.activeRooms.sendMessage(roomId, { message });
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
  const iterable = hms.sessions.list(params);
  const sessions = [];
  for await (const session of iterable) {
    sessions.push(session);
  }
  return sessions;
}
