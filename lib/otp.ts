// OTP Utility for phone verification (Twilio based)
// Responsibilities:
//  - Generate numeric OTP codes
//  - Persist (hashed) OTP with expiry & attempt limits
//  - Send via Twilio SMS
//  - Verify codes & enforce max attempts

import type { WithId, Document } from 'mongodb';
import crypto from 'crypto';
const database = require('@/lib/database');

interface OtpRecord {
  phone: string;            // E.164 normalized
  purpose: string;          // e.g. 'therapist_registration'
  codeHash: string;         // sha256(code + salt)
  salt: string;             // random salt per code
  expiresAt: Date;          // expiry timestamp
  createdAt: Date;
  updatedAt: Date;
  attempts: number;         // number of verification attempts used
  maxAttempts: number;      // allowed attempts
  verified: boolean;        // true once successfully verified
  lastSentAt: Date;         // last time SMS was sent
  meta?: Record<string, any>;
}

const DEFAULT_LEN = Number(process.env.OTP_LENGTH || 6);
const DEFAULT_TTL_MIN = Number(process.env.OTP_EXP_MIN || 10); // minutes
const DEFAULT_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_DEBUG = (process.env.OTP_DEBUG || '').toString() === '1';
const RESEND_INTERVAL_SEC = Number(process.env.OTP_RESEND_INTERVAL_SEC || 60);
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

let indexesEnsured = false;
async function ensureIndexes() {
  if (indexesEnsured) return;
  try {
    const coll = await database.getCollection('otp_codes');
    // TTL on expiresAt; expires immediately after time passed
    try { await database.createIndex('otp_codes', { expiresAt: 1 }, { expireAfterSeconds: 0 }); } catch {}
    // Helpful index on phone+purpose for lookups
    try { await database.createIndex('otp_codes', { phone: 1, purpose: 1 }); } catch {}
    indexesEnsured = true;
  } catch {
    // ignore if DB mocked
  }
}

function randomNumeric(length: number) {
  let s = '';
  while (s.length < length) {
    s += Math.floor(Math.random() * 10); // 0-9
  }
  return s;
}

function hashCode(code: string, salt: string) {
  return crypto.createHash('sha256').update(code + ':' + salt).digest('hex');
}

function normalizePhone(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let p = raw.trim();
  // If starts with 0 and 10 digits (India local), drop leading 0
  if (/^0\d{10}$/.test(p)) p = p.substring(1);
  // Add + if missing and looks like 10 digit (assume India +91) – configurable via OTP_DEFAULT_COUNTRY
  if (!p.startsWith('+') && /^\d{10}$/.test(p)) {
    const cc = process.env.OTP_DEFAULT_COUNTRY_CODE || '+91';
    p = cc + p;
  }
  // Basic E.164 check
  if (!/^\+?[1-9]\d{7,15}$/.test(p)) return null;
  if (!p.startsWith('+')) p = '+' + p; // ensure plus
  return p;
}

let twilioClient: any = null;
function getTwilio() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    console.error('[Twilio] Missing SID or Auth Token', { sid, tokenPresent: !!token });
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const twilioLib = require('twilio');
    twilioClient = twilioLib(sid, token, { lazyLoading: true });
    console.log('[Twilio] Client initialized');
    return twilioClient;
  } catch (err) {
    console.error('[Twilio] Client init error:', err);
    return null;
  }
}

function getSmsFrom(): string | null {
  // Remove inline comments or accidental extra text (e.g., "+123...  # comment")
  let from = String(process.env.TWILIO_SMS_FROM || '').split('#')[0].trim();
  if (!from) return null;
  // Basic E.164-ish validation: must start with + and be digits thereafter
  if (!/^\+[1-9]\d{5,15}$/.test(from)) {
    return null;
  }
  return from;
}

