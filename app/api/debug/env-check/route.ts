import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/debug/env-check
// Shows Twilio-related environment variables (for debugging only)
export async function GET(request: NextRequest) {
  // Only allow in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ROUTES !== '1') {
    return NextResponse.json({ 
      success: false, 
      message: 'Debug routes are disabled in production' 
    }, { status: 403 });
  }

  const twilioVars = Object.keys(process.env)
    .filter(key => key.includes('TWILIO') || key.includes('VERIFY'))
    .reduce((acc, key) => {
      const value = process.env[key];
      // Show first 3 and last 3 characters for security
      const masked = value 
        ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}` 
        : 'not set';
      acc[key] = {
        exists: !!value,
        length: value?.length || 0,
        masked: masked,
        startsWith: value?.substring(0, 2) || 'N/A'
      };
      return acc;
    }, {} as Record<string, any>);

  return NextResponse.json({
    success: true,
    twilioEnvVars: twilioVars,
    requiredVars: {
      TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
      TWILIO_VERIFY_SERVICE_SID: !!process.env.TWILIO_VERIFY_SERVICE_SID,
    },
    nodeEnv: process.env.NODE_ENV
  });
}

