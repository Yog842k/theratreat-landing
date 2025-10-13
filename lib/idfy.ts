// IDfy PAN verification client
// - Supports real API via environment-configured base URL and credentials
// - Provides a mock mode for local dev/testing when credentials are missing

type PanVerifyInput = {
  pan: string;
  name?: string; // full name provided by user
  dob?: string;  // date of birth; supports YYYY-MM-DD or DD/MM/YYYY
};

type PanVerifyResult = {
  ok: boolean;
  nameOnCard?: string;
  dobOnCard?: string;
  idfyStatus?: string;
  match?: {
    nameMatch: boolean;
    dobMatch: boolean;
    score: number; // simple 0..1 name score
  };
  provider?: {
    panStatus?: string;
    aadhaarSeedingStatus?: boolean;
    nameMatch?: boolean;
    dobMatch?: boolean;
    requestId?: string;
    taskId?: string;
    input?: { pan?: string; name?: string; dob?: string };
  };
  raw?: any;
  error?: string;
  detail?: string;
  httpStatus?: number;
};

function normalizeName(s?: string) {
  return String(s || '')
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function idfyDebugEnabled() {
  return (process.env.IDFY_DEBUG || '') === '1';
}

function dbg(...args: any[]) {
  if (idfyDebugEnabled()) {
    try {
      // Use a consistent prefix; avoid logging secrets (we never log headers)
      console.log('[IDFY]', ...args);
    } catch {
      // ignore logging errors
    }
  }
}

function parseDob(s?: string): string | null {
  if (!s) return null;
  const str = String(s).trim();
  // Accept YYYY-MM-DD
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(str)) return str;
  // Accept YYYY/MM/DD -> convert to YYYY-MM-DD
  const ymdSlash = /^(\d{4})\/(\d{2})\/(\d{2})$/;
  const ym = str.match(ymdSlash);
  if (ym) return `${ym[1]}-${ym[2]}-${ym[3]}`;
  // Accept DD/MM/YYYY -> convert to YY
  // YY-MM-DD
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const m = str.match(dmy);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  // Accept DD-MM-YYYY
  const dmy2 = /^(\d{2})-(\d{2})-(\d{4})$/;
  const m2 = str.match(dmy2);
  if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
  return null;
}

function panRegexValid(pan: string) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
}

function nameTokenScore(a: string, b: string): number {
  const at = new Set(a.split(' '));
  const bt = new Set(b.split(' '));
  if (at.size === 0 || bt.size === 0) return 0;
  let inter = 0;
  at.forEach((t) => { if (bt.has(t)) inter++; });
  const denom = Math.max(at.size, bt.size);
  return inter / denom; // 0..1
}

