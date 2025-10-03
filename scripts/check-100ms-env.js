#!/usr/bin/env node
// Lightweight diagnostic for 100ms configuration.
// Loads .env.local (if present) and prints masked presence info.

const fs = require('fs');
const path = require('path');
const dotenvPaths = [
  '.env.local',
  '.env'
];
for (const p of dotenvPaths) {
  const full = path.join(process.cwd(), p);
  if (fs.existsSync(full)) {
    require('dotenv').config({ path: full });
  }
}

function mask(v) {
  if (!v) return null;
  return v.length > 12 ? `${v.slice(0,6)}…${v.slice(-4)}` : v;
}

const data = {
  hasManagementToken: !!process.env.HMS_MANAGEMENT_TOKEN,
  hasAccessKey: !!process.env.HMS_ACCESS_KEY,
  hasSecret: !!process.env.HMS_SECRET,
  hasTemplate: !!process.env.HMS_TEMPLATE_ID,
  managementTokenMasked: mask(process.env.HMS_MANAGEMENT_TOKEN),
  accessKeyMasked: mask(process.env.HMS_ACCESS_KEY),
  templateMasked: mask(process.env.HMS_TEMPLATE_ID),
  mode: process.env.HMS_MANAGEMENT_TOKEN ? 'management-token' : ((process.env.HMS_ACCESS_KEY && process.env.HMS_SECRET) ? 'basic' : 'unconfigured'),
};

console.log('\n100ms Environment Diagnostics');
console.log('--------------------------------');
for (const [k,v] of Object.entries(data)) {
  console.log(`${k}: ${v}`);
}
if (!data.hasManagementToken && !(data.hasAccessKey && data.hasSecret)) {
  console.error('\nERROR: Missing required 100ms credentials. Provide either HMS_MANAGEMENT_TOKEN or HMS_ACCESS_KEY + HMS_SECRET');
  process.exitCode = 1;
}