export async function requestOtp({ phone, purpose }: { phone: string; purpose: string; }) {
  await ensureIndexes();
  const normalized = normalizePhone(phone);
  if (!normalized) {
    console.error('[OTP] Invalid phone number format:', phone);
    return { ok: false, error: 'INVALID_PHONE', detail: `Invalid phone number format: ${phone}. Expected E.164 format (e.g., +911234567890)` };
  }
  
  // Log OTP request attempt
  if (IS_DEVELOPMENT || OTP_DEBUG) {
    console.log('[OTP] Request received:', { phone: normalized, purpose });
  }

  const client = getTwilio();
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const smsFrom = getSmsFrom();
  
  // Debug: Log environment variable status (without exposing the actual value)
  if (IS_DEVELOPMENT || OTP_DEBUG) {
    console.log('[OTP] Environment check:', {
      hasClient: !!client,
      hasVerifySid: !!verifySid,
      verifySidLength: verifySid?.length || 0,
      verifySidPrefix: verifySid?.substring(0, 3) || 'N/A',
      nodeEnv: process.env.NODE_ENV
    });
  }
  
  if (!client) {
    const errorMsg = 'Twilio client not available. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.';
    console.error('[OTP]', errorMsg);
    return { ok: false, error: 'TWILIO_NOT_CONFIGURED', detail: errorMsg };
  }
  
  // Twilio Verify is the primary and recommended method
  if (!verifySid) {
    // Check for common variations of the env var name
    const altVerifySid = process.env.TWILIO_VERIFY_SID || 
                        process.env.VERIFY_SERVICE_SID || 
                        process.env.TWILIO_VERIFY_SERVICE_ID;
    
    if (altVerifySid) {
      console.warn('[OTP] Found alternative env var name. Using TWILIO_VERIFY_SERVICE_SID is recommended.');
      // Use the alternative if found (but warn)
      const errorMsg = `TWILIO_VERIFY_SERVICE_SID is not set, but found alternative variable. Please use TWILIO_VERIFY_SERVICE_SID instead. Current value: ${altVerifySid ? 'found' : 'not found'}`;
      console.error('[OTP]', errorMsg);
      return { ok: false, error: 'TWILIO_VERIFY_NOT_CONFIGURED', detail: errorMsg };
    }
    
    const errorMsg = 'TWILIO_VERIFY_SERVICE_SID is not configured. Twilio Verify is required for OTP sending. Please set TWILIO_VERIFY_SERVICE_SID in your environment variables.';
    console.error('[OTP] Configuration error:', {
      message: errorMsg,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('TWILIO') || k.includes('VERIFY')).join(', '),
      hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasVerifySid: false
    });
    return { ok: false, error: 'TWILIO_VERIFY_NOT_CONFIGURED', detail: errorMsg };
  }

  // Rate limit resends per phone+purpose
  try {
    const coll = await database.getCollection('otp_codes');
    const existing: WithId<Document> | null = await coll.findOne({ phone: normalized, purpose });
    if (existing?.lastSentAt) {
      const last = new Date(existing.lastSentAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - last) / 1000);
      const remain = RESEND_INTERVAL_SEC - elapsed;
      if (remain > 0) {
        return { ok: false, error: 'RATE_LIMITED', detail: `Please wait ${remain}s before requesting a new code`, retryAfter: remain };
      }
    }
  } catch { /* ignore if DB missing */ }

  // Use Twilio Verify Service (primary and recommended method)
  if (!verifySid) {
    const errorMsg = 'TWILIO_VERIFY_SERVICE_SID is required. Twilio Verify is the only supported method for OTP sending.';
    console.error('[OTP]', errorMsg);
    return { ok: false, error: 'TWILIO_VERIFY_NOT_CONFIGURED', detail: errorMsg };
  }

  try {
    // Custom OTP message template
    // This applies to ALL OTPs: patient registration, therapist registration, clinic registration, etc.
    // To use a custom message, you need to:
    // 1. Configure in Twilio Console: Verify → Services → Your Service → Message Template
    //    Set message to: "Welcome to theratreat, your OTP is {{code}}"
    // OR
    // 2. Request a custom template from Twilio Support with message: "Welcome to theratreat, your OTP is {{code}}"
    //    Get the Template SID (starts with HJ...) and set: TWILIO_VERIFY_TEMPLATE_SID
    const customTemplateSid = process.env.TWILIO_VERIFY_TEMPLATE_SID;
    
    const verificationParams: any = {
      to: normalized,
      channel: 'sms',
      friendlyName: 'TheraTreat'
    };
    
    // Use custom template if provided, otherwise use default
    if (customTemplateSid) {
      verificationParams.templateSid = customTemplateSid;
      if (OTP_DEBUG || IS_DEVELOPMENT) {
        console.log('[OTP] Using custom template:', customTemplateSid);
      }
    }
    
    const verification = await client.verify.v2.services(verifySid).verifications.create(verificationParams);
    
    // Optional: write minimal audit record (no code stored - Twilio manages the code)
    try {
      const coll = await database.getCollection('otp_codes');
      const now = new Date();
      await coll.updateOne(
        { phone: normalized, purpose },
        { 
          $set: { 
            phone: normalized, 
            purpose, 
            updatedAt: now, 
            lastSentAt: now, 
            verified: false 
          }, 
          $setOnInsert: { createdAt: now } 
        },
        { upsert: true }
      );
    } catch { /* non-blocking - DB might not be available */ }
    
    // Log successful send
    if (OTP_DEBUG || IS_DEVELOPMENT) {
      console.log('[OTP] Twilio Verify OTP sent successfully', { 
        to: normalized, 
        purpose, 
        sid: verification?.sid,
        status: verification?.status 
      });
    }
    
    return { 
      ok: true, 
      phone: normalized, 
      ttlMinutes: DEFAULT_TTL_MIN, 
      channel: 'verify',
      sid: verification?.sid 
    } as any;
  } catch (err: any) {
    // Map common Verify errors to user-friendly messages
    const code = (err && (err.code || err.status)) || 'VERIFY_SEND_FAILED';
    const errorDetail = err?.message || 'verify send failed';
    
    // Common Twilio Verify error codes
    let userMessage = errorDetail;
    if (code === 60200) {
      userMessage = 'Invalid phone number format';
    } else if (code === 60203) {
      userMessage = 'Max send attempts reached. Please try again later.';
    } else if (code === 20404) {
      userMessage = 'Twilio Verify Service not found. Check your TWILIO_VERIFY_SERVICE_SID.';
    } else if (code === 20003) {
      userMessage = 'Twilio account authentication failed. Check your credentials.';
    }
    
    console.error('[OTP] Twilio Verify send failed:', { 
      code, 
      error: errorDetail, 
      to: normalized, 
      verifySid,
      fullError: err 
    });
    
    return { 
      ok: false, 
      error: 'OTP_ERROR', 
      detail: userMessage,
      code: code.toString()
    };
  }
  
  // Note: Programmable SMS fallback has been removed
  // Twilio Verify is now the only supported method
  // This code should never be reached due to the check above, but included for safety
  return { 
    ok: false, 
    error: 'TWILIO_VERIFY_NOT_CONFIGURED', 
    detail: 'Twilio Verify is required. Please configure TWILIO_VERIFY_SERVICE_SID.' 
  };
}

