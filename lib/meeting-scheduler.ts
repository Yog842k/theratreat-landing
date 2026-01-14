import hmsConfig from './hms-config';

type SessionType = 'video' | 'audio';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ScheduleResult {
  roomCode: string;
  meetingUrl: string | null;
  roomId: string | null;
  generated: boolean;
  provider: '100ms' | 'fallback';
}

interface RoomResponse {
  id?: string;
  room_id?: string;
  name?: string;
  code?: string;
  enabled?: boolean;
  region?: string;
  template_id?: string;
  created_at?: string;
  [key: string]: any;
}

interface RoomCodeResponse {
  code?: string;
  room_code?: string;
  room_id?: string;
  role?: string;
  enabled?: boolean;
  data?: { code?: string };
  [key: string]: any;
}

/**
 * Generate a fallback room code when 100ms API is unavailable
 */
function generateFallbackCode(seed: string): string {
  let hash: string;
  try {
    const crypto = require('crypto');
    hash = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 12);
  } catch {
    hash = Buffer.from(seed).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  }

  const base = hash.toLowerCase();
  const padded = base.length < 12 ? (base + Math.random().toString(36).substring(2, 12 - base.length)).slice(0, 12) : base;
  return padded.replace(/(.{3})(.{4})/, '$1-$2-') + padded.slice(7, 10);
}

/**
 * Create a room using 100ms Management API
 */
async function createRoomViaAPI(
  mgmtToken: string,
  roomName: string,
  templateId: string,
  region: string = 'auto',
  sessionType: SessionType = 'video'
): Promise<{ roomId: string; roomData: RoomResponse } | null> {
  const payload = {
    name: roomName,
    template_id: templateId,
    region: region.toLowerCase() === 'auto' ? undefined : region.toLowerCase(),
    description: `${sessionType === 'audio' ? 'Audio call' : 'Video consultation'} room for booking ${roomName}`,
  };

  const create = async (name: string) => {
    const response = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, name }),
    });
    return response;
  };

  try {
    let response = await create(roomName);

    if (response.status === 409) {
      console.warn('[createRoomViaAPI] Room name conflict (409), creating with unique suffix...');
      const retryRoomName = `${roomName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      console.log('[createRoomViaAPI] Retrying with unique name:', retryRoomName);
      response = await create(retryRoomName);
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(`Room creation failed: ${response.status} - ${errorData.message || errorText}`);
    }

    const roomData: RoomResponse = await response.json();
    const roomId = roomData.id || roomData.room_id;
    if (!roomId) throw new Error('Room created but no room ID returned');

    console.log('[createRoomViaAPI]  NEW Room created via 100ms API:', {
      roomId,
      roomName,
      hasCode: !!roomData.code,
      code: roomData.code || 'N/A',
      timestamp: new Date().toISOString(),
      unique: true,
    });

    return { roomId, roomData };
  } catch (error: any) {
    console.error('[createRoomViaAPI] Error:', error.message || error);
    throw error;
  }
}

/**
 * Find an existing room by name (disabled to avoid reuse)
 */
async function findExistingRoom(
  _mgmtToken: string,
  roomName: string
): Promise<{ roomId: string; roomData: RoomResponse } | null> {
  console.log('[findExistingRoom] Skipping room reuse - creating new room for:', roomName);
  return null;
}

/**
 * Get room details including room code if available
 */
async function getRoomDetails(mgmtToken: string, roomId: string): Promise<RoomResponse | null> {
  try {
    const response = await fetch(`https://api.100ms.live/v2/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${mgmtToken}` },
    });
    if (response.ok) return await response.json();
  } catch (error: any) {
    console.warn('[getRoomDetails] Error:', error.message);
  }
  return null;
}

/**
 * Create a room code for a room using 100ms API with retries to handle propagation delays
 */
