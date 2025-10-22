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
  if (!sid || !token) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twilioLib = require('twilio');
  twilioClient = twilioLib(sid, token, { lazyLoading: true });
  return twilioClient;
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
    return { ok: false, error: 'INVALID_PHONE' };
  }

  const client = getTwilio();
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

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

  // Prefer Twilio Verify if configured
  if (client && verifySid) {
    try {
      await client.verify.v2.services(verifySid).verifications.create({ to: normalized, channel: 'sms' });
      // Optional: write minimal audit record (no code stored)
      try {
        const coll = await database.getCollection('otp_codes');
        const now = new Date();
        await coll.updateOne(
          { phone: normalized, purpose },
          { $set: { phone: normalized, purpose, updatedAt: now, lastSentAt: now, verified: false }, $setOnInsert: { createdAt: now } },
          { upsert: true }
        );
      } catch { /* non-blocking */ }
  // TTL is managed by Verify; we surface configured default if provided
  if (OTP_DEBUG) console.log('[OTP] Verify sent', { to: normalized });
  return { ok: true, phone: normalized, ttlMinutes: DEFAULT_TTL_MIN, channel: 'verify' } as any;
    } catch (err: any) {
      // Map common Verify errors
      const code = (err && (err.code || err.status)) || 'VERIFY_SEND_FAILED';
      return { ok: false, error: 'OTP_ERROR', detail: `${code}: ${err?.message || 'verify send failed'}` };
    }
  }

  // Fallback to Programmable SMS with self-managed OTP
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_SMS_FROM) {
    return { ok: false, error: 'TWILIO_NOT_CONFIGURED' };
  }

  const code = randomNumeric(DEFAULT_LEN);
  const salt = crypto.randomBytes(8).toString('hex');
  const codeHash = hashCode(code, salt);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_TTL_MIN * 60 * 1000);

  const coll = await database.getCollection('otp_codes');
  await coll.updateOne(
    { phone: normalized, purpose },
    {
      $set: {
        phone: normalized,
        purpose,
        codeHash,
        salt,
        expiresAt,
        updatedAt: now,
        lastSentAt: now,
        verified: false,
      },
      $setOnInsert: {
        createdAt: now,
        attempts: 0,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
      }
    },
    { upsert: true }
  );

  try {
    if (!client) throw new Error('Twilio client init failed');
    const body = `Your verification code is ${code}. It expires in ${DEFAULT_TTL_MIN} minutes. — TheraTreat`;
    const from = getSmsFrom();
    if (!from) {
      return { ok: false, error: 'TWILIO_NOT_CONFIGURED', detail: 'Invalid TWILIO_SMS_FROM format. Use E.164 like +1234567890' };
    }
    const msg = await client.messages.create({ from, to: normalized, body });
    if (OTP_DEBUG) console.log('[OTP] SMS queued', { sid: msg?.sid, from, to: normalized });
    if ((process.env.OTP_DEV_ECHO || '') === '1') {
      console.log('[OTP][dev] code', { to: normalized, purpose, code });
    }
  } catch (err: any) {
    return { ok: false, error: 'SMS_SEND_FAILED', detail: err?.message };
  }

  return { ok: true, phone: normalized, ttlMinutes: DEFAULT_TTL_MIN, channel: 'sms' } as any;
}

export async function verifyOtp({ phone, purpose, code }: { phone: string; purpose: string; code: string; }) {
  await ensureIndexes();
  const normalized = normalizePhone(phone);
  if (!normalized) return { ok: false, error: 'INVALID_PHONE' };

  const client = getTwilio();
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (client && verifySid) {
    try {
      const res = await client.verify.v2.services(verifySid).verificationChecks.create({ to: normalized, code });
      // res.status can be 'approved' when code is valid
      if (res && res.status === 'approved') {
        // Optional: mark audit as verified
        try {
          const coll = await database.getCollection('otp_codes');
          await coll.updateOne({ phone: normalized, purpose }, { $set: { verified: true, updatedAt: new Date() } }, { upsert: true });
        } catch { /* ignore */ }
        return { ok: true, verified: true };
      }
      // If not approved, treat as invalid
      return { ok: false, error: 'INVALID_CODE' };
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('expired')) return { ok: false, error: 'EXPIRED' };
      if (err?.status === 429 || (err?.code && String(err.code) === '20429')) return { ok: false, error: 'TOO_MANY_ATTEMPTS' };
      if (err?.status === 404) return { ok: false, error: 'NOT_FOUND' };
      return { ok: false, error: 'OTP_VERIFY_FAILED', detail: err?.message };
    }
  }

  // Fallback: self-managed verification
  const coll = await database.getCollection('otp_codes');
  const rec: WithId<Document> | null = await coll.findOne({ phone: normalized, purpose });
  if (!rec) return { ok: false, error: 'NOT_FOUND' };
  if (rec.verified) return { ok: true, alreadyVerified: true };
  const now = new Date();
  if (rec.expiresAt && new Date(rec.expiresAt) < now) {
    return { ok: false, error: 'EXPIRED' };
  }
  if (typeof rec.attempts === 'number' && typeof rec.maxAttempts === 'number' && rec.attempts >= rec.maxAttempts) {
    return { ok: false, error: 'TOO_MANY_ATTEMPTS' };
  }
  const expectedHash = hashCode(code, rec.salt);
  const matches = expectedHash === rec.codeHash;
  if (!matches) {
    await coll.updateOne({ _id: rec._id }, { $inc: { attempts: 1 }, $set: { updatedAt: now } });
    return { ok: false, error: 'INVALID_CODE', attemptsRemaining: (rec.maxAttempts || DEFAULT_MAX_ATTEMPTS) - (rec.attempts + 1) };
  }
  await coll.updateOne({ _id: rec._id }, { $set: { verified: true, updatedAt: now } });
  return { ok: true, verified: true };
}

export async function isPhoneVerified({ phone, purpose }: { phone: string; purpose: string; }) {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  const coll = await database.getCollection('otp_codes');
  const rec = await coll.findOne({ phone: normalized, purpose, verified: true });
  return !!rec;
}

export const OtpUtils = { requestOtp, verifyOtp, isPhoneVerified };