export async function verifyOtp({ phone, purpose, code }: { phone: string; purpose: string; code: string; }) {
  await ensureIndexes();
  const normalized = normalizePhone(phone);
  if (!normalized) return { ok: false, error: 'INVALID_PHONE' };

  const client = getTwilio();
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
  
  // Twilio Verify is the primary and only supported method
  if (!client || !verifySid) {
    const errorMsg = 'Twilio Verify is not configured. TWILIO_VERIFY_SERVICE_SID is required.';
    console.error('[OTP Verify]', errorMsg);
    return { ok: false, error: 'TWILIO_VERIFY_NOT_CONFIGURED', detail: errorMsg };
  }
  
  try {
    const res = await client.verify.v2.services(verifySid).verificationChecks.create({ 
      to: normalized, 
      code: code.trim() 
    });
    
    // res.status can be 'approved' when code is valid
    if (res && res.status === 'approved') {
      // Optional: mark audit as verified
      try {
        const coll = await database.getCollection('otp_codes');
        await coll.updateOne(
          { phone: normalized, purpose }, 
          { $set: { verified: true, updatedAt: new Date() } }, 
          { upsert: true }
        );
      } catch { /* ignore - non-blocking */ }
      
      if (OTP_DEBUG || IS_DEVELOPMENT) {
        console.log('[OTP] Verification successful', { phone: normalized, purpose });
      }
      
      return { ok: true, verified: true };
    }
    
    // If not approved, treat as invalid
    if (OTP_DEBUG || IS_DEVELOPMENT) {
      console.log('[OTP] Verification failed - invalid code', { phone: normalized, status: res?.status });
    }
    return { ok: false, error: 'INVALID_CODE', detail: 'The verification code is incorrect' };
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    const code = err?.code || err?.status;
    
    // Map common verification errors
    if (msg.includes('expired') || code === 20404) {
      return { ok: false, error: 'EXPIRED', detail: 'The verification code has expired' };
    }
    if (err?.status === 429 || code === 20429) {
      return { ok: false, error: 'TOO_MANY_ATTEMPTS', detail: 'Too many verification attempts. Please request a new code.' };
    }
    if (err?.status === 404 || code === 20404) {
      return { ok: false, error: 'NOT_FOUND', detail: 'Verification not found. Please request a new code.' };
    }
    
    console.error('[OTP] Verification error:', { code, error: err?.message, phone: normalized });
    return { ok: false, error: 'OTP_VERIFY_FAILED', detail: err?.message || 'Verification failed' };
  }
}

export async function isPhoneVerified({ phone, purpose }: { phone: string; purpose: string; }) {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  const coll = await database.getCollection('otp_codes');
  const rec = await coll.findOne({ phone: normalized, purpose, verified: true });
  return !!rec;
}

export const OtpUtils = { requestOtp, verifyOtp, isPhoneVerified };
