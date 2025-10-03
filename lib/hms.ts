/** Lightweight 100ms server helpers for server-managed (room ID) flow. */
import fetch from 'node-fetch';

interface CreateRoomResult { id: string; name: string; }

function requireEnv(name: string): string {
  const v = (process.env[name] || '').trim();
  if (!v) throw new Error(`ENV_MISSING:${name}`);
  return v;
}

export async function createHmsRoom(roomName: string, description?: string): Promise<CreateRoomResult> {
  const subdomain = requireEnv('HMS_SUBDOMAIN');
  const templateId = requireEnv('HMS_TEMPLATE_ID');
  const mgmt = (process.env.HMS_MANAGEMENT_TOKEN || '').trim();
  if (!mgmt) throw new Error('ENV_MISSING:HMS_MANAGEMENT_TOKEN');
  const url = `https://${subdomain}.api.100ms.live/v2/rooms`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mgmt}` },
    body: JSON.stringify({ name: roomName, description: description || 'Therapy session', template_id: templateId })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ROOM_CREATE_FAILED:${res.status}:${text}`);
  }
  const json = await res.json();
  return { id: json.id || json.room_id, name: json.name };
}

export async function generateRoomToken(roomId: string, userId: string, role: string): Promise<string> {
  const subdomain = requireEnv('HMS_SUBDOMAIN');
  const mgmt = (process.env.HMS_MANAGEMENT_TOKEN || '').trim();
  if (!mgmt) throw new Error('ENV_MISSING:HMS_MANAGEMENT_TOKEN');
  const url = `https://${subdomain}.api.100ms.live/v2/rooms/${roomId}/tokens`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mgmt}` },
    body: JSON.stringify({ user_id: userId, role })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`TOKEN_FAILED:${res.status}:${JSON.stringify(json)}`);
  }
  return json.token;
}