async function realIdfyPanVerify({ pan, name, dob }: PanVerifyInput): Promise<PanVerifyResult> {
  const base = process.env.IDFY_BASE_URL || 'https://eve.idfy.com/v3';
  // Default to async verify endpoint; can be overridden via IDFY_PAN_ENDPOINT
  const endpoint = process.env.IDFY_PAN_ENDPOINT || '/tasks/async/verify_with_source/ind_pan';
  const cid = process.env.IDFY_CLIENT_ID;
  const secret = process.env.IDFY_CLIENT_SECRET;
  const apiKey = process.env.IDFY_API_KEY;
  const accountId = process.env.IDFY_ACCOUNT_ID;
  const hasBasic = !!(cid && secret);
  const hasHeader = !!apiKey; // account-id may be optional depending on tenant
  if (!hasBasic && !hasHeader) {
    return { ok: false, error: 'IDFY_NOT_CONFIGURED', detail: 'Missing credentials: provide CLIENT_ID/CLIENT_SECRET or API_KEY (+ optional ACCOUNT_ID)' };
  }

  const auth = hasBasic ? Buffer.from(`${cid}:${secret}`).toString('base64') : '';
  const url = `${base.replace(/\/$/, '')}${endpoint}`;
  
  // Build common headers once
  const baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (hasHeader) {
    if (accountId) baseHeaders['account-id'] = accountId;
    baseHeaders['api-key'] = apiKey as string;
  } else if (hasBasic) {
    baseHeaders['Authorization'] = `Basic ${auth}`;
  }

  // helper to POST and return parsed response
  async function postAndParse(payload: any) {
    dbg('POST', url, { hasHeaderAuth: hasHeader, hasBasicAuth: hasBasic, payloadKeys: Object.keys(payload || {}) });
    const res = await fetch(url, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify(payload)
    });
    const json: any = await res.json().catch(() => ({}));
    dbg('POST result', { status: res.status, request_id: json?.request_id, task_id: json?.task_id, statusText: (json?.status || json?.result?.status) });
    return { res, json, sent: payload };
  }

  // helper to GET JSON with same headers
  async function getJson(getUrl: string) {
    dbg('GET', getUrl);
    const res = await fetch(getUrl, { headers: baseHeaders, method: 'GET' });
    const json: any = await res.json().catch(() => ({}));
    dbg('GET result', { status: res.status, statusText: json?.status, request_id: json?.request_id, task_id: json?.task_id });
    return { res, json };
  }

  function extractCandidate(src: any) {
    return src?.result || src?.response || src?.data || src;
  }

  function looksFinal(obj: any) {
    const r = extractCandidate(obj);
    const so = r?.source_output || r?.result?.source_output;
    const nameCandidate = r?.name_on_card || r?.name || r?.full_name || r?.result?.name_on_card || so?.extracted_name || so?.name;
    const dobCandidate = r?.dob || r?.date_of_birth || r?.result?.dob || so?.extracted_dob || so?.dob;
    // Consider final if either name or dob present, or explicit completed status
    const status = r?.status || obj?.status;
    const hasSourceOutput = !!so && (typeof so === 'object');
    return Boolean(nameCandidate || dobCandidate || hasSourceOutput || (typeof status === 'string' && /completed|success/i.test(status)));
  }

  async function pollForFinal(initial: any): Promise<any | null> {
    const r = extractCandidate(initial);
    const taskId = initial?.task_id || r?.task_id || initial?.id || r?.id;
    const requestId = initial?.request_id || r?.request_id;
  const maxAttempts = 10;
  const delayMs = 700;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Prefer direct task lookup if taskId present
        if (taskId) {
          const { res, json } = await getJson(`${base.replace(/\/$/, '')}/tasks/${encodeURIComponent(taskId)}`);
          if (res.ok && looksFinal(json)) return json;
        }
        // Try request_id query path
        if (requestId) {
          const { res, json } = await getJson(`${base.replace(/\/$/, '')}/tasks?request_id=${encodeURIComponent(requestId)}`);
          if (res.ok) {
            if (Array.isArray(json)) {
              const item = json.find((t: any) => looksFinal(t));
              if (item) return item;
            } else if (json && typeof json === 'object') {
              // Some tenants return a single task object
              if (looksFinal(json)) return json;
              const arr = Array.isArray(json?.tasks) ? json.tasks : [];
              const item = arr.find((t: any) => looksFinal(t));
              if (item) return item;
            }
          }
        }
      } catch {
        // ignore and retry
      }
      // wait and retry
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return null;
  }

  // Try multiple payload shapes to satisfy varying IDfy workflows
  const dobIso = parseDob(dob || '') || undefined; // ISO for our comparisons
  const isAsyncVerify = /\/tasks\/async\/verify_with_source\/ind_pan/.test(endpoint);
  const uuid = (() => {
    try { return (globalThis as any).crypto?.randomUUID?.() || require('crypto').randomUUID(); } catch { /* no-op */ }
    // Fallback: not a UUID but ensures uniqueness; IDfy may reject if not UUID
    return `00000000-0000-4000-8000-${Date.now().toString().padStart(12,'0').slice(-12)}`;
  })();
  // Build names
  const fullName = name ? String(name).trim() : undefined;

  const shapes: any[] = [];
  if (isAsyncVerify) {
    // Spec-compliant async shape: requires UUIDs and exact keys
    shapes.push({
      task_id: uuid,
      group_id: uuid,
      data: {
        id_number: pan.toUpperCase(),
        full_name: fullName,
        dob: dobIso // IDfy accepts yyyy-mm-dd; parser accepts multiple inputs
      }
    });
  }
  // Fallback shapes for other endpoints/tenants
  shapes.push(
    {
      task_id: uuid,
      group_id: uuid,
      data: {
        id_number: pan.toUpperCase(),
        full_name: fullName,
        dob: dobIso
      }
    },
    {
      task_id: uuid,
      group_id: uuid,
      data: {
        pan: pan.toUpperCase(),
        name: fullName,
        dob: dobIso,
        consent: 'Y',
        consent_text: 'I authorize PAN verification for onboarding.'
      }
    },
    {
      task_id: uuid,
      group_id: uuid,
      data: {
        pan: pan.toUpperCase()
      }
    }
  );

  const errors: any[] = [];
  for (const payload of shapes) {
    try {
      const { res, json, sent } = await postAndParse(payload);
      if (!res.ok) {
        const msg = (json?.message || json?.error || res.statusText || '').toString();
        const code = (json?.code || json?.error_code || '').toString();
        const detail = [code, msg].filter(Boolean).join(': ');
        errors.push({ httpStatus: res.status, detail, raw: json, sent });
        // retry next shape on 400/422; otherwise break
        if (res.status === 400 || res.status === 422) {
          continue;
        }
        // non-retryable error
        return { ok: false, error: 'IDFY_HTTP_ERROR', detail, raw: { response: json, sent }, httpStatus: res.status };
      }
      // success -> if async envelope, poll briefly for final
      let finalJson = json;
      if (!looksFinal(json) && (json?.task_id || json?.request_id)) {
        const polled = await pollForFinal(json);
        if (polled) finalJson = polled;
      }
      dbg('FINAL', { status: finalJson?.status, keys: Object.keys(finalJson || {}), hasSourceOutput: !!(finalJson?.result?.source_output) });

      // parse
      const result = extractCandidate(finalJson);
      const so = result?.source_output || result?.result?.source_output;
      const nameOnCard = result?.name_on_card || result?.name || result?.full_name || result?.result?.name_on_card || so?.extracted_name || so?.name;
      const dobOnCard = result?.dob || result?.date_of_birth || result?.result?.dob || so?.extracted_dob || so?.dob;
      const status = result?.status || finalJson?.status || 'success';

      const nn = normalizeName(name || '');
      const nc = normalizeName(nameOnCard || '');
      let score = nn && nc ? nameTokenScore(nn, nc) : 0;
      if (so && typeof so.name_match === 'boolean') {
        // Trust provider's match if present
        score = so.name_match ? Math.max(score, 1) : Math.min(score, 0);
      }
      const dobIdfyIso = parseDob(dobOnCard || '');
      const providerDobMatch = so && typeof so.dob_match === 'boolean' ? so.dob_match : undefined;

      return {
        ok: true,
        nameOnCard,
        dobOnCard: dobIdfyIso || dobOnCard,
        idfyStatus: status,
        match: {
          nameMatch: (typeof so?.name_match === 'boolean') ? so.name_match : (score >= 0.5),
          dobMatch: (typeof providerDobMatch === 'boolean') ? providerDobMatch : (!!dobIso && !!dobIdfyIso && dobIso === dobIdfyIso),
          score
        },
        provider: {
          panStatus: so?.pan_status,
          aadhaarSeedingStatus: typeof so?.aadhaar_seeding_status === 'boolean' ? so.aadhaar_seeding_status : undefined,
          nameMatch: typeof so?.name_match === 'boolean' ? so.name_match : undefined,
          dobMatch: typeof so?.dob_match === 'boolean' ? so.dob_match : undefined,
              requestId: (finalJson?.request_id || result?.request_id),
              taskId: (finalJson?.task_id || result?.task_id),
          input: {
            pan: result?.input_details?.input_pan_number,
            name: result?.input_details?.input_name,
            dob: result?.input_details?.input_dob,
          }
        },
        raw: finalJson
      };
    } catch (err: any) {
      errors.push({ httpStatus: 0, detail: err?.message || 'request_failed', sent: payload });
      continue;
    }
  }

  // If all shapes failed, return aggregated diagnostic
  const last = errors[errors.length - 1] || {};
  return { ok: false, error: 'IDFY_HTTP_ERROR', detail: last?.detail || 'All payload shapes failed', raw: { attempts: errors }, httpStatus: last?.httpStatus || 400 };
}

