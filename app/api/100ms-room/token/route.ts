import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

interface TokenRequest {
  user_id: string;
  role: string;
  room_id: string;
}

/**
 * Refined 100ms Token Generation API
 * Generates authentication tokens for joining rooms using JWT (not API call)
 * 100ms tokens are generated server-side, not via API endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body: TokenRequest = await request.json();
    const { user_id, role, room_id } = body;

    // Validate required fields
    if (!user_id || !role || !room_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'user_id, role, and room_id are required',
        },
        { status: 400 }
      );
    }

    // Get 100ms credentials (access key and secret)
    const accessKey = process.env.HMS_ACCESS_KEY || process.env.HMS_ACCESS_KEY_NEW;
    const secret = process.env.HMS_SECRET || process.env.HMS_SECRET_NEW;

    if (!accessKey || !secret) {
      return NextResponse.json(
        {
          success: false,
          error: '100ms credentials not configured',
          message: 'Please configure HMS_ACCESS_KEY and HMS_SECRET in your environment variables',
          details: {
            hasAccessKey: !!accessKey,
            hasSecret: !!secret,
          },
        },
        { status: 500 }
      );
    }

    // Validate room_id format
    if (!room_id || room_id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid room_id',
          message: 'room_id cannot be empty',
        },
        { status: 400 }
      );
    }

    // Generate JWT token for 100ms
    // According to 100ms docs, client auth tokens need:
    // - access_key: Your app access key
    // - room_id: The room ID
    // - user_id: Unique user identifier
    // - role: User role (host, guest, etc.)
    // - type: 'app'
    // - version: 2
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 24 * 60 * 60; // 24 hours
    
    const payload = {
      access_key: accessKey,
      room_id: room_id,
      user_id: user_id,
      role: role,
      type: 'app',
      version: 2,
      iat: now,
      nbf: now,
      exp: now + expiresIn,
    };

    let token: string;
    try {
      // Generate JWT token using HS256 algorithm
      // Note: Don't use expiresIn option since we already set exp in payload
      token = jwt.sign(payload, secret, {
        algorithm: 'HS256',
        jwtid: randomUUID(),
      });
    } catch (jwtError: any) {
      console.error('[100ms Token Generation] JWT Signing Error:', jwtError);
      return NextResponse.json(
        {
          success: false,
          error: 'Token generation failed',
          message: 'Failed to sign JWT token: ' + (jwtError.message || String(jwtError)),
        },
        { status: 500 }
      );
    }

    console.log('[100ms Token Generation] Success:', {
      room_id,
      user_id,
      role,
      tokenLength: token.length,
    });

    // Return standardized response
    return NextResponse.json({
      success: true,
      token: token,
      room_id: room_id,
      user_id: user_id,
      role: role,
      expires_at: new Date((now + expiresIn) * 1000).toISOString(),
      expires_in: expiresIn,
    });

  } catch (error: any) {
    console.error('[100ms Token Generation] Error:', error);
    
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
  const hasAccessKey = !!(process.env.HMS_ACCESS_KEY || process.env.HMS_ACCESS_KEY_NEW);
  const hasSecret = !!(process.env.HMS_SECRET || process.env.HMS_SECRET_NEW);
  const configured = hasAccessKey && hasSecret;
  
  return NextResponse.json({
    status: 'ok',
    configured: configured,
    checks: {
      accessKey: hasAccessKey,
      secret: hasSecret,
    },
    message: configured 
      ? '100ms token generation API is ready (using JWT signing)' 
      : 'Missing HMS_ACCESS_KEY and/or HMS_SECRET environment variables',
  });
}

