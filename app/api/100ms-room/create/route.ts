import { NextRequest, NextResponse } from 'next/server';

interface RoomCreationPayload {
  name?: string;
  description?: string;
  template_id?: string;
  region?: string;
  recording_info?: {
    enabled: boolean;
  };
  large_room?: boolean;
  size?: number;
  max_duration_seconds?: number;
  webhook?: string;
}

interface RoomResponse {
  id: string;
  name: string;
  description?: string;
  template_id?: string;
  region?: string;
  code?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

/**
 * Refined 100ms Room Creation API
 * Creates a new room with proper error handling and validation
 */
export async function POST(request: NextRequest) {
  try {
    const body: RoomCreationPayload = await request.json();
    
    // Validate management token
    const managementToken = process.env.HMS_MANAGEMENT_TOKEN;
    if (!managementToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'HMS_MANAGEMENT_TOKEN is not configured',
          message: 'Please configure HMS_MANAGEMENT_TOKEN in your environment variables'
        },
        { status: 500 }
      );
    }

    // Build payload with defaults
    const payload: Record<string, any> = {
      name: body.name || `room-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      template_id: body.template_id || process.env.HMS_TEMPLATE_ID,
      region: (body.region || process.env.HMS_REGION || 'auto').toLowerCase(),
    };

    // Add optional fields only if provided
    if (body.description) payload.description = body.description;
    if (body.recording_info !== undefined) payload.recording_info = body.recording_info;
    if (body.large_room !== undefined) payload.large_room = body.large_room;
    if (body.size !== undefined) payload.size = body.size;
    if (body.max_duration_seconds !== undefined) payload.max_duration_seconds = body.max_duration_seconds;
    if (body.webhook) payload.webhook = body.webhook;

    // Validate template_id
    if (!payload.template_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template ID is required',
          message: 'Please provide template_id in request body or set HMS_TEMPLATE_ID in environment'
        },
        { status: 400 }
      );
    }

    // Create room via 100ms API with timeout and retry logic
    const timeoutMs = 15000; // 15 seconds timeout
    const maxRetries = 2; // Retry up to 2 times
    let lastError: any = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch('https://api.100ms.live/v2/rooms', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${managementToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        // If we got a response, break out of retry loop
        let responseData: any;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          if (attempt < maxRetries) {
            // Retry on JSON parse error
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid response',
              message: '100ms API returned an invalid response. Please try again.',
            },
            { status: 502 }
          );
        }

        if (!response.ok) {
          return NextResponse.json(
            {
              success: false,
              error: responseData.error || responseData.message || 'Room creation failed',
              details: responseData,
              payload,
            },
            { status: response.status }
          );
        }

        const roomData: RoomResponse = responseData;
        
        // Room codes are not included in room creation response
        // They need to be created separately via /v2/room-codes endpoint
        // We'll return the room data and let the frontend create codes if needed
        
        return NextResponse.json({
          success: true,
          room: {
            id: roomData.id,
            name: roomData.name,
            description: roomData.description,
            template_id: roomData.template_id,
            region: roomData.region,
            created_at: roomData.created_at,
            updated_at: roomData.updated_at,
            // Note: code is not included - create it separately via /api/100ms-room/create-room-code
          },
          message: 'Room created successfully. Create room codes separately if needed.',
          raw: roomData,
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        lastError = fetchError;
        
        // Don't retry on abort/timeout errors
        if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
          return NextResponse.json(
            {
              success: false,
              error: 'Connection timeout',
              message: `Request to 100ms API timed out after ${timeoutMs}ms. Please check your network connection and try again.`,
              details: {
                code: fetchError.code,
                cause: fetchError.cause?.message,
                attempt: attempt + 1,
              },
            },
            { status: 504 }
          );
        }
        
        // Retry on network errors (except on last attempt)
        if (attempt < maxRetries && (fetchError.message?.includes('fetch failed') || fetchError.code)) {
          const delay = 1000 * Math.pow(2, attempt); // Exponential backoff: 1s, 2s
          console.log(`[100ms Room Creation] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If we've exhausted retries or it's not a retryable error, return error
        if (fetchError.message?.includes('fetch failed') || fetchError.code) {
          return NextResponse.json(
            {
              success: false,
              error: 'Network error',
              message: 'Failed to connect to 100ms API. Please check your network connection and 100ms service status.',
              details: {
                code: fetchError.code,
                message: fetchError.message,
                cause: fetchError.cause?.message,
                attempts: attempt + 1,
              },
            },
            { status: 503 }
          );
        }
        
        throw fetchError;
      }
    }
    
    // This should never be reached, but just in case
    return NextResponse.json(
      {
        success: false,
        error: 'Network error',
        message: 'Failed to connect to 100ms API after multiple attempts.',
        details: {
          attempts: maxRetries + 1,
          lastError: lastError?.message,
        },
      },
      { status: 503 }
    );


  } catch (error: any) {
    console.error('[100ms Room Creation] Error:', error);
    
    // Check if it's a known network error
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.name === 'AbortError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Connection timeout',
          message: 'Request to 100ms API timed out. Please check your network connection.',
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || String(error),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
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
  const hasTemplate = !!process.env.HMS_TEMPLATE_ID;
  
  return NextResponse.json({
    status: 'ok',
    configured: hasToken && hasTemplate,
    checks: {
      managementToken: hasToken,
      templateId: hasTemplate,
    },
    message: hasToken && hasTemplate 
      ? '100ms room creation API is ready' 
      : 'Missing required environment variables',
  });
}

