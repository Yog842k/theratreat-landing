import { NextRequest, NextResponse } from 'next/server';

interface RoomCodeRequest {
  room_id: string;
  role: string;
}

interface RoomCodeResponse {
  code: string;
  enabled: boolean;
  room_id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a room code for a specific role
 * Room codes allow users to join rooms without needing auth tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body: RoomCodeRequest = await request.json();
    const { room_id, role } = body;

    // Validate required fields
    if (!room_id || !role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'room_id and role are required',
        },
        { status: 400 }
      );
    }

    // Validate management token
    const managementToken = process.env.HMS_MANAGEMENT_TOKEN;
    if (!managementToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'HMS_MANAGEMENT_TOKEN is not configured',
          message: 'Please configure HMS_MANAGEMENT_TOKEN in your environment variables',
        },
        { status: 500 }
      );
    }

    // Create room code via 100ms API
    const timeoutMs = 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch('https://api.100ms.live/v2/room-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id, role }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
        return NextResponse.json(
          {
            success: false,
            error: 'Connection timeout',
            message: `Request to 100ms API timed out after ${timeoutMs}ms.`,
          },
          { status: 504 }
        );
      }
      
      if (fetchError.message?.includes('fetch failed') || fetchError.code) {
        return NextResponse.json(
          {
            success: false,
            error: 'Network error',
            message: 'Failed to connect to 100ms API.',
          },
          { status: 503 }
        );
      }
      
      throw fetchError;
    }

    let responseData: any;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response',
          message: '100ms API returned an invalid response.',
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: responseData.error || responseData.message || 'Room code creation failed',
          details: responseData,
        },
        { status: response.status }
      );
    }

    const roomCodeData: RoomCodeResponse = responseData;

    return NextResponse.json({
      success: true,
      room_code: roomCodeData.code,
      room_id: roomCodeData.room_id,
      role: roomCodeData.role,
      enabled: roomCodeData.enabled,
      created_at: roomCodeData.created_at,
      raw: roomCodeData,
    });

  } catch (error: any) {
    console.error('[100ms Room Code Creation] Error:', error);
    
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.name === 'AbortError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Connection timeout',
          message: 'Request to 100ms API timed out.',
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  const hasToken = !!process.env.HMS_MANAGEMENT_TOKEN;
  
  return NextResponse.json({
    status: 'ok',
    configured: hasToken,
    checks: {
      managementToken: hasToken,
    },
    message: hasToken 
      ? '100ms room code creation API is ready' 
      : 'Missing HMS_MANAGEMENT_TOKEN environment variable',
  });
}