async function mockPanVerify({ pan, name, dob }: PanVerifyInput): Promise<PanVerifyResult> {
  const valid = panRegexValid(pan);
  const nn = normalizeName(name || '');
  const score = nn ? 1 : 0;
  const dobIso = parseDob(dob || '');
  return {
    ok: valid,
    nameOnCard: nn || 'MOCK NAME',
    dobOnCard: dobIso || '1990-01-01',
    idfyStatus: valid ? 'success' : 'failed',
    match: { nameMatch: score >= 0.5, dobMatch: !!dobIso, score },
    raw: { mode: 'mock' }
  };
}

export async function verifyPan(input: PanVerifyInput): Promise<PanVerifyResult> {
  const mode = (process.env.IDFY_MODE || '').toLowerCase();
  const hasBasic = !!(process.env.IDFY_CLIENT_ID && process.env.IDFY_CLIENT_SECRET);
  const hasHeader = !!process.env.IDFY_API_KEY; // ACCOUNT_ID optional
  const hasCreds = hasBasic || hasHeader;
  if (mode === 'mock' || !hasCreds) {
    return mockPanVerify(input);
  }
  return realIdfyPanVerify(input);
}

export async function verifyPanMock(input: PanVerifyInput): Promise<PanVerifyResult> {
  return mockPanVerify(input);
}

