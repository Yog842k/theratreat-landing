#!/usr/bin/env node
/**
 * Fails the build early if critical runtime env vars are missing.
 * Adjust REQUIRED (fail) and OPTIONAL (warn) lists as needed.
 */
const REQUIRED = [
  'MONGODB_URI',
  'MONGODB_DB',
  'JWT_SECRET'
];
const OPTIONAL = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'HMS_ACCESS_KEY',
  'HMS_SECRET',
  'SENDGRID_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN'
];

const missing = REQUIRED.filter(k => !process.env[k]);
const missingOptional = OPTIONAL.filter(k => !process.env[k]);

// Enforce standard NODE_ENV usage
const allowedNodeEnv = new Set(['production','development','test','']);
const nodeEnv = process.env.NODE_ENV || '';
if (!allowedNodeEnv.has(nodeEnv)) {
  console.warn(`\n[ENV CHECK] Warning: Non-standard NODE_ENV='${nodeEnv}'. Next.js will emit warnings. Use production|development|test only.`);
}

if (missing.length) {
  console.error('\n[ENV CHECK] Missing required environment variables:');
  for (const k of missing) console.error('  -', k);
  console.error('\nAdd them in Amplify Console: App > Environment variables > Save > Redeploy');
  process.exit(1);
}

if (missingOptional.length) {
  console.warn('[ENV CHECK] Optional variables not set (features using them will degrade):');
  for (const k of missingOptional) console.warn('  -', k);
}

console.log('[ENV CHECK] All required environment variables present.');
if (!nodeEnv) {
  console.log('[ENV CHECK] NODE_ENV not explicitly set (Amplify will set production during build).');
}