async function createRoomCode(
  mgmtToken: string,
  roomId: string,
  role: string = 'host'
): Promise<string | null> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log('[createRoomCode]  Attempting to create UNIQUE room code via 100ms API:', {
        roomId,
        role,
        attempt,
        endpoint: 'https://api.100ms.live/v2/room-codes',
        timestamp: new Date().toISOString(),
      });

      const response = await fetch('https://api.100ms.live/v2/room-codes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id: roomId, role }),
      });

      console.log('[createRoomCode] API response status:', response.status);

      if (response.ok) {
        const data: RoomCodeResponse = await response.json();
        console.log('[createRoomCode] Full API response:', JSON.stringify(data, null, 2));

        const code =
          data.code ||
          data.room_code ||
          data.data?.code ||
          (data as any).roomCode ||
          (data as any).code_value ||
          (data as any).room_code_value;

        if (code) {
          console.log('[createRoomCode]  Successfully created UNIQUE room code via 100ms API:', {
            roomId,
            roomCode: code,
            role,
            timestamp: new Date().toISOString(),
          });
          if (!/^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i.test(code)) {
            console.warn('[createRoomCode]  Room code format may be unexpected (expected xxx-xxxx-xxx):', code);
          }
          return code;
        }
      } else {
        const errorText = await response.text();
        let errorJson: any = {};
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          errorJson = { message: errorText };
        }
        console.error('[createRoomCode]  Room code creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorJson,
          roomId,
          role,
          attempt,
        });

        if (response.status === 401 || response.status === 403) {
          console.error('[createRoomCode] Authentication failed. Check if HMS_MANAGEMENT_TOKEN is valid and not expired.');
        } else if (response.status === 404) {
          console.error('[createRoomCode] Room not found. Verify the roomId is correct.');
          // Try alternate endpoint format in case body-based API is strict
          try {
            console.warn('[createRoomCode] Trying alternate endpoint with path params...');
            const altRes = await fetch(`https://api.100ms.live/v2/room-codes/room/${roomId}/role/${role}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${mgmtToken}`,
                'Content-Type': 'application/json',
              },
            });
            console.log('[createRoomCode] Alternate endpoint status:', altRes.status);
            if (altRes.ok) {
              const altData: RoomCodeResponse = await altRes.json();
              const altCode =
                altData.code ||
                altData.room_code ||
                altData.data?.code ||
                (altData as any).roomCode ||
                (altData as any).code_value ||
                (altData as any).room_code_value;
              if (altCode) {
                console.log('[createRoomCode] ✅ Got code from alternate endpoint:', altCode);
                return altCode;
              }
            }
          } catch (altErr: any) {
            console.warn('[createRoomCode] Alternate endpoint failed:', altErr?.message || altErr);
          }
          if (attempt < maxAttempts) {
            console.warn('[createRoomCode] Retrying after short delay (possible propagation delay)...');
            await sleep(500 * attempt);
            continue;
          }
        } else if (response.status === 400) {
          console.error('[createRoomCode] Bad request. Check if the role "' + role + '" exists in your template.');
          console.error('[createRoomCode] Common roles: host, hls-viewer, guest, viewer');
        }
      }
    } catch (error: any) {
      console.error('[createRoomCode]  Network/Request Error:', {
        message: error.message,
        roomId,
        stack: error.stack,
        attempt,
      });
    }

    if (attempt < maxAttempts) {
      await sleep(300 * attempt);
    }
  }

  return null;
}

function generateMeetingUrl(roomCode: string): string | null {
  return hmsConfig.getRoomUrlWithFallback(roomCode) || hmsConfig.getRoomUrl(roomCode);
}

/**
 * Main meeting scheduler function
 * Creates a 100ms room and generates a room code for the booking
 */