export const Idfy = { verifyPan, verifyPanMock };

// ---------------- Aadhaar verification (IDfy) ----------------
type AadhaarVerifyInput = {
  aadhaar: string;
  name?: string;
  dob?: string;
};

type AadhaarVerifyResult = {
  ok: boolean;
  nameOnId?: string;
  dobOnId?: string;
  idfyStatus?: string;
  match?: {
    nameMatch: boolean;
    dobMatch: boolean;
    score: number;
  };
  provider?: any;
  raw?: any;
  error?: string;
  detail?: string;
  httpStatus?: number;
};

function aadhaarRegexValid(a: string) {
  const s = a.replace(/\s|-/g, '');
  return /^\d{12}$/.test(s);
}

async function mockAadhaarVerify({ aadhaar, name, dob }: AadhaarVerifyInput): Promise<AadhaarVerifyResult> {
  const valid = aadhaarRegexValid(aadhaar);
  const nn = normalizeName(name || '');
  const score = nn ? 1 : 0;
  const dobIso = parseDob(dob || '');
  return {
    ok: valid,
    nameOnId: nn || 'MOCK AADHAAR NAME',
    dobOnId: dobIso || '1990-01-01',
    idfyStatus: valid ? 'success' : 'failed',
    match: { nameMatch: score >= 0.5, dobMatch: !!dobIso, score },
    raw: { mode: 'mock' }
  };
}

