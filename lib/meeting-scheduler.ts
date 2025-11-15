
import hmsConfig from './hms-config';

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
  [key: string]: any;
}

/**
 * Generate a fallback room code when 100ms API is unavailable
 */
function generateFallbackCode(seed: string): string {
  // Use crypto for better randomness if available, otherwise use seed
  let hash: string;
  try {
    const crypto = require('crypto');
    hash = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 12);
  } catch {
    // Fallback to base64 encoding
    hash = Buffer.from(seed).toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12);
  }
  
  const base = hash.toLowerCase();
  
  // Ensure we have enough characters
  if (base.length < 10) {
    // Pad with random characters if needed
    const extra = Math.random().toString(36).substring(2, 12 - base.length);
    const padded = (base + extra).slice(0, 12);
    return padded.replace(/(.{3})(.{4})/, '$1-$2-') + padded.slice(7, 10);
  }
  
  // Format: xxx-xxxx-xxx (100ms style)
  return base.replace(/(.{3})(.{4})/, '$1-$2-') + base.slice(7, 10);
}

/**
 * Create a room using 100ms Management API
 */
async function createRoomViaAPI(
  mgmtToken: string,
  roomName: string,
  templateId: string,
  region: string = 'auto',
  sessionType: 'video' | 'audio' = 'video'
): Promise<{ roomId: string; roomData: RoomResponse } | null> {
  try {
    const response = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mgmtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        template_id: templateId,
        region: region.toLowerCase() === 'auto' ? undefined : region.toLowerCase(),
        description: `${sessionType === 'audio' ? 'Audio call' : 'Video consultation'} room for booking ${roomName}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      // Handle 409 Conflict (room already exists)
      // Instead of reusing, create a new room with a modified name
      if (response.status === 409) {
        console.warn('[createRoomViaAPI] Room name conflict (409), creating with unique suffix...');
        const retryRoomName = `${roomName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        console.log('[createRoomViaAPI] Retrying with unique name:', retryRoomName);
        
        // Retry with unique name
        const retryResponse = await fetch('https://api.100ms.live/v2/rooms', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mgmtToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: retryRoomName,
            template_id: templateId,
            region: region.toLowerCase() === 'auto' ? undefined : region.toLowerCase(),
            description: `Therapy session room for booking ${retryRoomName}`,
          }),
        });
        
        if (retryResponse.ok) {
          const retryRoomData: RoomResponse = await retryResponse.json();
          const retryRoomId = retryRoomData.id || retryRoomData.room_id;
          if (retryRoomId) {
            return { roomId: retryRoomId, roomData: retryRoomData };
          }
        } else {
          const retryErrorText = await retryResponse.text();
          console.error('[createRoomViaAPI] Retry also failed:', retryResponse.status, retryErrorText);
        }
        
        // If retry fails, throw error to trigger fallback
        throw new Error(`Room creation failed after retry: ${response.status}`);
      }

      throw new Error(`Room creation failed: ${response.status} - ${errorData.message || errorText}`);
    }

    const roomData: RoomResponse = await response.json();
    const roomId = roomData.id || roomData.room_id;
    
    if (!roomId) {
      throw new Error('Room created but no room ID returned');
    }

    console.log('[createRoomViaAPI] ✅✅✅ NEW Room created via 100ms API:', {
      roomId,
      roomName,
      hasCode: !!roomData.code,
      code: roomData.code || 'N/A',
      timestamp: new Date().toISOString(),
      unique: true
    });

    return { roomId, roomData };
  } catch (error: any) {
    console.error('[createRoomViaAPI] Error:', error.message || error);
    throw error;
  }
}

/**
 * Find an existing room by name
 * NOTE: We should avoid reusing rooms - each booking should have its own room
 */