export async function scheduleMeeting(opts: {
  bookingId: string;
  existingRoomCode?: string | null;
  existingMeetingUrl?: string | null;
  sessionType?: SessionType;
}): Promise<ScheduleResult> {
  if (opts.existingRoomCode && opts.existingRoomCode.trim() !== '') {
    console.log('[scheduleMeeting] Reusing existing room code:', opts.existingRoomCode);
    const meetingUrl = opts.existingMeetingUrl || generateMeetingUrl(opts.existingRoomCode);
    return {
      roomCode: opts.existingRoomCode,
      meetingUrl,
      roomId: null,
      generated: false,
      provider: meetingUrl?.includes('100ms.live') ? '100ms' : 'fallback',
    };
  }

  console.log('[scheduleMeeting] Creating NEW room (no existing room code provided)');

  if (!hmsConfig.hasManagementToken()) {
    console.error('[scheduleMeeting]  HMS_MANAGEMENT_TOKEN is missing! Cannot create real 100ms rooms.');
    throw new Error('HMS_MANAGEMENT_TOKEN is required for 100ms room creation. Please configure it in your environment variables.');
  }

  if (!hmsConfig.templateId) {
    console.error('[scheduleMeeting]  HMS_TEMPLATE_ID is missing! Cannot create real 100ms rooms.');
    throw new Error('HMS_TEMPLATE_ID is required for 100ms room creation. Please configure it in your environment variables.');
  }

  const mgmtToken = hmsConfig.managementToken as string;
  const sessionType = opts.sessionType || 'video';
  let templateId = hmsConfig.templateId as string;

  if (sessionType === 'audio') {
    const audioTemplateId = process.env.HMS_AUDIO_TEMPLATE_ID || process.env.HMS_TEMPLATE_ID_AUDIO;
    if (audioTemplateId) {
      templateId = audioTemplateId;
      console.log('[scheduleMeeting] Using audio-specific template:', templateId);
    } else {
      console.log('[scheduleMeeting] No audio template found, using default template for audio call');
    }
  }

  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const roomTypePrefix = sessionType === 'audio' ? 'call' : 'video';
  const roomName = `${roomTypePrefix}_booking_${opts.bookingId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${uniqueSuffix}`;

  try {
    console.log('[scheduleMeeting]  Creating NEW room with unique name:', {
      roomName,
      bookingId: opts.bookingId,
      sessionType,
      templateId: templateId.substring(0, 20) + '...',
    });

    const roomResult = await createRoomViaAPI(mgmtToken, roomName, templateId, hmsConfig.region, sessionType);
    if (!roomResult) {
      console.error('[scheduleMeeting]  Failed to create room via API, using fallback');
      return createFallbackRoom(opts.bookingId);
    }

    const { roomId, roomData } = roomResult;
    console.log('[scheduleMeeting]  Room created successfully:', { roomId, roomName, hasCodeInResponse: !!roomData.code });

    let roomCode = roomData.code || null;

    if (!roomCode) {
      const roomDetails = await getRoomDetails(mgmtToken, roomId);
      if (roomDetails) {
        roomCode = roomDetails.code || null;
      }
    }

    if (!roomCode) {
      // Allow a short propagation window before requesting a room code
      await sleep(800);
      console.log('[scheduleMeeting] Room code not found in room data, creating via API...');
      const rolesToTry = ['host', 'instructor', 'guest'];
      for (const roleToTry of rolesToTry) {
        roomCode = await createRoomCode(mgmtToken, roomId, roleToTry);
        if (roomCode) break;
      }
    }

    if (roomCode) {
      const meetingUrl = generateMeetingUrl(roomCode);
      console.log('[scheduleMeeting]  Successfully created UNIQUE 100ms room:', {
        bookingId: opts.bookingId,
        roomId,
        roomCode,
        meetingUrl,
        roomName,
        provider: '100ms',
        isRealRoom: true,
        timestamp: new Date().toISOString(),
      });

      if (!/^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i.test(roomCode)) {
        console.warn('[scheduleMeeting]  Room code format may be invalid (expected xxx-xxxx-xxx):', roomCode);
      }

      return { roomCode, meetingUrl, roomId, generated: true, provider: '100ms' };
    }

    // Fallback: return roomId even if code generation fails so caller can still fetch join tokens by room_id
    console.error(`[scheduleMeeting] ❌ CRITICAL: Room created (roomId: ${roomId}) but no room code could be generated! Falling back to roomId-only response.`);
    return {
      roomCode: roomId, // use roomId as a stable identifier; token generation can use room_id
      meetingUrl: null,
      roomId,
      generated: true,
      provider: '100ms',
    };
  } catch (error: any) {
    console.error('[scheduleMeeting]  Error creating 100ms room:', {
      message: error.message,
      stack: error.stack,
      bookingId: opts.bookingId,
    });

    if (error.message?.includes('HMS_MANAGEMENT_TOKEN') || error.message?.includes('HMS_TEMPLATE_ID')) {
      throw error;
    }

    console.error('[scheduleMeeting] Room creation failed. Please check:');
    console.error('  1. HMS_MANAGEMENT_TOKEN is valid and not expired');
    console.error('  2. HMS_TEMPLATE_ID exists and is correct');
    console.error('  3. 100ms API is accessible');
    console.error('  4. Template has room code generation enabled');

    throw new Error(`Failed to create 100ms room: ${error.message}. Please check your 100ms configuration.`);
  }
}

function createFallbackRoom(bookingId: string): ScheduleResult {
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  let hrtimeStr = '';
  try {
    hrtimeStr = process.hrtime.bigint().toString();
  } catch {
    hrtimeStr = Math.random().toString(36).substring(2, 10);
  }

  const uniqueSeed = `${bookingId}_${timestamp}_${random1}_${random2}_${hrtimeStr}_${Math.random()}`;
  const fallbackCode = generateFallbackCode(uniqueSeed);

  console.warn('[createFallbackRoom]  Using fallback room code (not a real 100ms room):', {
    bookingId,
    fallbackCode,
    seed: uniqueSeed.substring(0, 50) + '...',
  });

  let meetingUrl: string | null = null;
  if (hmsConfig.subdomain) {
    meetingUrl = `https://${hmsConfig.subdomain}.app.100ms.live/meeting/${fallbackCode}`;
  } else {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    meetingUrl = baseUrl ? `${baseUrl}/video-call/room?roomCode=${fallbackCode}` : null;
  }

  return {
    roomCode: fallbackCode,
    meetingUrl,
    roomId: null,
    generated: true,
    provider: hmsConfig.subdomain ? '100ms' : 'fallback',
  };
}
