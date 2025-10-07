#!/usr/bin/env node
/**
 * Lightweight secret scanning script (does NOT replace dedicated tools like GitGuardian, trufflehog, gitleaks).
 * Purpose: quick local pre-flight to catch obvious credential patterns before committing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common high-risk filename patterns or directories to skip (node_modules already ignored)
const IGNORE_DIRS = new Set(['.git','node_modules','.next','dist','build','coverage']);

// If running in staged mode, we only scan staged files (git diff --cached --name-only)
// Usage: node scripts/scan-secrets.js --mode=staged
const args = process.argv.slice(2);
const MODE = (() => {
  const modeArg = args.find(a => a.startsWith('--mode='));
  return modeArg ? modeArg.split('=')[1] : 'full';
})();

let stagedFiles = [];
if (MODE === 'staged') {
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    stagedFiles = out.split(/\r?\n/).filter(Boolean);
  } catch (e) {
    // If git diff fails (e.g. outside repo), fall back to full scan
    stagedFiles = [];
  }
}

// Simple regex patterns (add more as needed)
const PATTERNS = [
  { name: 'Razorpay Key ID', regex: /rzp_\w{10,}/i },
  { name: 'Razorpay Secret (hex/base64 guess)', regex: /(?:key|secret)[_\-]?(?:id)?['"=:\s]{1,12}([A-Za-z0-9_]{20,})/i },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Generic API Key', regex: /api[_-]?key['"=:\s]{1,12}[A-Za-z0-9-_]{16,}/i },
  { name: 'Bearer JWT-like', regex: /Bearer\s+eyJ[0-9a-zA-Z_-]+\.[0-9a-zA-Z_-]+\.[0-9a-zA-Z_-]+/ },
];

const findings = [];

// Lines that are clearly placeholders or explicitly allowed should be skipped
// Add a trailing comment `// secret-scan: allow` OR include one of the placeholder tokens below
const INLINE_ALLOW_MARKER = /secret-scan:\s*allow/i;
const PLACEHOLDER_TOKENS = [
  'PLACEHOLDER',
  'XXXXXXXXXXXXXXXX',
  'your_access_key_here',
  'rzp_test_x', // generic masked test key
  'change_this_shared_secret',
  'rzp_test_SIMULATED' // explicit simulated Razorpay key used only in no-credentials simulation path
];

function isPlaceholderLine(line) {
  if (INLINE_ALLOW_MARKER.test(line)) return true;
  const lower = line.toLowerCase();
  return PLACEHOLDER_TOKENS.some(tok => lower.includes(tok.toLowerCase()));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (isPlaceholderLine(line)) return; // skip obvious placeholders
      PATTERNS.forEach(p => {
        if (p.regex.test(line)) {
          findings.push({ file: filePath, line: idx + 1, pattern: p.name, snippet: line.trim().slice(0,240) });
        }
      });
    });
  } catch (_) {}
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (IGNORE_DIRS.has(entry)) continue;
      walk(full);
    } else {
      if (MODE === 'staged' && !stagedFiles.includes(full.replace(/^\.\\/, '').replace(/^\.\//, '')) && !stagedFiles.includes(entry) && !stagedFiles.includes(path.relative(process.cwd(), full))) {
        continue; // skip non-staged file in staged mode
      }
      // Only scan reasonably small text-like files
      if (stat.size < 512 * 1024) {
        scanFile(full);
      }
    }
  }
}

if (MODE === 'staged') {
  // Scan only staged files (but still iterate to reuse size & placeholder filters)
  // Directly scan each staged file path if it exists
  stagedFiles.forEach(f => {
    if (fs.existsSync(f)) {
      const stat = fs.statSync(f);
      if (stat.isFile() && stat.size < 512 * 1024) scanFile(f);
    }
  });
} else {
  walk(process.cwd());
}

if (!findings.length) {
  console.log('\u2705 No obvious secrets detected by basic scanner.' + (MODE === 'staged' ? ' (staged mode)' : ''));
  process.exit(0);
} else {
  console.log('\n\u26a0\ufe0f Potential secrets found (manual verification required):');
  findings.forEach(f => {
    console.log(`- [${f.pattern}] ${f.file}:${f.line} -> ${f.snippet}`);
  });
  console.log('\nRecommendation: If any are real secrets, rotate immediately and add to environment variables.');
  process.exit(2);
}
