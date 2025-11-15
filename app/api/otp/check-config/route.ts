import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/otp/check-config
// Returns Twilio configuration status (for debugging)
export async function GET(request: NextRequest) {
  try {
    // Check for the exact variable and also common variations
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID || 
                     process.env.TWILIO_VERIFY_SID || 
                     process.env.VERIFY_SERVICE_SID ||
                     process.env.TWILIO_VERIFY_SERVICE_ID;
    
    const config = {
      twilioAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      twilioVerifyServiceSid: !!verifySid,
      twilioVerifyServiceSidValue: verifySid ? (verifySid.substring(0, 3) + '...' + verifySid.substring(verifySid.length - 3)) : null,
      twilioVerifyServiceSidLength: verifySid?.length || 0,
      twilioVerifyTemplateSid: !!process.env.TWILIO_VERIFY_TEMPLATE_SID,
      twilioVerifyTemplateSidValue: process.env.TWILIO_VERIFY_TEMPLATE_SID ? (process.env.TWILIO_VERIFY_TEMPLATE_SID.substring(0, 3) + '...' + process.env.TWILIO_VERIFY_TEMPLATE_SID.substring(process.env.TWILIO_VERIFY_TEMPLATE_SID.length - 3)) : null,
      usingCorrectVarName: !!process.env.TWILIO_VERIFY_SERVICE_SID,
      allTwilioEnvVars: Object.keys(process.env).filter(k => k.includes('TWILIO') || k.includes('VERIFY')),
      otpDebug: process.env.OTP_DEBUG === '1',
      otpDevEcho: process.env.OTP_DEV_ECHO === '1',
      nodeEnv: process.env.NODE_ENV || 'development',
      isConfigured: false,
      configurationMethod: null as string | null,
      issues: [] as string[]
    };

    // Twilio Verify is the only supported method
    if (config.twilioAccountSid && config.twilioAuthToken && config.twilioVerifyServiceSid) {
      config.isConfigured = true;
      config.configurationMethod = 'Twilio Verify Service';
      if (!config.usingCorrectVarName) {
        config.issues.push('Warning: Using alternative env var name. Please use TWILIO_VERIFY_SERVICE_SID for consistency.');
      }
    }
    // Identify missing configuration
    else {
      if (!config.twilioAccountSid) {
        config.issues.push('TWILIO_ACCOUNT_SID is missing');
      }
      if (!config.twilioAuthToken) {
        config.issues.push('TWILIO_AUTH_TOKEN is missing');
      }
      if (!config.twilioVerifyServiceSid) {
        config.issues.push('TWILIO_VERIFY_SERVICE_SID is required (Twilio Verify is the only supported method)');
        config.issues.push(`Found Twilio-related env vars: ${config.allTwilioEnvVars.join(', ') || 'none'}`);
      }
    }

    return NextResponse.json({
      success: true,
      config,
      message: config.isConfigured 
        ? `OTP is configured using ${config.configurationMethod}` 
        : 'OTP is not properly configured. Check the issues array for details.'
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to check configuration',
      error: err?.message
    }, { status: 500 });
  }
}

