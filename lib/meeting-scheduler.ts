
import hmsConfig from './hms-config';

export interface ScheduleResult {
  roomCode: string;
  meetingUrl: string | null;
  generated: boolean;
  provider: '100ms' | 'fallback';
}

function generateFallbackCode(seed: string) {
  // Simple hash-based slug (not cryptographically secure; just uniqueness aid)
  const base = Buffer.from(seed).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toLowerCase();
  // Insert dashes to mimic 100ms style
  return base.replace(/(.{3})(.{4})/, '$1-$2-') + base.slice(7, 10);
}

export async function scheduleMeeting(opts: { bookingId: string; existingRoomCode?: string | null; existingMeetingUrl?: string | null; }): Promise<ScheduleResult> {
  // If already scheduled, just return those
  if (opts.existingRoomCode) {
    return {
      roomCode: opts.existingRoomCode,
      meetingUrl: opts.existingMeetingUrl || (opts.existingRoomCode ? hmsConfig.getRoomUrl(opts.existingRoomCode) : null),
      generated: false,
      provider: '100ms'
    };
  }

  // If we have management token + template, attempt real 100ms room creation first
  if (hmsConfig.hasManagementToken() && hmsConfig.templateId) {
    try {
      const mgmtToken = hmsConfig.managementToken as string;
      const roomName = `booking_${opts.bookingId}`;
      // Create or idempotently get room
      let roomId: string | null = null;
      let roomCreationFailed = false;
      const roomRes = await fetch('https://api.100ms.live/v2/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mgmtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: roomName, template_id: hmsConfig.templateId, region: hmsConfig.region })
      });
      if (roomRes.ok) {
        const roomJson: any = await roomRes.json();
        roomId = roomJson?.id || roomJson?.room?.id || null;
      } else {
        // If room already exists (409), search for it
        if (roomRes.status === 409) {
          const listRes = await fetch(`https://api.100ms.live/v2/rooms?limit=1&name=${encodeURIComponent(roomName)}`, {
            headers: { 'Authorization': `Bearer ${mgmtToken}` }
          });
            if (listRes.ok) {
              const listJson: any = await listRes.json();
              const existing = (listJson.rooms || listJson.data || []).find((r: any) => r.name === roomName);
              roomId = existing?.id || null;
            }
        }
        if (!roomId) roomCreationFailed = true;
      }

      if (roomId) {
        // Create a room code (single shared code for now)
        const codeRes = await fetch('https://api.100ms.live/v2/room-codes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mgmtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ room_id: roomId, role: 'host' })
        });
        if (codeRes.ok) {
          const codeJson: any = await codeRes.json();
          const roomCode = codeJson.code || codeJson.data?.code;
          if (roomCode) {
            const meetingUrl = hmsConfig.getRoomUrl(roomCode) || null;
            return { roomCode, meetingUrl, generated: true, provider: '100ms' };
          }
        }
      }
      if (roomCreationFailed) {
        console.warn('[scheduleMeeting] 100ms room creation failed, falling back to pseudo');
      }
    } catch (err) {
      console.error('[scheduleMeeting] 100ms management API error, falling back', err);
    }
  }

  // Pseudo 100ms style when subdomain present but no management token / failure above
  if (hmsConfig.subdomain) {
    const pseudo = generateFallbackCode(opts.bookingId + Date.now());
    const meetingUrl = hmsConfig.getRoomUrl(pseudo);
    return { roomCode: pseudo, meetingUrl, generated: true, provider: '100ms' };
  }

  // Fallback generic meeting link (non-100ms)
  const fallbackCode = generateFallbackCode(opts.bookingId + 'fallback');
  const meetingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/video-call/room?roomCode=${fallbackCode}`;
  return { roomCode: fallbackCode, meetingUrl, generated: true, provider: 'fallback' };
}
