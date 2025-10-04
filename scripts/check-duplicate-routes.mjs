#!/usr/bin/env node
/**
 * Scan app/api for directories containing both route.ts and route.js.
 * Exits with code 1 if any active duplicates (where JS file isn't a minimal neutralized stub)
 * are detected so CI can fail.
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const API_ROOT = join(process.cwd(), 'app', 'api');

const NEUTRAL_MARKER = 'Duplicate neutralized. Canonical implementation in route.ts';

/** Recursively walk directories */
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc); else acc.push(full);
  }
  return acc;
}

function rel(p){
  return p.replace(process.cwd()+"\\", '').replace(process.cwd()+"/", '');
}

const files = walk(API_ROOT);
const byDir = new Map();
for (const f of files) {
  const dir = join(f, '..');
  if (!byDir.has(dir)) byDir.set(dir, new Set());
  byDir.get(dir).add(f.endsWith('route.ts') ? 'ts' : f.endsWith('route.js') ? 'js' : f);
}

let problems = [];
for (const [dir, kinds] of byDir.entries()) {
  if (kinds.has('ts') && kinds.has('js')) {
    const jsPath = join(dir, 'route.js');
    let neutralized = false;
    try {
      const content = readFileSync(jsPath, 'utf8');
      neutralized = content.includes(NEUTRAL_MARKER);
    } catch {}
    if (!neutralized) {
      problems.push({ dir: rel(dir), jsPath: rel(jsPath) });
    }
  }
}

if (problems.length) {
  console.error('\nDuplicate route handler pairs detected (non-neutralized):');
  for (const p of problems) {
    console.error(` - ${p.dir} (remove ${p.jsPath} or neutralize it)`);
  }
  process.exit(1);
} else {
  console.log('No active duplicate route.ts/route.js conflicts found.');
}