async function realIdfyAadhaarVerify({ aadhaar, name, dob }: AadhaarVerifyInput): Promise<AadhaarVerifyResult> {
  // Many Aadhaar verifications require OTP/eKYC. For a non-OTP basic demo, some tenants support ind_aadhaar_v2 seeding/basic checks.
  // We'll mirror the PAN client structure and best-effort parse common fields.
  const base = process.env.IDFY_BASE_URL || 'https://eve.idfy.com/v3';
  const endpoint = process.env.IDFY_AADHAAR_ENDPOINT || '/tasks/async/verify_with_source/ind_aadhaar';
  const cid = process.env.IDFY_CLIENT_ID;
  const secret = process.env.IDFY_CLIENT_SECRET;
  const apiKey = process.env.IDFY_API_KEY;
  const accountId = process.env.IDFY_ACCOUNT_ID;
  const hasBasic = !!(cid && secret);
  const hasHeader = !!apiKey;
  if (!hasBasic && !hasHeader) {
    return { ok: false, error: 'IDFY_NOT_CONFIGURED', detail: 'Missing credentials: provide CLIENT_ID/CLIENT_SECRET or API_KEY' };
  }
  const auth = hasBasic ? Buffer.from(`${cid}:${secret}`).toString('base64') : '';
  const url = `${base.replace(/\/$/, '')}${endpoint}`;
  const baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (hasHeader) {
    if (accountId) baseHeaders['account-id'] = accountId;
    baseHeaders['api-key'] = apiKey as string;
  } else if (hasBasic) {
    baseHeaders['Authorization'] = `Basic ${auth}`;
  }

  async function postAndParse(payload: any) {
    const res = await fetch(url, { method: 'POST', headers: baseHeaders, body: JSON.stringify(payload) });
    const json: any = await res.json().catch(() => ({}));
    return { res, json };
  }

  function extractCandidate(src: any) { return src?.result || src?.response || src?.data || src; }
  function looksFinal(obj: any) {
    const r = extractCandidate(obj);
    const so = r?.source_output || r?.result?.source_output;
    const nameCandidate = r?.name || r?.full_name || so?.name || so?.extracted_name;
    const dobCandidate = r?.dob || r?.date_of_birth || so?.dob || so?.extracted_dob;
    const status = r?.status || obj?.status;
    return Boolean(nameCandidate || dobCandidate || (typeof status === 'string' && /completed|success/i.test(status)) || so);
  }

  async function getJson(getUrl: string) {
    const res = await fetch(getUrl, { headers: baseHeaders, method: 'GET' });
    const json: any = await res.json().catch(() => ({}));
    return { res, json };
  }

  const uuid = (() => {
    try { return (globalThis as any).crypto?.randomUUID?.() || require('crypto').randomUUID(); } catch { /* no-op */ }
    return `00000000-0000-4000-8000-${Date.now().toString().padStart(12,'0').slice(-12)}`;
  })();
  const dobIso = parseDob(dob || '') || undefined;
  const aadhaarDigits = aadhaar.replace(/\s|-/g, '');

  const shapes: any[] = [
    { task_id: uuid, group_id: uuid, data: { id_number: aadhaarDigits, full_name: name, dob: dobIso, consent: 'Y', consent_text: 'I authorize Aadhaar verification for onboarding.' } },
    { task_id: uuid, group_id: uuid, data: { aadhaar_number: aadhaarDigits, name, dob: dobIso } },
    { task_id: uuid, group_id: uuid, data: { aadhaar_number: aadhaarDigits } },
  ];

  // POST first
  try {
    const { res, json } = await postAndParse(shapes[0]);
    if (!res.ok) {
      // try next shape if 400/422
      if (res.status === 400 || res.status === 422) {
        const r2 = await postAndParse(shapes[1]);
        if (!r2.res.ok) {
          if (r2.res.status === 400 || r2.res.status === 422) {
            const r3 = await postAndParse(shapes[2]);
            if (!r3.res.ok) return { ok: false, error: 'IDFY_HTTP_ERROR', detail: String(r3.json?.message || r3.res.statusText), raw: r3.json, httpStatus: r3.res.status };
            // success with shape3
            const final = r3.json?.task_id ? (await getJson(`${base.replace(/\/$/, '')}/tasks/${encodeURIComponent(r3.json.task_id)}`)).json : r3.json;
            return parseAadhaarFinal(final, name, dobIso);
          }
          return { ok: false, error: 'IDFY_HTTP_ERROR', detail: String(r2.json?.message || r2.res.statusText), raw: r2.json, httpStatus: r2.res.status };
        }
        const final = r2.json?.task_id ? (await getJson(`${base.replace(/\/$/, '')}/tasks/${encodeURIComponent(r2.json.task_id)}`)).json : r2.json;
        return parseAadhaarFinal(final, name, dobIso);
      }
      return { ok: false, error: 'IDFY_HTTP_ERROR', detail: String(json?.message || res.statusText), raw: json, httpStatus: res.status };
    }
    const final = json?.task_id ? (await getJson(`${base.replace(/\/$/, '')}/tasks/${encodeURIComponent(json.task_id)}`)).json : json;
    return parseAadhaarFinal(final, name, dobIso);
  } catch (err: any) {
    return { ok: false, error: 'IDFY_HTTP_ERROR', detail: err?.message || 'request_failed' };
  }

  function parseAadhaarFinal(finalJson: any, providedName?: string, providedDobIso?: string): AadhaarVerifyResult {
    const r = finalJson?.result || finalJson?.response || finalJson?.data || finalJson;
    const so = r?.source_output || r?.result?.source_output;
    const nameOnId = r?.name || r?.full_name || so?.name || so?.extracted_name;
    const dobOnId = parseDob(r?.dob || r?.date_of_birth || so?.dob || so?.extracted_dob || '') || undefined;
    const nn = normalizeName(providedName || '');
    const nc = normalizeName(nameOnId || '');
    let score = nn && nc ? nameTokenScore(nn, nc) : 0;
    if (so && typeof so.name_match === 'boolean') {
      score = so.name_match ? Math.max(score, 1) : Math.min(score, 0);
    }
    const dobMatch = (typeof so?.dob_match === 'boolean') ? so.dob_match : (!!providedDobIso && !!dobOnId && providedDobIso === dobOnId);
    return {
      ok: !!nameOnId || !!dobOnId || !!so,
      nameOnId,
      dobOnId,
      idfyStatus: r?.status || finalJson?.status || 'success',
      match: { nameMatch: (typeof so?.name_match === 'boolean') ? so.name_match : (score >= 0.5), dobMatch, score },
      provider: {
        nameMatch: typeof so?.name_match === 'boolean' ? so.name_match : undefined,
        dobMatch: typeof so?.dob_match === 'boolean' ? so.dob_match : undefined,
      },
      raw: finalJson
    };
  }
}

export async function verifyAadhaar(input: AadhaarVerifyInput): Promise<AadhaarVerifyResult> {
  const mode = (process.env.IDFY_MODE || '').toLowerCase();
  const hasBasic = !!(process.env.IDFY_CLIENT_ID && process.env.IDFY_CLIENT_SECRET);
  const hasHeader = !!process.env.IDFY_API_KEY;
  const hasCreds = hasBasic || hasHeader;
  if (mode === 'mock' || !hasCreds) return mockAadhaarVerify(input);
  return realIdfyAadhaarVerify(input);
}

export async function verifyAadhaarMock(input: AadhaarVerifyInput) { return mockAadhaarVerify(input); }

Object.assign(Idfy, { verifyAadhaar, verifyAadhaarMock });
