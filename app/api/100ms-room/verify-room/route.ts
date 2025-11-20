import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify if a room exists before generating tokens
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get('room_id');

    if (!room_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing room_id',
          message: 'Please provide room_id as a query parameter',
        },
        { status: 400 }
      );
    }

    const managementToken = process.env.HMS_MANAGEMENT_TOKEN;
    if (!managementToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'HMS_MANAGEMENT_TOKEN is not configured',
        },
        { status: 500 }
      );
    }

    // Try to fetch room details
    const timeoutMs = 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`https://api.100ms.live/v2/rooms/${room_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        {
          success: false,
          error: 'Network error',
          message: 'Failed to connect to 100ms API',
        },
        { status: 503 }
      );
    }

    if (response.status === 404) {
      return NextResponse.json(
        {
          success: false,
          exists: false,
          error: 'Room not found',
          message: `Room with ID "${room_id}" does not exist. Please create the room first.`,
        },
        { status: 404 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          exists: false,
          error: 'Room verification failed',
          message: `API returned status ${response.status}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const roomData = await response.json();

    return NextResponse.json({
      success: true,
      exists: true,
      room: {
        id: roomData.id,
        name: roomData.name,
        enabled: roomData.enabled,
        template_id: roomData.template_id,
      },
    });

  } catch (error: any) {
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

