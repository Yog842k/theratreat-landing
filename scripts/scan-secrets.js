#!/usr/bin/env node
/**
 * Lightweight secret scanning script (does NOT replace dedicated tools like GitGuardian, trufflehog, gitleaks).
 * Purpose: quick local pre-flight to catch obvious credential patterns before committing.
 */

const fs = require('fs');
const path = require('path');

// Common high-risk filename patterns or directories to skip (node_modules already ignored)
const IGNORE_DIRS = new Set(['.git','node_modules','.next','dist','build','coverage']);

// Simple regex patterns (add more as needed)
const PATTERNS = [
  { name: 'Razorpay Key ID', regex: /rzp_\w{10,}/i },
  { name: 'Razorpay Secret (hex/base64 guess)', regex: /(?:key|secret)[_\-]?(?:id)?['"=:\s]{1,12}([A-Za-z0-9_]{20,})/i },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Generic API Key', regex: /api[_-]?key['"=:\s]{1,12}[A-Za-z0-9-_]{16,}/i },
  { name: 'Bearer JWT-like', regex: /Bearer\s+eyJ[0-9a-zA-Z_-]+\.[0-9a-zA-Z_-]+\.[0-9a-zA-Z_-]+/ },
];

const findings = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
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
      // Only scan reasonably small text-like files
      if (stat.size < 512 * 1024) {
        scanFile(full);
      }
    }
  }
}

walk(process.cwd());

if (!findings.length) {
  console.log('\u2705 No obvious secrets detected by basic scanner.');
  process.exit(0);
} else {
  console.log('\n\u26a0\ufe0f Potential secrets found (manual verification required):');
  findings.forEach(f => {
    console.log(`- [${f.pattern}] ${f.file}:${f.line} -> ${f.snippet}`);
  });
  console.log('\nRecommendation: If any are real secrets, rotate immediately and add to environment variables.');
  process.exit(2);
}
