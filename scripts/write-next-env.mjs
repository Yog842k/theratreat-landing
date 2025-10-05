#!/usr/bin/env node
/**
 * Writes a curated set of server & public environment variables into `.env.production`
 * so that Next.js (including server components / route handlers) can access them
 * during build & runtime on Amplify. This avoids broad `env | grep` patterns and
 * gives you an auditable whitelist.
 *
 * IMPORTANT SECURITY NOTE:
 *  - Anything written into .env.production will end up in the build artifacts.
 *  - DO NOT include secrets here unless you accept that risk.
 *  - Prefer using IAM roles / service integrations where possible instead of raw keys.
 */

const fs = require('fs');
const path = require('path');

// Server-side variables you explicitly want available to Next.js runtime.
// Remove any you decide should NOT be exposed via build artifacts.
const SERVER_VARS = [
  // Database / Auth
  'MONGODB_URI','MONGODB_DB','JWT_SECRET',
  // Payments
  'RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET',
  // 100ms Video
  'HMS_ACCESS_KEY','HMS_SECRET','HMS_TEMPLATE_ID','HMS_REGION','HMS_SUBDOMAIN','HMS_MANAGEMENT_TOKEN',
  // Twilio
  'TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_SMS_FROM',
  // SendGrid
  'SENDGRID_API_KEY','SENDGRID_FROM_EMAIL',
  // Cloudinary
  'CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET',
  // Admin bootstrap (optional; remove once initial setup done)
  'ADMIN_EMAIL','ADMIN_PASSWORD'
];

// Any key beginning with these prefixes will also be written.
const PUBLIC_PREFIXES = ['NEXT_PUBLIC_'];

const outFile = path.join(process.cwd(), '.env.production');
let lines = [];

function addVar(k) {
  const val = process.env[k];
  if (val && val.length) {
    // Preserve exact value; DO NOT quote (Next.js expects KEY=VAL lines)
    lines.push(`${k}=${val}`);
  }
}

SERVER_VARS.forEach(addVar);

// Collect dynamic public keys
Object.keys(process.env)
  .filter(k => PUBLIC_PREFIXES.some(p => k.startsWith(p)))
  .sort()
  .forEach(addVar);

if (!lines.length) {
  console.warn('[write-next-env] No configured environment variables were present to write.');
} else {
  fs.writeFileSync(outFile, lines.join('\n') + '\n', { encoding: 'utf8' });
  console.log(`[write-next-env] Wrote ${lines.length} variables to .env.production`);
  // Mask values in log for safety
  lines.slice(0, 20).forEach(l => {
    const [k,v] = l.split('=');
    const masked = v.length > 8 ? v.slice(0,4) + '***' + v.slice(-2) : '***';
    console.log(`  - ${k}=${masked}`);
  });
  if (lines.length > 20) console.log(`  ... (${lines.length-20} more)`);
}

// Optional: warn if critical vars absent
['MONGODB_URI','JWT_SECRET'].forEach(k => {
  if (!process.env[k]) console.warn(`[write-next-env] WARNING: ${k} not set`);
});