async function findExistingRoom(
  mgmtToken: string,
  roomName: string
): Promise<{ roomId: string; roomData: RoomResponse } | null> {
  // Don't reuse existing rooms - each booking should have a unique room
  // This prevents conflicts and ensures proper isolation
  console.log('[findExistingRoom] Skipping room reuse - creating new room for:', roomName);
  return null;
  
  /* Original code kept for reference but disabled:
  try {
    // Try to list rooms and find by name
    const response = await fetch(
      `https://api.100ms.live/v2/rooms?limit=100&search=${encodeURIComponent(roomName)}`,
      {
        headers: {
          'Authorization': `Bearer ${mgmtToken}`,
        },
      }
    );

    if (response.ok) {
      const data: any = await response.json();
      const rooms = data.rooms || data.data || [];
      const existing = rooms.find((r: RoomResponse) => r.name === roomName);
      
      if (existing) {
        const roomId = existing.id || existing.room_id;
        if (roomId) {
          return { roomId, roomData: existing };
        }
      }
    }
  } catch (error: any) {
    console.warn('[findExistingRoom] Error searching for room:', error.message);
  }
  
  return null;
  */
}

/**
 * Get room details including room code if available
 */
async function getRoomDetails(
  mgmtToken: string,
  roomId: string
): Promise<RoomResponse | null> {
  try {
    const response = await fetch(`https://api.100ms.live/v2/rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${mgmtToken}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error: any) {
    console.warn('[getRoomDetails] Error:', error.message);
  }
  
  return null;
}

/**
 * Create a room code for a room using 100ms API
 */
async function createRoomCode(
  mgmtToken: string,
  roomId: string,
  role: string = 'host'
): Promise<string | null> {
  try {
    console.log('[createRoomCode] 🔑 Attempting to create UNIQUE room code via 100ms API:', {
      roomId,
      role,
      endpoint: 'https://api.100ms.live/v2/room-codes',
      timestamp: new Date().toISOString()
    });
    
    // Use the correct 100ms API endpoint for creating room codes
    // According to 100ms docs: POST /v2/room-codes with body { room_id, role }
    // OR: POST /v2/room-codes/room/:room_id/role/:role
    // We'll use the body-based approach as it's more flexible
    const response = await fetch('https://api.100ms.live/v2/room-codes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mgmtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_id: roomId,
        role: role,
      }),
    });
    
    console.log('[createRoomCode] API response status:', response.status);

    if (response.ok) {
      const data: RoomCodeResponse = await response.json();
      console.log('[createRoomCode] Full API response:', JSON.stringify(data, null, 2));
      
      // According to 100ms docs, room codes are unique per room_id + role combination
      // Try multiple possible response formats to handle different API versions
      const code = data.code || 
                   data.room_code || 
                   data.data?.code ||
                   (data as any).roomCode ||
                   (data as any).code_value ||
                   (data as any).room_code_value;
      
      if (code) {
        console.log('[createRoomCode] ✅✅✅ Successfully created UNIQUE room code via 100ms API:', {
          roomId,
          roomCode: code,
          role,
          responseFormat: data.code ? 'code' : data.room_code ? 'room_code' : 'other',
          timestamp: new Date().toISOString(),
          isUnique: true,
          note: 'Each room_id + role combination generates a unique code'
        });
        
        // Validate room code format (100ms codes are typically xxx-xxxx-xxx)
        if (!/^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i.test(code)) {
          console.warn('[createRoomCode] ⚠️ Room code format may be invalid (expected xxx-xxxx-xxx):', code);
        } else {
          console.log('[createRoomCode] ✅ Room code format validated:', code);
        }
        
        return code;
      } else {
        console.error('[createRoomCode] ❌ Response OK (200) but no code field found in response!');
        console.error('[createRoomCode] Response structure:', Object.keys(data));
        console.error('[createRoomCode] Full response:', JSON.stringify(data, null, 2));
        console.error('[createRoomCode] This may indicate the API response format has changed or the template does not support room codes.');
      }
    } else {
      const errorText = await response.text();
      let errorJson: any = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText };
      }
      console.error('[createRoomCode] ❌ Room code creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorJson,
        roomId,
        role
      });
      
      // Provide helpful error messages
      if (response.status === 401 || response.status === 403) {
        console.error('[createRoomCode] Authentication failed. Check if HMS_MANAGEMENT_TOKEN is valid and not expired.');
      } else if (response.status === 404) {
        console.error('[createRoomCode] Room not found. Verify the roomId is correct.');
      } else if (response.status === 400) {
        console.error('[createRoomCode] Bad request. Check if the role "' + role + '" exists in your template.');
        console.error('[createRoomCode] Common roles: host, hls-viewer, guest, viewer');
      }
    }
  } catch (error: any) {
    console.error('[createRoomCode] ❌ Network/Request Error:', {
      message: error.message,
      roomId,
      stack: error.stack
    });
  }

  return null;
}

/**
 * Generate meeting URL from room code using hms-config
 */
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
  sessionType?: 'video' | 'audio'; // Add session type to differentiate
}): Promise<ScheduleResult> {
  // If room already exists AND is valid, return existing data
  // But only if explicitly provided and not null/empty
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
  
  // Always create a NEW room for new bookings
  console.log('[scheduleMeeting] Creating NEW room (no existing room code provided)');

  // Check if we have required configuration - CRITICAL: Must have both for real 100ms rooms
  if (!hmsConfig.hasManagementToken()) {
    console.error('[scheduleMeeting] ❌ HMS_MANAGEMENT_TOKEN is missing! Cannot create real 100ms rooms.');
    console.error('[scheduleMeeting] Please set HMS_MANAGEMENT_TOKEN in your environment variables.');
    throw new Error('HMS_MANAGEMENT_TOKEN is required for 100ms room creation. Please configure it in your environment variables.');
  }
  
  if (!hmsConfig.templateId) {
    console.error('[scheduleMeeting] ❌ HMS_TEMPLATE_ID is missing! Cannot create real 100ms rooms.');
    console.error('[scheduleMeeting] Please set HMS_TEMPLATE_ID in your environment variables.');
    throw new Error('HMS_TEMPLATE_ID is required for 100ms room creation. Please configure it in your environment variables.');
  }

  const mgmtToken = hmsConfig.managementToken as string;
  
  // Use different template IDs for video vs audio sessions
  // Check for audio-specific template, fallback to default
  const sessionType = opts.sessionType || 'video';
  let templateId = hmsConfig.templateId as string;
  
  // If audio session, try to use audio-specific template if available
  if (sessionType === 'audio') {
    const audioTemplateId = process.env.HMS_AUDIO_TEMPLATE_ID || process.env.HMS_TEMPLATE_ID_AUDIO;
    if (audioTemplateId) {
      templateId = audioTemplateId;
      console.log('[scheduleMeeting] Using audio-specific template:', templateId);
    } else {
      console.log('[scheduleMeeting] No audio template found, using default template for audio call');
    }
  }
  
  // Create unique room name with timestamp and random suffix to avoid conflicts
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const roomTypePrefix = sessionType === 'audio' ? 'call' : 'video';
  const roomName = `${roomTypePrefix}_booking_${opts.bookingId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${uniqueSuffix}`;

  try {
    // Step 1: Create or find room
    // Pass session type context for better room description
    console.log('[scheduleMeeting] 🚀 Creating NEW room with unique name:', {
      roomName,
      bookingId: opts.bookingId,
      sessionType,
      templateId: templateId.substring(0, 20) + '...'
    });
    
    const roomResult = await createRoomViaAPI(mgmtToken, roomName, templateId, hmsConfig.region, sessionType);
    
    if (!roomResult) {
      console.error('[scheduleMeeting] ❌ Failed to create room via API, using fallback');
      console.error('[scheduleMeeting] This means 100ms API is not working properly!');
      return createFallbackRoom(opts.bookingId);
    }

    const { roomId, roomData } = roomResult;
    console.log('[scheduleMeeting] ✅ Room created successfully:', {
      roomId,
      roomName,
      hasCodeInResponse: !!roomData.code
    });

    // Step 2: Try to get room code from room data
    let roomCode = roomData.code || null;

    // Step 3: If no code in room data, try to get room details
    if (!roomCode) {
      const roomDetails = await getRoomDetails(mgmtToken, roomId);
      if (roomDetails) {
        roomCode = roomDetails.code || null;
      }
    }

    // Step 4: If still no code, create one via API - THIS IS CRITICAL
    if (!roomCode) {
      console.log('[scheduleMeeting] Room code not found in room data, creating via API...');
      roomCode = await createRoomCode(mgmtToken, roomId, 'host');
      
      if (!roomCode) {
        // Try alternative roles if host fails
        console.log('[scheduleMeeting] Host role failed, trying guest role...');
        roomCode = await createRoomCode(mgmtToken, roomId, 'guest');
      }
    }

    // Step 5: If we have a room code, generate meeting URL
    if (roomCode) {
      const meetingUrl = generateMeetingUrl(roomCode);
      console.log('[scheduleMeeting] ✅✅✅ Successfully created UNIQUE 100ms room:', {
        bookingId: opts.bookingId,
        roomId,
        roomCode,
        meetingUrl,
        roomName,
        provider: '100ms',
        isRealRoom: true,
        timestamp: new Date().toISOString()
      });
      
      // Validate room code format (100ms codes are typically xxx-xxxx-xxx)
      if (!/^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i.test(roomCode)) {
        console.warn('[scheduleMeeting] ⚠️ Room code format may be invalid (expected xxx-xxxx-xxx):', roomCode);
      } else {
        console.log('[scheduleMeeting] ✅ Room code format validated successfully:', roomCode);
      }
      
      return {
        roomCode,
        meetingUrl,
        roomId,
        generated: true,
        provider: '100ms',
      };
    }

    // If we have roomId but no code, this is an error - we should NOT use fallback
    console.error('[scheduleMeeting] ❌ CRITICAL: Room created (roomId: ' + roomId + ') but no room code could be generated!');
    console.error('[scheduleMeeting] This indicates a problem with the 100ms API. Room details:', {
      roomId,
      roomName,
      roomData: roomData ? Object.keys(roomData) : 'null'
    });
    
    // Throw error instead of falling back - we need real 100ms rooms
    throw new Error(`Failed to generate room code for room ${roomId}. Please check 100ms API configuration and template settings.`);
  } catch (error: any) {
    console.error('[scheduleMeeting] ❌ Error creating 100ms room:', {
      message: error.message,
      stack: error.stack,
      bookingId: opts.bookingId,
    });
    
    // If it's a configuration error, throw it (don't fall back)
    if (error.message?.includes('HMS_MANAGEMENT_TOKEN') || error.message?.includes('HMS_TEMPLATE_ID')) {
      throw error;
    }
    
    // For other errors, log but still throw to prevent silent fallback
    console.error('[scheduleMeeting] Room creation failed. Please check:');
    console.error('  1. HMS_MANAGEMENT_TOKEN is valid and not expired');
    console.error('  2. HMS_TEMPLATE_ID exists and is correct');
    console.error('  3. 100ms API is accessible');
    console.error('  4. Template has room code generation enabled');
    
    throw new Error(`Failed to create 100ms room: ${error.message}. Please check your 100ms configuration.`);
  }
}

/**
 * Create a fallback room when 100ms API is unavailable
 * Uses a more unique seed to avoid duplicate codes
 */
function createFallbackRoom(bookingId: string): ScheduleResult {
  // Generate truly unique fallback code with multiple entropy sources
  // Use multiple entropy sources to ensure uniqueness
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
  
  console.warn('[createFallbackRoom] ⚠️ Using fallback room code (not a real 100ms room):', {
    bookingId,
    fallbackCode,
    seed: uniqueSeed.substring(0, 50) + '...'
  });
  
  // Try to generate URL with subdomain if available
  let meetingUrl: string | null = null;
  if (hmsConfig.subdomain) {
    meetingUrl = `https://${hmsConfig.subdomain}.app.100ms.live/meeting/${fallbackCode}`;
  } else {
    // Fallback to internal video call page
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
