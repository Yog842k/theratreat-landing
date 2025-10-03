#!/usr/bin/env node
/**
 * generate-hms-management-token.js
 * --------------------------------
 * Helper to generate a 100ms Management Token (JWT) locally.
 *
 * Usage (PowerShell / bash):
 *   node scripts/generate-hms-management-token.js \
 *     --access $Env:HMS_ACCESS_KEY_NEW \
 *     --secret $Env:HMS_SECRET_NEW \
 *     --ttl 3600
 *
 * Or it will fallback to env vars:
 *   HMS_ACCESS_KEY_NEW / HMS_SECRET_NEW (preferred)
 *   HMS_ACCESS_KEY / HMS_SECRET (fallback)
 *
 * NOTE: This produces a MANAGEMENT token (not a client auth token). Keep it server-side only.
 * Claims shape (100ms expects):
 *   type: 'management'
 *   version: 2
 *   access_key: <your access key>
 *   iat: issued-at (seconds)
 *   exp: expiry   (seconds)
 */

const jwt = require('jsonwebtoken');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
      out[key] = val;
    }
  }
  return out;
}

(async function main() {
  const args = parseArgs();
  const access = args.access || process.env.HMS_ACCESS_KEY_NEW || process.env.HMS_ACCESS_KEY;
  const secret = args.secret || process.env.HMS_SECRET_NEW || process.env.HMS_SECRET;
  const ttlSec = Number(args.ttl || process.env.HMS_MGMT_TOKEN_TTL || 3600); // 1 hour default

  if (!access || !secret) {
    console.error('[generate-hms-management-token] Missing access/secret. Provide --access/--secret or set HMS_ACCESS_KEY_NEW & HMS_SECRET_NEW.');
    process.exit(1);
  }
  if (ttlSec < 60 || ttlSec > 60 * 60 * 24 * 7) {
    console.warn('[generate-hms-management-token] TTL looks unusual. Using default 3600s.');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + ttlSec,
    type: 'management',
    version: 2,
    access_key: access, // 100ms field
  };

  try {
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
    console.log('\n=== 100ms Management Token (paste into .env.local as HMS_MANAGEMENT_TOKEN) ===\n');
    console.log(token + '\n');
    console.log('Claims:', payload);
    console.log('\nSecurity Tips:');
    console.log('- NEVER expose this token client-side.');
    console.log('- Keep ttl short (1h-4h) and rotate periodically.');
    console.log('- After confirming new token works, remove old token from .env.local.');
  } catch (e) {
    console.error('Failed to sign management token:', e.message);
    process.exit(1);
  }
})();
