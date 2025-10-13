import type { NextRequest } from 'next/server';
import { Idfy } from '@/lib/idfy';
const { ResponseUtils } = require('@/lib/utils');

export const runtime = 'nodejs';

// GET /api/kyc/verify-pan
// Helpful usage info for developers visiting in a browser (instead of returning 405)
export async function GET(_request: NextRequest) {
  return ResponseUtils.success({
    usage: 'POST JSON to this endpoint to verify PAN via IDfy',
    url: '/api/kyc/verify-pan',
    method: 'POST',
    body: { pan: 'ABCDE1234F', name: 'Full Name', dob: '1990-01-01' },
    notes: [
      'PAN must match format AAAAA9999A; spaces and hyphens are ignored',
      'DOB is optional (YYYY-MM-DD preferred; DD/MM/YYYY accepted)',
      'Set IDFY_CLIENT_ID and IDFY_CLIENT_SECRET on the server',
      'Optionally set IDFY_FALLBACK_TO_MOCK=1 for mock fallback when credits are insufficient'
    ]
  }, 'Use POST to verify PAN');
}

// POST /api/kyc/verify-pan
// Body: { pan: string, name: string, dob?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Normalize inputs early to avoid false 400s due to spaces/hyphens
    const rawPan: string = String(body?.pan || '');
    const pan: string = rawPan.replace(/[\s-]/g, '').toUpperCase();
    const name: string = String(body?.name || '').trim().replace(/\s+/g, ' ');
    const dob: string = String(body?.dob || '').trim();
    const forceMock: boolean = !!body?.forceMock;

    if (!pan || !name) {
      return ResponseUtils.badRequest('pan and name are required');
    }
    const panFormat = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panFormat.test(pan)) {
      return ResponseUtils.badRequest('Invalid PAN format');
    }

    const allowMockEnv = process.env.IDFY_FALLBACK_TO_MOCK === '1' || (process.env.IDFY_MODE || '').toLowerCase() === 'mock';

    // If explicitly asked to use mock and environment allows it, short-circuit
    if (forceMock && allowMockEnv) {
      const mock = await Idfy.verifyPanMock({ pan, name, dob });
      return ResponseUtils.success({
        nameOnCard: mock.nameOnCard,
        dobOnCard: mock.dobOnCard,
        match: mock.match,
        idfyStatus: mock.idfyStatus,
        fallbackUsed: true,
        forcedMock: true
      }, 'PAN verified (mock)');
    }

    let res = await Idfy.verifyPan({ pan, name, dob });
    if (process.env.IDFY_DEBUG === '1') {
      try {
        console.log('[IDFY] VERIFY', {
          input: { pan, name, dob },
          ok: res.ok,
          httpStatus: res.httpStatus,
          idfyStatus: res.idfyStatus,
          provider: res.provider ? {
            panStatus: res.provider.panStatus,
            nameMatch: res.provider.nameMatch,
            dobMatch: res.provider.dobMatch,
          } : undefined,
          match: res.match
        });
      } catch {}
    }
    let fallbackUsed = false;
    if (!res.ok) {
      // Graceful fallback: if insufficient credits and fallback allowed, use mock
      const allowMock = allowMockEnv;
      const rawStr = JSON.stringify(res.raw || {});
      const insufficient =
        (res.error || '').toUpperCase().includes('INSUFFICIENT') ||
        (res.detail || '').toLowerCase().includes('insufficient') ||
        rawStr.toLowerCase().includes('insufficient') ||
        rawStr.toLowerCase().includes('no credits') ||
        rawStr.toLowerCase().includes('balance');
      const isPayloadIssue = res.httpStatus === 422 || res.httpStatus === 400; // IDfy often returns 422 for bad payload/schema
      if (allowMock && (insufficient || isPayloadIssue)) {
        res = await Idfy.verifyPanMock({ pan, name, dob });
        fallbackUsed = true;
      } else {
        // return full details to help diagnose environment issues
        return ResponseUtils.errorCode(res.error || 'PAN_VERIFY_FAILED', res.detail || 'Failed to verify PAN', res.httpStatus || 400, res);
      }
    }

    return ResponseUtils.success({
      nameOnCard: res.nameOnCard,
      dobOnCard: res.dobOnCard,
      match: res.match,
      idfyStatus: res.idfyStatus,
      fallbackUsed,
      provider: res.provider
    }, 'PAN verified');
  } catch (err: any) {
    return ResponseUtils.error('PAN verification failed', 500, err?.message);
  }
}
