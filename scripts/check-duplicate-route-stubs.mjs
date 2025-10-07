#!/usr/bin/env node
/**
 * Scan for duplicate Next.js App Router API route siblings (route.ts + route.js)
 * and exit with non-zero code if any are found. Prevents webpack asset conflicts
 * like: Multiple assets emit different content to the same filename .../config/route.ts
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const API_ROOT = join(ROOT, 'app', 'api');

const dupes = [];

function walk(dir) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const full = join(dir, name);
    let s; try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) {
      walk(full);
    } else if (name === 'route.ts') {
      const siblingJs = join(dir, 'route.js');
      try { const st = statSync(siblingJs); if (st.isFile()) { dupes.push(dir); } } catch {}
    }
  }
}

walk(API_ROOT);

if (dupes.length) {
  console.error('\nDuplicate route stubs found (both route.ts and route.js present):');
  for (const d of dupes) console.error(' -', d.replace(ROOT + '/', ''));
  console.error('\nRemove the route.js (or route.ts) duplicate to fix asset emission conflicts.');
  process.exit(1);
} else {
  console.log('No duplicate route stubs detected.');
}
